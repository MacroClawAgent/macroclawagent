// IMPORTANT: Your RapidAPI key works across all APIs but you must
// SUBSCRIBE to each API individually at rapidapi.com even on the free tier.
// Required subscriptions:
//   1. "Woolworths Products API" — search it on rapidapi.com, click Subscribe (Free plan)
//   2. "Coles AU" — same process
// The API key alone is not enough — subscription is mandatory.

import type { SmartCartIngredient, SupermarketProduct } from '../types/smartCart';
import { RAPIDAPI_KEY } from '../constants/apiKeys';

function getRapidApiKey(): string { return RAPIDAPI_KEY; }

// ── Debug ─────────────────────────────────────────────────────────────────────

export function logApiDebug(): void {
  const key = getRapidApiKey();
  console.log('=== SMART CART API DEBUG ===');
  console.log('RapidAPI Key exists:', !!key);
  console.log('RapidAPI Key first 8 chars:', key.substring(0, 8) || '(empty)');
}

export async function testRapidAPIConnection(): Promise<void> {
  const key = getRapidApiKey();
  console.log('=== TESTING RAPIDAPI CONNECTION ===');

  if (!key) {
    console.error('❌ EXPO_PUBLIC_RAPIDAPI_KEY is undefined or empty');
    console.error('Fix: restart Metro with --clear flag after adding to .env');
    return;
  }

  try {
    console.log('Making test request to RapidAPI...');
    const res = await fetch(
      'https://woolworths-products-api.p.rapidapi.com/api/products/search?query=chicken&pageSize=3&pageNumber=1',
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': 'woolworths-products-api.p.rapidapi.com',
        },
      }
    );
    console.log('Response status:', res.status, res.statusText);
    const text = await res.text();
    console.log('Raw response (first 500 chars):', text.substring(0, 500));

    if (res.status === 200)       console.log('✅ RapidAPI connection working!');
    else if (res.status === 401)  console.error('❌ 401 — API key invalid or not subscribed to this API on rapidapi.com');
    else if (res.status === 403)  console.error('❌ 403 — Subscribed but quota exceeded or wrong plan');
    else if (res.status === 404)  console.error('❌ 404 — Endpoint URL wrong');
    else if (res.status === 429)  console.error('❌ 429 — Rate limit hit');
  } catch (e: unknown) {
    console.error('❌ Network error:', e instanceof Error ? e.message : String(e));
  }
}

// ── Mock data (always shown when API unavailable) ─────────────────────────────

const MOCK_DB: Record<string, { ww: Omit<SupermarketProduct, 'store'>; coles: Omit<SupermarketProduct, 'store'> }> = {
  default: {
    ww:    { id: 'ww-default',    name: 'Woolworths Product',          brand: 'Woolworths', price: 4.50, size: '500g',   productUrl: 'https://woolworths.com.au' },
    coles: { id: 'coles-default', name: 'Coles Product',               brand: 'Coles',      price: 4.20, size: '500g',   productUrl: 'https://coles.com.au' },
  },
  chicken: {
    ww:    { id: 'ww-001', name: 'Woolworths Free Range Chicken Breast', brand: 'Woolworths', price: 10.00, size: '1kg',  productUrl: 'https://woolworths.com.au/shop/productdetails/123456' },
    coles: { id: 'cl-001', name: 'Coles RSPCA Chicken Breast',           brand: 'Coles',      price: 9.50,  size: '1kg',  productUrl: 'https://coles.com.au/product/123456' },
  },
  egg: {
    ww:    { id: 'ww-002', name: 'Woolworths Free Range Eggs 12 Pack', brand: 'Woolworths', price: 5.50, size: '12 pack', productUrl: 'https://woolworths.com.au/shop/productdetails/234567' },
    coles: { id: 'cl-002', name: 'Coles Free Range Eggs 12 Pack',      brand: 'Coles',      price: 5.00, size: '12 pack', productUrl: 'https://coles.com.au/product/234567' },
  },
  rice: {
    ww:    { id: 'ww-003', name: 'SunRice Long Grain White Rice',  brand: 'SunRice',    price: 3.00, size: '1kg', productUrl: 'https://woolworths.com.au/shop/productdetails/345678' },
    coles: { id: 'cl-003', name: 'Coles Long Grain White Rice',    brand: 'Coles',      price: 2.80, size: '1kg', productUrl: 'https://coles.com.au/product/345678' },
  },
  tuna: {
    ww:    { id: 'ww-004', name: 'John West Tuna in Spring Water 4 Pack', brand: 'John West', price: 7.00, size: '4x95g', productUrl: 'https://woolworths.com.au/shop/productdetails/456789' },
    coles: { id: 'cl-004', name: 'Sirena Tuna in Spring Water 4 Pack',    brand: 'Sirena',    price: 6.80, size: '4x95g', productUrl: 'https://coles.com.au/product/456789' },
  },
  broccoli: {
    ww:    { id: 'ww-005', name: 'Woolworths Broccoli',  brand: 'Woolworths', price: 2.90, size: '~500g', productUrl: 'https://woolworths.com.au/shop/productdetails/567890' },
    coles: { id: 'cl-005', name: 'Coles Broccoli Head',  brand: 'Coles',      price: 2.70, size: '~500g', productUrl: 'https://coles.com.au/product/567890' },
  },
  spinach: {
    ww:    { id: 'ww-006', name: 'Woolworths Baby Spinach', brand: 'Woolworths', price: 3.50, size: '150g', productUrl: 'https://woolworths.com.au/shop/productdetails/678901' },
    coles: { id: 'cl-006', name: 'Coles Baby Spinach Salad', brand: 'Coles',    price: 3.30, size: '150g', productUrl: 'https://coles.com.au/product/678901' },
  },
  oat: {
    ww:    { id: 'ww-007', name: "Uncle Tobys Traditional Rolled Oats", brand: 'Uncle Tobys', price: 4.50, size: '500g', productUrl: 'https://woolworths.com.au/shop/productdetails/789012' },
    coles: { id: 'cl-007', name: 'Coles Rolled Oats Traditional',       brand: 'Coles',       price: 2.80, size: '500g', productUrl: 'https://coles.com.au/product/789012' },
  },
  yogurt: {
    ww:    { id: 'ww-008', name: 'Chobani Greek Yogurt Plain',      brand: 'Chobani',    price: 5.00, size: '500g', productUrl: 'https://woolworths.com.au/shop/productdetails/890123' },
    coles: { id: 'cl-008', name: 'Farmers Union Greek Style Yogurt', brand: 'Farmers Union', price: 4.50, size: '500g', productUrl: 'https://coles.com.au/product/890123' },
  },
  'sweet potato': {
    ww:    { id: 'ww-009', name: 'Woolworths Sweet Potato', brand: 'Woolworths', price: 3.90, size: '~700g', productUrl: 'https://woolworths.com.au/shop/productdetails/901234' },
    coles: { id: 'cl-009', name: 'Coles Sweet Potato',      brand: 'Coles',      price: 3.70, size: '~700g', productUrl: 'https://coles.com.au/product/901234' },
  },
  'olive oil': {
    ww:    { id: 'ww-010', name: 'Cobram Estate Light Olive Oil',     brand: 'Cobram Estate', price: 9.00, size: '500ml', productUrl: 'https://woolworths.com.au/shop/productdetails/012345' },
    coles: { id: 'cl-010', name: 'Coles Extra Virgin Olive Oil',      brand: 'Coles',         price: 5.50, size: '500ml', productUrl: 'https://coles.com.au/product/012345' },
  },
  banana: {
    ww:    { id: 'ww-011', name: 'Woolworths Bananas', brand: 'Woolworths', price: 3.90, size: '~1kg',  productUrl: 'https://woolworths.com.au/shop/productdetails/112345' },
    coles: { id: 'cl-011', name: 'Coles Bananas',      brand: 'Coles',      price: 3.70, size: '~1kg',  productUrl: 'https://coles.com.au/product/112345' },
  },
  almond: {
    ww:    { id: 'ww-012', name: 'Woolworths Roasted Almonds', brand: 'Woolworths', price: 6.00, size: '200g', productUrl: 'https://woolworths.com.au/shop/productdetails/212345' },
    coles: { id: 'cl-012', name: 'Coles Whole Almonds',        brand: 'Coles',      price: 5.80, size: '200g', productUrl: 'https://coles.com.au/product/212345' },
  },
  salmon: {
    ww:    { id: 'ww-013', name: 'Tassal Atlantic Salmon Portion',   brand: 'Tassal', price: 12.00, size: '400g', productUrl: 'https://woolworths.com.au/shop/productdetails/312345' },
    coles: { id: 'cl-013', name: 'Coles Atlantic Salmon Skin On',    brand: 'Coles',  price: 11.50, size: '400g', productUrl: 'https://coles.com.au/product/312345' },
  },
  vegetable: {
    ww:    { id: 'ww-014', name: 'Woolworths Mixed Vegetables Frozen', brand: 'Woolworths', price: 3.50, size: '400g', productUrl: 'https://woolworths.com.au/shop/productdetails/412345' },
    coles: { id: 'cl-014', name: 'Coles Frozen Mixed Vegetables',      brand: 'Coles',      price: 3.30, size: '400g', productUrl: 'https://coles.com.au/product/412345' },
  },
};

function getMockProducts(query: string): { woolworths: SupermarketProduct[]; coles: SupermarketProduct[] } {
  const lower = query.toLowerCase();
  const key = Object.keys(MOCK_DB).find((k) => k !== 'default' && lower.includes(k)) ?? 'default';
  const entry = MOCK_DB[key];
  return {
    woolworths: [{ ...entry.ww, store: 'woolworths' as const }],
    coles:      [{ ...entry.coles, store: 'coles' as const }],
  };
}

// ── Woolworths ────────────────────────────────────────────────────────────────

async function searchWoolworthsProducts(query: string): Promise<SupermarketProduct[]> {
  const key = getRapidApiKey();
  if (!key) return [];
  try {
    const url = new URL('https://woolworths-products-api.p.rapidapi.com/api/products/search');
    url.searchParams.set('query', query);
    url.searchParams.set('pageSize', '5');
    url.searchParams.set('pageNumber', '1');

    const res = await fetch(url.toString(), {
      headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'woolworths-products-api.p.rapidapi.com' },
    });
    if (!res.ok) { console.warn('[Woolworths API]', res.status, await res.text().catch(() => '')); return []; }
    const data = await res.json() as Record<string, unknown>;
    const products = (data?.products ?? data?.results ?? data?.items ?? []) as Record<string, unknown>[];
    return products.slice(0, 3).map(mapWoolworthsProduct);
  } catch (e) {
    console.warn('[Woolworths API] error:', e);
    return [];
  }
}

function mapWoolworthsProduct(p: Record<string, unknown>): SupermarketProduct {
  const id = String(p?.stockcode ?? p?.id ?? Math.random());
  return {
    id,
    name:       String(p?.name ?? p?.displayName ?? 'Unknown product'),
    brand:      String(p?.brand ?? p?.brandName ?? ''),
    price:      Number(p?.price ?? p?.salePrice ?? p?.retailPrice ?? 0),
    size:       String(p?.packageSize ?? p?.size ?? p?.unit ?? ''),
    imageUrl:   String((p?.imageUrls as string[])?.[0] ?? p?.imageUrl ?? '') || undefined,
    productUrl: `https://www.woolworths.com.au/shop/productdetails/${id}`,
    store:      'woolworths',
  };
}

// ── Coles ─────────────────────────────────────────────────────────────────────

async function searchColesProducts(query: string): Promise<SupermarketProduct[]> {
  const key = getRapidApiKey();
  if (!key) return [];
  try {
    const url = new URL('https://coles-au.p.rapidapi.com/search');
    url.searchParams.set('q', query);
    url.searchParams.set('page', '1');

    const res = await fetch(url.toString(), {
      headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'coles-au.p.rapidapi.com' },
    });
    if (!res.ok) { console.warn('[Coles API]', res.status, await res.text().catch(() => '')); return []; }
    const data = await res.json() as Record<string, unknown>;
    const products = (data?.products ?? data?.results ?? data?.data ?? []) as Record<string, unknown>[];
    return products.slice(0, 3).map(mapColesProduct);
  } catch (e) {
    console.warn('[Coles API] error:', e);
    return [];
  }
}

function mapColesProduct(p: Record<string, unknown>): SupermarketProduct {
  const id = String(p?.id ?? p?.sku ?? Math.random());
  return {
    id,
    name:       String(p?.name ?? p?.displayName ?? 'Unknown product'),
    brand:      String(p?.brand ?? p?.brandName ?? ''),
    price:      Number(p?.price ?? p?.salePrice ?? p?.pricePerItem ?? 0),
    size:       String(p?.size ?? p?.packageSize ?? p?.unit ?? ''),
    imageUrl:   String(p?.imageUrl ?? (p?.images as Record<string, string>)?.large ?? '') || undefined,
    productUrl: `https://www.coles.com.au/product/${id}`,
    store:      'coles',
  };
}

// ── Combined ──────────────────────────────────────────────────────────────────

export async function searchBothStores(
  query: string
): Promise<{ woolworths: SupermarketProduct[]; coles: SupermarketProduct[] }> {
  const [woolworths, coles] = await Promise.all([
    searchWoolworthsProducts(query),
    searchColesProducts(query),
  ]);
  return { woolworths, coles };
}

// ── Main search — always returns data (mock fallback guaranteed) ───────────────

export async function smartSearchIngredient(
  ingredient: SmartCartIngredient
): Promise<{ woolworths: SupermarketProduct[]; coles: SupermarketProduct[] }> {
  const query = ingredient.name
    .toLowerCase()
    .replace(/\d+(\.\d+)?\s*(g|kg|ml|l|oz|lb|cup|tbsp|tsp|pc|piece|pieces|x)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  console.log('[SmartCart] Searching:', query);

  // Try real API if key available
  const key = getRapidApiKey();
  if (key && key.length > 10) {
    try {
      const results = await searchBothStores(query);
      if (results.woolworths.length > 0 || results.coles.length > 0) {
        console.log('[SmartCart] ✅ Live results for:', query);
        return results;
      }
    } catch (e) {
      console.warn('[SmartCart] API failed for:', query, e);
    }
  }

  // No mock fallback — return empty so UI shows "price unavailable" instead of fake data
  console.log('[SmartCart] No results for:', query);
  return { woolworths: [], coles: [] };
}
