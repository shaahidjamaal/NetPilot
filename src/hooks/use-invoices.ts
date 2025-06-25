
'use client'

import { type Invoice, type Customer, type Package } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useCustomers } from './use-customers';
import { usePackages } from './use-packages';
import { addDays, format } from 'date-fns';
import { useSettings } from './use-settings';
import { generateSuffix } from '@/lib/id-generation';

const STORAGE_KEY = 'netpilot-invoices';

const initialInvoices: Invoice[] = [];

export type AddInvoiceInput = {
    customerId: string;
    packageName: string;
    additionalCharges?: number;
    discountOverride?: number;
};


export function useInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { customers, isLoading: isLoadingCustomers } = useCustomers();
    const { packages, isLoading: isLoadingPackages } = usePackages();
    const { settings } = useSettings();

    useEffect(() => {
        if (isLoadingCustomers || isLoadingPackages) return;

        try {
            const item = window.localStorage.getItem(STORAGE_KEY);
            if (item) {
                setInvoices(JSON.parse(item));
            } else {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialInvoices));
                setInvoices(initialInvoices);
            }
        } catch (error) {
            console.error(error);
            setInvoices(initialInvoices);
        }
        setIsLoading(false);
    }, [isLoadingCustomers, isLoadingPackages]);

    const updateLocalStorage = useCallback((newInvoices: Invoice[]) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newInvoices));
            setInvoices(newInvoices);
        } catch (error) {
            console.error("Failed to update invoices in localStorage", error);
        }
    }, []);
    
    const addInvoice = useCallback((data: AddInvoiceInput) => {
        const customer = customers.find(c => c.id === data.customerId);
        const servicePackage = packages.find(p => p.name === data.packageName);

        if (!customer || !servicePackage) {
            throw new Error("Selected customer or package not found.");
        }

        const discount = data.discountOverride !== undefined ? data.discountOverride : (customer.discount || 0);
        const basePrice = servicePackage.price;
        const additionalCharges = data.additionalCharges || 0;
        const discountAmount = basePrice * (discount / 100);
        const finalAmount = (basePrice - discountAmount) + additionalCharges;

        const today = new Date();
        
        const suffix = generateSuffix(settings.invoiceSuffix);
        const uniquePart = `-${data.customerId.slice(-4)}`;

        const newInvoice: Invoice = {
            id: `${settings.invoicePrefix}${suffix}${uniquePart}`,
            customerId: customer.id,
            customerName: customer.name,
            amount: Math.round(finalAmount),
            generatedDate: today.toISOString(),
            dueDate: addDays(today, 15).toISOString(),
            status: 'Unpaid',
            packageName: servicePackage.name,
            packagePrice: basePrice,
            discount: discount,
            additionalCharges: additionalCharges,
        };

        const newInvoices = [newInvoice, ...invoices].sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime());
        updateLocalStorage(newInvoices);
        return newInvoice;

    }, [customers, packages, invoices, updateLocalStorage, settings]);
    
    const markAsPaid = useCallback((invoiceId: string) => {
        const newInvoices = invoices.map(inv => 
            inv.id === invoiceId ? { ...inv, status: 'Paid' as const } : inv
        );
        updateLocalStorage(newInvoices);
    }, [invoices, updateLocalStorage]);

    const deleteInvoice = useCallback((invoiceId: string) => {
        const newInvoices = invoices.filter(inv => inv.id !== invoiceId);
        updateLocalStorage(newInvoices);
    }, [invoices, updateLocalStorage]);

    const getInvoiceById = useCallback((invoiceId: string) => {
        return invoices.find(inv => inv.id === invoiceId);
    }, [invoices]);

    const hookIsLoading = isLoading || isLoadingCustomers || isLoadingPackages;

    return { invoices, addInvoice, markAsPaid, deleteInvoice, getInvoiceById, isLoading: hookIsLoading, customers, packages };
}
