
'use client'

import { type BillingProfile } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'netpilot-billing-profile';

const initialProfile: BillingProfile = {
  profileName: 'Default Profile',
  companyName: 'NetPilot Inc.',
  address: '123 Tech Street, Silicon Valley',
  city: 'Techville',
  state: 'California',
  country: 'USA',
  zip: '94000',
  phone: '+1 123-456-7890',
  gstNumber: '27ABCDE1234F1Z5',
  cgstRate: 9,
  sgstRate: 9,
  invoiceTerms: 'Thank you for your business. Please pay within 30 days.',
};

export function useBillingProfile() {
  const [profile, setProfile] = useState<BillingProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsedProfile = JSON.parse(item);
        setProfile({ ...initialProfile, ...parsedProfile });
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProfile));
        setProfile(initialProfile);
      }
    } catch (error) {
      console.error("Failed to load billing profile from localStorage", error);
      setProfile(initialProfile);
    }
    setIsLoading(false);
  }, []);

  const updateProfile = useCallback((newProfile: BillingProfile) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
        setProfile(newProfile);
    } catch (error) {
        console.error("Failed to update billing profile in localStorage", error);
    }
  }, []);

  return { profile, updateProfile, isLoading };
}
