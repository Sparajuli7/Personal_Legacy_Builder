// IndexedDB storage utilities for offline functionality

const DB_NAME = 'LegacyBuilderDB';
const DB_VERSION = 1;
const STORES = {
  stories: 'stories',
  userData: 'userData',
  settings: 'settings',
  cache: 'cache'
};

let db = null;

// Initialize IndexedDB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('IndexedDB initialized successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores
      if (!db.objectStoreNames.contains(STORES.stories)) {
        const storiesStore = db.createObjectStore(STORES.stories, { keyPath: 'id', autoIncrement: true });
        storiesStore.createIndex('timestamp', 'timestamp', { unique: false });
        storiesStore.createIndex('userId', 'userId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.userData)) {
        const userDataStore = db.createObjectStore(STORES.userData, { keyPath: 'id' });
        userDataStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.settings)) {
        const settingsStore = db.createObjectStore(STORES.settings, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(STORES.cache)) {
        const cacheStore = db.createObjectStore(STORES.cache, { keyPath: 'key' });
        cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Save data to IndexedDB
export const saveToIndexedDB = async (storeName, data) => {
  try {
    if (!db) {
      await initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.add({
        ...data,
        timestamp: new Date().toISOString()
      });

      request.onsuccess = () => {
        console.log(`Data saved to ${storeName}:`, data);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`Error saving to ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB save error:', error);
    throw error;
  }
};

// Load data from IndexedDB
export const loadFromIndexedDB = async (storeName, key = null) => {
  try {
    if (!db) {
      await initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      let request;
      if (key) {
        request = store.get(key);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        console.log(`Data loaded from ${storeName}:`, request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`Error loading from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB load error:', error);
    throw error;
  }
};

// Update data in IndexedDB
export const updateInIndexedDB = async (storeName, data) => {
  try {
    if (!db) {
      await initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.put({
        ...data,
        timestamp: new Date().toISOString()
      });

      request.onsuccess = () => {
        console.log(`Data updated in ${storeName}:`, data);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`Error updating in ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB update error:', error);
    throw error;
  }
};

// Delete data from IndexedDB
export const deleteFromIndexedDB = async (storeName, key) => {
  try {
    if (!db) {
      await initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.delete(key);

      request.onsuccess = () => {
        console.log(`Data deleted from ${storeName}:`, key);
        resolve();
      };

      request.onerror = () => {
        console.error(`Error deleting from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB delete error:', error);
    throw error;
  }
};

// Clear all data from a store
export const clearIndexedDBStore = async (storeName) => {
  try {
    if (!db) {
      await initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.clear();

      request.onsuccess = () => {
        console.log(`Store ${storeName} cleared`);
        resolve();
      };

      request.onerror = () => {
        console.error(`Error clearing store ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB clear error:', error);
    throw error;
  }
};

// Get database size
export const getDBSize = async () => {
  try {
    if (!db) {
      await initDB();
    }

    const stores = Object.values(STORES);
    let totalSize = 0;

    for (const storeName of stores) {
      const data = await loadFromIndexedDB(storeName);
      if (Array.isArray(data)) {
        totalSize += data.length;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Error getting DB size:', error);
    return 0;
  }
};

// Check if IndexedDB is available
export const isIndexedDBSupported = () => {
  return 'indexedDB' in window;
};

// Initialize storage on app start
export const initializeStorage = async () => {
  if (!isIndexedDBSupported()) {
    console.warn('IndexedDB not supported, falling back to localStorage');
    return false;
  }

  try {
    await initDB();
    return true;
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    return false;
  }
};

// Sync data when online
export const syncOfflineData = async () => {
  try {
    const offlineStories = await loadFromIndexedDB(STORES.stories);
    
    if (offlineStories && offlineStories.length > 0) {
      console.log('Syncing offline stories:', offlineStories.length);
      
      // Here you would typically send the offline data to the server
      // For now, we'll just log it
      for (const story of offlineStories) {
        console.log('Syncing story:', story);
        // await api.syncStory(story);
      }
      
      // Clear synced data
      await clearIndexedDBStore(STORES.stories);
    }
  } catch (error) {
    console.error('Error syncing offline data:', error);
  }
}; 