
'use client'

import { type Invoice, type Customer, type Package } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useCustomers } from './use-customers';
import { usePackages } from './use-packages';
import { addDays, format } from 'date-fns';
import { useSettings } from './use-settings';
import { generateSuffix } from '@/lib/id-generation';
import { useBillingProfile } from './use-billing-profile';

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
    const { settings, isLoading: isLoadingSettings } = useSettings();
    const { profile, isLoading: isLoadingProfile } = useBillingProfile();

    useEffect(() => {
        if (isLoadingCustomers || isLoadingPackages || isLoadingSettings || isLoadingProfile) return;

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
    }, [isLoadingCustomers, isLoadingPackages, isLoadingSettings, isLoadingProfile]);

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

        if (!customer || !servicePackage || !profile) {
            throw new Error("Selected customer, package, or billing profile not found.");
        }

        const discount = data.discountOverride !== undefined ? data.discountOverride : (customer.discount || 0);
        const basePrice = servicePackage.price;
        const additionalCharges = data.additionalCharges || 0;
        const discountAmount = basePrice * (discount / 100);
        
        const subtotal = (basePrice - discountAmount) + additionalCharges;
        
        const cgstRate = profile.cgstRate || 0;
        const sgstRate = profile.sgstRate || 0;

        const cgstAmount = subtotal * (cgstRate / 100);
        const sgstAmount = subtotal * (sgstRate / 100);

        const finalAmount = subtotal + cgstAmount + sgstAmount;

        const today = new Date();
        
        const suffix = generateSuffix(settings.invoiceSuffix);
        const numericIdPart = data.customerId.match(/\d+$/)?.[0] || 'N/A';
        const uniquePart = `-${numericIdPart}`;

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
            subtotal: subtotal,
            cgstAmount: cgstAmount,
            sgstAmount: sgstAmount,
        };

        const newInvoices = [newInvoice, ...invoices].sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime());
        updateLocalStorage(newInvoices);
        return newInvoice;

    }, [customers, packages, invoices, updateLocalStorage, settings, profile]);
    
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

    const hookIsLoading = isLoading || isLoadingCustomers || isLoadingPackages || isLoadingSettings || isLoadingProfile;

    return { invoices, addInvoice, markAsPaid, deleteInvoice, getInvoiceById, isLoading: hookIsLoading, customers, packages };
}
