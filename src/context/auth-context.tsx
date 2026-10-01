import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  apiLogin,
  apiRegister,
  apiFetchUsers,
  apiApproveUser,
  apiRejectUser,
  apiDeleteUser,
  apiUpdateProfile,
} from '@/services/api-client';

export interface EmployeeUser {
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  employeeId: string;
  status?: 'active' | 'pending' | 'rejected';
  documentsCount?: number;
}

export interface StoredAccount extends EmployeeUser {
  password?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: EmployeeUser;
  registeredAccounts: StoredAccount[];
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  login: (email: string, password?: string) => Promise<AuthResult>;
  register: (accountData: {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    role?: string;
    department?: string;
  }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<EmployeeUser>, newPassword?: string) => Promise<AuthResult>;
  approveAccount: (email: string) => Promise<void>;
  rejectAccount: (email: string) => Promise<void>;
  removeAccount: (email: string) => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

const STORAGE_KEY_SESSION = '@docuvault_auth_session';
const STORAGE_KEY_ACCOUNTS = '@docuvault_accounts';
const STORAGE_KEY_ADMIN_MODE = '@docuvault_admin_mode';
export const INITIAL_DEFAULT_ADMIN_ACCOUNT: StoredAccount = {
  name: 'Administrator',
  email: 'admin@docuvault.io',
  avatar: '',
  role: 'Admin',
  department: 'Administration',
  employeeId: 'ADM-001',
  status: 'active',
  password: 'Admin@123',
  documentsCount: 0,
};

export const DEFAULT_ADMIN_ACCOUNT = INITIAL_DEFAULT_ADMIN_ACCOUNT;
export const INITIAL_STAFF_ACCOUNTS: StoredAccount[] = [INITIAL_DEFAULT_ADMIN_ACCOUNT];

const EMPTY_USER: EmployeeUser = {
  name: '',
  email: '',
  avatar: '',
  role: 'Staff',
  department: '',
  employeeId: '',
  status: 'active',
  documentsCount: 0,
};

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  isLoading: true,
  user: EMPTY_USER,
  registeredAccounts: [],
  isAdminMode: false,
  setIsAdminMode: () => {},
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  updateUser: async () => ({ success: true }),
  approveAccount: async () => {},
  rejectAccount: async () => {},
  removeAccount: async () => {},
  syncWithBackend: async () => {},
});

function getStoredWebSession(): { user: EmployeeUser | null; isAdminMode: boolean } {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const rawSession = window.localStorage.getItem(STORAGE_KEY_SESSION);
      const rawAdmin = window.localStorage.getItem(STORAGE_KEY_ADMIN_MODE);
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed && parsed.email) {
          return {
            user: parsed,
            isAdminMode: parsed.role === 'Admin' || rawAdmin === 'true',
          };
        }
      }
    } catch {}
  }
  return { user: null, isAdminMode: false };
}

async function persistSession(sessionUser: EmployeeUser | null, adminModeVal: boolean) {
  try {
    if (sessionUser) {
      const userJson = JSON.stringify(sessionUser);
      const adminJson = JSON.stringify(adminModeVal);
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, userJson).catch(() => {});
      await AsyncStorage.setItem(STORAGE_KEY_ADMIN_MODE, adminJson).catch(() => {});
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(STORAGE_KEY_SESSION, userJson);
          window.localStorage.setItem(STORAGE_KEY_ADMIN_MODE, adminJson);
        } catch {}
      }
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY_SESSION).catch(() => {});
      await AsyncStorage.removeItem(STORAGE_KEY_ADMIN_MODE).catch(() => {});
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem(STORAGE_KEY_SESSION);
          window.localStorage.removeItem(STORAGE_KEY_ADMIN_MODE);
        } catch {}
      }
    }
  } catch (e) {
    console.warn('Session persistence error:', e);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialWeb = getStoredWebSession();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!initialWeb.user);
  const [isLoading, setIsLoading] = useState<boolean>(!initialWeb.user);
  const [user, setUser] = useState<EmployeeUser>(initialWeb.user || EMPTY_USER);
  const [accounts, setAccounts] = useState<StoredAccount[]>(INITIAL_STAFF_ACCOUNTS);
  const [isAdminMode, setIsAdminModeState] = useState<boolean>(initialWeb.isAdminMode);

  const setIsAdminMode = async (val: boolean) => {
    setIsAdminModeState(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ADMIN_MODE, JSON.stringify(val));
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY_ADMIN_MODE, JSON.stringify(val));
      }
    } catch (e) {
      console.warn('Failed to save admin mode flag:', e);
    }
  };

  // Sync users from backend API
  const syncWithBackend = useCallback(async () => {
    try {
      const rawAccounts = await AsyncStorage.getItem(STORAGE_KEY_ACCOUNTS);
      let localAccounts: StoredAccount[] = [];
      if (rawAccounts) {
        try {
          const parsed = JSON.parse(rawAccounts);
          if (Array.isArray(parsed)) localAccounts = parsed;
        } catch {}
      }

      const res = await apiFetchUsers();
      if (res.success && Array.isArray(res.users)) {
        // Collect existing local passwords so they are NEVER wiped by backend sync
        const localPasswordMap = new Map<string, string>();
        localAccounts.forEach((acc) => {
          if (acc.password) {
            localPasswordMap.set(acc.email.toLowerCase(), acc.password);
          }
        });

        const accMap = new Map<string, StoredAccount>();
        // Add backend users, preserving local passwords
        res.users.forEach((u) => {
          const emailLower = u.email.toLowerCase();
          const existingPassword = localPasswordMap.get(emailLower);
          accMap.set(emailLower, {
            ...u,
            password: existingPassword,
          });
        });

        // Merge local accounts not in backend
        localAccounts.forEach((u) => {
          const emailLower = u.email.toLowerCase();
          if (!accMap.has(emailLower)) {
            accMap.set(emailLower, u);
          }
        });

        // Ensure at least one admin exists in accMap
        const hasAdminInMap = Array.from(accMap.values()).some((u) => u.role === 'Admin');
        if (!hasAdminInMap) {
          const defaultAdminEmail = INITIAL_DEFAULT_ADMIN_ACCOUNT.email.toLowerCase();
          accMap.set(defaultAdminEmail, {
            ...INITIAL_DEFAULT_ADMIN_ACCOUNT,
            password: localPasswordMap.get(defaultAdminEmail) || INITIAL_DEFAULT_ADMIN_ACCOUNT.password,
          });
        }

        const merged = Array.from(accMap.values());
        setAccounts(merged);
        await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(merged)).catch(() => {});
      }
    } catch {
      // Backend offline or error - keep cached accounts
    }
  }, []);

  // Hydrate accounts and active session on startup
  useEffect(() => {
    let canceled = false;

    async function hydrateAuth() {
      try {
        // Step 1: Read session from storage
        let rawSession: string | null = null;
        let rawAdminMode: string | null = null;
        let rawAccounts: string | null = null;

        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          try {
            rawSession = window.localStorage.getItem(STORAGE_KEY_SESSION);
            rawAdminMode = window.localStorage.getItem(STORAGE_KEY_ADMIN_MODE);
            rawAccounts = window.localStorage.getItem(STORAGE_KEY_ACCOUNTS);
          } catch {}
        }

        if (!rawSession) {
          rawSession = await AsyncStorage.getItem(STORAGE_KEY_SESSION).catch(() => null);
        }
        if (!rawAdminMode) {
          rawAdminMode = await AsyncStorage.getItem(STORAGE_KEY_ADMIN_MODE).catch(() => null);
        }
        if (!rawAccounts) {
          rawAccounts = await AsyncStorage.getItem(STORAGE_KEY_ACCOUNTS).catch(() => null);
        }

        let loadedAccounts: StoredAccount[] = [];
        if (rawAccounts) {
          try {
            const parsed = JSON.parse(rawAccounts);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedAccounts = parsed.filter(
                (a: StoredAccount) => a.email.toLowerCase() !== 'admin@enterprise.com'
              );
            }
          } catch {}
        }

        const hasLoadedAdmin = loadedAccounts.some((a) => a.role === 'Admin');
        if (!hasLoadedAdmin) {
          loadedAccounts.push(INITIAL_DEFAULT_ADMIN_ACCOUNT);
        }

        if (!canceled) {
          setAccounts(loadedAccounts);
        }

        // Restore active user session if exists - NEVER clear unless user manually logs out
        if (rawSession) {
          try {
            const sessionUser = JSON.parse(rawSession) as EmployeeUser;
            if (sessionUser && sessionUser.email && sessionUser.email.trim()) {
              const matchedAcc = loadedAccounts.find(
                (acc) => acc.email.toLowerCase() === sessionUser.email.toLowerCase()
              );
              const effectiveUser: EmployeeUser = matchedAcc ? { ...sessionUser, ...matchedAcc } : sessionUser;
              const isUserAdmin = effectiveUser.role === 'Admin' || rawAdminMode === 'true';

              if (!canceled) {
                setUser(effectiveUser);
                setIsLoggedIn(true);
                setIsAdminModeState(isUserAdmin);
              }
            }
          } catch (e) {
            console.warn('Failed to parse active session:', e);
          }
        }

        // Step 2: Fetch latest users from MongoDB backend if reachable
        try {
          const res = await apiFetchUsers();
          if (res.success && Array.isArray(res.users) && !canceled) {
            const localPasswordMap = new Map<string, string>();
            loadedAccounts.forEach((acc) => {
              if (acc.password) {
                localPasswordMap.set(acc.email.toLowerCase(), acc.password);
              }
            });

            const accMap = new Map<string, StoredAccount>();
            res.users.forEach((u) => {
              const emailLower = u.email.toLowerCase();
              const existingPassword = localPasswordMap.get(emailLower);
              accMap.set(emailLower, {
                ...u,
                password: existingPassword,
              });
            });

            loadedAccounts.forEach((u) => {
              const emailLower = u.email.toLowerCase();
              if (!accMap.has(emailLower)) {
                accMap.set(emailLower, u);
              }
            });

            const hasAdminInMap = Array.from(accMap.values()).some((u) => u.role === 'Admin');
            if (!hasAdminInMap) {
              const defaultAdminEmail = INITIAL_DEFAULT_ADMIN_ACCOUNT.email.toLowerCase();
              accMap.set(defaultAdminEmail, {
                ...INITIAL_DEFAULT_ADMIN_ACCOUNT,
                password: localPasswordMap.get(defaultAdminEmail) || INITIAL_DEFAULT_ADMIN_ACCOUNT.password,
              });
            }

            const merged = Array.from(accMap.values());
            setAccounts(merged);
            await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(merged)).catch(() => {});

            // Refresh currently logged-in user profile from backend data without logging out
            if (rawSession) {
              try {
                const sUser = JSON.parse(rawSession) as EmployeeUser;
                const freshUser = res.users.find(
                  (u) => u.email.toLowerCase() === sUser.email.toLowerCase()
                );
                if (freshUser && !canceled) {
                  setUser((prev) => ({
                    ...prev,
                    ...freshUser,
                    role: prev.role === 'Admin' ? 'Admin' : (freshUser.role || prev.role),
                  }));
                }
              } catch {}
            }
          }
        } catch {
          // Backend offline - cached session continues undisturbed
        }
      } catch (err) {
        console.warn('Error hydrating auth state:', err);
      } finally {
        if (!canceled) {
          setIsLoading(false);
        }
      }
    }

    hydrateAuth();

    return () => {
      canceled = true;
    };
  }, []);

  const login = async (email: string, password?: string): Promise<AuthResult> => {
    let cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password?.trim();

    const activeAdmin = accounts.find((a) => a.role === 'Admin');
    if (cleanEmail === 'admin') {
      if (activeAdmin) {
        cleanEmail = activeAdmin.email.toLowerCase();
      }
    }

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered work email.' };
    }

    if (!cleanPassword) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Attempt backend API login first
    try {
      const apiRes = await apiLogin(cleanEmail, cleanPassword);
      if (apiRes.success && apiRes.user) {
        const isUserAdmin = apiRes.user.role === 'Admin';

        // Block login if employee is not approved by administrator
        if (!isUserAdmin && apiRes.user.status === 'pending') {
          return {
            success: false,
            error: 'Your account is pending administrator approval. You cannot log in until the admin approves your account.',
          };
        }

        if (!isUserAdmin && apiRes.user.status === 'rejected') {
          return {
            success: false,
            error: 'Your account registration was rejected. Please contact an administrator.',
          };
        }

        const authUser: EmployeeUser = {
          name: apiRes.user.name,
          email: apiRes.user.email,
          avatar: apiRes.user.avatar || '',
          role: isUserAdmin ? 'Admin' : (apiRes.user.role || 'Staff'),
          department: apiRes.user.department || 'Operations',
          employeeId: apiRes.user.employeeId || (isUserAdmin ? 'ADM-001' : 'EMP-1001'),
          status: apiRes.user.status || 'active',
          documentsCount: apiRes.user.documentsCount || 0,
        };

        setUser(authUser);
        setIsLoggedIn(true);
        setIsAdminModeState(isUserAdmin);
        await persistSession(authUser, isUserAdmin);

        // Save the successful password into local accounts cache
        setAccounts((prev) => {
          const updated = prev.map((acc) =>
            acc.email.toLowerCase() === cleanEmail ? { ...acc, password: cleanPassword, status: apiRes.user.status } : acc
          );
          AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updated)).catch(() => {});
          return updated;
        });

        return { success: true };
      } else if (!apiRes.offline && apiRes.message) {
        return { success: false, error: apiRes.message };
      }
    } catch {
      // Backend offline: fall back to local accounts cache
    }

    // Fallback: Local accounts authentication
    let matchedAccount = accounts.find(
      (acc) => acc.email.trim().toLowerCase() === cleanEmail
    );

    const hasAnyAdminInCache = accounts.some((a) => a.role === 'Admin');
    if (!matchedAccount && !hasAnyAdminInCache) {
      matchedAccount = INITIAL_DEFAULT_ADMIN_ACCOUNT;
    }

    if (!matchedAccount) {
      return {
        success: false,
        error: 'No account found with this email. Please register first.',
      };
    }

    // STRICT password check - only the matching password works!
    const isPasswordValid = matchedAccount.password === cleanPassword;

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Incorrect password. Please verify and try again.',
      };
    }

    const isUserAdmin = matchedAccount.role === 'Admin';

    // Strict approval check: non-admin employees CANNOT log in until approved by admin!
    if (!isUserAdmin && matchedAccount.status === 'pending') {
      return {
        success: false,
        error: 'Your account is pending administrator approval. You cannot log in until the admin approves your account.',
      };
    }

    if (!isUserAdmin && matchedAccount.status === 'rejected') {
      return {
        success: false,
        error: 'Your account registration was rejected. Please contact an administrator.',
      };
    }

    const authUser: EmployeeUser = {
      name: matchedAccount.name,
      email: matchedAccount.email,
      avatar: matchedAccount.avatar || '',
      role: isUserAdmin ? 'Admin' : (matchedAccount.role || 'Employee'),
      department: matchedAccount.department || 'Operations',
      employeeId: matchedAccount.employeeId || (isUserAdmin ? 'ADM-001' : `EMP-${Math.floor(10000 + Math.random() * 90000)}`),
      status: matchedAccount.status || 'active',
      documentsCount: matchedAccount.documentsCount || 0,
    };

    setUser(authUser);
    setIsLoggedIn(true);
    setIsAdminModeState(isUserAdmin);
    await persistSession(authUser, isUserAdmin);

    return { success: true };
  };

  const register = async (accountData: {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    role?: string;
    department?: string;
  }): Promise<AuthResult> => {
    const cleanName = accountData.name.trim();
    const cleanEmail = accountData.email.trim().toLowerCase();
    const cleanPassword = accountData.password?.trim() || '';
    const cleanAvatar = accountData.avatar?.trim() || '';

    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }

    if (!cleanEmail) {
      return { success: false, error: 'Work email is required.' };
    }
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid work email address.' };
    }

    if (!cleanAvatar) {
      return { success: false, error: 'Profile photo is required. Please upload your photo to register.' };
    }

    if (!cleanPassword) {
      return { success: false, error: 'Password is required.' };
    }
    if (cleanPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(cleanPassword)) {
      return { success: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(cleanPassword)) {
      return { success: false, error: 'Password must contain at least one lowercase letter (a-z).' };
    }
    if (!/[0-9]/.test(cleanPassword)) {
      return { success: false, error: 'Password must contain at least one number (0-9).' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(cleanPassword)) {
      return { success: false, error: 'Password must contain at least one special character (!@#$%^&*...).' };
    }

    // Call backend API to register in MongoDB
    try {
      const apiRes = await apiRegister({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        avatar: cleanAvatar,
        role: accountData.role || 'Staff',
        department: accountData.department || 'Operations',
      });

      if (!apiRes.success && !apiRes.offline) {
        return { success: false, error: apiRes.message || 'Registration failed on server.' };
      }
    } catch {
      // Backend offline: continue with local registration
    }

    // Local account cache - status defaults to 'pending' until Admin approval!
    const newAccount: StoredAccount = {
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      avatar: cleanAvatar,
      role: accountData.role || 'Employee',
      department: accountData.department || 'Operations',
      employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'pending',
      documentsCount: 0,
    };

    const updatedAccounts = [...accounts.filter((a) => a.email.toLowerCase() !== cleanEmail), newAccount];
    setAccounts(updatedAccounts);

    await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updatedAccounts)).catch(() => {});

    return { success: true };
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUser(EMPTY_USER);
    setIsAdminModeState(false);
    await persistSession(null, false);
  };

  const updateUser = async (
    data: Partial<EmployeeUser>,
    newPassword?: string
  ): Promise<AuthResult> => {
    if (newPassword && newPassword.trim()) {
      const cleanPassword = newPassword.trim();
      if (cleanPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters long.' };
      }
      if (!/[A-Z]/.test(cleanPassword)) {
        return { success: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
      }
      if (!/[a-z]/.test(cleanPassword)) {
        return { success: false, error: 'Password must contain at least one lowercase letter (a-z).' };
      }
      if (!/[0-9]/.test(cleanPassword)) {
        return { success: false, error: 'Password must contain at least one number (0-9).' };
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(cleanPassword)) {
        return { success: false, error: 'Password must contain at least one special character (!@#$%^&*...).' };
      }
    }

    let cleanNewEmail: string | undefined;
    if (data.email && data.email.trim()) {
      cleanNewEmail = data.email.trim().toLowerCase();
      if (!/\S+@\S+\.\S+/.test(cleanNewEmail)) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
    }

    const previousEmail = (user.email || '').toLowerCase();

    // Check local email collision
    if (cleanNewEmail && cleanNewEmail !== previousEmail) {
      const emailCollision = accounts.some(
        (acc) => acc.email.toLowerCase() === cleanNewEmail && acc.email.toLowerCase() !== previousEmail
      );
      if (emailCollision) {
        return { success: false, error: 'An account with this email address already exists.' };
      }
    }

    // Persist to backend first and validate response
    try {
      const apiRes = await apiUpdateProfile(
        {
          email: previousEmail,
          ...data,
          ...(cleanNewEmail && cleanNewEmail !== previousEmail ? { newEmail: cleanNewEmail } : {}),
        },
        newPassword && newPassword.trim() ? newPassword.trim() : undefined
      );

      if (!apiRes.success && !apiRes.offline) {
        return { success: false, error: apiRes.message || 'Failed to update profile.' };
      }
    } catch (err: any) {
      console.warn('Failed to update profile on backend:', err);
    }

    const effectiveEmail = cleanNewEmail || previousEmail;
    const isTargetAdmin = user.role === 'Admin';

    const updatedUser: EmployeeUser = {
      ...user,
      ...data,
      email: effectiveEmail,
      ...(isTargetAdmin ? { role: 'Admin' } : {}),
    };

    setUser(updatedUser);
    await persistSession(updatedUser, isTargetAdmin);

    // Update in local accounts list:
    // Remove both previousEmail and effectiveEmail to ensure no stale/duplicate accounts remain
    const cleanOtherAccounts = accounts.filter(
      (acc) => acc.email.toLowerCase() !== previousEmail && acc.email.toLowerCase() !== effectiveEmail
    );

    const oldAcc = accounts.find((acc) => acc.email.toLowerCase() === previousEmail);
    const existingPassword = oldAcc?.password || (isTargetAdmin ? 'Admin@123' : 'password123');
    const finalPassword = newPassword && newPassword.trim() ? newPassword.trim() : existingPassword;

    const updatedAccount: StoredAccount = {
      ...(oldAcc || {}),
      ...updatedUser,
      password: finalPassword,
    };

    const finalAccounts = [...cleanOtherAccounts, updatedAccount];
    setAccounts(finalAccounts);
    await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(finalAccounts)).catch(() => {});

    return { success: true };
  };

  const approveAccount = async (email: string) => {
    // 1. Optimistically update local state
    const updated = accounts.map((acc) => {
      if (acc.email.toLowerCase() === email.toLowerCase()) {
        return { ...acc, status: 'active' as const };
      }
      return acc;
    });
    setAccounts(updated);
    await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updated)).catch(() => {});

    // 2. Persist to MongoDB backend
    try {
      await apiApproveUser(email);
    } catch (err) {
      console.warn('Failed to approve account on backend:', err);
    }
  };

  const rejectAccount = async (email: string) => {
    // 1. Optimistically update local state
    const updated = accounts.filter(
      (acc) => acc.email.toLowerCase() !== email.toLowerCase()
    );
    setAccounts(updated);
    await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updated)).catch(() => {});

    // 2. Persist to MongoDB backend
    try {
      await apiRejectUser(email);
    } catch (err) {
      console.warn('Failed to reject account on backend:', err);
    }
  };

  const removeAccount = async (email: string) => {
    // 1. Optimistically update local state
    const updated = accounts.filter(
      (acc) => acc.email.toLowerCase() !== email.toLowerCase()
    );
    setAccounts(updated);
    await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updated)).catch(() => {});

    // 2. Persist to MongoDB backend
    try {
      await apiDeleteUser(email);
    } catch (err) {
      console.warn('Failed to remove account on backend:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        registeredAccounts: accounts,
        isAdminMode,
        setIsAdminMode,
        login,
        register,
        logout,
        updateUser,
        approveAccount,
        rejectAccount,
        removeAccount,
        syncWithBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
