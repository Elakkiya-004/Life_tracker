import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getLocalData,
  setLocalData,
  STORAGE_KEYS,
  DEFAULT_USERS,
  DEFAULT_MENU_PERMISSIONS,
  AVAILABLE_MENUS
} from '../services/storage';
import {
  initFirebase,
  auth,
  syncUserToDirectoryCloud,
  deleteUserFromDirectoryCloud,
  listenToUsersDirectory,
  syncMenuPermissionsToCloud,
  listenToMenuPermissions
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
        // Seamlessly migrate previous admin credentials to new email & password
        const migrated = data.map(u => {
          if (u && (u.role === 'super_admin' || u.email === 'admin@lifetracker.com')) {
            return {
              ...u,
              name: u.name === 'Super Admin' ? 'Elakkiya' : (u.name || 'Elakkiya'),
              email: 'elakkiya.sakthivelu3089@gmail.com',
              password: 'Cr3089',
              role: 'super_admin',
            };
          }
          return u;
        });

        // Ensure default super admin exists
        const hasAdmin = migrated.some(u => u && u.role === 'super_admin');
        const finalList = hasAdmin ? migrated : [DEFAULT_USERS[0], ...migrated];
        setLocalData(STORAGE_KEYS.USERS_DIRECTORY, finalList);
        return finalList;
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
        if (savedUser.role === 'super_admin' || savedUser.email === 'admin@lifetracker.com') {
          const updatedAdmin = {
            ...savedUser,
            name: savedUser.name === 'Super Admin' ? 'Elakkiya' : (savedUser.name || 'Elakkiya'),
            email: 'elakkiya.sakthivelu3089@gmail.com',
          };
          setLocalData(STORAGE_KEYS.AUTH_USER, updatedAdmin);
          return updatedAdmin;
        }
        return savedUser;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Global Menu Permissions for regular users (Toggled by Super Admin)
  const [menuPermissions, setMenuPermissions] = useState(() => {
    try {
      const saved = getLocalData(STORAGE_KEYS.MENU_PERMISSIONS, null);
      if (saved && typeof saved === 'object') {
        return { ...DEFAULT_MENU_PERMISSIONS, ...saved };
      }
      setLocalData(STORAGE_KEYS.MENU_PERMISSIONS, DEFAULT_MENU_PERMISSIONS);
      return DEFAULT_MENU_PERMISSIONS;
    } catch {
      return DEFAULT_MENU_PERMISSIONS;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sync users directory & menu permissions with Firebase Cloud
  useEffect(() => {
    const fbRes = initFirebase();
    if (fbRes.success) {
      // Seed default admin and menu permissions in cloud
      DEFAULT_USERS.forEach(u => syncUserToDirectoryCloud(u));
      syncMenuPermissionsToCloud(menuPermissions);

      const unsubUsers = listenToUsersDirectory((cloudUsers) => {
        if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
          setUsersList(prev => {
            const mergedMap = new Map();
            prev.forEach(u => u && u.email && mergedMap.set(u.email.toLowerCase(), u));
            cloudUsers.forEach(u => u && u.email && mergedMap.set(u.email.toLowerCase(), { ...mergedMap.get(u.email.toLowerCase()), ...u }));
            const mergedList = Array.from(mergedMap.values());
            setLocalData(STORAGE_KEYS.USERS_DIRECTORY, mergedList);
            return mergedList;
          });
        }
      });

      const unsubPerms = listenToMenuPermissions((cloudPerms) => {
        if (cloudPerms && typeof cloudPerms === 'object') {
          setMenuPermissions(prev => {
            const updated = { ...prev, ...cloudPerms };
            setLocalData(STORAGE_KEYS.MENU_PERMISSIONS, updated);
            return updated;
          });
        }
      });

      return () => {
        unsubUsers && unsubUsers();
        unsubPerms && unsubPerms();
      };
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
        avatar: foundUser.avatar || null,
        avatarBg: foundUser.avatarBg || null,
        jobTitle: foundUser.jobTitle || '',
        bio: foundUser.bio || '',
        allowedMenus: foundUser.allowedMenus || null,
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

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Update Current User Profile (Avatar / Photo, Name, Job Title, Bio, Password)
  const updateCurrentUserProfile = useCallback(async ({ name, avatar, avatarBg, jobTitle, bio, newPassword }) => {
    if (!currentUser) return { success: false, error: 'No user is currently logged in.' };

    const targetUser = usersList.find(u => u && u.email?.toLowerCase() === currentUser.email?.toLowerCase());
    if (!targetUser) return { success: false, error: 'User record not found.' };

    // If changing password, update directly
    let updatedPassword = targetUser.password;
    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 4) {
        return { success: false, error: 'New password must be at least 4 characters long.' };
      }
      updatedPassword = newPassword.trim();
    }

    const updatedUser = {
      ...targetUser,
      name: name !== undefined ? name.trim() : targetUser.name,
      avatar: avatar !== undefined ? avatar : (targetUser.avatar || null),
      avatarBg: avatarBg !== undefined ? avatarBg : (targetUser.avatarBg || null),
      jobTitle: jobTitle !== undefined ? jobTitle.trim() : (targetUser.jobTitle || ''),
      bio: bio !== undefined ? bio.trim() : (targetUser.bio || ''),
      password: updatedPassword,
      updatedAt: new Date().toISOString(),
    };

    const updatedSession = {
      ...currentUser,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      avatarBg: updatedUser.avatarBg,
      jobTitle: updatedUser.jobTitle,
      bio: updatedUser.bio,
    };

    const updatedList = usersList.map(u => u.uid === targetUser.uid ? updatedUser : u);

    setCurrentUser(updatedSession);
    setLocalData(STORAGE_KEYS.AUTH_USER, updatedSession);

    setUsersList(updatedList);
    setLocalData(STORAGE_KEYS.USERS_DIRECTORY, updatedList);

    await syncUserToDirectoryCloud(updatedUser);

    return { success: true, user: updatedSession };
  }, [currentUser, usersList]);

  // Super Admin: Create / Add New User with optional allowedMenus
  const createUser = useCallback(async ({ name, email, password, role = 'user', avatar = null, avatarBg = null, jobTitle = '', bio = '', allowedMenus = null }) => {
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
      avatar: avatar || null,
      avatarBg: avatarBg || null,
      jobTitle: jobTitle || (role === 'super_admin' ? 'System Administrator' : 'Member'),
      bio: bio || '',
      allowedMenus: Array.isArray(allowedMenus) ? allowedMenus : null,
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

  // Super Admin: Toggle Global Menu Permission (Show / Hide menu for users)
  const toggleMenuPermission = useCallback(async (menuId) => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Only Super Admin can toggle menu permissions.' };
    }

    setMenuPermissions(prev => {
      const isCurrentlyEnabled = prev[menuId] !== false;
      const updated = {
        ...prev,
        [menuId]: !isCurrentlyEnabled
      };
      setLocalData(STORAGE_KEYS.MENU_PERMISSIONS, updated);
      syncMenuPermissionsToCloud(updated);
      return updated;
    });

    return { success: true };
  }, [currentUser]);

  // Super Admin: Set all menu permissions at once
  const updateAllMenuPermissions = useCallback(async (newPermissions) => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized.' };
    }
    setMenuPermissions(newPermissions);
    setLocalData(STORAGE_KEYS.MENU_PERMISSIONS, newPermissions);
    await syncMenuPermissionsToCloud(newPermissions);
    return { success: true };
  }, [currentUser]);

  // Super Admin: Update Specific User's Menu Permissions (Per-User Override)
  const updateUserAllowedMenus = useCallback(async (uid, allowedMenus) => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized.' };
    }

    const targetUser = usersList.find(u => u && u.uid === uid);
    if (!targetUser) return { success: false, error: 'User not found.' };

    const updatedUser = { ...targetUser, allowedMenus: Array.isArray(allowedMenus) ? allowedMenus : null };
    const updatedList = usersList.map(u => u.uid === uid ? updatedUser : u);

    setUsersList(updatedList);
    setLocalData(STORAGE_KEYS.USERS_DIRECTORY, updatedList);
    await syncUserToDirectoryCloud(updatedUser);

    // Update session if editing self
    if (currentUser.uid === uid) {
      const updatedSession = { ...currentUser, allowedMenus: updatedUser.allowedMenus };
      setCurrentUser(updatedSession);
      setLocalData(STORAGE_KEYS.AUTH_USER, updatedSession);
    }

    return { success: true };
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

  // Helper to check if a menu is visible for a user
  const isMenuVisible = useCallback((menuId, targetUser = currentUser) => {
    if (!targetUser) return false;
    // Super Admin can always see all menus
    if (targetUser.role === 'super_admin') return true;

    // If user has specific custom allowedMenus array
    if (Array.isArray(targetUser.allowedMenus)) {
      return targetUser.allowedMenus.includes(menuId);
    }

    // Otherwise use global permissions
    return menuPermissions[menuId] !== false;
  }, [currentUser, menuPermissions]);

  const value = {
    currentUser,
    usersList,
    menuPermissions,
    availableMenus: AVAILABLE_MENUS,
    isLoading,
    authError,
    isProfileModalOpen,
    setIsProfileModalOpen,
    login,
    logout,
    updateCurrentUserProfile,
    createUser,
    toggleMenuPermission,
    updateAllMenuPermissions,
    updateUserAllowedMenus,
    updateUserStatus,
    updateUserPassword,
    deleteUser,
    isMenuVisible,
    isSuperAdmin: currentUser?.role === 'super_admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
