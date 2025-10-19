import apiClient from './client';

let cachedPublicKey: string | null = null;

export async function getPublicKeyPEM(): Promise<string> {
  if (cachedPublicKey) return cachedPublicKey;
  const resp = await apiClient.get<any, { public_key: string }>(
    '/crypto/public-key'
  );
  cachedPublicKey = resp.public_key;
  return cachedPublicKey;
}

