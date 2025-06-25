
'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type User } from '@/lib/types';
import { authApi, handleApiResponse } from '@/lib/api-config';

interface AuthContextType {
  user: User | null;
  avatar: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateAvatar: (newAvatar: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'netpilot-token';
const AVATAR_STORAGE_KEY_PREFIX = 'netpilot-avatar-'; // One avatar per user

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isAuthCheckLoading, setIsAuthCheckLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in by verifying token
    const checkAuth = async () => {
      try {
        const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
          const response = await authApi.profile();

          if (response.ok) {
            const userData = await handleApiResponse(response);

            setUser({
              id: userData._id || userData.id,
              email: userData.email,
              username: userData.username,
              firstName: userData.profile?.firstName || userData.firstName,
              lastName: userData.profile?.lastName || userData.lastName,
              userType: userData.userType || 'Office Staff', // Default if not provided
              designation: userData.designation || 'User', // Default if not provided
              roleId: userData.roleId || 'role_2', // Default if not provided
              enabled: userData.isActive !== undefined ? userData.isActive : true,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
            });

            // Load avatar for the user
            const avatarItem = window.localStorage.getItem(`${AVATAR_STORAGE_KEY_PREFIX}${userData._id}`);
            if (avatarItem) {
              setAvatar(avatarItem);
            }
          } else {
            // Token is invalid, remove it
            window.localStorage.removeItem(TOKEN_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("Failed to verify authentication", error);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
      setIsAuthCheckLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ usernameOrEmail, password });
      const data = await handleApiResponse(response);

      // Store the token
      window.localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);

      // Set user data
      const userData = data.user;

      setUser({
        id: userData.id || userData._id,
        email: userData.email,
        username: userData.username,
        firstName: userData.profile?.firstName || userData.firstName,
        lastName: userData.profile?.lastName || userData.lastName,
        userType: userData.userType || 'Office Staff', // Default if not provided
        designation: userData.designation || 'User', // Default if not provided
        roleId: userData.roleId || 'role_2', // Default if not provided
        enabled: userData.isActive !== undefined ? userData.isActive : true,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      });

      // Load avatar for the newly logged-in user
      const userId = userData.id || userData._id;
      const avatarItem = window.localStorage.getItem(`${AVATAR_STORAGE_KEY_PREFIX}${userId}`);
      if (avatarItem) {
        setAvatar(avatarItem);
      } else {
        setAvatar(null);
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const updateAvatar = useCallback((newAvatar: string) => {
    if (user) {
      try {
        window.localStorage.setItem(`${AVATAR_STORAGE_KEY_PREFIX}${user.id}`, newAvatar);
        setAvatar(newAvatar);
      } catch (error) {
        console.error("Failed to save avatar to localStorage", error);
      }
    }
  }, [user]);

  const logout = useCallback(async () => {
    try {
      const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        // Call logout API
        await authApi.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state and storage regardless of API call result
      setUser(null);
      setAvatar(null);
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      router.push('/login');
    }
  }, [router]);

  const isLoading = isAuthCheckLoading;

  const value = { user, avatar, login, logout, updateAvatar, isLoading };

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
