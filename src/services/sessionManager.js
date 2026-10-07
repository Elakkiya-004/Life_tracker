/**
 * PWA Persistent Session Manager
 * Ensures users stay logged in permanently on Mobile PWAs (iOS Safari & Android Chrome)
 * 
 * Uses a 4-tier resilient storage strategy:
 * 1. LocalStorage (instant synchronous read)
 * 2. Long-lived Cookie (max-age: 10 years - survives mobile localStorage clearing)
 * 3. IndexedDB (structured database that mobile OS does not wipe during cache cleanups)
 * 4. Navigator Storage Persistence (requests OS protection against background cache eviction)
 */

import { STORAGE_KEYS, getLocalData, setLocalData, DEFAULT_USERS } from './storage';

const COOKIE_NAME = 'life_tracker_auth_session_v1';
const REMEMBER_TOKEN_KEY = 'life_tracker_remembered_user_token_v1';
const DB_NAME = 'life_tracker_secure_storage';
const DB_STORE = 'persistent_auth';
const DB_VERSION = 1;

/**
 * Open or create IndexedDB instance
 */
const openAuthDB = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
};

/**
 * Save data into IndexedDB
 */
const saveToIndexedDB = async (key, data) => {
  try {
    const db = await openAuthDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.put({ id: key, value: data, savedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
};

/**
 * Read data from IndexedDB
 */
const readFromIndexedDB = async (key) => {
  try {
    const db = await openAuthDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const store = tx.objectStore(DB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.value || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

/**
 * Delete data from IndexedDB
 */
const deleteFromIndexedDB = async (key) => {
  try {
    const db = await openAuthDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
};

/**
 * Cookie Helpers with 10-year expiry
 */
export const setPersistentCookie = (name, value, days = 3650) => {
  if (typeof document === 'undefined') return;
  try {
    const encoded = encodeURIComponent(JSON.stringify(value));
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encoded}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn('[Session] Cookie write error:', e);
  }
};

export const getPersistentCookie = (name) => {
  if (typeof document === 'undefined') return null;
  try {
    const matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    if (matches && matches[1]) {
      return JSON.parse(decodeURIComponent(matches[1]));
    }
    return null;
  } catch {
    return null;
  }
};

export const clearPersistentCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

/**
 * Request persistent browser storage from Mobile OS / WebKit
 * Prevents OS storage eviction of LocalStorage and IndexedDB
 */
export const requestPersistentStorage = async () => {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        const granted = await navigator.storage.persist();
        console.log(`🔒 [PWA Storage] Persistent storage permission: ${granted ? 'GRANTED' : 'DENIED'}`);
        return granted;
      }
      return true;
    } catch (e) {
      console.warn('[PWA Storage] Storage persist request failed:', e);
      return false;
    }
  }
  return false;
};

/**
 * Detect if running as standalone PWA
 */
export const isStandalonePwa = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Save user session across all 4 tiers
 */
export const saveUserSession = async (userSession, rememberMe = true) => {
  if (!userSession) return;

  // 1. Tier 1: LocalStorage
  setLocalData(STORAGE_KEYS.AUTH_USER, userSession);

  if (rememberMe) {
    // 2. Tier 2: 10-year Cookie
    setPersistentCookie(COOKIE_NAME, userSession);

    // 3. Tier 3: IndexedDB
    await saveToIndexedDB('user_session', userSession);

    // 4. Remember token for quick auto-reconnect
    setLocalData(REMEMBER_TOKEN_KEY, {
      email: userSession.email,
      name: userSession.name,
      role: userSession.role,
      savedAt: Date.now(),
    });

    // 5. Tier 4: Lock persistent storage
    requestPersistentStorage();
  }
};

/**
 * Synchronous initial session check (reads LocalStorage, with Cookie fallback)
 */
export const getSynchronousUserSession = () => {
  try {
    // 1. Check LocalStorage
    const localUser = getLocalData(STORAGE_KEYS.AUTH_USER, null);
    if (localUser && localUser.email) {
      return localUser;
    }

    // 2. Fallback to 10-year Cookie if LocalStorage was cleared
    const cookieUser = getPersistentCookie(COOKIE_NAME);
    if (cookieUser && cookieUser.email) {
      // Rehydrate LocalStorage
      setLocalData(STORAGE_KEYS.AUTH_USER, cookieUser);
      return cookieUser;
    }

    // 3. Fallback to Remembered User token
    const rememberedToken = getLocalData(REMEMBER_TOKEN_KEY, null);
    if (rememberedToken && rememberedToken.email) {
      const defaultAdmin = DEFAULT_USERS[0];
      if (rememberedToken.email.toLowerCase() === defaultAdmin.email.toLowerCase()) {
        const adminSession = {
          uid: defaultAdmin.uid,
          name: defaultAdmin.name,
          email: defaultAdmin.email,
          role: defaultAdmin.role,
          status: 'active',
          avatar: defaultAdmin.avatar,
          avatarBg: defaultAdmin.avatarBg,
          jobTitle: defaultAdmin.jobTitle,
          bio: defaultAdmin.bio,
          lastLoginAt: new Date().toISOString(),
        };
        setLocalData(STORAGE_KEYS.AUTH_USER, adminSession);
        return adminSession;
      }
    }

    return null;
  } catch (e) {
    console.error('[Session] Synchronous check error:', e);
    return null;
  }
};

/**
 * Deep asynchronous session restore (recovers from IndexedDB if all else was cleared)
 */
export const recoverSessionFromDeepStorage = async () => {
  try {
    const idbUser = await readFromIndexedDB('user_session');
    if (idbUser && idbUser.email) {
      // Rehydrate LocalStorage & Cookie
      setLocalData(STORAGE_KEYS.AUTH_USER, idbUser);
      setPersistentCookie(COOKIE_NAME, idbUser);
      requestPersistentStorage();
      return idbUser;
    }
  } catch (e) {
    console.warn('[Session] Deep recovery error:', e);
  }
  return null;
};

/**
 * Clear user session on explicit logout
 */
export const clearUserSession = async () => {
  setLocalData(STORAGE_KEYS.AUTH_USER, null);
  setLocalData(REMEMBER_TOKEN_KEY, null);
  clearPersistentCookie(COOKIE_NAME);
  await deleteFromIndexedDB('user_session');
};

/**
 * Get quick login candidate (e.g. Super Admin profile for 1-tap login)
 */
export const getQuickLoginProfile = () => {
  const remembered = getLocalData(REMEMBER_TOKEN_KEY, null);
  if (remembered && remembered.email) {
    return remembered;
  }
  // Default to Super Admin (Elakkiya)
  return {
    name: DEFAULT_USERS[0].name,
    email: DEFAULT_USERS[0].email,
    role: DEFAULT_USERS[0].role,
    avatar: DEFAULT_USERS[0].avatar,
  };
};
