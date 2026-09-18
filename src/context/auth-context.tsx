import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

const STORAGE_KEY_SESSION = '@docuvault_auth_session';
const STORAGE_KEY_ACCOUNTS = '@docuvault_accounts';
const STORAGE_KEY_ADMIN_MODE = '@docuvault_admin_mode';

export const INITIAL_STAFF_ACCOUNTS: StoredAccount[] = [
  {
    name: 'Alex Smith',
    email: 'a.smith@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: 'Admin',
    department: 'Executive Management',
    employeeId: 'ADM-001',
    status: 'active',
    password: 'password123',
    documentsCount: 4,
  },
  {
    name: 'Liam Thompson',
    email: 'l.thompson@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    role: 'Employee',
    department: 'Engineering',
    employeeId: 'EMP-10492',
    status: 'active',
    password: 'password123',
    documentsCount: 31,
  },
  {
    name: 'Fatima Khan',
    email: 'f.khan@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    role: 'Employee',
    department: 'Design',
    employeeId: 'EMP-10493',
    status: 'active',
    password: 'password123',
    documentsCount: 18,
  },
  {
    name: 'Benjamin Garcia',
    email: 'b.garcia@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    role: 'Employee',
    department: 'Operations',
    employeeId: 'EMP-10494',
    status: 'active',
    password: 'password123',
    documentsCount: 5,
  },
  {
    name: 'Alex Thompson',
    email: 'alex.t@company.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    role: 'Employee',
    department: 'Marketing',
    employeeId: 'EMP-10501',
    status: 'pending',
    password: 'password123',
    documentsCount: 0,
  },
  {
    name: 'Rachel Green',
    email: 'r.green@company.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    role: 'Employee',
    department: 'Human Resources',
    employeeId: 'EMP-10502',
    status: 'pending',
    password: 'password123',
    documentsCount: 0,
  },
];

const EMPTY_USER: EmployeeUser = {
  name: '',
  email: '',
  avatar: '',
  role: 'Employee',
  department: 'Operations',
  employeeId: '',
  status: 'active',
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

  // Hydrate accounts and active session on startup
  useEffect(() => {
    let isMounted = true;

    async function hydrateAuth() {
      try {
        // Load saved accounts
        const rawAccounts = await AsyncStorage.getItem(STORAGE_KEY_ACCOUNTS);
        let loadedAccounts: StoredAccount[] = [];
        if (rawAccounts) {
          try {
            const parsed = JSON.parse(rawAccounts);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Merge user accounts with design-matching baseline accounts if not present
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
        await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(loadedAccounts));

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
                if (matchedAcc.role === 'Admin') {
                  setIsAdminModeState(true);
                }
              } else {
                setUser(sessionUser);
                setIsLoggedIn(true);
              }
            }
          } catch {
            await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
          }
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
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password?.trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered work email.' };
    }

    if (!cleanPassword) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Search for matching registered account only
    const matchedAccount = accounts.find(
      (acc) => acc.email.trim().toLowerCase() === cleanEmail
    );

    if (!matchedAccount) {
      return {
        success: false,
        error: 'No account found with this email. Please register as an employee first.',
      };
    }

    // Verify password
    if (matchedAccount.password && matchedAccount.password !== cleanPassword) {
      return {
        success: false,
        error: 'Incorrect password. Please verify and try again.',
      };
    }

    // Successful authentication
    const authUser: EmployeeUser = {
      name: matchedAccount.name,
      email: matchedAccount.email,
      avatar: matchedAccount.avatar || '',
      role: matchedAccount.role || 'Employee',
      department: matchedAccount.department || 'Operations',
      employeeId: matchedAccount.employeeId || `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    setUser(authUser);
    setIsLoggedIn(true);

    try {
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(authUser));
    } catch (e) {
      console.warn('Failed to persist session:', e);
    }

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

    // Compulsory Name
    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }

    // Compulsory Email
    if (!cleanEmail) {
      return { success: false, error: 'Work email is required.' };
    }
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid work email address.' };
    }

    // Compulsory Face / Profile Image
    if (!cleanAvatar) {
      return { success: false, error: 'Profile photo is required. Please upload your photo to register.' };
    }

    // Compulsory Strong Password
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

    // Check if account already exists
    const existing = accounts.find(
      (acc) => acc.email.trim().toLowerCase() === cleanEmail
    );
    if (existing) {
      return {
        success: false,
        error: 'An account with this email is already registered. Please sign in.',
      };
    }

    // Create new account
    const newAccount: StoredAccount = {
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      avatar: accountData.avatar || '',
      role: accountData.role || 'Employee',
      department: accountData.department || 'Operations',
      employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);

    // Persist accounts list
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updatedAccounts));
    } catch (e) {
      console.warn('Failed to save accounts list:', e);
    }

    // Log in the newly registered user
    const authUser: EmployeeUser = {
      name: newAccount.name,
      email: newAccount.email,
      avatar: newAccount.avatar,
      role: newAccount.role,
      department: newAccount.department,
      employeeId: newAccount.employeeId,
    };

    setUser(authUser);
    setIsLoggedIn(true);

    try {
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(authUser));
    } catch (e) {
      console.warn('Failed to save session:', e);
    }

    return { success: true };
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUser(EMPTY_USER);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
    } catch (e) {
      console.warn('Failed to clear session:', e);
    }
  };

  const updateUser = async (
    data: Partial<EmployeeUser>,
    newPassword?: string
  ): Promise<AuthResult> => {
    // Validate new password if provided
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

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);

    try {
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Failed to update session:', e);
    }

    // Update in registered accounts list too
    const updatedAccounts = accounts.map((acc) => {
      if (acc.email.toLowerCase() === user.email.toLowerCase()) {
        return {
          ...acc,
          ...data,
          ...(newPassword && newPassword.trim() ? { password: newPassword.trim() } : {}),
        };
      }
      return acc;
    });
    setAccounts(updatedAccounts);

    try {
      await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updatedAccounts));
    } catch (e) {
      console.warn('Failed to update stored account:', e);
    }

    return { success: true };
  };

  const approveAccount = async (email: string) => {
    const updated = accounts.map((acc) => {
      if (acc.email.toLowerCase() === email.toLowerCase()) {
        return { ...acc, status: 'active' as const };
      }
      return acc;
    });
    setAccounts(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save approved account:', e);
    }
  };

  const rejectAccount = async (email: string) => {
    const updated = accounts.filter(
      (acc) => acc.email.toLowerCase() !== email.toLowerCase()
    );
    setAccounts(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to remove rejected account:', e);
    }
  };

  const removeAccount = async (email: string) => {
    const updated = accounts.filter(
      (acc) => acc.email.toLowerCase() !== email.toLowerCase()
    );
    setAccounts(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to remove account:', e);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
