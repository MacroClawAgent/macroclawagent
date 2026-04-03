export type IngredientCategory =
  | 'protein'
  | 'carbs'
  | 'vegetables'
  | 'dairy'
  | 'fats'
  | 'condiments'
  | 'other';

export type StoreType = 'woolworths' | 'coles' | 'aldi' | 'iga' | 'costco';

export interface SupermarketProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  size: string;
  imageUrl?: string;
  productUrl: string;
  store: StoreType;
}

export interface SmartCartIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  isChecked: boolean;
  woolworthsProducts: SupermarketProduct[];
  colesProducts: SupermarketProduct[];
  selectedProductId: string | null;
  isLoadingProducts: boolean;
  // Optional fields populated when ingredient comes from Agent meal plan
  usedIn?: string[];
  estimatedPrice?: number;
  supermarketProduct?: string;
  displayQuantity?: string;
  isInPantry?: boolean;
}

export type CartSource = 'agent' | 'community' | 'manual';

export interface CartMeta {
  source: CartSource;
  planType: 'today' | 'week' | 'single';
  mealCount: number;
  pantrySkipped: number;
  generatedAt: string;
  label: string; // e.g. "Today's Plan", "Chicken Rice Bowl", "Manual Cart"
}

export interface NearbyStore {
  id: string;
  name: string;
  store: StoreType;
  address: string;
  distance: number; // metres
  isOpen: boolean;
  lat: number;
  lng: number;
}

export interface SmartCart {
  id: string;
  createdAt: string;
  ingredients: SmartCartIngredient[];
  selectedStore: StoreType | null;
  selectedNearbyStore: NearbyStore | null;
  nearbyStores: NearbyStore[];
  estimatedTotal: number;
  lastUpdated: string;
}
