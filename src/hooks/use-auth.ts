
'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type User } from '@/lib/types';
import { useUsers } from '@/hooks/use-users';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'netpilot-auth-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthCheckLoading, setIsAuthCheckLoading] = useState(true);
  const { login: loginUser, isLoading: isLoadingUsers } = useUsers();
  const router = useRouter();

  useEffect(() => {
    // This effect runs once on mount to restore the user from localStorage.
    try {
      const item = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (item) {
        setUser(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to parse auth user from localStorage", error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsAuthCheckLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password?: string): Promise<boolean> => {
    const loggedInUser = await loginUser(email, password);
    
    if (loggedInUser) {
      setUser(loggedInUser);
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
      router.push('/dashboard');
      return true;
    }
    
    return false;
  }, [loginUser, router]);

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push('/login');
  }, [router]);

  const isLoading = isAuthCheckLoading || isLoadingUsers;

  const value = { user, login, logout, isLoading };

  // We don't render anything until the initial auth check is complete.
  // Using React.createElement instead of JSX to avoid parsing issues in a .ts file.
  return React.createElement(
    AuthContext.Provider,
    { value: value },
    !isAuthCheckLoading ? children : null
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
