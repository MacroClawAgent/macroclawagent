import React, { useEffect, useState } from 'react';
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
import { SymbolView } from 'expo-symbols';
import { useSmartCart } from '@/hooks/useSmartCart';
import { searchBothStores, logApiDebug, testRapidAPIConnection } from '@/services/supermarketApi';
import type {
  IngredientCategory,
  NearbyStore,
  SmartCartIngredient,
  SupermarketProduct,
  StoreType,
} from '@/types/smartCart';

// ── Theme ──────────────────────────────────────────────────────────────────────
const BG       = '#EEF4FA';
const WHITE    = '#FFFFFF';
const TEAL     = '#2BB6A6';
const BORDER   = '#E5E7EB';
const TEXT     = '#1C1C1E';
const MUTED    = '#9CA3AF';
const WW_GREEN = '#007837';
const COLES_RED = '#E31837';

// ── Category meta ──────────────────────────────────────────────────────────────
const CATEGORY_META: Record<IngredientCategory, { label: string; symbol: string }> = {
  protein:    { label: 'Protein',     symbol: 'flame.fill'          },
  carbs:      { label: 'Carbs',       symbol: 'leaf.fill'           },
  vegetables: { label: 'Vegetables',  symbol: 'carrot'              },
  dairy:      { label: 'Dairy',       symbol: 'drop.fill'           },
  fats:       { label: 'Fats',        symbol: 'circle.fill'         },
  condiments: { label: 'Condiments',  symbol: 'oval.fill'           },
  other:      { label: 'Other',       symbol: 'bag.fill'            },
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

  return (
    <View style={[s.row, isChecked && s.rowChecked]}>
      {/* Checkbox */}
      <TouchableOpacity onPress={onToggle} style={s.checkbox} activeOpacity={0.7}>
        {isChecked ? (
          <View style={s.checkboxFilled}>
            <SymbolView name={'checkmark' as any} size={10} tintColor={WHITE} style={{ width: 10, height: 10 }} />
          </View>
        ) : (
          <View style={s.checkboxEmpty} />
        )}
      </TouchableOpacity>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text
          style={[s.rowName, isChecked && s.rowNameChecked]}
          numberOfLines={1}
        >
          {ingredient.name}
        </Text>
        <Text style={s.rowQty}>
          {ingredient.quantity}{ingredient.unit}
        </Text>

        {/* Product line */}
        {ingredient.isLoadingProducts ? (
          <Skeleton width="70%" height={9} />
        ) : selectedProduct ? (
          <Text style={s.rowProduct} numberOfLines={1}>
            {selectedProduct.name}
            {selectedProduct.price > 0 ? ` · $${selectedProduct.price.toFixed(2)}` : ''}
          </Text>
        ) : selectedStore ? (
          <Text style={s.rowNoMatch}>No match found</Text>
        ) : null}
      </View>

      {/* Actions */}
      <TouchableOpacity onPress={onSwap} style={s.actionBtn} activeOpacity={0.7}>
        <Text style={s.actionTxt}>⇅</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={[s.actionBtn, s.deleteBtn]} activeOpacity={0.7}>
        <Text style={s.deleteTxt}>×</Text>
      </TouchableOpacity>
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
              placeholderTextColor={MUTED}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searching && <ActivityIndicator size="small" color={TEAL} style={{ marginLeft: 8 }} />}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {/* Woolworths */}
            {wProducts.length > 0 && (
              <>
                <View style={[s.storeHeader, { backgroundColor: 'rgba(0,120,55,0.07)' }]}>
                  <View style={[s.storeDot, { backgroundColor: WW_GREEN }]} />
                  <Text style={[s.storeHeaderLabel, { color: WW_GREEN }]}>Woolworths</Text>
                </View>
                {wProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </>
            )}

            {/* Coles */}
            {cProducts.length > 0 && (
              <>
                <View style={[s.storeHeader, { backgroundColor: 'rgba(227,24,55,0.07)', marginTop: 8 }]}>
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
  const sc = useSmartCart();
  const [collapsed, setCollapsed] = useState<Set<IngredientCategory>>(new Set());
  const [addText, setAddText] = useState('');
  const [pickerIngredient, setPickerIngredient] = useState<SmartCartIngredient | null>(null);

  useEffect(() => {
    logApiDebug();
    testRapidAPIConnection();
  }, []);

  const total = sc.getEstimatedTotal();
  const checkedCount = sc.cart?.ingredients.filter((i) => i.isChecked).length ?? 0;

  const nearestWW = sc.getNearestStore('woolworths');
  const nearestColes = sc.getNearestStore('coles');

  function toggleCollapse(cat: IngredientCategory) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function formatDistance(m: number): string {
    return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
  }

  function getNearestForStore(store: StoreType): NearbyStore | undefined {
    return sc.cart?.nearbyStores.find((s) => s.store === store);
  }

  const groupedIngredients = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: sc.cart?.ingredients.filter((i) => i.category === cat) ?? [],
  })).filter((g) => g.items.length > 0);

  // ── Store button ─────────────────────────────────────────────────────────
  function StoreButton({ store, color, label }: { store: StoreType; color: string; label: string }) {
    const isSelected = sc.cart?.selectedStore === store;
    const nearest = getNearestForStore(store);
    return (
      <TouchableOpacity
        onPress={() => sc.selectStore(store)}
        activeOpacity={0.8}
        style={[
          s.storeBtn,
          isSelected && { borderColor: color, backgroundColor: `${color}10` },
        ]}
      >
        <View style={[s.storeBtnDot, { backgroundColor: color }]} />
        <Text style={[s.storeBtnLabel, isSelected && { color }]}>{label}</Text>
        {isSelected && nearest && (
          <Text style={[s.storeBtnSub, { color }]}>✓</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.title}>Smart Cart</Text>
        <TouchableOpacity
          onPress={sc.initializeCart}
          style={s.refreshBtn}
          activeOpacity={0.7}
        >
          <SymbolView
            name={'arrow.clockwise' as any}
            size={16}
            tintColor={TEAL}
            style={{ width: 16, height: 16 }}
          />
        </TouchableOpacity>
      </View>

      {/* ── Network error banner ── */}
      {sc.networkError && (
        <View style={s.errorBanner}>
          <Text style={s.errorBannerText}>Couldn't load prices — showing ingredients only</Text>
          <TouchableOpacity onPress={sc.refreshProducts}>
            <Text style={s.errorBannerRetry}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Loading / empty / content ── */}
      {sc.initializing ? (
        <View style={s.centred}>
          <ActivityIndicator size="large" color={TEAL} />
          <Text style={s.loadingText}>Building your cart...</Text>
        </View>
      ) : !sc.cart || sc.cart.ingredients.length === 0 ? (
        /* ── Empty state ── */
        <View style={s.centred}>
          <View style={s.emptyIcon}>
            <SymbolView name={'cart' as any} size={30} tintColor={TEAL} style={{ width: 30, height: 30 }} />
          </View>
          <Text style={s.emptyTitle}>Your Smart Cart is empty</Text>
          <Text style={s.emptySub}>
            Generate a meal plan first, or we'll build a cart from your macro targets
          </Text>
          <TouchableOpacity onPress={sc.initializeCart} style={s.buildBtn} activeOpacity={0.85}>
            <Text style={s.buildBtnLabel}>Build My Cart</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Store selector card ── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>Shop at</Text>
            <View style={s.storeBtnRow}>
              <StoreButton store="woolworths" color={WW_GREEN} label="Woolworths" />
              <StoreButton store="coles" color={COLES_RED} label="Coles" />
            </View>

            {sc.locationLoading ? (
              <View style={s.locationRow}>
                <Skeleton width="80%" height={10} />
              </View>
            ) : sc.locationPermissionDenied ? (
              <TouchableOpacity
                style={s.locationRow}
                onPress={() => Linking.openURL('app-settings:')}
              >
                <Text style={s.locationText}>Enable location to find your nearest store →</Text>
              </TouchableOpacity>
            ) : sc.cart.selectedStore ? (
              (() => {
                const nearest = getNearestForStore(sc.cart.selectedStore);
                return nearest ? (
                  <View style={s.locationRow}>
                    <Text style={s.locationText}>
                      📍 {nearest.name} — {formatDistance(nearest.distance)} away
                      {' · '}
                      <Text style={{ color: nearest.isOpen ? '#10B981' : '#EF4444' }}>
                        {nearest.isOpen ? 'Open now' : 'Closed'}
                      </Text>
                    </Text>
                  </View>
                ) : null;
              })()
            ) : null}
          </View>

          {/* ── Estimated total card ── */}
          <View style={s.card}>
            <Text style={s.totalNum}>
              ${total.toFixed(2)}
              <Text style={s.totalEstLabel}> estimated</Text>
            </Text>
            <Text style={s.totalSub}>
              Based on {checkedCount} item{checkedCount !== 1 ? 's' : ''}
              {sc.cart.selectedStore ? ` · ${sc.cart.selectedStore === 'woolworths' ? 'Woolworths' : 'Coles'}` : ''}
            </Text>
            {sc.productsLoading && (
              <View style={s.loadingBadge}>
                <ActivityIndicator size="small" color={TEAL} />
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
                {sc.cart.selectedStore
                  ? `Shop at ${sc.cart.selectedStore === 'woolworths' ? 'Woolworths' : 'Coles'} →`
                  : 'Select a store above'}
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
                    <SymbolView
                      name={meta.symbol as any}
                      size={13}
                      tintColor={TEAL}
                      style={{ width: 13, height: 13 }}
                    />
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

          {/* ── Add item row ── */}
          <View style={s.addRow}>
            <TextInput
              style={s.addInput}
              placeholder="Add an ingredient..."
              placeholderTextColor={MUTED}
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
  title: { fontSize: 22, fontWeight: '800', color: TEXT },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: WHITE,
    borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
  },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 8, backgroundColor: '#FEF3C7',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  errorBannerText: { fontSize: 12, fontWeight: '600', color: '#92400E', flex: 1 },
  errorBannerRetry: { fontSize: 12, fontWeight: '700', color: '#D97706', marginLeft: 8 },

  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  loadingText: { fontSize: 14, color: MUTED, fontWeight: '500' },

  emptyIcon: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(43,182,166,0.10)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: TEXT, textAlign: 'center' },
  emptySub: { fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 19, paddingHorizontal: 10 },
  buildBtn: {
    marginTop: 8, backgroundColor: TEAL, borderRadius: 100,
    paddingHorizontal: 28, paddingVertical: 14,
  },
  buildBtnLabel: { color: WHITE, fontWeight: '700', fontSize: 15 },

  scroll: { paddingHorizontal: 16, paddingTop: 2, gap: 12 },

  card: {
    backgroundColor: WHITE, borderRadius: 18, borderWidth: 1, borderColor: BORDER,
    padding: 16, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8,
  },
  cardLabel: { fontSize: 11, fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.6 },

  // Store selector
  storeBtnRow: { flexDirection: 'row', gap: 10 },
  storeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 11, borderRadius: 12,
    borderWidth: 1.5, borderColor: BORDER, backgroundColor: BG,
  },
  storeBtnDot: { width: 8, height: 8, borderRadius: 4 },
  storeBtnLabel: { fontSize: 13, fontWeight: '700', color: TEXT },
  storeBtnSub: { fontSize: 12, fontWeight: '700' },

  locationRow: { marginTop: 2 },
  locationText: { fontSize: 12, fontWeight: '500', color: MUTED, lineHeight: 17 },

  // Total card
  totalNum: { fontSize: 28, fontWeight: '800', color: TEXT },
  totalEstLabel: { fontSize: 14, fontWeight: '500', color: MUTED },
  totalSub: { fontSize: 12, fontWeight: '500', color: MUTED, marginTop: -4 },
  loadingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(43,182,166,0.08)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start',
  },
  loadingBadgeText: { fontSize: 11, fontWeight: '600', color: TEAL },
  shopBtn: {
    backgroundColor: TEAL, borderRadius: 100, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
  },
  shopBtnDisabled: { opacity: 0.45 },
  shopBtnLabel: { color: WHITE, fontWeight: '700', fontSize: 15 },

  // Category
  categoryBlock: {
    backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4,
  },
  categoryHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: 'rgba(43,182,166,0.04)',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BORDER,
  },
  categoryHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryLabel: { fontSize: 13, fontWeight: '700', color: TEXT },
  categoryCount: {
    backgroundColor: 'rgba(43,182,166,0.12)', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  categoryCountTxt: { fontSize: 11, fontWeight: '700', color: TEAL },
  collapseChevron: { fontSize: 16, color: MUTED, fontWeight: '400' },
  categoryItems: {},

  // Ingredient row
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BORDER,
  },
  rowChecked: { opacity: 0.55 },
  checkbox: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  checkboxFilled: {
    width: 20, height: 20, borderRadius: 6, backgroundColor: TEAL,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxEmpty: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: BORDER,
  },
  rowName: { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 1 },
  rowNameChecked: { textDecorationLine: 'line-through' },
  rowQty: { fontSize: 11, fontWeight: '500', color: MUTED, marginBottom: 3 },
  rowProduct: { fontSize: 11, fontWeight: '500', color: TEAL },
  rowNoMatch: { fontSize: 11, fontWeight: '400', color: MUTED, fontStyle: 'italic' },
  actionBtn: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: BG,
    alignItems: 'center', justifyContent: 'center',
  },
  actionTxt: { fontSize: 16, color: MUTED, fontWeight: '600' },
  deleteBtn: { backgroundColor: 'rgba(239,68,68,0.07)' },
  deleteTxt: { fontSize: 18, color: '#EF4444', fontWeight: '400', lineHeight: 22 },

  // Skeleton
  skeleton: { backgroundColor: '#E5E7EB' },

  // Add row
  addRow: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    backgroundColor: WHITE, borderRadius: 14, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addInput: { flex: 1, fontSize: 14, color: TEXT, paddingVertical: 4 },
  addBtn: {
    backgroundColor: TEAL, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 7,
  },
  addBtnLabel: { color: WHITE, fontWeight: '700', fontSize: 13 },

  clearCartBtn: { alignItems: 'center', paddingVertical: 8 },
  clearCartTxt: { fontSize: 13, fontWeight: '600', color: '#EF4444' },

  // Product picker modal
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, maxHeight: '80%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 16,
  },
  pickerHandle: {
    width: 40, height: 4, backgroundColor: BORDER, borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  pickerTitle: { fontSize: 16, fontWeight: '800', color: TEXT, marginBottom: 12 },
  pickerSearchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
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
    backgroundColor: BG, borderRadius: 12, padding: 12,
    marginBottom: 6, borderWidth: 1, borderColor: BORDER,
  },
  productCardSelected: { borderColor: TEAL, backgroundColor: 'rgba(43,182,166,0.06)' },
  productName: { fontSize: 13, fontWeight: '600', color: TEXT, lineHeight: 18 },
  productBrand: { fontSize: 11, fontWeight: '400', color: MUTED, marginTop: 2 },
  productRight: { alignItems: 'flex-end', gap: 4, marginLeft: 8 },
  productPrice: { fontSize: 14, fontWeight: '800', color: TEXT },
  selectedDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: TEAL,
  },
  pickerEmpty: { fontSize: 13, color: MUTED, textAlign: 'center', paddingVertical: 20 },
  pickerCloseBtn: {
    marginTop: 12, backgroundColor: BG, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  pickerCloseTxt: { fontSize: 15, fontWeight: '700', color: TEXT },
});
