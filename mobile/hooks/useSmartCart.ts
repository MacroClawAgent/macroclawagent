import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../lib/api';
import { smartSearchIngredient } from '../services/supermarketApi';
import { getUserLocation, findNearbyStores, MOCK_STORES } from '../services/storeLocator';
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
} from '../types/smartCart';

const STORAGE_KEY = 'jonno_smart_cart';
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
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
  const [initializing, setInitializing] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const abortRef = useRef(false);

  // Load persisted cart on mount — always reset isChecked to false
  useEffect(() => {
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
      const stores = await findNearbyStores(lat, lng);
      finalStores = stores.length > 0 ? stores : MOCK_STORES;
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

    let ingredients: SmartCartIngredient[] = [];

    try {
      const res = await apiGet<{ grocery_list?: { name: string; grams?: number }[] }>(
        '/api/optimizer/create'
      );
      if (res?.grocery_list && res.grocery_list.length > 0) {
        ingredients = generateCartFromGroceryList(res.grocery_list);
      }
    } catch {
      setNetworkError(true);
    }

    if (ingredients.length === 0) {
      ingredients = generateDefaultCartFromMacros(
        userProfile?.protein_goal ?? 120,
        userProfile?.carbs_goal ?? 250,
        userProfile?.fat_goal ?? 70
      );
    }

    const newCart: SmartCart = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      ingredients,
      selectedStore: null,
      selectedNearbyStore: null,
      nearbyStores: [],
      estimatedTotal: 0,
      lastUpdated: new Date().toISOString(),
    };

    setCart(newCart);
    persistCart(newCart);
    setInitializing(false);

    // Load location and products in parallel
    loadNearbyStores(newCart.id);
    loadProductsForIngredients(ingredients, newCart.id);
  }, [userProfile, loadNearbyStores, loadProductsForIngredients]);

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

  return {
    cart,
    initializing,
    productsLoading,
    locationLoading,
    locationError,
    locationPermissionDenied,
    networkError,
    initializeCart,
    toggleIngredient,
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
