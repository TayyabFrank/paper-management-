import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
export const FIXED_ADMIN_EMAIL = 'tayyab@admin.com';

export const DEFAULT_ADMIN_ACCOUNT: StoredAccount = {
  name: 'Tayyab',
  email: 'tayyab@admin.com',
  avatar: '',
  role: 'Admin',
  department: 'Administration',
  employeeId: 'ADM-001',
  status: 'active',
  password: 'Tayyab@123',
  documentsCount: 0,
};

export const INITIAL_STAFF_ACCOUNTS: StoredAccount[] = [DEFAULT_ADMIN_ACCOUNT];

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<EmployeeUser>(EMPTY_USER);
  const [accounts, setAccounts] = useState<StoredAccount[]>(INITIAL_STAFF_ACCOUNTS);
  const [isAdminMode, setIsAdminModeState] = useState<boolean>(false);

  const setIsAdminMode = async (val: boolean) => {
    setIsAdminModeState(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ADMIN_MODE, JSON.stringify(val));
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
            password: existingPassword || (emailLower === FIXED_ADMIN_EMAIL ? 'Tayyab@123' : undefined),
          });
        });

        // Merge local accounts not in backend
        localAccounts.forEach((u) => {
          const emailLower = u.email.toLowerCase();
          if (!accMap.has(emailLower)) {
            accMap.set(emailLower, u);
          }
        });

        // Ensure fixed admin exists in accMap
        if (!accMap.has(FIXED_ADMIN_EMAIL)) {
          accMap.set(FIXED_ADMIN_EMAIL, {
            ...DEFAULT_ADMIN_ACCOUNT,
            password: localPasswordMap.get(FIXED_ADMIN_EMAIL) || DEFAULT_ADMIN_ACCOUNT.password,
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
    let isMounted = true;

    async function hydrateAuth() {
      try {
        // Step 1: Load from local cache for instant UI rendering
        const rawAccounts = await AsyncStorage.getItem(STORAGE_KEY_ACCOUNTS);
        let loadedAccounts: StoredAccount[] = [];
        if (rawAccounts) {
          try {
            const parsed = JSON.parse(rawAccounts);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedAccounts = parsed.filter(
                (a: StoredAccount) => a.email.toLowerCase() !== 'admin@enterprise.com'
              );
            }
          } catch {
            loadedAccounts = [];
          }
        }

        // Ensure the fixed admin account exists in loadedAccounts
        const adminAccountIndex = loadedAccounts.findIndex(
          (a) => a.email.toLowerCase() === FIXED_ADMIN_EMAIL
        );
        if (adminAccountIndex === -1) {
          loadedAccounts.push(DEFAULT_ADMIN_ACCOUNT);
        } else {
          // Admin account exists! Preserve whatever password was saved, only ensure Admin role & active status
          loadedAccounts[adminAccountIndex] = {
            ...DEFAULT_ADMIN_ACCOUNT,
            ...loadedAccounts[adminAccountIndex],
            role: 'Admin',
            status: 'active',
          };
        }

        if (isMounted) {
          setAccounts(loadedAccounts);
        }

        // Restore admin mode preference
        const rawAdminMode = await AsyncStorage.getItem(STORAGE_KEY_ADMIN_MODE);
        if (rawAdminMode && isMounted) {
          try {
            setIsAdminModeState(JSON.parse(rawAdminMode));
          } catch {
            // ignore
          }
        }

        // Check active session
        const rawSession = await AsyncStorage.getItem(STORAGE_KEY_SESSION);
        if (rawSession && isMounted) {
          try {
            const sessionUser = JSON.parse(rawSession) as EmployeeUser;
            if (sessionUser && sessionUser.email && sessionUser.email.toLowerCase() !== 'admin@enterprise.com') {
              const matchedAcc = loadedAccounts.find(
                (acc) => acc.email.toLowerCase() === sessionUser.email.toLowerCase()
              );
              if (matchedAcc) {
                setUser({ ...matchedAcc });
                setIsLoggedIn(true);
                setIsAdminModeState(matchedAcc.role === 'Admin');
              } else {
                setUser(sessionUser);
                setIsLoggedIn(true);
                setIsAdminModeState(sessionUser.role === 'Admin');
              }
            } else {
              await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
            }
          } catch {
            await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
          }
        }

        // Step 2: Fetch latest users from MongoDB backend if reachable
        try {
          const res = await apiFetchUsers();
          if (res.success && Array.isArray(res.users) && isMounted) {
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
                password: existingPassword || (emailLower === FIXED_ADMIN_EMAIL ? 'Tayyab@123' : undefined),
              });
            });

            loadedAccounts.forEach((u) => {
              const emailLower = u.email.toLowerCase();
              if (!accMap.has(emailLower)) {
                accMap.set(emailLower, u);
              }
            });

            if (!accMap.has(FIXED_ADMIN_EMAIL)) {
              accMap.set(FIXED_ADMIN_EMAIL, {
                ...DEFAULT_ADMIN_ACCOUNT,
                password: localPasswordMap.get(FIXED_ADMIN_EMAIL) || DEFAULT_ADMIN_ACCOUNT.password,
              });
            }

            const merged = Array.from(accMap.values());
            setAccounts(merged);
            await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(merged)).catch(() => {});
          }
        } catch {
          // ignore offline
        }
      } catch (err) {
        console.warn('Error loading auth state from storage:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password?: string): Promise<AuthResult> => {
    let cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password?.trim();

    if (cleanEmail === 'admin') {
      cleanEmail = FIXED_ADMIN_EMAIL;
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
        const isUserAdmin = apiRes.user.role === 'Admin' || cleanEmail === FIXED_ADMIN_EMAIL;
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
        await AsyncStorage.setItem(STORAGE_KEY_ADMIN_MODE, JSON.stringify(isUserAdmin)).catch(() => {});
        await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(authUser)).catch(() => {});

        // Save the successful password into local accounts cache
        setAccounts((prev) => {
          const updated = prev.map((acc) =>
            acc.email.toLowerCase() === cleanEmail ? { ...acc, password: cleanPassword } : acc
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

    if (!matchedAccount && cleanEmail === FIXED_ADMIN_EMAIL) {
      matchedAccount = DEFAULT_ADMIN_ACCOUNT;
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

    const isUserAdmin = matchedAccount.role === 'Admin' || cleanEmail === FIXED_ADMIN_EMAIL;

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
    await AsyncStorage.setItem(STORAGE_KEY_ADMIN_MODE, JSON.stringify(isUserAdmin)).catch(() => {});
    await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(authUser)).catch(() => {});

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

    // Local account cache
    const newAccount: StoredAccount = {
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      avatar: cleanAvatar,
      role: accountData.role || 'Employee',
      department: accountData.department || 'Operations',
      employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'active',
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
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
      await AsyncStorage.removeItem(STORAGE_KEY_ADMIN_MODE);
    } catch (e) {
      console.warn('Failed to clear session:', e);
    }
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
    const updatedUser: EmployeeUser = {
      ...user,
      ...data,
      ...(cleanNewEmail ? { email: cleanNewEmail } : {}),
      ...(user.role === 'Admin' || previousEmail === FIXED_ADMIN_EMAIL ? { role: 'Admin' } : {}),
    };

    setUser(updatedUser);
    await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedUser)).catch(() => {});

    // Update in local accounts list
    let accountMatched = false;
    const updatedAccounts = accounts.map((acc) => {
      if (acc.email.toLowerCase() === previousEmail) {
        accountMatched = true;
        return {
          ...acc,
          ...data,
          ...(cleanNewEmail ? { email: cleanNewEmail } : {}),
          ...(newPassword && newPassword.trim() ? { password: newPassword.trim() } : {}),
          ...(user.role === 'Admin' || previousEmail === FIXED_ADMIN_EMAIL ? { role: 'Admin' } : {}),
        };
      }
      return acc;
    });

    if (!accountMatched) {
      updatedAccounts.push({
        ...updatedUser,
        password: newPassword && newPassword.trim() ? newPassword.trim() : (previousEmail === FIXED_ADMIN_EMAIL ? 'Tayyab@123' : 'password123'),
      });
    }

    setAccounts(updatedAccounts);
    await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updatedAccounts)).catch(() => {});

    // Persist to backend
    try {
      await apiUpdateProfile(
        {
          email: previousEmail,
          ...data,
          ...(cleanNewEmail && cleanNewEmail !== previousEmail ? { newEmail: cleanNewEmail } : {}),
        },
        newPassword && newPassword.trim() ? newPassword.trim() : undefined
      );
    } catch (err) {
      console.warn('Failed to update profile on backend:', err);
    }

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
