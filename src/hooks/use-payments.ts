
'use client'

import { type Payment, type PaymentMethod } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

const initialPayments: Payment[] = [
  { id: 'pay_1', invoiceId: 'INV-20240701-us_1', customerId: 'cus_1', customerName: 'John Doe', amount: 3799, paymentDate: new Date('2024-07-01').toISOString(), method: 'Online Gateway', status: 'Completed', transactionId: 'txn_12345' },
  { id: 'pay_2', invoiceId: 'INV-20240625-us_2', customerId: 'cus_2', customerName: 'Jane Smith', amount: 2499, paymentDate: new Date('2024-06-25').toISOString(), method: 'Admin Renewal', status: 'Completed', transactionId: 'txn_67890' },
  { id: 'pay_3', invoiceId: 'INV-20240705-us_4', customerId: 'cus_4', customerName: 'Emily Davis', amount: 7499, paymentDate: new Date('2024-07-05').toISOString(), method: 'Bank Transfer', status: 'Completed', transactionId: 'txn_11223' },
];

const STORAGE_KEY = 'netpilot-payments';

export type AddPaymentInput = Omit<Payment, 'id' | 'paymentDate'>;

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        setPayments(JSON.parse(item));
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPayments));
        setPayments(initialPayments);
      }
    } catch (error) {
      console.error(error);
      setPayments(initialPayments);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = useCallback((newPayments: Payment[]) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newPayments));
        setPayments(newPayments);
    } catch (error) {
        console.error("Failed to update payments in localStorage", error);
    }
  }, []);

  const addPayment = useCallback((paymentData: AddPaymentInput) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `pay_${new Date().getTime()}`,
      paymentDate: new Date().toISOString(),
    };
    
    const currentPayments = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    const newPayments = [newPayment, ...currentPayments].sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    updateLocalStorage(newPayments);
  }, [updateLocalStorage]);


  return { payments, addPayment, isLoading };
}
