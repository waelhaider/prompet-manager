const DB_NAME = 'NotesAppDB';
const DB_VERSION = 1;

export interface Note {
  id: string;
  content: string;
  board: string;
  images?: string[];
  createdAt?: string;
}

export interface DeletedBoard {
  board: string;
  notes: Note[];
}

export interface AppData {
  boards: string[];
  notes: Note[];
  deletedBoards: DeletedBoard[];
  deletedNotes: Note[];
  fontSize: number;
}

let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('deletedNotes')) {
        db.createObjectStore('deletedNotes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('deletedBoards')) {
        db.createObjectStore('deletedBoards', { keyPath: 'board' });
      }
    };
  });
};

// Generic get function
const getData = async <T>(storeName: string, key: string): Promise<T | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result?.value ?? null);
    };
    request.onerror = () => {
      reject(new Error(`Failed to get ${key} from ${storeName}`));
    };
  });
};

// Generic set function for settings
const setData = async <T>(storeName: string, key: string, value: T): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put({ key, value });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to set ${key} in ${storeName}`));
  });
};

// Get all items from a store
const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };
    request.onerror = () => {
      reject(new Error(`Failed to get all from ${storeName}`));
    };
  });
};

// Clear and set all items in a store
const setAllInStore = async <T extends { id?: string; board?: string }>(
  storeName: string,
  items: T[]
): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    // Clear existing data
    store.clear();

    // Add all items
    items.forEach((item) => {
      store.add(item);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error(`Failed to set all in ${storeName}`));
  });
};

// Specific functions for app data
export const getBoards = async (): Promise<string[]> => {
  const boards = await getData<string[]>('settings', 'boards');
  return boards ?? ['الرئيسية'];
};

export const setBoards = async (boards: string[]): Promise<void> => {
  await setData('settings', 'boards', boards);
};

export const getNotes = async (): Promise<Note[]> => {
  return getAllFromStore<Note>('notes');
};

export const setNotes = async (notes: Note[]): Promise<void> => {
  await setAllInStore('notes', notes);
};

export const getDeletedNotes = async (): Promise<Note[]> => {
  return getAllFromStore<Note>('deletedNotes');
};

export const setDeletedNotes = async (notes: Note[]): Promise<void> => {
  await setAllInStore('deletedNotes', notes);
};

export const getDeletedBoards = async (): Promise<DeletedBoard[]> => {
  return getAllFromStore<DeletedBoard>('deletedBoards');
};

export const setDeletedBoards = async (boards: DeletedBoard[]): Promise<void> => {
  await setAllInStore('deletedBoards', boards);
};

export const getFontSize = async (): Promise<number> => {
  const fontSize = await getData<number>('settings', 'fontSize');
  return fontSize ?? 14;
};

export const setFontSize = async (fontSize: number): Promise<void> => {
  await setData('settings', 'fontSize', fontSize);
};

// Migration from localStorage to IndexedDB
export const migrateFromLocalStorage = async (): Promise<boolean> => {
  try {
    const migrated = await getData<boolean>('settings', 'migrated');
    if (migrated) return false;

    // Migrate boards
    const savedBoards = localStorage.getItem('boards');
    if (savedBoards) {
      await setBoards(JSON.parse(savedBoards));
    }

    // Migrate notes
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      await setNotes(JSON.parse(savedNotes));
    }

    // Migrate deleted notes
    const savedDeletedNotes = localStorage.getItem('deletedNotes');
    if (savedDeletedNotes) {
      await setDeletedNotes(JSON.parse(savedDeletedNotes));
    }

    // Migrate deleted boards
    const savedDeletedBoards = localStorage.getItem('deletedBoards');
    if (savedDeletedBoards) {
      await setDeletedBoards(JSON.parse(savedDeletedBoards));
    }

    // Migrate font size
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      await setFontSize(parseInt(savedFontSize));
    }

    // Mark as migrated
    await setData('settings', 'migrated', true);

    // Clear localStorage after successful migration
    localStorage.removeItem('boards');
    localStorage.removeItem('notes');
    localStorage.removeItem('deletedNotes');
    localStorage.removeItem('deletedBoards');
    localStorage.removeItem('fontSize');

    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};

// Initialize and load all data
export const initializeDB = async (): Promise<AppData> => {
  await openDB();
  await migrateFromLocalStorage();

  const [boards, notes, deletedBoards, deletedNotes, fontSize] = await Promise.all([
    getBoards(),
    getNotes(),
    getDeletedBoards(),
    getDeletedNotes(),
    getFontSize(),
  ]);

  return { boards, notes, deletedBoards, deletedNotes, fontSize };
};
