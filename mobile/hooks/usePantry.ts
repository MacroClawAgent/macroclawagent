import { useState, useEffect, useCallback } from 'react';
import { loadPantryItems, addPantryItem, removePantryItem, type PantryItem } from '@/services/pantryService';

export function usePantry() {
  const [items, setItems] = useState<PantryItem[]>([]);

  useEffect(() => {
    loadPantryItems().then(setItems);
  }, []);

  const add = useCallback(async (name: string) => {
    const updated = await addPantryItem(name);
    setItems(updated);
  }, []);

  const remove = useCallback(async (id: string) => {
    const updated = await removePantryItem(id);
    setItems(updated);
  }, []);

  return { items, add, remove };
}
