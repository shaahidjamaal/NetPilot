
'use client'

import { type Role, allPermissions, type Permission } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const initialRoles: Role[] = [
  { 
    id: 'role_1', 
    name: 'Administrator', 
    description: 'Has all permissions.', 
    permissions: [...allPermissions] 
  },
  { 
    id: 'role_2', 
    name: 'Billing Staff', 
    description: 'Can manage invoices and payments.', 
    permissions: ['view_invoices', 'generate_invoices', 'receive_payments'] 
  },
  { 
    id: 'role_3', 
    name: 'Support Staff', 
    description: 'Can manage customer accounts.', 
    permissions: ['edit_customers', 'renew_customers', 'terminate_customers'] 
  },
  {
    id: 'role_4',
    name: 'View Only',
    description: 'Can only view information, cannot make changes.',
    permissions: ['view_invoices']
  }
]

const STORAGE_KEY = 'netpilot-roles';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        setRoles(JSON.parse(item));
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRoles));
        setRoles(initialRoles);
      }
    } catch (error) {
      console.error(error);
      setRoles(initialRoles);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = useCallback((newRoles: Role[]) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newRoles));
        setRoles(newRoles);
    } catch (error) {
        console.error("Failed to update roles in localStorage", error);
    }
  }, []);

  const addRole = useCallback((roleData: Omit<Role, 'id'>) => {
    const newRole: Role = {
      ...roleData,
      id: `role_${new Date().getTime()}`,
    };
    const newRoles = [...roles, newRole];
    updateLocalStorage(newRoles);
  }, [roles, updateLocalStorage]);
  
  const getRoleById = useCallback((id: string) => {
    return roles.find(r => r.id === id);
  }, [roles]);
  
  const updateRole = useCallback((id: string, updatedRoleData: Partial<Omit<Role, 'id'>>) => {
    const newRoles = roles.map(r => r.id === id ? { ...r, ...updatedRoleData } : r);
    updateLocalStorage(newRoles);
  }, [roles, updateLocalStorage]);

  const deleteRole = useCallback((id: string) => {
      const newRoles = roles.filter(r => r.id !== id);
      updateLocalStorage(newRoles);
  }, [roles, updateLocalStorage]);


  return { roles, addRole, getRoleById, updateRole, deleteRole, isLoading };
}
