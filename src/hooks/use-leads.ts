'use client'

import { type Lead, type LeadStatus, type LeadSource } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const initialLeads: Lead[] = [
  { id: 'LEAD-1', name: 'Potential Customer A', email: 'potential.a@example.com', mobile: '9123456780', address: "1 Main Street, Anytown", status: 'New', source: 'Website', createdAt: new Date('2024-07-22T11:00:00Z').toISOString(), updatedAt: new Date('2024-07-22T11:00:00Z').toISOString() },
  { id: 'LEAD-2', name: 'Potential Customer B', email: 'potential.b@example.com', mobile: '9123456781', address: "2 Oak Avenue, Otherville", status: 'Contacted', source: 'Phone Call', assigneeId: 'user_3', notes: "Called on July 23rd, interested in Fiber 100 plan. Follow up next week.", createdAt: new Date('2024-07-21T15:00:00Z').toISOString(), updatedAt: new Date('2024-07-23T10:00:00Z').toISOString() },
  { id: 'LEAD-3', name: 'Potential Customer C', email: 'potential.c@example.com', mobile: '9123456782', address: "3 Pine Lane, Somewhere", status: 'Lost', source: 'Referral', notes: "Decided to go with a competitor.", createdAt: new Date('2024-07-20T09:00:00Z').toISOString(), updatedAt: new Date('2024-07-21T12:00:00Z').toISOString() },
];

const STORAGE_KEY = 'netpilot-leads';

export type AddLeadInput = Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLeadInput = Partial<AddLeadInput>;

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        setLeads(JSON.parse(item));
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLeads));
        setLeads(initialLeads);
      }
    } catch (error) {
      console.error(error);
      setLeads(initialLeads);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = useCallback((newLeads: Lead[]) => {
    try {
        const sortedLeads = newLeads.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedLeads));
        setLeads(sortedLeads);
    } catch (error) {
        console.error("Failed to update leads in localStorage", error);
    }
  }, []);

  const addLead = useCallback((leadData: AddLeadInput) => {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...leadData,
      id: `LEAD-${new Date().getTime()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    const newLeads = [newLead, ...leads];
    updateLocalStorage(newLeads);
    return newLead;
  }, [leads, updateLocalStorage]);
  
  const updateLead = useCallback((id: string, leadData: UpdateLeadInput) => {
    const newLeads = leads.map(lead => {
        if (lead.id === id) {
            const updatedLead: Lead = { 
                ...lead, 
                ...leadData, 
                updatedAt: new Date().toISOString() 
            };
            return updatedLead;
        }
        return lead;
    });
    updateLocalStorage(newLeads);
  }, [leads, updateLocalStorage]);

  const deleteLead = useCallback((id: string) => {
      const newLeads = leads.filter(lead => lead.id !== id);
      updateLocalStorage(newLeads);
  }, [leads, updateLocalStorage]);

  return { leads, addLead, updateLead, deleteLead, isLoading };
}
