/**
 * Lightweight, zero-dependency client-side IndexedDB caching layer for Medhavi.
 * Caches questions, subjects, and batch catalogs to eliminate repeated Firestore reads
 * and provide instant <20ms page transitions.
 */

const DB_NAME = "medhavi_client_cache";
const STORE_NAME = "cache_entries";
const DB_VERSION = 1;

interface CacheRecord<T> {
  key: string;
  data: T;
  timestamp: number;
  ttlMs: number;
}

// In-memory fallback for environments without IndexedDB (SSR, private browsing restrictions)
const memoryStore = new Map<string, CacheRecord<any>>();

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn("IndexedDB open error, falling back to memory cache.");
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Retrieves an item from client cache. Returns null if expired or missing.
 */
export async function getCacheItem<T>(key: string): Promise<T | null> {
  const now = Date.now();

  // Try IndexedDB first
  try {
    const db = await openDb();
    if (db) {
      return new Promise<T | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          const rec: CacheRecord<T> | undefined = req.result;
          if (rec && now - rec.timestamp < rec.ttlMs) {
            resolve(rec.data);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    }
  } catch (err) {
    console.warn("Error reading from IndexedDB:", err);
  }

  // Memory fallback
  const mem = memoryStore.get(key);
  if (mem && now - mem.timestamp < mem.ttlMs) {
    return mem.data as T;
  }
  return null;
}

/**
 * Stores an item into client cache with an optional Time-To-Live (default 3 days).
 */
export async function setCacheItem<T>(
  key: string,
  data: T,
  ttlMs: number = 3 * 24 * 60 * 60 * 1000 // 3 days default
): Promise<void> {
  const record: CacheRecord<T> = {
    key,
    data,
    timestamp: Date.now(),
    ttlMs,
  };

  // Always write to memory cache
  memoryStore.set(key, record);

  // Write to IndexedDB
  try {
    const db = await openDb();
    if (db) {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(record);
    }
  } catch (err) {
    console.warn("Error writing to IndexedDB:", err);
  }
}

/**
 * Clears client cache
 */
export async function clearClientCache(): Promise<void> {
  memoryStore.clear();
  try {
    const db = await openDb();
    if (db) {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.clear();
    }
  } catch (err) {
    console.warn("Error clearing IndexedDB:", err);
  }
}
