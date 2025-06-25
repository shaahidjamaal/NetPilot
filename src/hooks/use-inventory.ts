
'use client'

import { type InventoryItem } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const LOW_STOCK_THRESHOLD = 10;

const calculateStatus = (stock: number): InventoryItem['status'] => {
    if (stock <= 0) return "Out of Stock";
    if (stock <= LOW_STOCK_THRESHOLD) return "Low Stock";
    return "In Stock";
};

const initialInventory: InventoryItem[] = [
  { id: 'item_1', name: 'MikroTik hAP ac3', category: 'Routers', stock: 15, status: 'In Stock' },
  { id: 'item_2', name: 'CAT6 Cable Roll (305m)', category: 'Cabling', stock: 8, status: 'Low Stock' },
  { id: 'item_3', name: 'Ubiquiti EdgeSwitch 24', category: 'Switches', stock: 5, status: 'Low Stock' },
  { id: 'item_4', name: 'RJ45 Connectors (Pack of 100)', category: 'Accessories', stock: 50, status: 'In Stock' },
  { id: 'item_5', name: 'Fiber Optic Patch Cord', category: 'Cabling', stock: 0, status: 'Out of Stock' },
];

const STORAGE_KEY = 'netpilot-inventory';

export type AddItemInput = Omit<InventoryItem, 'id' | 'status'>;
export type UpdateItemInput = Partial<AddItemInput>;

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        setInventory(JSON.parse(item));
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialInventory));
        setInventory(initialInventory);
      }
    } catch (error) {
      console.error(error);
      setInventory(initialInventory);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = useCallback((newInventory: InventoryItem[]) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newInventory));
        setInventory(newInventory);
    } catch (error) {
        console.error("Failed to update inventory in localStorage", error);
    }
  }, []);

  const addItem = useCallback((itemData: AddItemInput) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `item_${new Date().getTime()}`,
      status: calculateStatus(itemData.stock),
    };
    
    const newInventory = [...inventory, newItem];
    updateLocalStorage(newInventory);
  }, [inventory, updateLocalStorage]);
  
  const updateItem = useCallback((id: string, itemData: UpdateItemInput) => {
    const newInventory = inventory.map(item => {
        if (item.id === id) {
            const updatedItem = { ...item, ...itemData };
            return {
                ...updatedItem,
                status: calculateStatus(updatedItem.stock),
            };
        }
        return item;
    });
    updateLocalStorage(newInventory);
  }, [inventory, updateLocalStorage]);

  const deleteItem = useCallback((id: string) => {
      const newInventory = inventory.filter(item => item.id !== id);
      updateLocalStorage(newInventory);
  }, [inventory, updateLocalStorage]);


  return { inventory, addItem, updateItem, deleteItem, isLoading };
}
