// Encrypted storage for the questionnaire answers (AES-GCM 256, Web Crypto).
// The key is generated on the device as non-extractable and kept in IndexedDB,
// so the stored text cannot be read back as plain answers, even by page scripts.
const DB = 'csg-secure';
const STORE = 'keys';
const KEY_ID = 'answers-v1';

function idb<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const tx = open.result.transaction(STORE, mode);
      const req = run(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => open.result.close();
    };
  });
}

let keyPromise: Promise<CryptoKey> | null = null;

/** The device key, created once and stored non-extractable. */
export function deviceKey(): Promise<CryptoKey> {
  keyPromise ??= (async () => {
    const existing = await idb<CryptoKey | undefined>('readonly', (s) => s.get(KEY_ID));
    if (existing) return existing;
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    await idb('readwrite', (s) => s.put(key, KEY_ID));
    return key;
  })();
  return keyPromise;
}

const toB64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function encryptJSON(key: CryptoKey, value: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(value));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data));
  return `v1.${toB64(iv)}.${toB64(ct)}`;
}

export async function decryptJSON<T>(key: CryptoKey, text: string): Promise<T> {
  const [v, iv, ct] = text.split('.');
  if (v !== 'v1' || !iv || !ct) throw new Error('bad format');
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(iv) }, key, fromB64(ct));
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}

export function secureStorageAvailable(): boolean {
  return typeof indexedDB !== 'undefined' && typeof crypto !== 'undefined' && !!crypto.subtle;
}
