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

// ── Ingredient → supermarket search term mapping ────────────────────────────
// Recipe ingredients are verbose ("boneless skinless chicken thigh fillets").
// Supermarket APIs work best with short, common product names.

const SEARCH_MAP: [RegExp, string][] = [
  // Protein
  [/chicken\s*breast/i, 'chicken breast'],
  [/chicken\s*thigh/i, 'chicken thigh'],
  [/chicken/i, 'chicken'],
  [/salmon\s*(fillet|portion|steak)?/i, 'salmon'],
  [/tuna/i, 'tuna'],
  [/beef\s*(mince|steak|stir.?fry|strips)?/i, 'beef $1'],
  [/lamb/i, 'lamb'],
  [/pork/i, 'pork'],
  [/prawn|shrimp/i, 'prawns'],
  [/tofu/i, 'tofu'],
  [/egg/i, 'eggs'],
  // Dairy
  [/greek\s*yogu?r?t/i, 'greek yoghurt'],
  [/yogu?r?t/i, 'yoghurt'],
  [/cheddar|cheese/i, 'cheese'],
  [/milk/i, 'milk'],
  [/butter/i, 'butter'],
  [/cream\s*cheese/i, 'cream cheese'],
  [/parmesan/i, 'parmesan'],
  // Carbs
  [/jasmine\s*rice/i, 'jasmine rice'],
  [/brown\s*rice/i, 'brown rice'],
  [/basmati/i, 'basmati rice'],
  [/rice/i, 'rice'],
  [/pasta|penne|spaghetti|fusilli|fettuccine/i, 'pasta'],
  [/bread/i, 'bread'],
  [/oat|porridge/i, 'oats'],
  [/quinoa/i, 'quinoa'],
  [/sweet\s*potato/i, 'sweet potato'],
  [/potato/i, 'potato'],
  [/wrap|tortilla/i, 'wraps'],
  // Vegetables
  [/broccoli/i, 'broccoli'],
  [/spinach/i, 'baby spinach'],
  [/avocado/i, 'avocado'],
  [/capsicum|bell\s*pepper/i, 'capsicum'],
  [/zucchini|courgette/i, 'zucchini'],
  [/carrot/i, 'carrots'],
  [/onion/i, 'onion'],
  [/garlic/i, 'garlic'],
  [/tomato\s*(paste|passata|sauce)/i, 'tomato $1'],
  [/tomato/i, 'tomatoes'],
  [/mushroom/i, 'mushrooms'],
  [/lettuce|cos|iceberg/i, 'lettuce'],
  [/cucumber/i, 'cucumber'],
  [/corn/i, 'corn'],
  [/beansprout|bean\s*sprout/i, 'bean sprouts'],
  [/green\s*bean/i, 'green beans'],
  // Pantry
  [/olive\s*oil/i, 'olive oil'],
  [/coconut\s*(oil|milk|cream)/i, 'coconut $1'],
  [/soy\s*sauce/i, 'soy sauce'],
  [/honey/i, 'honey'],
  [/peanut\s*butter/i, 'peanut butter'],
  [/almond/i, 'almonds'],
  [/walnut/i, 'walnuts'],
  [/cashew/i, 'cashews'],
  [/protein\s*(powder|shake)/i, 'protein powder'],
  [/lemon/i, 'lemon'],
  [/lime/i, 'lime'],
  [/ginger/i, 'ginger'],
  [/chilli|chili/i, 'chilli'],
  [/cumin/i, 'cumin'],
  [/paprika/i, 'paprika'],
  [/cinnamon/i, 'cinnamon'],
  [/banana/i, 'banana'],
  [/apple/i, 'apple'],
  [/berr(y|ies)/i, 'berries'],
  [/blueberr/i, 'blueberries'],
  [/strawberr/i, 'strawberries'],
];

function getSearchTerm(rawName: string): string {
  // Strip units and quantities first
  const cleaned = rawName
    .replace(/\(.*?\)/g, '') // remove parentheses e.g. "(150g)"
    .replace(/\d+(\.\d+)?\s*(g|kg|ml|l|oz|lb|cups?|tbsp|tsp|pc|pieces?|x|slices?|cloves?|sprigs?|handfuls?)\b/gi, '')
    .replace(/,.*$/, '') // remove everything after comma
    .replace(/\s+/g, ' ')
    .trim();

  // Try mapping first
  for (const [pattern, term] of SEARCH_MAP) {
    if (pattern.test(cleaned)) {
      return cleaned.replace(pattern, term).replace(/\s+/g, ' ').trim();
    }
  }

  // Fallback: take first 2-3 meaningful words
  const words = cleaned.toLowerCase().split(/\s+/).filter(w =>
    w.length > 2 && !['and', 'the', 'for', 'with', 'fresh', 'raw', 'cooked', 'diced', 'sliced',
      'chopped', 'minced', 'grated', 'crushed', 'dried', 'ground', 'boneless', 'skinless',
      'organic', 'free', 'range', 'large', 'small', 'medium', 'thin', 'thick'].includes(w)
  );
  return words.slice(0, 3).join(' ');
}

// ── Main search ──────────────────────────────────────────────────────────────

export async function smartSearchIngredient(
  ingredient: SmartCartIngredient
): Promise<{ woolworths: SupermarketProduct[]; coles: SupermarketProduct[] }> {
  const searchTerm = getSearchTerm(ingredient.name);
  if (!searchTerm) {
    console.log('[SmartCart] Empty search term for:', ingredient.name);
    return { woolworths: [], coles: [] };
  }

  console.log('[SmartCart] Searching:', searchTerm, '(from:', ingredient.name, ')');

  const key = getRapidApiKey();
  if (key && key.length > 10) {
    try {
      const results = await searchBothStores(searchTerm);
      if (results.woolworths.length > 0 || results.coles.length > 0) {
        console.log('[SmartCart] ✅ Live results for:', searchTerm);
        return results;
      }
      // If exact term fails, try just the first word as a broader search
      const firstWord = searchTerm.split(' ')[0];
      if (firstWord !== searchTerm && firstWord.length > 2) {
        console.log('[SmartCart] Retrying with:', firstWord);
        const retry = await searchBothStores(firstWord);
        if (retry.woolworths.length > 0 || retry.coles.length > 0) {
          console.log('[SmartCart] ✅ Retry results for:', firstWord);
          return retry;
        }
      }
    } catch (e) {
      console.warn('[SmartCart] API failed for:', searchTerm, e);
    }
  }

  console.log('[SmartCart] No results for:', searchTerm);
  return { woolworths: [], coles: [] };
}
