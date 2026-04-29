'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'globenews-time-filter';

export function usePersistentTimeFilter(defaultFilter: string = '24h') {
  const [timeFilter, setTimeFilter] = useState<string>(defaultFilter);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved filter on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTimeFilter(saved);
      }
    } catch (e) {
      console.error('Failed to load time filter:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save filter when changed
  const updateTimeFilter = (newFilter: string) => {
    setTimeFilter(newFilter);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newFilter);
      } catch (e) {
        console.error('Failed to save time filter:', e);
      }
    }
  };

  return { timeFilter, setTimeFilter: updateTimeFilter, isLoaded };
}