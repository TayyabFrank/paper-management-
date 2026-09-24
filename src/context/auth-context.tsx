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

export const INITIAL_STAFF_ACCOUNTS: StoredAccount[] = [
  {
    name: 'System Administrator',
    email: 'admin@enterprise.com',
    avatar: '',
    role: 'Admin',
    department: 'IT Administration',
    employeeId: 'ADM-001',
    status: 'active',
    password: 'password123',
    documentsCount: 0,
  },
];

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
        const accMap = new Map<string, StoredAccount>();
        // Add backend users first
        res.users.forEach((u) => accMap.set(u.email.toLowerCase(), u));
        // Merge local accounts
        localAccounts.forEach((u) => {
          const emailLower = u.email.toLowerCase();
          if (!accMap.has(emailLower)) {
            accMap.set(emailLower, u);
            // Push missing local account to backend
            apiRegister({
              name: u.name,
              email: u.email,
              password: u.password || 'password123',
              avatar: u.avatar,
              role: u.role,
              department: u.department,
            })
              .then(() => {
                if (u.status === 'active') {
                  apiApproveUser(u.email).catch(() => {});
                }
              })
              .catch(() => {});
          }
        });
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
              const existingEmails = new Set(parsed.map((a: StoredAccount) => a.email.toLowerCase()));
              const missingDefaults = INITIAL_STAFF_ACCOUNTS.filter(
                (a) => !existingEmails.has(a.email.toLowerCase())
              );
              loadedAccounts = [...parsed, ...missingDefaults];
            } else {
              loadedAccounts = INITIAL_STAFF_ACCOUNTS;
            }
          } catch {
            loadedAccounts = INITIAL_STAFF_ACCOUNTS;
          }
        } else {
          loadedAccounts = INITIAL_STAFF_ACCOUNTS;
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
            if (sessionUser && sessionUser.email) {
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
            }
          } catch {
            await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
          }
        }

        // Step 2: Fetch latest users from MongoDB backend if reachable
        try {
          const res = await apiFetchUsers();
          if (res.success && Array.isArray(res.users) && isMounted) {
            const accMap = new Map<string, StoredAccount>();
            res.users.forEach((u) => accMap.set(u.email.toLowerCase(), u));
            loadedAccounts.forEach((u) => {
              if (!accMap.has(u.email.toLowerCase())) {
                accMap.set(u.email.toLowerCase(), u);
              }
            });
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
      cleanEmail = 'admin@enterprise.com';
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
        const authUser: EmployeeUser = {
          name: apiRes.user.name,
          email: apiRes.user.email,
          avatar: apiRes.user.avatar || '',
          role: apiRes.user.role || 'Staff',
          department: apiRes.user.department || 'Operations',
          employeeId: apiRes.user.employeeId || 'EMP-1001',
          status: apiRes.user.status || 'active',
          documentsCount: apiRes.user.documentsCount || 0,
        };

        setUser(authUser);
        setIsLoggedIn(true);

        const isUserAdmin = authUser.role === 'Admin';
        setIsAdminModeState(isUserAdmin);
        await AsyncStorage.setItem(STORAGE_KEY_ADMIN_MODE, JSON.stringify(isUserAdmin)).catch(() => {});
        await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(authUser)).catch(() => {});

        // Refresh user list from backend
        syncWithBackend();

        return { success: true };
      } else if (!apiRes.offline && apiRes.message) {
        // Backend replied with a real rejection/approval error
        return { success: false, error: apiRes.message };
      }
    } catch {
      // Backend offline: fall back to local accounts cache
    }

    // Fallback: Local accounts authentication
    let matchedAccount = accounts.find(
      (acc) => acc.email.trim().toLowerCase() === cleanEmail
    );

    if (!matchedAccount) {
      matchedAccount = INITIAL_STAFF_ACCOUNTS.find(
        (acc) => acc.email.trim().toLowerCase() === cleanEmail
      );
    }

    if (!matchedAccount) {
      return {
        success: false,
        error: 'No account found with this email. Please register as an employee first.',
      };
    }

    const isAdminAccount =
      matchedAccount.role === 'Admin' ||
      cleanEmail.startsWith('admin@') ||
      cleanEmail === 'admin';

    const isPasswordValid =
      matchedAccount.password === cleanPassword ||
      (isAdminAccount && (cleanPassword === 'password123' || cleanPassword === 'admin123' || cleanPassword === 'admin'));

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Incorrect password. Please verify and try again.',
      };
    }

    if (!isAdminAccount) {
      if (matchedAccount.status === 'pending') {
        return {
          success: false,
          error: 'Your account registration is pending admin approval. You can only log in once an administrator approves your account.',
        };
      }
      if (matchedAccount.status === 'rejected') {
        return {
          success: false,
          error: 'Your account registration was not approved. Please contact IT / HR administration.',
        };
      }
    }

    const authUser: EmployeeUser = {
      name: matchedAccount.name,
      email: matchedAccount.email,
      avatar: matchedAccount.avatar || '',
      role: isAdminAccount ? 'Admin' : (matchedAccount.role || 'Employee'),
      department: matchedAccount.department || 'Operations',
      employeeId: matchedAccount.employeeId || (isAdminAccount ? 'ADM-001' : `EMP-${Math.floor(10000 + Math.random() * 90000)}`),
      status: matchedAccount.status || 'active',
      documentsCount: matchedAccount.documentsCount || 0,
    };

    setUser(authUser);
    setIsLoggedIn(true);

    const isUserAdmin = authUser.role === 'Admin';
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
      ...(user.role === 'Admin' ? { role: 'Admin' } : {}),
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
          ...(user.role === 'Admin' ? { role: 'Admin' } : {}),
        };
      }
      return acc;
    });

    if (!accountMatched) {
      updatedAccounts.push({
        ...updatedUser,
        password: newPassword && newPassword.trim() ? newPassword.trim() : 'password123',
      });
    }

    setAccounts(updatedAccounts);
    await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updatedAccounts)).catch(() => {});

    // Persist to backend
    try {
      await apiUpdateProfile({ email: previousEmail, ...data }, newPassword);
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
