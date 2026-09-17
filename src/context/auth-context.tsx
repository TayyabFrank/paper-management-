import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmployeeUser {
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  employeeId: string;
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
}

const STORAGE_KEY_SESSION = '@docuvault_auth_session';
const STORAGE_KEY_ACCOUNTS = '@docuvault_accounts';

const EMPTY_USER: EmployeeUser = {
  name: '',
  email: '',
  avatar: '',
  role: 'Employee',
  department: 'Operations',
  employeeId: '',
};

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  isLoading: true,
  user: EMPTY_USER,
  registeredAccounts: [],
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  updateUser: async () => ({ success: true }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Authentication strictly requires valid registered user login (no guest access, no demo accounts)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<EmployeeUser>(EMPTY_USER);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);

  // Hydrate accounts and active session on startup
  useEffect(() => {
    let isMounted = true;

    async function hydrateAuth() {
      try {
        // Load registered accounts and remove any legacy demo accounts
        const rawAccounts = await AsyncStorage.getItem(STORAGE_KEY_ACCOUNTS);
        let loadedAccounts: StoredAccount[] = [];
        if (rawAccounts) {
          try {
            const parsed = JSON.parse(rawAccounts);
            if (Array.isArray(parsed)) {
              // Strictly filter out any demo or guest accounts
              loadedAccounts = parsed.filter(
                (a: StoredAccount) =>
                  a &&
                  a.email &&
                  !a.email.toLowerCase().includes('l.thompson') &&
                  !a.email.toLowerCase().includes('enterprise.com') &&
                  !a.name?.toLowerCase().includes('guest')
              );
            }
          } catch {
            loadedAccounts = [];
          }
        }
        await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(loadedAccounts));

        if (isMounted) {
          setAccounts(loadedAccounts);
        }

        // Check active session (strictly require matching real registered user)
        const rawSession = await AsyncStorage.getItem(STORAGE_KEY_SESSION);
        if (rawSession) {
          try {
            const sessionUser = JSON.parse(rawSession) as EmployeeUser;
            const isDemoOrGuest =
              !sessionUser ||
              !sessionUser.email ||
              sessionUser.email.toLowerCase().includes('l.thompson') ||
              sessionUser.email.toLowerCase().includes('enterprise.com') ||
              sessionUser.name?.toLowerCase().includes('guest');

            if (!isDemoOrGuest && isMounted) {
              const accountExists = loadedAccounts.some(
                (acc) => acc.email.toLowerCase() === sessionUser.email.toLowerCase()
              );
              if (accountExists) {
                setUser(sessionUser);
                setIsLoggedIn(true);
              } else {
                await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
              }
            } else {
              await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
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

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        registeredAccounts: accounts,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
