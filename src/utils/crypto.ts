const STORAGE_KEY = 'bankr_crypto_key_v1';

const toBase64 = (buffer: ArrayBuffer): string =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

const fromBase64 = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const getStoredKey = async (): Promise<CryptoKey | null> => {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const keyBase64 = stored[STORAGE_KEY] as string | undefined;
  if (!keyBase64) return null;
  return crypto.subtle.importKey('raw', fromBase64(keyBase64), 'AES-GCM', true, [
    'encrypt',
    'decrypt'
  ]);
};

const storeKey = async (key: CryptoKey): Promise<void> => {
  const raw = await crypto.subtle.exportKey('raw', key);
  await chrome.storage.local.set({ [STORAGE_KEY]: toBase64(raw) });
};

export const getOrCreateCryptoKey = async (): Promise<CryptoKey> => {
  const existing = await getStoredKey();
  if (existing) return existing;
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt'
  ]);
  await storeKey(key);
  return key;
};

export const encryptText = async (text: string): Promise<{ ciphertext: string; iv: string }> => {
  const key = await getOrCreateCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return { ciphertext: toBase64(encrypted), iv: toBase64(iv.buffer) };
};

export const decryptText = async (ciphertext: string, ivBase64: string): Promise<string> => {
  const key = await getOrCreateCryptoKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(fromBase64(ivBase64)) },
    key,
    fromBase64(ciphertext)
  );
  return new TextDecoder().decode(decrypted);
};
