
'use client'

import { type Zone } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const initialZones: Zone[] = [
  { id: "zone_1", name: "North Zone" },
  { id: "zone_2", name: "South Zone" },
  { id: "zone_3", name: "West End" },
]

const STORAGE_KEY = 'netpilot-zones';

export function useZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        setZones(JSON.parse(item));
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialZones));
        setZones(initialZones);
      }
    } catch (error) {
      console.error(error);
      setZones(initialZones);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = useCallback((newZones: Zone[]) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newZones));
        setZones(newZones);
    } catch (error) {
        console.error("Failed to update zones in localStorage", error);
    }
  }, []);

  const addZone = useCallback((name: string) => {
    const newZone: Zone = {
      id: `zone_${new Date().getTime()}`,
      name,
    };
    
    const newZones = [...zones, newZone];
    updateLocalStorage(newZones);
  }, [zones, updateLocalStorage]);
  
  const deleteZone = useCallback((id: string) => {
      const newZones = zones.filter(z => z.id !== id);
      updateLocalStorage(newZones);
  }, [zones, updateLocalStorage]);

  return { zones, addZone, deleteZone, isLoading };
}
