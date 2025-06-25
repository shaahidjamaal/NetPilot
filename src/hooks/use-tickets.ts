
'use client'

import { type Ticket, type TicketStatus, type TicketPriority } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const initialTickets: Ticket[] = [
  { id: 'TKT-1', subject: 'Internet connection is slow', description: 'Customer reports that their internet speed has been very slow since yesterday, especially in the evenings.', customerId: 'CUS-1', customerName: 'John Doe', status: 'Open', priority: 'High', assigneeId: 'user_2', createdAt: new Date('2024-07-20T10:00:00Z').toISOString(), updatedAt: new Date('2024-07-20T10:00:00Z').toISOString() },
  { id: 'TKT-2', subject: 'Billing inquiry', description: 'Customer has a question about their last invoice and wants to understand the additional charges.', customerId: 'CUS-2', customerName: 'Jane Smith', status: 'In Progress', priority: 'Medium', assigneeId: 'user_2', createdAt: new Date('2024-07-19T14:30:00Z').toISOString(), updatedAt: new Date('2024-07-19T15:00:00Z').toISOString() },
  { id: 'TKT-3', subject: 'Router not working after power outage', description: 'The router is not turning on after a recent power outage. Customer has tried plugging it into different outlets.', customerId: 'CUS-3', customerName: 'Mike Johnson', status: 'Closed', priority: 'High', createdAt: new Date('2024-07-18T09:00:00Z').toISOString(), updatedAt: new Date('2024-07-18T16:45:00Z').toISOString() },
];

const STORAGE_KEY = 'netpilot-tickets';

export type AddTicketInput = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'customerName'>;
export type UpdateTicketInput = Partial<AddTicketInput> & { status?: TicketStatus };

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        setTickets(JSON.parse(item));
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTickets));
        setTickets(initialTickets);
      }
    } catch (error) {
      console.error(error);
      setTickets(initialTickets);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = useCallback((newTickets: Ticket[]) => {
    try {
        const sortedTickets = newTickets.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedTickets));
        setTickets(sortedTickets);
    } catch (error) {
        console.error("Failed to update tickets in localStorage", error);
    }
  }, []);

  const addTicket = useCallback((ticketData: AddTicketInput, customerName: string) => {
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      ...ticketData,
      id: `TKT-${new Date().getTime()}`,
      customerName,
      createdAt: now,
      updatedAt: now,
    };
    
    const newTickets = [newTicket, ...tickets];
    updateLocalStorage(newTickets);
    return newTicket;
  }, [tickets, updateLocalStorage]);
  
  const updateTicket = useCallback((id: string, ticketData: UpdateTicketInput, customerName?: string) => {
    const newTickets = tickets.map(ticket => {
        if (ticket.id === id) {
            const updatedTicket: Ticket = { 
                ...ticket, 
                ...ticketData, 
                updatedAt: new Date().toISOString() 
            };
            if (customerName) {
                updatedTicket.customerName = customerName;
            }
            return updatedTicket;
        }
        return ticket;
    });
    updateLocalStorage(newTickets);
  }, [tickets, updateLocalStorage]);

  const deleteTicket = useCallback((id: string) => {
      const newTickets = tickets.filter(ticket => ticket.id !== id);
      updateLocalStorage(newTickets);
  }, [tickets, updateLocalStorage]);

  return { tickets, addTicket, updateTicket, deleteTicket, isLoading };
}
