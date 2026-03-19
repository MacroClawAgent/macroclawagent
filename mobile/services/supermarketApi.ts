import type { SmartCartIngredient, SupermarketProduct } from '../types/smartCart';

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY ?? '';

// ── Woolworths ────────────────────────────────────────────────────────────────

export async function searchWoolworthsProducts(query: string): Promise<SupermarketProduct[]> {
  if (!RAPIDAPI_KEY) return [];
  try {
    const url = new URL('https://woolworths-products-api.p.rapidapi.com/search');
    url.searchParams.set('query', query);
    url.searchParams.set('pageSize', '5');
    url.searchParams.set('pageNumber', '1');

    const res = await fetch(url.toString(), {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'woolworths-products-api.p.rapidapi.com',
      },
    });
    if (!res.ok) return [];
    const data = await res.json() as Record<string, unknown>;
    const products = (data?.products ?? data?.results ?? []) as Record<string, unknown>[];
    return products.slice(0, 3).map((p) => mapWoolworthsProduct(p));
  } catch {
    return [];
  }
}

function mapWoolworthsProduct(p: Record<string, unknown>): SupermarketProduct {
  const id = String(p?.stockcode ?? p?.id ?? Math.random());
  const name = String(p?.name ?? p?.displayName ?? 'Unknown product');
  const brand = String(p?.brand ?? p?.brandName ?? '');
  const price = Number(p?.price ?? p?.salePrice ?? p?.retailPrice ?? 0);
  const size = String(p?.packageSize ?? p?.size ?? p?.unit ?? '');
  const imageUrl = String((p?.imageUrls as string[])?.[0] ?? p?.imageUrl ?? '');
  return {
    id,
    name,
    brand,
    price,
    size,
    imageUrl: imageUrl || undefined,
    productUrl: `https://www.woolworths.com.au/shop/productdetails/${id}`,
    store: 'woolworths',
  };
}

// ── Coles ─────────────────────────────────────────────────────────────────────

export async function searchColesProducts(query: string): Promise<SupermarketProduct[]> {
  if (!RAPIDAPI_KEY) return [];
  try {
    const url = new URL('https://coles-au.p.rapidapi.com/search');
    url.searchParams.set('q', query);
    url.searchParams.set('page', '1');

    const res = await fetch(url.toString(), {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'coles-au.p.rapidapi.com',
      },
    });
    if (!res.ok) return [];
    const data = await res.json() as Record<string, unknown>;
    const products = (data?.products ?? data?.results ?? data?.data ?? []) as Record<string, unknown>[];
    return products.slice(0, 3).map((p) => mapColesProduct(p));
  } catch {
    return [];
  }
}

function mapColesProduct(p: Record<string, unknown>): SupermarketProduct {
  const id = String(p?.id ?? p?.sku ?? Math.random());
  const name = String(p?.name ?? p?.displayName ?? 'Unknown product');
  const brand = String(p?.brand ?? p?.brandName ?? '');
  const price = Number(p?.price ?? p?.salePrice ?? p?.pricePerItem ?? 0);
  const size = String(p?.size ?? p?.packageSize ?? p?.unit ?? '');
  const imageUrl = String(p?.imageUrl ?? (p?.images as Record<string, string>)?.large ?? '');
  return {
    id,
    name,
    brand,
    price,
    size,
    imageUrl: imageUrl || undefined,
    productUrl: `https://www.coles.com.au/product/${id}`,
    store: 'coles',
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

// Strips quantities and units from an ingredient name before searching
function cleanSearchQuery(ingredient: SmartCartIngredient): string {
  return ingredient.name
    .toLowerCase()
    .replace(/\d+(\.\d+)?\s*(g|kg|ml|l|oz|lb|cup|tbsp|tsp|pc|piece|pieces|x)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function smartSearchIngredient(
  ingredient: SmartCartIngredient
): Promise<{ woolworths: SupermarketProduct[]; coles: SupermarketProduct[] }> {
  const query = cleanSearchQuery(ingredient);
  return searchBothStores(query);
}
