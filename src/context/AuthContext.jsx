import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getLocalData,
  setLocalData,
  STORAGE_KEYS,
  DEFAULT_USERS
} from '../services/storage';
import {
  initFirebase,
  auth,
  syncUserToDirectoryCloud,
  deleteUserFromDirectoryCloud,
  listenToUsersDirectory
} from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize Users Directory from localStorage or defaults
  const [usersList, setUsersList] = useState(() => {
    try {
      const data = getLocalData(STORAGE_KEYS.USERS_DIRECTORY, null);
      if (Array.isArray(data) && data.length > 0) {
        // Ensure default super admin exists
        const hasAdmin = data.some(u => u && u.role === 'super_admin');
        if (!hasAdmin) {
          const merged = [...DEFAULT_USERS, ...data];
          setLocalData(STORAGE_KEYS.USERS_DIRECTORY, merged);
          return merged;
        }
        return data;
      }
      setLocalData(STORAGE_KEYS.USERS_DIRECTORY, DEFAULT_USERS);
      return DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  // Initialize Active User Session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = getLocalData(STORAGE_KEYS.AUTH_USER, null);
      if (savedUser && savedUser.email) {
        return savedUser;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sync users directory with Firebase Cloud
  useEffect(() => {
    const fbRes = initFirebase();
    if (fbRes.success) {
      // Seed default admin in cloud if directory empty
      DEFAULT_USERS.forEach(u => syncUserToDirectoryCloud(u));

      const unsubscribe = listenToUsersDirectory((cloudUsers) => {
        if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
          setUsersList(prev => {
            const mergedMap = new Map();
            // Local users first
            prev.forEach(u => u && u.email && mergedMap.set(u.email.toLowerCase(), u));
            // Overwrite with cloud directory
            cloudUsers.forEach(u => u && u.email && mergedMap.set(u.email.toLowerCase(), { ...mergedMap.get(u.email.toLowerCase()), ...u }));
            const mergedList = Array.from(mergedMap.values());
            setLocalData(STORAGE_KEYS.USERS_DIRECTORY, mergedList);
            return mergedList;
          });
        }
      });
      return () => unsubscribe && unsubscribe();
    }
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      if (!cleanEmail || !cleanPass) {
        setAuthError('Please enter both email and password.');
        setIsLoading(false);
        return { success: false, error: 'Please enter both email and password.' };
      }

      // Check against users directory
      const foundUser = usersList.find(u => u && u.email?.toLowerCase() === cleanEmail);

      if (!foundUser) {
        setAuthError('User not found. Please contact Super Admin to get an account.');
        setIsLoading(false);
        return { success: false, error: 'User not found. Please contact Super Admin to get an account.' };
      }

      if (foundUser.password && foundUser.password !== cleanPass) {
        setAuthError('Incorrect password. Please try again.');
        setIsLoading(false);
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      if (foundUser.status === 'disabled') {
        setAuthError('Your account has been suspended by Super Admin. Contact admin for access.');
        setIsLoading(false);
        return { success: false, error: 'Your account has been suspended by Super Admin.' };
      }

      const userSession = {
        uid: foundUser.uid || `usr-${foundUser.email.replace(/[@.]/g, '_')}`,
        name: foundUser.name || (foundUser.role === 'super_admin' ? 'Super Admin' : 'LifeTracker Member'),
        email: foundUser.email,
        role: foundUser.role || 'user',
        status: foundUser.status || 'active',
        createdAt: foundUser.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      setCurrentUser(userSession);
      setLocalData(STORAGE_KEYS.AUTH_USER, userSession);
      setIsLoading(false);
      return { success: true, user: userSession };
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, [usersList]);

  // Logout handler
  const logout = useCallback(() => {
    setCurrentUser(null);
    setLocalData(STORAGE_KEYS.AUTH_USER, null);
  }, []);

  // Super Admin: Create / Add New User
  const createUser = useCallback(async ({ name, email, password, role = 'user' }) => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Only Super Admin can create users.' };
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass || !cleanName) {
      return { success: false, error: 'Name, email, and password are all required.' };
    }

    // Check duplicate
    const exists = usersList.some(u => u && u.email?.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: `A user with email "${cleanEmail}" already exists.` };
    }

    const newUser = {
      uid: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role: role === 'super_admin' ? 'super_admin' : 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: currentUser.email,
    };

    const updatedList = [newUser, ...usersList];
    setUsersList(updatedList);
    setLocalData(STORAGE_KEYS.USERS_DIRECTORY, updatedList);

    // Sync to cloud directory
    await syncUserToDirectoryCloud(newUser);

    return { success: true, user: newUser };
  }, [currentUser, usersList]);

  // Super Admin: Update User Status (active / disabled)
  const updateUserStatus = useCallback(async (uid, newStatus) => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Only Super Admin can change user status.' };
    }

    const targetUser = usersList.find(u => u && u.uid === uid);
    if (!targetUser) return { success: false, error: 'User not found.' };

    if (targetUser.email === currentUser.email && newStatus === 'disabled') {
      return { success: false, error: 'You cannot suspend your own Super Admin account.' };
    }

    const updatedUser = { ...targetUser, status: newStatus };
    const updatedList = usersList.map(u => u.uid === uid ? updatedUser : u);

    setUsersList(updatedList);
    setLocalData(STORAGE_KEYS.USERS_DIRECTORY, updatedList);
    await syncUserToDirectoryCloud(updatedUser);

    return { success: true };
  }, [currentUser, usersList]);

  // Super Admin: Update User Password
  const updateUserPassword = useCallback(async (uid, newPassword) => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Only Super Admin can reset passwords.' };
    }

    const cleanPass = (newPassword || '').trim();
    if (!cleanPass) return { success: false, error: 'Password cannot be empty.' };

    const targetUser = usersList.find(u => u && u.uid === uid);
    if (!targetUser) return { success: false, error: 'User not found.' };

    const updatedUser = { ...targetUser, password: cleanPass };
    const updatedList = usersList.map(u => u.uid === uid ? updatedUser : u);

    setUsersList(updatedList);
    setLocalData(STORAGE_KEYS.USERS_DIRECTORY, updatedList);
    await syncUserToDirectoryCloud(updatedUser);

    return { success: true };
  }, [currentUser, usersList]);

  // Super Admin: Delete User
  const deleteUser = useCallback(async (uid) => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Only Super Admin can delete users.' };
    }

    const targetUser = usersList.find(u => u && u.uid === uid);
    if (!targetUser) return { success: false, error: 'User not found.' };

    if (targetUser.email === currentUser.email) {
      return { success: false, error: 'You cannot delete your own active Super Admin account.' };
    }

    const updatedList = usersList.filter(u => u && u.uid !== uid);
    setUsersList(updatedList);
    setLocalData(STORAGE_KEYS.USERS_DIRECTORY, updatedList);
    await deleteUserFromDirectoryCloud(uid);

    return { success: true };
  }, [currentUser, usersList]);

  const value = {
    currentUser,
    usersList,
    isLoading,
    authError,
    login,
    logout,
    createUser,
    updateUserStatus,
    updateUserPassword,
    deleteUser,
    isSuperAdmin: currentUser?.role === 'super_admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
