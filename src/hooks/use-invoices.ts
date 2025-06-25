
'use client'

import { type Invoice, type Customer, type Package } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useCustomers } from './use-customers';
import { usePackages } from './use-packages';
import { addDays, format, startOfMonth } from 'date-fns';

const STORAGE_KEY = 'netpilot-invoices';

const createInitialInvoices = (customers: Customer[], packages: Package[]): Invoice[] => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const initialInvoices: Invoice[] = [];

    customers.slice(0, 5).forEach(customer => {
        if (customer.status !== 'Active') return;
        const customerPackage = packages.find(p => p.name === customer.servicePackage);
        if (!customerPackage) return;
        
        let amount = customerPackage.price;
        if (customer.discount && customer.discount > 0) {
            amount = amount - (amount * (customer.discount / 100));
        }

        const generatedDate = startOfMonth(lastMonth);

        initialInvoices.push({
            id: `INV-${format(generatedDate, 'yyyyMM')}-${customer.id.slice(-4)}`,
            customerId: customer.id,
            customerName: customer.name,
            amount: Math.round(amount),
            generatedDate: generatedDate.toISOString(),
            dueDate: addDays(generatedDate, 15).toISOString(),
            status: Math.random() > 0.5 ? 'Paid' : 'Unpaid',
        });
    });
    return initialInvoices;
};

export function useInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { customers, isLoading: isLoadingCustomers } = useCustomers();
    const { packages, isLoading: isLoadingPackages } = usePackages();

    useEffect(() => {
        if (isLoadingCustomers || isLoadingPackages) return;

        try {
            const item = window.localStorage.getItem(STORAGE_KEY);
            if (item) {
                setInvoices(JSON.parse(item));
            } else {
                const initialData = createInitialInvoices(customers, packages);
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
                setInvoices(initialData);
            }
        } catch (error) {
            console.error(error);
            const initialData = createInitialInvoices(customers, packages);
            setInvoices(initialData);
        }
        setIsLoading(false);
    }, [isLoadingCustomers, isLoadingPackages, customers, packages]);

    const updateLocalStorage = useCallback((newInvoices: Invoice[]) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newInvoices));
            setInvoices(newInvoices);
        } catch (error) {
            console.error("Failed to update invoices in localStorage", error);
        }
    }, []);
    
    const generateInvoices = useCallback(() => {
        const existingInvoices = [...invoices];
        const newGenerated: Invoice[] = [];
        const today = new Date();
        const currentMonthYear = format(today, 'yyyy-MM');

        customers.forEach(customer => {
            if (customer.status !== 'Active') return; 

            const customerPackage = packages.find(p => p.name === customer.servicePackage);
            if (!customerPackage) return; 

            const existingInvoice = existingInvoices.find(inv => 
                inv.customerId === customer.id && 
                format(new Date(inv.generatedDate), 'yyyy-MM') === currentMonthYear
            );
            if (existingInvoice) return;

            let amount = customerPackage.price;
            if (customer.discount && customer.discount > 0) {
                amount = amount - (amount * (customer.discount / 100));
            }
            
            const generationDate = startOfMonth(today);

            const newInvoice: Invoice = {
                id: `INV-${format(generationDate, 'yyyyMM')}-${customer.id.slice(-4)}`,
                customerId: customer.id,
                customerName: customer.name,
                amount: Math.round(amount),
                generatedDate: generationDate.toISOString(),
                dueDate: addDays(generationDate, 15).toISOString(),
                status: 'Unpaid'
            };
            newGenerated.push(newInvoice);
        });

        if (newGenerated.length > 0) {
            updateLocalStorage([...existingInvoices, ...newGenerated].sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()));
        }
        return newGenerated.length;
    }, [customers, packages, invoices, updateLocalStorage]);
    
    const markAsPaid = useCallback((invoiceId: string) => {
        const newInvoices = invoices.map(inv => 
            inv.id === invoiceId ? { ...inv, status: 'Paid' as const } : inv
        );
        updateLocalStorage(newInvoices);
    }, [invoices, updateLocalStorage]);

    return { invoices, generateInvoices, markAsPaid, isLoading };
}
