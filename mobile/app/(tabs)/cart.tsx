import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSmartCart } from '@/hooks/useSmartCart';
import { searchBothStores } from '@/services/supermarketApi';
import { StoreSelector } from '@/components/SmartCart/StoreSelector';
import type {
  IngredientCategory,
  SmartCartIngredient,
  SupermarketProduct,
  StoreType,
} from '@/types/smartCart';
import type { ConsolidatedIngredient } from '@/types/mealPlan';

// ── Theme ──────────────────────────────────────────────────────────────────────
const BG        = '#1C1612';
const CARD      = '#252018';
const BORDER    = 'rgba(248,213,97,0.12)';
const BORDER_DIM = 'rgba(232,224,208,0.06)';
const TEXT      = '#E8E0D0';
const TEXT_MUTED = 'rgba(232,224,208,0.5)';
const TEXT_DIM  = 'rgba(232,224,208,0.35)';
const GOLD      = '#F5C842';
const CORAL     = '#E07B54';
const SAGE      = '#8B9E6E';
const DIM       = 'rgba(232,224,208,0.3)';
const WW_GREEN  = '#007837';
const COLES_RED = '#E31837';

// ── Aisle mapping ────────────────────────────────────────────────────────────
type Aisle = 'produce' | 'meat_seafood' | 'dairy_eggs' | 'bakery' | 'pantry' | 'frozen' | 'drinks' | 'other';

const AISLE_META: Record<Aisle, { label: string; icon: string; order: number }> = {
  produce:      { label: 'Produce',        icon: 'leaf-outline',       order: 0 },
  meat_seafood: { label: 'Meat & Seafood', icon: 'fish-outline',       order: 1 },
  dairy_eggs:   { label: 'Dairy & Eggs',   icon: 'water-outline',      order: 2 },
  bakery:       { label: 'Bakery',         icon: 'restaurant-outline', order: 3 },
  pantry:       { label: 'Pantry & Dry',   icon: 'cube-outline',       order: 4 },
  frozen:       { label: 'Frozen',         icon: 'snow-outline',       order: 5 },
  drinks:       { label: 'Drinks',         icon: 'cafe-outline',       order: 6 },
  other:        { label: 'Other',          icon: 'grid-outline',       order: 7 },
};

const AISLE_KEYWORDS: [RegExp, Aisle][] = [
  [/chicken|beef|lamb|pork|mince|steak|salmon|tuna|fish|prawn|turkey|bacon|sausage/i, 'meat_seafood'],
  [/milk|yoghurt|yogurt|cheese|cream|butter|egg/i, 'dairy_eggs'],
  [/bread|wrap|tortilla|roll|bun|crumpet|muffin/i, 'bakery'],
  [/spinach|broccoli|carrot|onion|garlic|tomato|capsicum|zucchini|lettuce|avocado|mushroom|potato|sweet potato|corn|cucumber|celery|bean sprout|kale|rocket|herb|basil|coriander|parsley|lemon|lime|apple|banana|berr|strawberr|blueberr|mango|orange|ginger/i, 'produce'],
  [/frozen|ice cream/i, 'frozen'],
  [/juice|water|kombucha|coffee|tea\b/i, 'drinks'],
  [/rice|pasta|oat|quinoa|flour|sugar|oil|vinegar|sauce|soy|honey|peanut butter|almond|walnut|cashew|can|tin|lentil|chickpea|coconut|spice|cumin|paprika|cinnamon|chilli|salt|pepper|stock|broth|cereal|protein powder|noodle/i, 'pantry'],
];

function getAisle(name: string): Aisle {
  for (const [pattern, aisle] of AISLE_KEYWORDS) {
    if (pattern.test(name)) return aisle;
  }
  return 'other';
}

function groupByAisle(ingredients: SmartCartIngredient[]): { aisle: Aisle; items: SmartCartIngredient[] }[] {
  const map = new Map<Aisle, SmartCartIngredient[]>();
  for (const ing of ingredients) {
    const a = getAisle(ing.name);
    if (!map.has(a)) map.set(a, []);
    map.get(a)!.push(ing);
  }
  return [...map.entries()]
    .map(([aisle, items]) => ({ aisle, items }))
    .sort((a, b) => AISLE_META[a.aisle].order - AISLE_META[b.aisle].order);
}

// ── Category meta ──────────────────────────────────────────────────────────────
const CATEGORY_META: Record<IngredientCategory, { label: string; emoji: string }> = {
  protein:    { label: 'Protein',     emoji: '🥩' },
  carbs:      { label: 'Carbs',       emoji: '🌾' },
  vegetables: { label: 'Vegetables',  emoji: '🥦' },
  dairy:      { label: 'Dairy',       emoji: '🥛' },
  fats:       { label: 'Fats',        emoji: '🫒' },
  condiments: { label: 'Condiments',  emoji: '🧂' },
  other:      { label: 'Other',       emoji: '🛒' },
};

const CATEGORY_ORDER: IngredientCategory[] = [
  'protein', 'carbs', 'vegetables', 'dairy', 'fats', 'condiments', 'other',
];

// ── Skeleton ───────────────────────────────────────────────────────────────────
function Skeleton({ width = '60%', height = 10 }: { width?: number | `${number}%`; height?: number }) {
  return (
    <View
      style={[
        s.skeleton,
        { width: width as never, height, borderRadius: height / 2 },
      ]}
    />
  );
}

// ── IngredientRow ──────────────────────────────────────────────────────────────
function IngredientRow({
  ingredient,
  selectedStore,
  onToggle,
  onDelete,
  onSwap,
}: {
  ingredient: SmartCartIngredient;
  selectedStore: StoreType | null;
  onToggle: () => void;
  onDelete: () => void;
  onSwap: () => void;
}) {
  const products =
    selectedStore === 'woolworths'
      ? ingredient.woolworthsProducts
      : selectedStore === 'coles'
      ? ingredient.colesProducts
      : [];

  const selectedProduct =
    ingredient.selectedProductId
      ? ([...ingredient.woolworthsProducts, ...ingredient.colesProducts].find(
          (p) => p.id === ingredient.selectedProductId
        ) ?? products[0])
      : products[0];

  const isChecked = ingredient.isChecked;
  // Price: live product price only (no mock/estimated data)
  const displayPrice = selectedProduct?.price
    ? `$${selectedProduct.price.toFixed(2)}`
    : null;

  return (
    <View style={[s.row, isChecked && s.rowChecked]}>
      {/* Checkbox */}
      <TouchableOpacity onPress={onToggle} style={s.checkbox} activeOpacity={0.7}>
        {isChecked ? (
          <View style={s.checkboxFilled}>
            <Text style={{ fontSize: 12, color: '#1C1612', fontWeight: '800' }}>✓</Text>
          </View>
        ) : (
          <View style={s.checkboxEmpty} />
        )}
      </TouchableOpacity>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[s.rowName, isChecked && s.rowNameChecked]} numberOfLines={1}>
            {ingredient.name}
          </Text>
          <Text style={s.rowQty}>
            {ingredient.displayQuantity ?? `${ingredient.quantity}${ingredient.unit}`}
          </Text>
        </View>
        {ingredient.usedIn && ingredient.usedIn.length > 0 && (
          <Text style={s.rowUsedIn} numberOfLines={1}>
            Used in: {ingredient.usedIn.join(', ')}
          </Text>
        )}
        {ingredient.isLoadingProducts ? (
          <Skeleton width="70%" height={9} />
        ) : ingredient.supermarketProduct ? (
          <Text style={s.rowProduct} numberOfLines={1}>{ingredient.supermarketProduct}</Text>
        ) : selectedProduct ? (
          <Text style={s.rowProduct} numberOfLines={1}>{selectedProduct.name}</Text>
        ) : null}
      </View>

      {/* Price */}
      {displayPrice ? <Text style={s.rowPrice}>{displayPrice}</Text> : null}

      {/* Swap */}
      <TouchableOpacity onPress={onSwap} style={s.actionBtn} activeOpacity={0.7}>
        <Text style={s.actionTxt}>⇅</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={[s.actionBtn, s.deleteBtn]} activeOpacity={0.7}>
        <Text style={s.deleteTxt}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── PantryRow ─────────────────────────────────────────────────────────────────
function PantryRow({ item }: { item: ConsolidatedIngredient }) {
  return (
    <View style={s.pantryRow}>
      <View style={s.pantryCheck}>
        <Text style={{ fontSize: 11, color: SAGE, fontWeight: '800' }}>✓</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.pantryName}>{item.name}</Text>
        <Text style={s.pantryQty}>{item.displayQuantity}</Text>
      </View>
      <View style={s.pantryBadge}>
        <Text style={s.pantryBadgeText}>In pantry</Text>
      </View>
    </View>
  );
}

// ── ProductPicker Modal ────────────────────────────────────────────────────────
function ProductPickerModal({
  visible,
  ingredient,
  onSelect,
  onClose,
}: {
  visible: boolean;
  ingredient: SmartCartIngredient | null;
  onSelect: (productId: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ woolworths: SupermarketProduct[]; coles: SupermarketProduct[] } | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await searchBothStores(search.trim());
      setSearchResults(res);
    } finally {
      setSearching(false);
    }
  };

  const wProducts = searchResults?.woolworths ?? ingredient?.woolworthsProducts ?? [];
  const cProducts = searchResults?.coles ?? ingredient?.colesProducts ?? [];

  function ProductCard({ product }: { product: SupermarketProduct }) {
    const isSelected = ingredient?.selectedProductId === product.id;
    return (
      <TouchableOpacity
        onPress={() => onSelect(product.id)}
        activeOpacity={0.8}
        style={[s.productCard, isSelected && s.productCardSelected]}
      >
        <View style={{ flex: 1 }}>
          <Text style={s.productName} numberOfLines={2}>{product.name}</Text>
          {product.brand ? <Text style={s.productBrand}>{product.brand} · {product.size}</Text> : null}
        </View>
        <View style={s.productRight}>
          {product.price > 0 && (
            <Text style={s.productPrice}>${product.price.toFixed(2)}</Text>
          )}
          {isSelected && (
            <View style={s.selectedDot} />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.pickerOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.pickerSheet}>
          <View style={s.pickerHandle} />
          <Text style={s.pickerTitle}>
            {ingredient ? `Choose product for ${ingredient.name}` : 'Choose product'}
          </Text>

          {/* Search */}
          <View style={s.pickerSearchRow}>
            <TextInput
              style={s.pickerSearchInput}
              placeholder="Search manually..."
              placeholderTextColor={TEXT_DIM}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searching && <ActivityIndicator size="small" color={GOLD} style={{ marginLeft: 8 }} />}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {wProducts.length > 0 && (
              <>
                <View style={[s.storeHeader, { backgroundColor: 'rgba(0,120,55,0.12)' }]}>
                  <View style={[s.storeDot, { backgroundColor: WW_GREEN }]} />
                  <Text style={[s.storeHeaderLabel, { color: WW_GREEN }]}>Woolworths</Text>
                </View>
                {wProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </>
            )}
            {cProducts.length > 0 && (
              <>
                <View style={[s.storeHeader, { backgroundColor: 'rgba(227,24,55,0.10)', marginTop: 8 }]}>
                  <View style={[s.storeDot, { backgroundColor: COLES_RED }]} />
                  <Text style={[s.storeHeaderLabel, { color: COLES_RED }]}>Coles</Text>
                </View>
                {cProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </>
            )}
            {wProducts.length === 0 && cProducts.length === 0 && !searching && (
              <Text style={s.pickerEmpty}>No products found. Try searching manually above.</Text>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={s.pickerCloseBtn} activeOpacity={0.8}>
            <Text style={s.pickerCloseTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Shopping List View ────────────────────────────────────────────────────────

function ShoppingListView({ ingredients, storeName, total, getPrice, onClose }: {
  ingredients: SmartCartIngredient[];
  storeName: string;
  total: number;
  getPrice: (ing: SmartCartIngredient) => number | null;
  onClose: () => void;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const aisles = groupByAisle(ingredients);
  const checkedCount = checked.size;

  function toggleItem(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function buildListText(): string {
    const lines: string[] = [];
    lines.push('JONNO SHOPPING LIST');
    if (storeName) lines.push(storeName);
    lines.push('─'.repeat(30));
    lines.push('');
    for (const { aisle, items } of aisles) {
      lines.push(AISLE_META[aisle].label.toUpperCase());
      for (const item of items) {
        const price = getPrice(item);
        const priceStr = price ? `$${price.toFixed(2)}` : '';
        const qty = item.displayQuantity ?? `${item.quantity}${item.unit}`;
        lines.push(`  ${checked.has(item.id) ? '✓' : '□'} ${item.name} ${qty}  ${priceStr}`);
      }
      lines.push('');
    }
    lines.push('─'.repeat(30));
    lines.push(`ESTIMATED TOTAL: $${total.toFixed(2)}`);
    lines.push(`${ingredients.length} items`);
    return lines.join('\n');
  }

  function handleCopy() {
    const text = buildListText();
    Clipboard.setString(text);
    Alert.alert('Copied', 'Shopping list copied to clipboard');
  }

  function handleShare() {
    const text = buildListText();
    Share.share({ message: text, title: 'Jonno Shopping List' });
  }

  return (
    <View style={sl.container}>
      {/* Header */}
      <View style={sl.header}>
        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={sl.title}>Shopping List</Text>
          <Text style={sl.subtitle}>{storeName} · {ingredients.length} items</Text>
        </View>
        <TouchableOpacity onPress={handleCopy} style={sl.iconBtn} activeOpacity={0.7}>
          <Ionicons name="copy-outline" size={20} color={TEXT} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={sl.iconBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={20} color={TEXT} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={sl.progressRow}>
        <View style={sl.progressTrack}>
          <View style={[sl.progressFill, { width: `${ingredients.length > 0 ? (checkedCount / ingredients.length) * 100 : 0}%` }]} />
        </View>
        <Text style={sl.progressText}>{checkedCount}/{ingredients.length}</Text>
      </View>

      {/* Aisle list */}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {aisles.map(({ aisle, items }) => (
          <View key={aisle} style={sl.aisleSection}>
            <View style={sl.aisleHeader}>
              <Ionicons name={AISLE_META[aisle].icon as any} size={16} color={GOLD} />
              <Text style={sl.aisleLabel}>{AISLE_META[aisle].label}</Text>
              <Text style={sl.aisleCount}>{items.length}</Text>
            </View>
            {items.map(item => {
              const isChecked = checked.has(item.id);
              const price = getPrice(item);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[sl.itemRow, isChecked && sl.itemRowChecked]}
                  onPress={() => toggleItem(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[sl.checkbox, isChecked && sl.checkboxOn]}>
                    {isChecked && <Ionicons name="checkmark" size={12} color={BG} />}
                  </View>
                  <Text style={[sl.itemName, isChecked && sl.itemNameChecked]} numberOfLines={1}>{item.name}</Text>
                  {price ? (
                    <Text style={[sl.itemPrice, isChecked && { opacity: 0.3 }]}>${price.toFixed(2)}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Bottom total */}
      <View style={sl.bottomBar}>
        <View>
          <Text style={sl.totalLabel}>Estimated Total</Text>
          <Text style={sl.totalValue}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={sl.copyBtn} onPress={handleCopy} activeOpacity={0.85}>
          <Ionicons name="copy-outline" size={16} color={BG} />
          <Text style={sl.copyBtnText}>Copy List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const sl = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: TEXT },
  subtitle: { fontSize: 12, color: DIM, marginTop: 1 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(232,224,208,0.08)' },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: SAGE },
  progressText: { fontSize: 12, fontWeight: '600', color: DIM },

  aisleSection: { marginBottom: 8 },
  aisleHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  aisleLabel: { fontSize: 13, fontWeight: '700', color: GOLD, flex: 1, letterSpacing: 0.3 },
  aisleCount: { fontSize: 11, color: DIM, fontWeight: '600' },

  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(232,224,208,0.04)',
  },
  itemRowChecked: { opacity: 0.5 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: 'rgba(232,224,208,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: SAGE, borderColor: SAGE },
  itemName: { fontSize: 15, color: TEXT, flex: 1 },
  itemNameChecked: { textDecorationLine: 'line-through', color: DIM },
  itemPrice: { fontSize: 14, fontWeight: '600', color: TEXT },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: CARD, borderTopWidth: 1, borderTopColor: 'rgba(232,224,208,0.06)',
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 34,
  },
  totalLabel: { fontSize: 12, color: DIM },
  totalValue: { fontSize: 22, fontWeight: '800', color: TEXT },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: GOLD, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20,
  },
  copyBtnText: { fontSize: 15, fontWeight: '700', color: BG },
});

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function CartScreen() {
  const router = useRouter();
  const sc = useSmartCart();
  const [showDetail, setShowDetail] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);

  // Re-check for fresh agent cart every time tab gains focus
  useFocusEffect(
    useCallback(() => {
      sc.checkForAgentCart();
      sc.refreshCartsIndex();
    }, [sc.checkForAgentCart, sc.refreshCartsIndex])
  );

  const [collapsed, setCollapsed] = useState<Set<IngredientCategory>>(new Set());
  const [addText, setAddText] = useState('');
  const [pickerIngredient, setPickerIngredient] = useState<SmartCartIngredient | null>(null);

  const checkedCount = sc.cart?.ingredients.filter((i) => i.isChecked).length ?? 0;
  const ingredientCount = sc.cart?.ingredients.length ?? 0;

  // Get the price for an ingredient from the selected store (real API only)
  function getIngPrice(ing: SmartCartIngredient): number | null {
    const store = sc.cart?.selectedStore;
    if (store === 'woolworths' && ing.woolworthsProducts?.length > 0) return ing.woolworthsProducts[0].price;
    if (store === 'coles' && ing.colesProducts?.length > 0) return ing.colesProducts[0].price;
    // No store selected — show best available
    if (ing.woolworthsProducts?.length > 0) return ing.woolworthsProducts[0].price;
    if (ing.colesProducts?.length > 0) return ing.colesProducts[0].price;
    return null;
  }

  // Total = sum of checked items' best available prices
  const total = sc.cart?.ingredients
    .filter(i => i.isChecked)
    .reduce((sum, i) => sum + (getIngPrice(i) ?? 0), 0) ?? 0;

  function toggleCollapse(cat: IngredientCategory) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  const groupedIngredients = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: sc.cart?.ingredients.filter((i) => i.category === cat) ?? [],
  })).filter((g) => g.items.length > 0);

  const storeName = sc.cart?.selectedNearbyStore
    ? sc.cart.selectedNearbyStore.store === 'woolworths' ? 'Woolworths' : 'Coles'
    : 'store';

  // Build visible carts list from index (each entry is a named meal)
  const visibleCarts = sc.cartsIndex;

  // ── Carts Overview ──────────────────────────────────────────────────────────
  if (!showDetail) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.header}>
          <Text style={s.title}>Smart Cart</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
          {/* Location — tappable to change */}
          <TouchableOpacity
            style={s.locationRow}
            onPress={() => {
              if (sc.suburb) {
                // Re-fetch location
                sc.initializeCart();
              } else {
                Linking.openURL('app-settings:').catch(() => {});
              }
            }}
            activeOpacity={0.75}
          >
            <Ionicons name="location" size={16} color={GOLD} />
            <Text style={s.locationText}>
              {sc.locationLoading ? 'Finding your location...'
                : sc.suburb ? sc.suburb
                : 'Tap to enable location'}
            </Text>
            <Ionicons name="pencil-outline" size={14} color={DIM} />
          </TouchableOpacity>

          {/* Jonno message */}
          <View style={s.jonnoMsg}>
            <Ionicons name="sparkles" size={14} color={CORAL} />
            <Text style={s.jonnoMsgText}>
              {visibleCarts.length > 0
                ? 'Your meals are ready to shop. Tap a cart to pick your store and see ingredients.'
                : 'Ask Jonno to create a meal plan — ingredients will appear here ready to shop.'}
            </Text>
          </View>

          {/* Cart cards */}
          {visibleCarts.length > 0 ? (
            <View style={{ gap: 10, marginTop: 16 }}>
              {visibleCarts.map(cart => (
                <TouchableOpacity
                  key={cart.id}
                  style={s.cartCard}
                  onPress={() => { sc.loadCartById(cart.id); setShowDetail(true); }}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.cartCardTitle} numberOfLines={1}>{cart.label}</Text>
                    <Text style={s.cartCardSub}>
                      {cart.ingredientCount} ingredient{cart.ingredientCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={s.cartCardDelete}
                    onPress={() => sc.deleteCartById(cart.id)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={14} color={DIM} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={[s.centred, { marginTop: 40 }]}>
              <Ionicons name="cart-outline" size={48} color={DIM} />
              <Text style={s.emptyTitle}>No carts yet</Text>
              <Text style={s.emptySub}>
                Generate a meal plan or save a community recipe to create a cart.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/agent' as never)}
                style={s.buildBtn}
                activeOpacity={0.85}
              >
                <Text style={s.buildBtnLabel}>Plan meals with Jonno →</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Cart Detail View ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setShowDetail(false)} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={[s.detailTitle, { flex: 1, marginLeft: 8 }]} numberOfLines={1}>{sc.cartMeta?.label ?? 'Cart'}</Text>
        <TouchableOpacity
          onPress={sc.cartMeta?.source === 'agent' ? sc.refreshFromPlan : sc.initializeCart}
          style={s.refreshBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={16} color={GOLD} />
        </TouchableOpacity>
      </View>

      {/* ── Loading / empty / content ── */}
      {sc.initializing ? (
        <View style={s.centred}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={s.loadingText}>Building your cart...</Text>
        </View>
      ) : !sc.cart || sc.cart.ingredients.length === 0 ? (
        <View style={s.centred}>
          <Ionicons name="cart-outline" size={48} color={DIM} />
          <Text style={s.emptyTitle}>No ingredients yet</Text>
          <Text style={s.emptySub}>
            Generate a meal plan or save a community recipe to create a cart.
          </Text>
          <TouchableOpacity
            onPress={() => { setShowDetail(false); router.push('/(tabs)/agent' as never); }}
            style={s.buildBtn}
            activeOpacity={0.85}
          >
            <Text style={s.buildBtnLabel}>Plan meals with Jonno →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Location + Store selector ── */}
          <View style={s.storeCard}>
            <StoreSelector
              nearbyStores={sc.cart.nearbyStores}
              selectedNearbyStore={sc.cart.selectedNearbyStore ?? null}
              onSelectStore={sc.selectNearbyStore}
              locationLoading={sc.locationLoading}
              locationPermissionDenied={sc.locationPermissionDenied}
              suburb={sc.suburb}
            />
          </View>

          {/* ── Total + Shop ── */}
          <View style={s.totalCard}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Estimated total</Text>
              {sc.productsLoading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ActivityIndicator size="small" color={GOLD} />
                  <Text style={[s.totalNum, { fontSize: 16 }]}>Loading...</Text>
                </View>
              ) : (
                <Text style={s.totalNum}>${total.toFixed(2)}</Text>
              )}
            </View>
            <Text style={s.totalSub}>
              {checkedCount} of {ingredientCount} items selected
            </Text>
            <TouchableOpacity
              onPress={() => setShowShoppingList(true)}
              activeOpacity={0.85}
              style={s.shopBtn}
            >
              <Ionicons name="list-outline" size={18} color={BG} style={{ marginRight: 6 }} />
              <Text style={s.shopBtnLabel}>Get Shopping List</Text>
            </TouchableOpacity>
          </View>

          {/* ── Select all + ingredients ── */}
          <View style={s.selectAllCard}>
            <TouchableOpacity
              style={s.selectAllRow}
              onPress={() => sc.toggleAll()}
              activeOpacity={0.75}
            >
              <View style={[s.checkbox, checkedCount === ingredientCount && s.checkboxOn]}>
                {checkedCount === ingredientCount && <Ionicons name="checkmark" size={12} color={BG} />}
              </View>
              <Text style={s.selectAllText}>
                {checkedCount === ingredientCount ? 'Deselect all' : 'Select all'}
              </Text>
              <Text style={s.selectAllCount}>{checkedCount}/{ingredientCount}</Text>
            </TouchableOpacity>

            {sc.cart.ingredients.map(ing => {
              const price = getIngPrice(ing);
              return (
                <TouchableOpacity
                  key={ing.id}
                  style={s.ingRow}
                  onPress={() => sc.toggleIngredient(ing.id)}
                  activeOpacity={0.75}
                >
                  <View style={[s.checkbox, ing.isChecked && s.checkboxOn]}>
                    {ing.isChecked && <Ionicons name="checkmark" size={12} color={BG} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.ingName, !ing.isChecked && s.ingNameOff]} numberOfLines={1}>{ing.name}</Text>
                    {ing.isInPantry && (
                      <Text style={s.pantryNote}>Check pantry/fridge</Text>
                    )}
                  </View>
                  {ing.displayQuantity ? (
                    <Text style={s.ingQty}>{ing.displayQuantity}</Text>
                  ) : null}
                  {ing.isLoadingProducts ? (
                    <ActivityIndicator size="small" color={GOLD} style={{ width: 45 }} />
                  ) : price ? (
                    <Text style={s.ingPrice}>${price.toFixed(2)}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Add item row ── */}
          <View style={s.addRow}>
            <TextInput
              style={s.addInput}
              placeholder="Add an ingredient..."
              placeholderTextColor={TEXT_DIM}
              value={addText}
              onChangeText={setAddText}
              returnKeyType="done"
              onSubmitEditing={() => {
                sc.addIngredient(addText);
                setAddText('');
              }}
            />
            <TouchableOpacity
              onPress={() => { sc.addIngredient(addText); setAddText(''); }}
              disabled={!addText.trim()}
              style={[s.addBtn, !addText.trim() && { opacity: 0.4 }]}
              activeOpacity={0.8}
            >
              <Text style={s.addBtnLabel}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Clear cart */}
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Clear Cart', 'Remove all ingredients?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: sc.clearCart },
              ])
            }
            style={s.clearCartBtn}
            activeOpacity={0.7}
          >
            <Text style={s.clearCartTxt}>Clear Cart</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ── Product picker modal ── */}
      <ProductPickerModal
        visible={pickerIngredient !== null}
        ingredient={pickerIngredient}
        onSelect={(productId) => {
          if (pickerIngredient) sc.selectProductForIngredient(pickerIngredient.id, productId);
          setPickerIngredient(null);
        }}
        onClose={() => setPickerIngredient(null)}
      />

      {/* ═══ Shopping List Modal ═══ */}
      <Modal visible={showShoppingList} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowShoppingList(false)}>
        <ShoppingListView
          ingredients={sc.cart?.ingredients ?? []}
          storeName={storeName}
          total={total}
          getPrice={getIngPrice}
          onClose={() => setShowShoppingList(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '800', color: TEXT },
  detailTitle: { fontSize: 18, fontWeight: '700', color: TEXT },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: CARD,
    borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
  },

  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  loadingText: { fontSize: 14, color: TEXT_MUTED, fontWeight: '500' },

  emptyTitle: { fontSize: 20, fontWeight: '700', color: TEXT, textAlign: 'center', marginTop: 8 },
  emptySub: { fontSize: 14, color: TEXT_MUTED, textAlign: 'center', lineHeight: 20, marginHorizontal: 16, marginTop: 4 },
  buildBtn: {
    marginTop: 16, backgroundColor: GOLD, borderRadius: 22,
    paddingHorizontal: 28, paddingVertical: 14,
  },
  buildBtnLabel: { color: '#1C1612', fontWeight: '700', fontSize: 15 },
  emptySecondaryBtn:  { marginTop: 12, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(248,213,97,0.15)', backgroundColor: 'rgba(248,213,97,0.06)' },
  emptySecondaryText: { fontSize: 13, fontWeight: '600', color: TEXT_DIM },

  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },

  // Store selector card wrapper
  storeCard: {
    backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    padding: 16,
  },
  // Location row (overview)
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  locationText: { fontSize: 15, color: TEXT, flex: 1 },

  // Jonno message
  jonnoMsg: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginTop: 12, paddingHorizontal: 4,
  },
  jonnoMsgText: { fontSize: 13, color: TEXT_MUTED, lineHeight: 19, flex: 1 },

  // Cart overview cards
  cartCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    padding: 18,
  },
  cartCardTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  cartCardSub: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  cartCardDelete: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 10,
  },

  // Total card
  // Select all + ingredients
  selectAllCard: {
    backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 16,
  },
  selectAllRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingBottom: 12, marginBottom: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(232,224,208,0.06)',
  },
  selectAllText: { fontSize: 14, fontWeight: '700', color: TEXT, flex: 1 },
  selectAllCount: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: 'rgba(139,158,110,0.4)', backgroundColor: 'rgba(139,158,110,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: SAGE, borderColor: SAGE },
  ingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(232,224,208,0.04)',
  },
  ingName: { fontSize: 14, fontWeight: '600', color: TEXT },
  ingNameOff: { color: TEXT_DIM, textDecorationLine: 'line-through' },
  pantryNote: { fontSize: 11, color: SAGE, marginTop: 2 },
  ingQty: { fontSize: 12, color: TEXT_MUTED },
  ingPrice: { fontSize: 13, fontWeight: '600', color: GOLD, minWidth: 45, textAlign: 'right' },

  // Total
  totalCard: {
    backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    padding: 20, gap: 6,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  totalLabel: { fontSize: 14, fontWeight: '600', color: TEXT_MUTED },
  totalNum: { fontSize: 24, fontWeight: '800', color: GOLD },
  totalSub: { fontSize: 12, color: TEXT_DIM },
  loadingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(248,213,97,0.08)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start',
  },
  loadingBadgeText: { fontSize: 11, fontWeight: '600', color: GOLD },
  shopBtn: {
    backgroundColor: GOLD, borderRadius: 24, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 8,
    shadowColor: GOLD, shadowOpacity: 0.25, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  shopBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  shopBtnLabel: { color: '#1C1612', fontWeight: '800', fontSize: 16 },

  // Category
  categoryBlock: {
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: 'rgba(248,213,97,0.04)',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(248,213,97,0.08)',
  },
  categoryHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryLabel: { fontSize: 13, fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.8 },
  categoryCount: {
    backgroundColor: 'rgba(248,213,97,0.12)', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  categoryCountTxt: { fontSize: 11, fontWeight: '700', color: GOLD },
  collapseChevron: { fontSize: 16, color: TEXT_MUTED, fontWeight: '400' },
  categoryItems: {},

  // Ingredient row
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BORDER_DIM,
  },
  rowChecked: { opacity: 0.5 },
  checkbox: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  checkboxFilled: {
    width: 22, height: 22, borderRadius: 6, backgroundColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxEmpty: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: 'rgba(232,224,208,0.3)',
  },
  rowName: { fontSize: 15, fontWeight: '600', color: TEXT },
  rowNameChecked: { textDecorationLine: 'line-through' },
  rowQty: { fontSize: 13, color: TEXT_MUTED },
  rowUsedIn: { fontSize: 11, color: TEXT_DIM, marginTop: 2 },
  rowProduct: { fontSize: 11, color: 'rgba(248,213,97,0.5)', marginTop: 1 },
  rowPrice: { fontSize: 15, fontWeight: '700', color: GOLD, minWidth: 44, textAlign: 'right' },
  actionBtn: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(232,224,208,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  actionTxt: { fontSize: 16, color: TEXT_MUTED, fontWeight: '600' },
  deleteBtn: { backgroundColor: 'rgba(239,68,68,0.08)' },
  deleteTxt: { fontSize: 18, color: '#EF4444', fontWeight: '400', lineHeight: 22 },

  // Skeleton
  skeleton: { backgroundColor: 'rgba(232,224,208,0.1)' },

  // Pantry section
  pantryHeader: {
    fontSize: 12, fontWeight: '700', color: 'rgba(139,158,110,0.8)',
    marginLeft: 0, marginTop: 8, marginBottom: 8,
    textTransform: 'uppercase',
  },
  pantryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(139,158,110,0.06)',
    borderRadius: 14, marginBottom: 6, padding: 12,
    borderWidth: 1, borderColor: 'rgba(139,158,110,0.1)',
    opacity: 0.75,
  },
  pantryCheck: {
    width: 22, height: 22, borderRadius: 6,
    backgroundColor: 'rgba(139,158,110,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  pantryName: { fontSize: 14, fontWeight: '500', color: 'rgba(232,224,208,0.5)', textDecorationLine: 'line-through' },
  pantryQty: { fontSize: 11, color: 'rgba(232,224,208,0.35)', marginTop: 1 },
  pantryBadge: {
    backgroundColor: 'rgba(139,158,110,0.15)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  pantryBadgeText: { fontSize: 11, color: SAGE, fontWeight: '600' },

  // Add row
  addRow: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER_DIM,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addInput: { flex: 1, fontSize: 14, color: TEXT, paddingVertical: 4 },
  addBtn: {
    backgroundColor: GOLD, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 7,
  },
  addBtnLabel: { color: '#1C1612', fontWeight: '700', fontSize: 13 },

  clearCartBtn: { alignItems: 'center', paddingVertical: 8 },
  clearCartTxt: { fontSize: 13, fontWeight: '600', color: '#EF4444' },

  // Product picker modal
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: '#1C1612', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, maxHeight: '80%',
    borderTopWidth: 1, borderColor: BORDER,
  },
  pickerHandle: {
    width: 40, height: 4, backgroundColor: 'rgba(248,213,97,0.15)', borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  pickerTitle: { fontSize: 16, fontWeight: '800', color: TEXT, marginBottom: 12 },
  pickerSearchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14,
  },
  pickerSearchInput: { flex: 1, fontSize: 14, color: TEXT },
  storeHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 6,
  },
  storeDot: { width: 8, height: 8, borderRadius: 4 },
  storeHeaderLabel: { fontSize: 12, fontWeight: '700' },
  productCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 12, padding: 12,
    marginBottom: 6, borderWidth: 1, borderColor: BORDER_DIM,
  },
  productCardSelected: { borderColor: GOLD, backgroundColor: 'rgba(248,213,97,0.06)' },
  productName: { fontSize: 13, fontWeight: '600', color: TEXT, lineHeight: 18 },
  productBrand: { fontSize: 11, fontWeight: '400', color: TEXT_MUTED, marginTop: 2 },
  productRight: { alignItems: 'flex-end', gap: 4, marginLeft: 8 },
  productPrice: { fontSize: 14, fontWeight: '800', color: GOLD },
  selectedDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD },
  pickerEmpty: { fontSize: 13, color: TEXT_MUTED, textAlign: 'center', paddingVertical: 20 },
  pickerCloseBtn: {
    marginTop: 12, backgroundColor: CARD, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  pickerCloseTxt: { fontSize: 15, fontWeight: '700', color: TEXT },
});
