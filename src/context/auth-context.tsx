import React, { createContext, useContext, useState } from 'react';

export interface EmployeeUser {
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  employeeId: string;
}

interface AuthContextValue {
  isLoggedIn: boolean;
  user: EmployeeUser;
  login: (userData?: Partial<EmployeeUser>) => void;
  logout: () => void;
  updateUser: (data: Partial<EmployeeUser>) => void;
}

const DEFAULT_USER: EmployeeUser = {
  name: 'Liam Thompson',
  email: 'l.thompson@enterprise.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  role: 'Senior Software Engineer',
  department: 'Cloud Platform & Security',
  employeeId: 'EMP-94021',
};

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: true,
  user: DEFAULT_USER,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // If employee is already logged in, Home page opens directly.
  // Defaults to true as requested.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [user, setUser] = useState<EmployeeUser>(DEFAULT_USER);

  const login = (userData?: Partial<EmployeeUser>) => {
    if (userData) {
      setUser((prev) => ({ ...prev, ...userData }));
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const updateUser = (data: Partial<EmployeeUser>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
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
