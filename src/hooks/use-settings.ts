
'use client'

import { type AppSettings } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'netpilot-settings';

const initialSettings: AppSettings = {
  invoicePrefix: 'INV-',
  invoiceSuffix: 'date',
  customerIdPrefix: 'CUS-',
  customerIdSuffix: 'timestamp'
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsedSettings = JSON.parse(item);
        // Ensure settings have all keys, useful for upgrades
        setSettings({ ...initialSettings, ...parsedSettings });
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSettings));
        setSettings(initialSettings);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
      setSettings(initialSettings);
    }
    setIsLoading(false);
  }, []);

  const updateSettings = useCallback((newSettings: AppSettings) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        setSettings(newSettings);
    } catch (error) {
        console.error("Failed to update settings in localStorage", error);
    }
  }, []);

  return { settings, updateSettings, isLoading };
}
