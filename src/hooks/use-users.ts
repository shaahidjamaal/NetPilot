
'use client'

import { type User } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const initialUsers: User[] = [
  { id: 'user_1', email: 'admin@example.com', password: 'admin', userType: 'Admin Staff', designation: 'Super Admin', roleId: 'role_1', enabled: true },
  { id: 'user_2', email: 'staff@example.com', password: 'staff', userType: 'Office Staff', designation: 'Billing Clerk', roleId: 'role_2', enabled: true },
  { id: 'user_3', email: 'support@example.com', password: 'support', userType: 'Office Staff', designation: 'Support Agent', roleId: 'role_3', enabled: false },
]

const STORAGE_KEY = 'netpilot-users';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        setUsers(JSON.parse(item));
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
        setUsers(initialUsers);
      }
    } catch (error) {
      console.error(error);
      setUsers(initialUsers);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = useCallback((newUsers: User[]) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers));
        setUsers(newUsers);
    } catch (error) {
        console.error("Failed to update users in localStorage", error);
    }
  }, []);

  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user_${new Date().getTime()}`,
    };
    
    const newUsers = [...users, newUser];
    updateLocalStorage(newUsers);
  }, [users, updateLocalStorage]);

  const updateUser = useCallback((id: string, updatedUserData: Partial<Omit<User, 'id'>>) => {
    const newUsers = users.map(u => u.id === id ? { ...u, ...updatedUserData } : u);
    updateLocalStorage(newUsers);
  }, [users, updateLocalStorage]);

  const deleteUser = useCallback((id: string) => {
      const newUsers = users.filter(u => u.id !== id);
      updateLocalStorage(newUsers);
  }, [users, updateLocalStorage]);

  const login = useCallback(async (email: string, password?: string): Promise<User | null> => {
    // Read directly from localStorage to avoid state-related race conditions.
    let userList: User[] = [];
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      userList = item ? JSON.parse(item) : initialUsers;
    } catch (error) {
      console.error("Failed to read users from localStorage during login", error);
      userList = initialUsers;
    }
    
    const foundUser = userList.find(u => u.email === email);

    if (foundUser && foundUser.enabled && foundUser.password === password) {
      const { password: _, ...userToReturn } = foundUser;
      return userToReturn as User;
    }
    
    return null;
  }, []);


  return { users, login, addUser, updateUser, deleteUser, isLoading };
}
