
'use client'

import { type Customer, type CustomerType } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { addDays } from 'date-fns';

const initialCustomers: Customer[] = [
  { id: "CUS-1", name: "John Doe", email: "john.doe@example.com", mobile: "9876543210", servicePackage: "Fiber 100", status: "Active", customerType: "Home User", joined: new Date("2023-01-15").toISOString(), permanentAddress: "123 Main St, Anytown", installationAddress: "123 Main St, Anytown", aadharNumber: "123456789012", zone: "North Zone", dataTopUp: 0, lastRechargeDate: new Date("2024-07-01").toISOString(), expiryDate: addDays(new Date("2024-07-01"), 30).toISOString(), pppoeUsername: "john.doe", pppoePassword: "password123", discount: 10 },
  { id: "CUS-2", name: "Jane Smith", email: "jane.smith@example.com", mobile: "9876543211", servicePackage: "Basic DSL", status: "Active", customerType: "Home User", joined: new Date("2022-11-30").toISOString(), permanentAddress: "456 Oak Ave, Otherville", installationAddress: "456 Oak Ave, Otherville", aadharNumber: "123456789013", zone: "South Zone", dataTopUp: 50, lastRechargeDate: new Date("2024-06-25").toISOString(), expiryDate: addDays(new Date("2024-06-25"), 30).toISOString(), pppoeUsername: "jane.s", pppoePassword: "password123", discount: 0 },
  { id: "CUS-3", name: "Mike Johnson", email: "mike.j@example.com", mobile: "9876543212", servicePackage: "Fiber 500", status: "Suspended", customerType: "Business User", gstNumber: "29AAAAA0000A1Z5", joined: new Date("2023-03-20").toISOString(), permanentAddress: "789 Pine Ln, Somewhere", installationAddress: "789 Pine Ln, Somewhere", aadharNumber: "123456789014", zone: "North Zone", dataTopUp: 0, lastRechargeDate: new Date("2024-05-10").toISOString(), expiryDate: addDays(new Date("2024-05-10"), 30).toISOString(), pppoeUsername: "mike.j", pppoePassword: "password123", discount: 5 },
  { id: "CUS-4", name: "Emily Davis", email: "emily.d@example.com", mobile: "9876543213", servicePackage: "Fiber 1000", status: "Active", customerType: "Business User", gstNumber: "27BBBBB1111B2Z6", joined: new Date("2021-08-10").toISOString(), permanentAddress: "101 Maple Dr, Anyplace", installationAddress: "101 Maple Dr, Anyplace", aadharNumber: "123456789015", zone: "West End", dataTopUp: 0, lastRechargeDate: new Date("2024-07-05").toISOString(), expiryDate: addDays(new Date("2024-07-05"), 30).toISOString(), pppoeUsername: "emily.d", pppoePassword: "password123", discount: 0 },
  { id: "CUS-5", name: "Chris Wilson", email: "chris.w@example.com", mobile: "9876543214", servicePackage: "Basic DSL", status: "Inactive", customerType: "Wireless User", joined: new Date("2023-05-01").toISOString(), permanentAddress: "212 Birch Rd, Nowhere", installationAddress: "212 Birch Rd, Nowhere", aadharNumber: "123456789016", dataTopUp: 0, lastRechargeDate: new Date("2023-06-01").toISOString(), expiryDate: addDays(new Date("2023-06-01"), 30).toISOString(), pppoeUsername: "chris.w", pppoePassword: "password123", discount: 0 },
  { id: "CUS-6", name: "Sarah Brown", email: "sarah.b@example.com", mobile: "9876543215", servicePackage: "Fiber 100", status: "Active", customerType: "Home User", joined: new Date("2023-09-22").toISOString(), permanentAddress: "333 Cedar Ct, Elsewhere", installationAddress: "333 Cedar Ct, Elsewhere", aadharNumber: "123456789017", zone: "South Zone", dataTopUp: 100, lastRechargeDate: new Date("2024-06-30").toISOString(), expiryDate: addDays(new Date("2024-06-30"), 30).toISOString(), pppoeUsername: "sarah.b", pppoePassword: "password123", discount: 15 },
]

const STORAGE_KEY = 'netpilot-customers';

export type AddCustomerInput = Omit<Customer, 'id' | 'status' | 'joined' | 'dataTopUp' | 'lastRechargeDate' | 'expiryDate'>;

export const generateNextCustomerId = (customers: Customer[]): string => {
    const prefix = 'CUS-';
    if (!customers || customers.length === 0) {
        return `${prefix}1`;
    }

    const maxId = customers.reduce((max, customer) => {
        const match = customer.id.match(/^CUS-(\d+)$/);
        if (match) {
            const num = parseInt(match[1], 10);
            return Math.max(max, num);
        }
        return max;
    }, 0);

    return `${prefix}${maxId + 1}`;
};


export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        setCustomers(JSON.parse(item));
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCustomers));
        setCustomers(initialCustomers);
      }
    } catch (error) {
      console.error(error);
      setCustomers(initialCustomers);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = useCallback((newCustomers: Customer[]) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newCustomers));
        setCustomers(newCustomers);
    } catch (error) {
        console.error("Failed to update customers in localStorage", error);
    }
  }, []);

  const addCustomer = useCallback((customerData: Omit<AddCustomerInput, 'id'>) => {
    const newId = generateNextCustomerId(customers);
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      status: 'Active',
      joined: new Date().toISOString(),
      dataTopUp: 0,
      lastRechargeDate: new Date().toISOString(),
      expiryDate: addDays(new Date(), 30).toISOString()
    };
    
    const newCustomers = [...customers, newCustomer];
    updateLocalStorage(newCustomers);
  }, [customers, updateLocalStorage]);

  const addMultipleCustomers = useCallback((customersData: Omit<AddCustomerInput, 'id'>[]) => {
      let currentCustomers = [...customers];
      const newCustomersList: Customer[] = customersData.map(customerData => {
          const newId = generateNextCustomerId(currentCustomers);
          const newCustomer: Customer = {
              ...customerData,
              id: newId,
              status: 'Active',
              joined: new Date().toISOString(),
              dataTopUp: 0,
              lastRechargeDate: new Date().toISOString(),
              expiryDate: addDays(new Date(), 30).toISOString()
          };
          currentCustomers.push(newCustomer);
          return newCustomer;
      });
      
      updateLocalStorage(currentCustomers);
  }, [customers, updateLocalStorage]);
  
  const getCustomerById = useCallback((id: string) => {
    return customers.find(c => c.id === id);
  }, [customers]);
  
  const updateCustomer = useCallback((id: string, updatedCustomerData: Partial<Omit<Customer, 'id'>>) => {
    const newCustomers = customers.map(c => c.id === id ? { ...c, ...updatedCustomerData } : c);
    updateLocalStorage(newCustomers);
  }, [customers, updateLocalStorage]);

  const deleteCustomer = useCallback((id: string) => {
      const newCustomers = customers.filter(c => c.id !== id);
      updateLocalStorage(newCustomers);
  }, [customers, updateLocalStorage]);

  const topUpCustomer = useCallback((id: string, amount: number) => {
    const newCustomers = customers.map(c => 
        c.id === id 
        ? { ...c, dataTopUp: (c.dataTopUp || 0) + amount } 
        : c
    );
    updateLocalStorage(newCustomers);
  }, [customers, updateLocalStorage]);

  const terminateCustomer = useCallback((id: string) => {
      const newCustomers = customers.map(c => 
          c.id === id
          ? { ...c, status: 'Inactive' }
          : c
      );
      updateLocalStorage(newCustomers);
  }, [customers, updateLocalStorage]);


  return { customers, addCustomer, addMultipleCustomers, getCustomerById, updateCustomer, deleteCustomer, topUpCustomer, terminateCustomer, isLoading, generateNextCustomerId };
}
