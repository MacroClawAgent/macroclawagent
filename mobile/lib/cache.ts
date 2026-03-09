type CacheEntry<T> = { value: T; ts: number };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mem = new Map<string, CacheEntry<any>>();

export function getCache<T>(key: string, maxAgeMs: number): T | null {
  const v = mem.get(key);
  if (!v) return null;
  if (Date.now() - v.ts > maxAgeMs) return null;
  return v.value as T;
}

export function setCache<T>(key: string, value: T): void {
  mem.set(key, { value, ts: Date.now() });
}

export function clearCache(keyPrefix?: string): void {
  if (!keyPrefix) { mem.clear(); return; }
  for (const k of mem.keys()) if (k.startsWith(keyPrefix)) mem.delete(k);
}
