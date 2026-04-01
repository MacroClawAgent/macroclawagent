import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../lib/api';
import { smartSearchIngredient } from '../services/supermarketApi';
import { getUserLocation, findNearbyStores, getSuburb, MOCK_STORES } from '../services/storeLocator';
import { openInStore as deepLinkOpenInStore } from '../services/deepLinkService';
import {
  generateCartFromGroceryList,
  generateDefaultCartFromMacros,
  assignCategory,
} from '../services/smartCartAI';
import type {
  SmartCart,
  SmartCartIngredient,
  NearbyStore,
  StoreType,
  SupermarketProduct,
  CartMeta,
} from '../types/smartCart';
import type { ConsolidatedIngredient, IngredientCategory as ConsolidatedCategory } from '../types/mealPlan';

const STORAGE_KEY = 'jonno_smart_cart';
const AGENT_CART_KEY = 'jonno_agent_cart';
const CARTS_INDEX_KEY = 'jonno_carts_index';
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface CartSummary {
  id: string;
  label: string;
  source: 'agent' | 'community' | 'manual';
  ingredientCount: number;
  estimatedTotal: number;
  createdAt: string;
}

async function loadCartsIndex(): Promise<CartSummary[]> {
  const raw = await AsyncStorage.getItem(CARTS_INDEX_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveCartsIndex(carts: CartSummary[]): Promise<void> {
  await AsyncStorage.setItem(CARTS_INDEX_KEY, JSON.stringify(carts));
}

async function addCartToIndex(summary: CartSummary): Promise<void> {
  const carts = await loadCartsIndex();
  // Replace if same id exists, else prepend
  const filtered = carts.filter(c => c.id !== summary.id);
  await saveCartsIndex([summary, ...filtered].slice(0, 20));
}

async function removeCartFromIndex(id: string): Promise<void> {
  const carts = await loadCartsIndex();
  await saveCartsIndex(carts.filter(c => c.id !== id));
  await AsyncStorage.removeItem(`jonno_cart_${id}`).catch(() => {});
}

async function saveCartData(id: string, data: any): Promise<void> {
  await AsyncStorage.setItem(`jonno_cart_${id}`, JSON.stringify(data));
}

async function loadCartData(id: string): Promise<any | null> {
  const raw = await AsyncStorage.getItem(`jonno_cart_${id}`);
  return raw ? JSON.parse(raw) : null;
}

// Map consolidation categories → SmartCart categories
function mapCategory(c: ConsolidatedCategory): SmartCartIngredient['category'] {
  const map: Record<ConsolidatedCategory, SmartCartIngredient['category']> = {
    produce:  'vegetables',
    protein:  'protein',
    dairy:    'dairy',
    pantry:   'carbs',
    bakery:   'carbs',
    frozen:   'other',
    other:    'other',
  };
  return map[c] ?? 'other';
}
const BATCH_SIZE = 3;
const BATCH_DELAY_MS = 350;

function makeId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function persistCart(cart: SmartCart): void {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cart)).catch(() => {});
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSmartCart() {
  const { userProfile } = useAuth();
  const [cart, setCart] = useState<SmartCart | null>(null);
  const [cartMeta, setCartMeta] = useState<CartMeta | null>(null);
  const [cartsIndex, setCartsIndex] = useState<CartSummary[]>([]);
  const [pantryItems, setPantryItems] = useState<ConsolidatedIngredient[]>([]);
  const [initializing, setInitializing] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [suburb, setSuburb] = useState<string | null>(null);
  const abortRef = useRef(false);

  // Load carts index + persisted active cart on mount
  useEffect(() => {
    loadCartsIndex().then(setCartsIndex).catch(() => {});
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as SmartCart;
        const age = Date.now() - new Date(saved.lastUpdated).getTime();
        if (age < CACHE_MAX_AGE_MS) {
          saved.ingredients = saved.ingredients.map((ing) => ({ ...ing, isChecked: false }));
          saved.selectedNearbyStore = saved.selectedNearbyStore ?? null;
          setCart(saved);
        }
      })
      .catch(() => {});
  }, []);

  // Re-try location when app returns to foreground after permission was denied
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && (locationPermissionDenied || locationError)) {
        setCart((prev) => {
          if (!prev) return prev;
          // Trigger retry with current cart id
          loadNearbyStores(prev.id);
          return prev;
        });
      }
    });
    return () => sub.remove();
  }, [locationPermissionDenied, locationError, loadNearbyStores]);

  // ── Product batch loading ─────────────────────────────────────────────────

  const loadProductsForIngredients = useCallback(
    async (ingredients: SmartCartIngredient[], cartId: string) => {
      setProductsLoading(true);
      abortRef.current = false;

      for (let i = 0; i < ingredients.length; i += BATCH_SIZE) {
        if (abortRef.current) break;
        const batch = ingredients.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(
          batch.map((ing) => smartSearchIngredient(ing))
        );

        setCart((prev) => {
          if (!prev || prev.id !== cartId) return prev;
          const updated = prev.ingredients.map((ing) => {
            const batchIdx = batch.findIndex((b) => b.id === ing.id);
            if (batchIdx === -1) return ing;
            const res = results[batchIdx];
            return {
              ...ing,
              woolworthsProducts: res.woolworths,
              colesProducts: res.coles,
              isLoadingProducts: false,
            };
          });
          const next = { ...prev, ingredients: updated, lastUpdated: new Date().toISOString() };
          persistCart(next);
          return next;
        });

        if (i + BATCH_SIZE < ingredients.length) await sleep(BATCH_DELAY_MS);
      }

      setProductsLoading(false);
    },
    []
  );

  // ── Location + nearby stores ──────────────────────────────────────────────

  const loadNearbyStores = useCallback(async (cartId: string) => {
    setLocationLoading(true);
    setLocationError(null);
    setLocationPermissionDenied(false);
    let finalStores: NearbyStore[] = MOCK_STORES;
    try {
      const { lat, lng } = await getUserLocation();
      const [stores, suburbName] = await Promise.all([
        findNearbyStores(lat, lng),
        getSuburb(lat, lng),
      ]);
      finalStores = stores.length > 0 ? stores : MOCK_STORES;
      if (suburbName) setSuburb(suburbName);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not get location';
      if (msg.includes('permission')) setLocationPermissionDenied(true);
      setLocationError(msg);
      finalStores = MOCK_STORES;
    } finally {
      const autoSelected = finalStores.find((s) => s.isOpen) ?? finalStores[0] ?? null;
      setCart((prev) => {
        if (!prev || prev.id !== cartId) return prev;
        const next = {
          ...prev,
          nearbyStores: finalStores,
          selectedNearbyStore: prev.selectedNearbyStore ?? autoSelected,
          selectedStore: prev.selectedStore ?? autoSelected?.store ?? null,
        };
        persistCart(next);
        return next;
      });
      setLocationLoading(false);
    }
  }, []);

  // ── Initialize ────────────────────────────────────────────────────────────

  const initializeCart = useCallback(async () => {
    setInitializing(true);
    setNetworkError(false);
    abortRef.current = true; // stop any in-flight product loading
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});

    // ── Check for agent-generated cart first ──────────────────────────────
    try {
      const agentRaw = await AsyncStorage.getItem(AGENT_CART_KEY);
      if (agentRaw) {
        const agentCart = JSON.parse(agentRaw) as {
          ingredients: ConsolidatedIngredient[];
          planType: 'today' | 'week' | 'single';
          mealCount: number;
          generatedAt: string;
        };
        const toBuy = agentCart.ingredients.filter(i => !i.isInPantry);
        const inPantry = agentCart.ingredients.filter(i => i.isInPantry);

        const mapped: SmartCartIngredient[] = toBuy.map(ci => ({
          id: ci.id,
          name: ci.name,
          quantity: ci.totalQuantity,
          unit: ci.unit,
          category: mapCategory(ci.category),
          isChecked: false,
          woolworthsProducts: [],
          colesProducts: [],
          selectedProductId: null,
          isLoadingProducts: true,
          usedIn: ci.usedIn,
          estimatedPrice: ci.estimatedPrice,
          supermarketProduct: ci.supermarketProduct,
          displayQuantity: ci.displayQuantity,
        }));

        const newCart: SmartCart = {
          id: makeId(),
          createdAt: new Date().toISOString(),
          ingredients: mapped,
          selectedStore: null,
          selectedNearbyStore: null,
          nearbyStores: [],
          estimatedTotal: 0,
          lastUpdated: new Date().toISOString(),
        };

        const planLabel = agentCart.label
          ?? (agentCart.planType === 'week' ? "This Week's Meals"
            : agentCart.planType === 'single' ? 'Meal'
            : "Today's Meals");
        const meta: CartMeta = {
          source: 'agent',
          planType: agentCart.planType,
          mealCount: agentCart.mealCount,
          pantrySkipped: inPantry.length,
          generatedAt: agentCart.generatedAt,
          label: planLabel,
        };

        setCart(newCart);
        persistCart(newCart);
        setCartMeta(meta);
        setPantryItems(inPantry);
        setInitializing(false);

        // Save to carts index
        const estTotal = toBuy.reduce((s, i) => s + (i.estimatedPrice ?? 0), 0);
        const summary: CartSummary = {
          id: newCart.id,
          label: planLabel,
          source: 'agent',
          ingredientCount: mapped.length,
          estimatedTotal: estTotal,
          createdAt: newCart.createdAt,
        };
        addCartToIndex(summary).then(() => loadCartsIndex().then(setCartsIndex));
        saveCartData(newCart.id, { cart: newCart, meta });

        loadNearbyStores(newCart.id);
        loadProductsForIngredients(mapped, newCart.id);

        // Consume the agent cart so it's not re-loaded on next focus
        await AsyncStorage.removeItem(AGENT_CART_KEY);
        return;
      }
    } catch {
      // fall through to existing logic
    }

    // No agent cart — leave empty so the empty state shows
    setCart(null);
    setCartMeta(null);
    setInitializing(false);
  }, [userProfile, loadNearbyStores, loadProductsForIngredients]);

  // ── Refresh from agent plan ───────────────────────────────────────────────

  const refreshFromPlan = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setCartMeta(null);
    setPantryItems([]);
    initializeCart();
  }, [initializeCart]);

  // ── Ingredient mutations ──────────────────────────────────────────────────

  const toggleIngredient = useCallback((id: string) => {
    setCart((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        ingredients: prev.ingredients.map((i) =>
          i.id === id ? { ...i, isChecked: !i.isChecked } : i
        ),
        lastUpdated: new Date().toISOString(),
      };
      persistCart(next);
      return next;
    });
  }, []);

  const removeIngredient = useCallback((id: string) => {
    setCart((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        ingredients: prev.ingredients.filter((i) => i.id !== id),
        lastUpdated: new Date().toISOString(),
      };
      persistCart(next);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setCart((prev) => {
      if (!prev) return prev;
      const allChecked = prev.ingredients.every((i) => i.isChecked);
      const next = {
        ...prev,
        ingredients: prev.ingredients.map((i) => ({ ...i, isChecked: !allChecked })),
        lastUpdated: new Date().toISOString(),
      };
      persistCart(next);
      return next;
    });
  }, []);

  const addIngredient = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newIng: SmartCartIngredient = {
      id: makeId(),
      name: trimmed,
      quantity: 1,
      unit: 'unit',
      category: assignCategory(trimmed),
      isChecked: false,
      woolworthsProducts: [],
      colesProducts: [],
      selectedProductId: null,
      isLoadingProducts: true,
    };
    setCart((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        ingredients: [...prev.ingredients, newIng],
        lastUpdated: new Date().toISOString(),
      };
      persistCart(next);
      // Load products for the new ingredient
      loadProductsForIngredients([newIng], prev.id);
      return next;
    });
  }, [loadProductsForIngredients]);

  const selectStore = useCallback((store: StoreType) => {
    setCart((prev) => {
      if (!prev) return prev;
      const next = { ...prev, selectedStore: store, lastUpdated: new Date().toISOString() };
      persistCart(next);
      return next;
    });
  }, []);

  const selectNearbyStore = useCallback((store: NearbyStore) => {
    setCart((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        selectedNearbyStore: store,
        selectedStore: store.store,
        lastUpdated: new Date().toISOString(),
      };
      persistCart(next);
      return next;
    });
  }, []);

  const selectProductForIngredient = useCallback(
    (ingredientId: string, productId: string) => {
      setCart((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          ingredients: prev.ingredients.map((i) =>
            i.id === ingredientId ? { ...i, selectedProductId: productId } : i
          ),
          lastUpdated: new Date().toISOString(),
        };
        persistCart(next);
        return next;
      });
    },
    []
  );

  const refreshProducts = useCallback(() => {
    if (!cart) return;
    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: prev.ingredients.map((i) => ({ ...i, isLoadingProducts: true })),
      };
    });
    loadProductsForIngredients(cart.ingredients, cart.id);
  }, [cart, loadProductsForIngredients]);

  const clearCart = useCallback(() => {
    abortRef.current = true;
    setCart(null);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────

  const getEstimatedTotal = useCallback((): number => {
    if (!cart) return 0;
    const store = cart.selectedStore;
    return cart.ingredients
      .filter((i) => i.isChecked)
      .reduce((sum, ing) => {
        let product: SupermarketProduct | undefined;
        if (ing.selectedProductId) {
          product =
            ing.woolworthsProducts.find((p) => p.id === ing.selectedProductId) ??
            ing.colesProducts.find((p) => p.id === ing.selectedProductId);
        } else if (store === 'woolworths') {
          product = ing.woolworthsProducts[0];
        } else if (store === 'coles') {
          product = ing.colesProducts[0];
        }
        return sum + (product?.price ?? 0);
      }, 0);
  }, [cart]);

  const getNearestStore = useCallback(
    (store: StoreType): NearbyStore | undefined =>
      cart?.nearbyStores.find((s) => s.store === store),
    [cart]
  );

  const openInStore = useCallback(async () => {
    if (!cart?.selectedStore || !cart.ingredients.length) return;
    await deepLinkOpenInStore(cart.selectedStore, cart.ingredients);
  }, [cart]);

  // Check if a fresh agent cart exists and load it (called on tab focus)
  const checkForAgentCart = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(AGENT_CART_KEY);
      if (!raw) return;
      // Fresh agent cart found — load it, then consume so it's not re-read
      initializeCart();
    } catch {}
  }, [initializeCart]);

  const loadCartById = useCallback(async (id: string) => {
    const data = await loadCartData(id);
    if (data?.cart) {
      setCart(data.cart);
      setCartMeta(data.meta ?? null);
      persistCart(data.cart);
      loadNearbyStores(data.cart.id);
    }
  }, [loadNearbyStores]);

  const deleteCartById = useCallback(async (id: string) => {
    await removeCartFromIndex(id);
    if (cart?.id === id) {
      setCart(null);
      setCartMeta(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
    setCartsIndex(await loadCartsIndex());
  }, [cart]);

  const refreshCartsIndex = useCallback(async () => {
    setCartsIndex(await loadCartsIndex());
  }, []);

  return {
    cart,
    cartMeta,
    cartsIndex,
    checkForAgentCart,
    pantryItems,
    initializing,
    productsLoading,
    locationLoading,
    locationError,
    locationPermissionDenied,
    networkError,
    suburb,
    initializeCart,
    refreshFromPlan,
    refreshCartsIndex,
    loadCartById,
    deleteCartById,
    toggleIngredient,
    toggleAll,
    removeIngredient,
    addIngredient,
    selectStore,
    selectNearbyStore,
    selectProductForIngredient,
    refreshProducts,
    clearCart,
    openInStore,
    getEstimatedTotal,
    getNearestStore,
  };
}
