
'use client'

import { type User } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const initialUsers: User[] = [
  { id: 'user_1', email: 'admin@example.com', password: 'password', userType: 'Admin Staff', designation: 'Super Admin', roleId: 'role_1', enabled: true },
  { id: 'user_2', email: 'staff@example.com', password: 'password', userType: 'Office Staff', designation: 'Billing Clerk', roleId: 'role_2', enabled: true },
  { id: 'user_3', email: 'support@example.com', password: 'password', userType: 'Office Staff', designation: 'Support Agent', roleId: 'role_3', enabled: false },
]

const STORAGE_KEY = 'netpilot-users';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to read users from localStorage
  const getUsersFromStorage = (): User[] => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : initialUsers;
    } catch (error) {
      console.error("Failed to read users from localStorage", error);
      return initialUsers;
    }
  };

  useEffect(() => {
    const usersFromStorage = getUsersFromStorage();
    // Ensure localStorage is populated on first run
    if (!window.localStorage.getItem(STORAGE_KEY)) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(usersFromStorage));
    }
    setUsers(usersFromStorage);
    setIsLoading(false);
  }, []);

  const updateLocalStorageAndState = useCallback((newUsers: User[]) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers));
        setUsers(newUsers);
    } catch (error) {
        console.error("Failed to update users in localStorage", error);
    }
  }, []);

  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    const currentUsers = getUsersFromStorage();
    const newUser: User = {
      ...userData,
      id: `user_${new Date().getTime()}`,
    };
    const newUsers = [...currentUsers, newUser];
    updateLocalStorageAndState(newUsers);
  }, [updateLocalStorageAndState]);

  const updateUser = useCallback((id: string, updatedUserData: Partial<Omit<User, 'id'>>) => {
    const currentUsers = getUsersFromStorage();
    const newUsers = currentUsers.map(u => u.id === id ? { ...u, ...updatedUserData } : u);
    updateLocalStorageAndState(newUsers);
  }, [updateLocalStorageAndState]);

  const deleteUser = useCallback((id: string) => {
    const currentUsers = getUsersFromStorage();
    const newUsers = currentUsers.filter(u => u.id !== id);
    updateLocalStorageAndState(newUsers);
  }, [updateLocalStorageAndState]);

  const login = useCallback(async (email: string, password?: string): Promise<User | null> => {
    const currentUsers = getUsersFromStorage();
    const user = currentUsers.find(u => u.email === email);

    // In a real app, you'd also check the password.
    // For this prototype, we'll check the password.
    if (user && user.enabled && user.password === password) {
      return user;
    }

    return null;
  }, []);

  return { users, addUser, updateUser, deleteUser, login, isLoading };
}
