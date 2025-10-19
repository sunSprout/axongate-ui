import apiClient from './client';
import { getPublicKeyPEM } from './publicKey';
import { rsaEncryptPKCS1v15 } from '../utils/rsaEncrypt';

export async function postEncrypted<T = any>(
  url: string,
  data: Record<string, any>,
  fields: string[]
): Promise<T> {
  const pem = await getPublicKeyPEM();
  const payload: Record<string, any> = { ...data };

  for (const f of fields) {
    const v = payload[f];
    if (v == null) continue;
    const s = typeof v === 'string' ? v : String(v);
    payload[f] = await rsaEncryptPKCS1v15(s, pem);
  }

  const headers = { 'X-Encrypted-Fields': fields.join(',') } as Record<string, string>;
  return apiClient.post<any, T>(url, payload, { headers });
}

