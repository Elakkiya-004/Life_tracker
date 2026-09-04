// Firebase Client Integration (Serverless & Free Tier with Auth & RBAC Directory)
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getLocalData, STORAGE_KEYS } from './storage';

// Get Firebase configuration from .env, LocalStorage GUI settings, or hardcoded project credentials
export const getFirebaseConfig = () => {
  const saved = getLocalData(STORAGE_KEYS.FIREBASE_CONFIG, null);
  if (saved && saved.apiKey && saved.projectId) {
    return saved;
  }

  const projectConfig = {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyCXM0KY2tGPUQc8WavgG2kkP12Ki7Wbnk0",
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "life-tracker-6e906.firebaseapp.com",
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "life-tracker-6e906",
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "life-tracker-6e906.firebasestorage.app",
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "323293841934",
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:323293841934:web:8cfa81f90b17221e390a5f",
    measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-0R9V3PRYCT"
  };

  if (projectConfig.apiKey && projectConfig.projectId) {
    return projectConfig;
  }

  return null;
};

let app = null;
let db = null;
let auth = null;
let isInitialized = false;

export const initFirebase = (customConfig = null) => {
  const config = customConfig || getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    console.log('ℹ️ Firebase config not detected. Running in Local-Only Mode.');
    app = null;
    db = null;
    auth = null;
    isInitialized = false;
    return { success: false, mode: 'local' };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }

    try {
      // Modern multi-tab offline persistence in Firebase v10/v11/v12
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch {
      // Fallback if Firestore was already created for this app instance
      db = getFirestore(app);
    }

    auth = getAuth(app);
    isInitialized = true;
    console.log('✅ Firebase initialized successfully with Firestore & Auth!');
    return { success: true, mode: 'firebase', db, auth, app };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { success: false, mode: 'local', error };
  }
};

// Cloud Sync Helpers for Individual User Workspace
export const syncToCloud = async (userId = 'default_user', data) => {
  if (!db || !isInitialized) {
    const initRes = initFirebase();
    if (!initRes.success) return { success: false, reason: 'offline_mode' };
  }

  try {
    const sanitizedData = JSON.parse(JSON.stringify(data));
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      ...sanitizedData,
      lastSyncedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('Error syncing to Firestore:', err);
    return { success: false, error: err };
  }
};

export const listenToCloud = (userId = 'default_user', onUpdate) => {
  if (!db || !isInitialized) {
    const initRes = initFirebase();
    if (!initRes.success) return () => {};
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data());
      }
    }, (err) => {
      console.error('Firestore listener error:', err);
    });
    return unsubscribe;
  } catch (err) {
    console.error('Failed to attach Firestore listener:', err);
    return () => {};
  }
};

// Super Admin Directory Cloud Sync Helpers
export const syncUserToDirectoryCloud = async (userObj) => {
  if (!db || !isInitialized) {
    const initRes = initFirebase();
    if (!initRes.success) return { success: false, reason: 'offline_mode' };
  }

  try {
    const sanitized = JSON.parse(JSON.stringify(userObj));
    const dirDocRef = doc(db, 'users_directory', userObj.uid || userObj.email.replace(/[@.]/g, '_'));
    await setDoc(dirDocRef, {
      ...sanitized,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('Error syncing user to cloud directory:', err);
    return { success: false, error: err };
  }
};

export const deleteUserFromDirectoryCloud = async (userId) => {
  if (!db || !isInitialized) return { success: false };
  try {
    const dirDocRef = doc(db, 'users_directory', userId);
    await deleteDoc(dirDocRef);
    return { success: true };
  } catch (err) {
    console.error('Error deleting user from cloud directory:', err);
    return { success: false, error: err };
  }
};

export const listenToUsersDirectory = (onUpdate) => {
  if (!db || !isInitialized) {
    const initRes = initFirebase();
    if (!initRes.success) return () => {};
  }

  try {
    const dirColRef = collection(db, 'users_directory');
    const unsubscribe = onSnapshot(dirColRef, (snapshot) => {
      const users = [];
      snapshot.forEach(docSnap => {
        users.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(users);
    }, (err) => {
      console.error('Users directory listener error:', err);
    });
    return unsubscribe;
  } catch (err) {
    console.error('Failed to attach directory listener:', err);
    return () => {};
  }
};

export { app, db, auth, isInitialized };
