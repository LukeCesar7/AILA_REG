const DB_NAME = "AILA_VECTOR_DB";
const DB_VERSION = 1;
const VECTOR_STORE = "vectors";
const META_STORE = "meta";

let db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(VECTOR_STORE)) {
        database.createObjectStore(VECTOR_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE, {
          keyPath: "key",
        });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

/*
   Vetores- sucesso
*/

export async function saveVector(vector: number[], content: string) {
  const database = await openDB();
  const tx = database.transaction(VECTOR_STORE, "readwrite");
  tx.objectStore(VECTOR_STORE).add({ vector, content });
  return new Promise(r => (tx.oncomplete = r));
}

export async function getAllVectors(): Promise<
  { vector: number[]; content: string }[]
> {
  const database = await openDB();
  const tx = database.transaction(VECTOR_STORE, "readonly");
  const store = tx.objectStore(VECTOR_STORE);

  return new Promise(resolve => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve([]);
  });
}

/*
   controle de indexação- sucesso
*/

export async function isIndexed(): Promise<boolean> {
  const database = await openDB();
  const tx = database.transaction(META_STORE, "readonly");
  const store = tx.objectStore(META_STORE);

  return new Promise(resolve => {
    const req = store.get("indexed");
    req.onsuccess = () => resolve(Boolean(req.result?.value));
    req.onerror = () => resolve(false);
  });
}

export async function setIndexed() {
  const database = await openDB();
  const tx = database.transaction(META_STORE, "readwrite");
  tx.objectStore(META_STORE).put({ key: "indexed", value: true });
  return new Promise(r => (tx.oncomplete = r));
}
