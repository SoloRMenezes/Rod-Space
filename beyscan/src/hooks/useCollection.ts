import { useState, useEffect, useCallback } from 'react';
import type { BeyItem, ScanType } from '../types';

const STORAGE_KEY = 'bey-collection-v2';

export function useCollection() {
  const [items, setItems] = useState<BeyItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  const add = useCallback((item: Omit<BeyItem, 'id' | 'createdAt'>) => {
    const newItem: BeyItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setItems(prev => [newItem, ...prev]);
    return newItem;
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const update = useCallback((id: string, updates: Partial<BeyItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const getByType = useCallback((type: ScanType) => {
    return items.filter(i => i.type === type);
  }, [items]);

  const stats = {
    total: items.length,
    byType: {
      Top: items.filter(i => i.type === 'Top').length,
      Middle: items.filter(i => i.type === 'Middle').length,
      Tip: items.filter(i => i.type === 'Tip').length,
      Build: items.filter(i => i.type === 'Build').length
    }
  };

  return {
    items,
    loaded,
    add,
    remove,
    update,
    getByType,
    stats
  };
}
