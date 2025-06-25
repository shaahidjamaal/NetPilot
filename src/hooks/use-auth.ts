
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

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = 'netpilot-auth-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthCheckLoading, setIsAuthCheckLoading] = useState(true);
  const { users, isLoading: isLoadingUsers } = useUsers();
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
    // In a real app, this would be an API call to a secure backend.
    // For this prototype, we check against the users in our local storage hook.
    if (isLoadingUsers) return false; // Can't log in while users are loading

    const foundUser = users.find(u => u.email === email);

    // Simple password check for prototype. Real apps MUST NOT do this on the client.
    if (foundUser && foundUser.enabled && foundUser.password === password) {
      const userToStore = { ...foundUser };
      // It's good practice not to store the password in the auth context/storage
      // even in a prototype.
      delete userToStore.password;

      setUser(userToStore);
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToStore));
      router.push('/dashboard');
      return true;
    }
    
    return false;
  }, [users, router, isLoadingUsers]);

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
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
