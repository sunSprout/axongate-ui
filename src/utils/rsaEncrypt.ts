// Minimal RSA PKCS#1 v1.5 encryption in the browser using BigInt
// - Parses PEM public key (SPKI or PKCS#1) to get modulus n and exponent e
// - Applies PKCS#1 v1.5 padding and performs modular exponentiation

function stripPem(pem: string): Uint8Array {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

// Basic DER reader for what we need (SEQUENCE, INTEGER, BIT STRING, OID, NULL)
type DerNode = {
  tag: number;
  length: number;
  headerLen: number;
  start: number; // value start index
  end: number; // value end index (exclusive)
};

function readNode(buf: Uint8Array, offset: number): { node: DerNode; next: number } {
  const tag = buf[offset];
  let length = buf[offset + 1];
  let lenLen = 1;
  if (length & 0x80) {
    const n = length & 0x7f;
    length = 0;
    for (let i = 0; i < n; i++) length = (length << 8) | buf[offset + 2 + i];
    lenLen = 1 + n;
  }
  const headerLen = 1 + lenLen;
  const start = offset + headerLen;
  const end = start + length;
  return { node: { tag, length, headerLen, start, end }, next: end };
}

function readSequence(buf: Uint8Array, offset: number) {
  const { node, next } = readNode(buf, offset);
  if ((node.tag & 0x1f) !== 0x10) throw new Error("DER: expected SEQUENCE");
  return { node, next };
}

function readInteger(buf: Uint8Array, offset: number) {
  const { node, next } = readNode(buf, offset);
  if ((node.tag & 0x1f) !== 0x02) throw new Error("DER: expected INTEGER");
  // Remove leading 0x00 used to force positive
  let start = node.start;
  while (start < node.end - 1 && buf[start] === 0) start++;
  const bytes = buf.slice(start, node.end);
  let bi = 0n;
  for (const b of bytes) bi = (bi << 8n) | BigInt(b);
  return { value: bi, bytes, next };
}

function readBitString(buf: Uint8Array, offset: number) {
  const { node, next } = readNode(buf, offset);
  if ((node.tag & 0x1f) !== 0x03) throw new Error("DER: expected BIT STRING");
  const unusedBits = buf[node.start];
  if (unusedBits !== 0) throw new Error("Unsupported BIT STRING with unused bits");
  const inner = buf.slice(node.start + 1, node.end);
  return { value: inner, next };
}

function readOID(buf: Uint8Array, offset: number) {
  const { node, next } = readNode(buf, offset);
  if ((node.tag & 0x1f) !== 0x06) throw new Error("DER: expected OID");
  return { value: buf.slice(node.start, node.end), next };
}

function readNull(buf: Uint8Array, offset: number) {
  const { node, next } = readNode(buf, offset);
  if ((node.tag & 0x1f) !== 0x05) throw new Error("DER: expected NULL");
  return { next };
}

function parseRSAPublicKey(buf: Uint8Array): { n: bigint; e: bigint; kBytes: number } {
  // RSAPublicKey ::= SEQUENCE { modulus INTEGER, publicExponent INTEGER }
  const { node: seq } = readSequence(buf, 0);
  let pos = seq.start;
  const { value: n, bytes: nBytes, next: next1 } = readInteger(buf, pos);
  pos = next1;
  const { value: e } = readInteger(buf, pos);
  const kBytes = nBytes.length; // modulus length in bytes
  return { n, e, kBytes };
}

function parseSPKI(buf: Uint8Array): { n: bigint; e: bigint; kBytes: number } {
  // SubjectPublicKeyInfo ::= SEQUENCE { algorithm, subjectPublicKey BIT STRING }
  const { node: seq1 } = readSequence(buf, 0);
  let pos = seq1.start;
  const { node: algSeq, next: nextAlg } = readSequence(buf, pos);
  // Read algorithm OID and optional NULL params
  let aPos = algSeq.start;
  const { next: afterOID } = readOID(buf, aPos);
  try {
    const { next: afterNull } = readNull(buf, afterOID);
    aPos = afterNull;
  } catch {
    // params absent or not NULL; ignore
  }
  pos = nextAlg;
  const { value: bitStr } = readBitString(buf, pos);
  return parseRSAPublicKey(bitStr);
}

function parsePEMToKey(pem: string): { n: bigint; e: bigint; kBytes: number } {
  const der = stripPem(pem);
  // Try SPKI first, then PKCS#1
  try {
    return parseSPKI(der);
  } catch {
    return parseRSAPublicKey(der);
  }
}

function randomNonZeroBytes(len: number): Uint8Array {
  const out = new Uint8Array(len);
  let i = 0;
  while (i < len) {
    const b = new Uint8Array(len - i);
    crypto.getRandomValues(b);
    for (let j = 0; j < b.length && i < len; j++) {
      if (b[j] !== 0) out[i++] = b[j];
    }
  }
  return out;
}

function i2osp(x: bigint, xLen: number): Uint8Array {
  const out = new Uint8Array(xLen);
  for (let i = xLen - 1; i >= 0; i--) {
    out[i] = Number(x & 0xffn);
    x >>= 8n;
  }
  return out;
}

function os2ip(bytes: Uint8Array): bigint {
  let x = 0n;
  for (const b of bytes) x = (x << 8n) | BigInt(b);
  return x;
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  let b = base % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod;
    e >>= 1n;
    b = (b * b) % mod;
  }
  return result;
}

export async function rsaEncryptPKCS1v15(plainText: string, publicKeyPEM: string): Promise<string> {
  const { n, e, kBytes } = parsePEMToKey(publicKeyPEM);
  const encoder = new TextEncoder();
  const m = encoder.encode(plainText);
  if (m.length > kBytes - 11) throw new Error("Message too long for RSA PKCS#1 v1.5");

  // EM = 0x00 || 0x02 || PS || 0x00 || M
  const psLen = kBytes - m.length - 3;
  const PS = randomNonZeroBytes(psLen);
  const EM = new Uint8Array(kBytes);
  EM[0] = 0x00;
  EM[1] = 0x02;
  EM.set(PS, 2);
  EM[2 + psLen] = 0x00;
  EM.set(m, 3 + psLen);

  const c = modPow(os2ip(EM), e, n);
  const C = i2osp(c, kBytes);
  // Base64 encode
  let bin = "";
  for (const b of C) bin += String.fromCharCode(b);
  return btoa(bin);
}
