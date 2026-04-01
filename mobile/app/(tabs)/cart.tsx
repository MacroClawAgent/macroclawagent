import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
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
  // Price: prefer live product price, then estimatedPrice, then nothing
  const displayPrice = selectedProduct?.price
    ? `$${selectedProduct.price.toFixed(2)}`
    : ingredient.estimatedPrice
    ? `$${ingredient.estimatedPrice.toFixed(2)}`
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

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function CartScreen() {
  const router = useRouter();
  const sc = useSmartCart();
  const [showDetail, setShowDetail] = useState(false);

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

  // Compute total: agent cart uses estimatedPrice, otherwise uses product prices
  const total = (() => {
    if (!sc.cart) return 0;
    if (sc.cartMeta?.source === 'agent') {
      return sc.cart.ingredients
        .filter(i => !i.isChecked)
        .reduce((sum, i) => sum + (i.estimatedPrice ?? 0), 0);
    }
    return sc.getEstimatedTotal();
  })();

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

  // Build visible carts list — active cart first, then any indexed carts not already shown
  const visibleCarts: { id: string; label: string; source: string; count: number; total: number; isActive: boolean }[] = [];
  if (sc.cart && sc.cart.ingredients.length > 0) {
    visibleCarts.push({
      id: sc.cart.id,
      label: sc.cartMeta?.label ?? 'Current Cart',
      source: sc.cartMeta?.source ?? 'agent',
      count: sc.cart.ingredients.length,
      total: sc.cart.ingredients.reduce((sum, i) => sum + (i.estimatedPrice ?? 0), 0),
      isActive: true,
    });
  }
  for (const c of sc.cartsIndex) {
    if (!visibleCarts.some(v => v.id === c.id)) {
      visibleCarts.push({ id: c.id, label: c.label, source: c.source, count: c.ingredientCount, total: c.estimatedTotal, isActive: false });
    }
  }

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
                  onPress={() => setShowDetail(true)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.cartCardTitle} numberOfLines={1}>{cart.label}</Text>
                    <Text style={s.cartCardSub}>
                      {cart.count} ingredient{cart.count !== 1 ? 's' : ''} · ${cart.total.toFixed(2)} est.
                    </Text>
                  </View>
                  <View style={s.cartCardArrow}>
                    <Ionicons name="chevron-forward" size={16} color={DIM} />
                  </View>
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
        <Text style={[s.title, { flex: 1, marginLeft: 8 }]}>{sc.cartMeta?.label ?? 'Cart'}</Text>
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

          {/* ── Estimated total card ── */}
          <View style={s.totalCard}>
            <Text style={s.totalNum}>
              ${total.toFixed(2)}{' '}
              <Text style={s.totalEstLabel}>estimated</Text>
            </Text>
            <Text style={s.totalSub}>
              Based on {ingredientCount} items · {storeName}
            </Text>
            {sc.productsLoading && (
              <View style={s.loadingBadge}>
                <ActivityIndicator size="small" color={GOLD} />
                <Text style={s.loadingBadgeText}>Loading prices...</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={sc.openInStore}
              disabled={!sc.cart.selectedStore}
              activeOpacity={0.85}
              style={[s.shopBtn, !sc.cart.selectedStore && s.shopBtnDisabled]}
            >
              <Text style={s.shopBtnLabel}>
                {sc.cart.selectedNearbyStore
                  ? `Shop at ${storeName} →`
                  : 'Select a store first'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Ingredient list by category ── */}
          {groupedIngredients.map(({ cat, items }) => {
            const meta = CATEGORY_META[cat];
            const isCollapsed = collapsed.has(cat);
            return (
              <View key={cat} style={s.categoryBlock}>
                <TouchableOpacity
                  onPress={() => toggleCollapse(cat)}
                  style={s.categoryHeader}
                  activeOpacity={0.7}
                >
                  <View style={s.categoryHeaderLeft}>
                    <Text style={{ fontSize: 14 }}>{meta.emoji}</Text>
                    <Text style={s.categoryLabel}>{meta.label}</Text>
                    <View style={s.categoryCount}>
                      <Text style={s.categoryCountTxt}>{items.length}</Text>
                    </View>
                  </View>
                  <Text style={s.collapseChevron}>{isCollapsed ? '›' : '⌄'}</Text>
                </TouchableOpacity>

                {!isCollapsed && (
                  <View style={s.categoryItems}>
                    {items.map((ing) => (
                      <IngredientRow
                        key={ing.id}
                        ingredient={ing}
                        selectedStore={sc.cart?.selectedStore ?? null}
                        onToggle={() => sc.toggleIngredient(ing.id)}
                        onDelete={() => sc.removeIngredient(ing.id)}
                        onSwap={() => setPickerIngredient(ing)}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {/* ── Pantry items section ── */}
          {sc.pantryItems.length > 0 && (
            <View>
              <Text style={s.pantryHeader}>✓  Already in your kitchen</Text>
              {sc.pantryItems.map((item) => (
                <PantryRow key={item.id} item={item} />
              ))}
            </View>
          )}

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
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10,
  },
  title: { fontSize: 28, fontWeight: '800', fontFamily: 'BebasNeue_400Regular', letterSpacing: 1, color: TEXT },
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
  locationText: { fontSize: 15, fontFamily: 'BebasNeue_400Regular', letterSpacing: 0.8, color: TEXT, flex: 1 },

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
  cartCardTitle: { fontSize: 20, fontFamily: 'BebasNeue_400Regular', letterSpacing: 0.8, color: TEXT },
  cartCardSub: { fontSize: 13, fontFamily: 'BebasNeue_400Regular', letterSpacing: 0.5, color: TEXT_MUTED, marginTop: 3 },
  cartCardArrow: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: BG, borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },

  // Total card
  totalCard: {
    backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    padding: 20, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
  },
  totalNum: { fontSize: 32, fontWeight: '800', color: TEXT },
  totalEstLabel: { fontSize: 14, fontWeight: '500', color: TEXT_MUTED },
  totalSub: { fontSize: 13, color: TEXT_MUTED },
  loadingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(248,213,97,0.08)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start',
  },
  loadingBadgeText: { fontSize: 11, fontWeight: '600', color: GOLD },
  shopBtn: {
    backgroundColor: GOLD, borderRadius: 24, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: GOLD, shadowOpacity: 0.35, shadowRadius: 12,
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
    letterSpacing: 1, marginLeft: 0, marginTop: 8, marginBottom: 8,
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
