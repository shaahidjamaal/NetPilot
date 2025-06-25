
'use client'

import { type Package, type PackageType } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const initialPackages: Package[] = [
  { name: "Basic DSL", price: 2499, downloadSpeed: 25, uploadSpeed: 5, dataLimit: "Unlimited", validity: 30, users: "1-2", packageType: "Home Package" },
  { name: "Fiber 100", price: 3999, downloadSpeed: 100, uploadSpeed: 20, dataLimit: "Unlimited", validity: 30, users: "3-5", packageType: "Home Package" },
  { name: "Fiber 500", price: 5799, downloadSpeed: 500, uploadSpeed: 100, dataLimit: "Unlimited", validity: 30, users: "5-10", packageType: "Business Package" },
  { name: "Fiber 1000", price: 7499, downloadSpeed: 1000, uploadSpeed: 250, dataLimit: "Unlimited", validity: 30, users: "10+", packageType: "Business Package" },
]

const STORAGE_KEY = 'netpilot-packages';

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsedPackages = JSON.parse(item);
        // Add default packageType if missing for backward compatibility
        const packagesWithDefaults = parsedPackages.map((p: Package) => ({
            ...p,
            packageType: p.packageType || (p.downloadSpeed > 200 ? 'Business Package' : 'Home Package')
        }));
        setPackages(packagesWithDefaults);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPackages));
        setPackages(initialPackages);
      }
    } catch (error) {
      console.error(error);
      setPackages(initialPackages);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = useCallback((newPackages: Package[]) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newPackages));
        setPackages(newPackages);
    } catch (error) {
        console.error("Failed to update packages in localStorage", error);
    }
  }, []);

  const deriveUsers = (downloadSpeed: number) => {
    if (downloadSpeed < 50) return "1-2";
    if (downloadSpeed < 200) return "3-5";
    if (downloadSpeed < 750) return "5-10";
    return "10+";
  }

  const addPackage = useCallback((newPackageData: Omit<Package, 'users'>) => {
    const users = deriveUsers(newPackageData.downloadSpeed);
    const packageWithUsers: Package = { ...newPackageData, users };
    
    const newPackages = [...packages, packageWithUsers];
    updateLocalStorage(newPackages);
  }, [packages, updateLocalStorage]);
  
  const getPackageByName = useCallback((name: string) => {
    return packages.find(p => p.name === name);
  }, [packages]);
  
  const updatePackage = useCallback((name: string, updatedPackageData: Omit<Package, 'users'>) => {
    const users = deriveUsers(updatedPackageData.downloadSpeed);
    const packageWithUsers: Package = { ...updatedPackageData, users };

    const newPackages = packages.map(p => p.name === name ? packageWithUsers : p);
    updateLocalStorage(newPackages);
  }, [packages, updateLocalStorage]);

  return { packages, addPackage, getPackageByName, updatePackage, isLoading };
}
