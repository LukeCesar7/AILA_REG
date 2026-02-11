
const DB_NAME = 'AILA_StableStore_V1';
const DB_VERSION = 1;
const STORE_NAME = 'chat_history';

let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (e: any) => {
      db = e.target.result;
      resolve(db!);
    };
    request.onerror = (e) => reject(e);
  });
};

export const saveChatHistory = async (messages: any[]) => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  store.clear();
  messages.forEach(m => store.add({
    role: m.role,
    content: m.content,
    timestamp: Date.now()
  }));

  return new Promise(r => tx.oncomplete = r);
};

export const getChatHistory = async (): Promise<any[]> => {
  try {
    const database = await initDB();
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((res) => {
      const req = store.getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => res([]);
    });
  } catch (e) {
    return [];
  }
};

export const clearAllData = async () => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
  return new Promise(r => tx.oncomplete = r);
};
