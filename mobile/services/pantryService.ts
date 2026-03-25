import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'jonno_pantry_v1';

export interface PantryItem {
  id: string;
  name: string;
  source: 'smart_cart' | 'manual';
  addedDate: string;
}

export async function loadPantryItems(): Promise<PantryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function _save(items: PantryItem[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function addPantryItem(name: string, source: PantryItem['source'] = 'manual'): Promise<PantryItem[]> {
  const items = await loadPantryItems();
  const trimmed = name.trim();
  if (!trimmed || items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) return items;
  const updated = [...items, { id: Date.now().toString(), name: trimmed, source, addedDate: new Date().toISOString() }];
  await _save(updated);
  return updated;
}

export async function removePantryItem(id: string): Promise<PantryItem[]> {
  const items = await loadPantryItems();
  const updated = items.filter((i) => i.id !== id);
  await _save(updated);
  return updated;
}

export async function importFromSmartCart(ingredients: string[]): Promise<void> {
  const current = await loadPantryItems();
  const existing = new Set(current.map((i) => i.name.toLowerCase()));
  const newItems: PantryItem[] = ingredients
    .filter((name) => !existing.has(name.toLowerCase()))
    .map((name) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, source: 'smart_cart', addedDate: new Date().toISOString() }));
  if (newItems.length > 0) await _save([...current, ...newItems]);
}

export function getPantryString(items: PantryItem[]): string {
  if (items.length === 0) return '';
  const lines = items.map((i) => `• ${i.name}${i.source === 'smart_cart' ? ' (from Smart Cart)' : ''}`).join('\n');
  return `PANTRY / FRIDGE (ingredients you currently have):\n${lines}\n\nPrioritise using these ingredients. Flag which ingredients come from pantry vs need to be purchased.`;
}
