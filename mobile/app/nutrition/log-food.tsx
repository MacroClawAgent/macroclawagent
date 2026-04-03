import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert, Animated, DeviceEventEmitter, KeyboardAvoidingView, Modal, PanResponder, Platform,
  SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

// ── Theme ──────────────────────────────────────────────────────────────────────
const BG      = "#1C1612";
const CARD    = "#252018";
const BORDER  = "rgba(248,213,97,0.12)";
const GOLD    = "#F5C842";
const CORAL   = "#E07B54";
const CREAM   = "#E8E0D0";
const MUTED   = "rgba(232,224,208,0.5)";
const DARK_TXT = "#1C1612";

// ── Types ──────────────────────────────────────────────────────────────────────
const TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
type MealTag = typeof TAGS[number];

function defaultMealTag(): MealTag {
  const h = new Date().getHours();
  if (h < 11) return "Breakfast";
  if (h < 14) return "Lunch";
  if (h < 18) return "Snack";
  return "Dinner";
}

interface DishEntry {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  lastLogged?: string;
  timesLogged?: number;
}



// ── Swipeable Dish Row ───────────────────────────────────────────────────────
const DELETE_THRESHOLD = -80;

function SwipeableDishRow({
  dish, onAdd, onDelete,
}: {
  dish: DishEntry;
  onAdd: () => void;
  onDelete: () => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) translateX.setValue(g.dx); // only allow left swipe
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < DELETE_THRESHOLD) {
          // Snap open to show delete
          Animated.spring(translateX, { toValue: -80, useNativeDriver: true }).start();
        } else {
          // Snap back
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Animated.timing(translateX, { toValue: -400, duration: 250, useNativeDriver: true }).start(() => {
      onDelete();
    });
  };

  return (
    <View style={{ overflow: "hidden" }}>
      {/* Delete button behind the row */}
      <View style={swipeStyles.deleteBackground}>
        <TouchableOpacity onPress={handleDelete} style={swipeStyles.deleteBtn} activeOpacity={0.8}>
          <Ionicons name="close-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Foreground row */}
      <Animated.View
        style={{ transform: [{ translateX }], backgroundColor: CARD }}
        {...panResponder.panHandlers}
      >
        <View style={swipeStyles.row}>
          <View style={swipeStyles.iconCircle}>
            <Ionicons name="nutrition-outline" size={22} color={GOLD} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={swipeStyles.title}>{dish.name}</Text>
            <View style={swipeStyles.macroRow}>
              <Text style={swipeStyles.cal}>{dish.calories} cal</Text>
              <Text style={swipeStyles.dot}> · </Text>
              <Text style={swipeStyles.prot}>{dish.protein}g protein</Text>
              {dish.timesLogged && dish.timesLogged > 1 && (
                <Text style={swipeStyles.logged} numberOfLines={1}>{dish.timesLogged}x logged</Text>
              )}
            </View>
          </View>
          <TouchableOpacity style={swipeStyles.addCircle} onPress={onAdd} activeOpacity={0.8}>
            <Ionicons name="add" size={20} color={DARK_TXT} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const swipeStyles = StyleSheet.create({
  deleteBackground: {
    position: "absolute", top: 0, bottom: 0, right: 0, width: 80,
    backgroundColor: "#D93025", alignItems: "center", justifyContent: "center",
  },
  deleteBtn: { width: 80, height: "100%", alignItems: "center", justifyContent: "center" },
  row: {
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: "row", alignItems: "center", gap: 14,
    borderBottomWidth: 1, borderBottomColor: "rgba(232,224,208,0.06)",
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(232,224,208,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  title:    { fontSize: 15, fontWeight: "600", color: CREAM },
  macroRow: { flexDirection: "row", alignItems: "center", marginTop: 3, flexWrap: "nowrap" },
  cal:      { fontSize: 12, fontWeight: "600", color: GOLD },
  dot:      { fontSize: 12, color: "rgba(232,224,208,0.3)" },
  prot:     { fontSize: 12, color: CORAL },
  logged:   { fontSize: 11, color: "rgba(232,224,208,0.3)", marginLeft: "auto" as const },
  addCircle:{ width: 36, height: 36, borderRadius: 18, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function LogFoodScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [mealTag,    setMealTag]    = useState<MealTag>(defaultMealTag);
  const [query,      setQuery]      = useState("");
  const [toast,      setToast]      = useState<string | null>(null);
  const [sortBy,     setSortBy]     = useState<"recent" | "most">("recent");
  const [showFilter, setShowFilter] = useState(false);

  // Previous dishes (loaded from API — real logged/scanned meals)
  const [previousDishes, setPreviousDishes] = useState<DishEntry[]>([]);
  const [loadingDishes, setLoadingDishes]   = useState(true);

  // Quantity sheet
  const [selectedDish, setSelectedDish] = useState<DishEntry | null>(null);
  const [showQty,      setShowQty]      = useState(false);
  const [servings,     setServings]     = useState<0.5 | 1 | 2>(1);
  const [saving,       setSaving]       = useState(false);

  // Custom dish form
  const [showCustom,    setShowCustom]    = useState(false);
  const [customName,    setCustomName]    = useState("");
  const [customCals,    setCustomCals]    = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs,   setCustomCarbs]   = useState("");
  const [customFat,     setCustomFat]     = useState("");
  const [customFiber,   setCustomFiber]   = useState("");
  const [savingCustom,  setSavingCustom]  = useState(false);


  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, []);

  // Fetch real logged dishes from API — re-fetches on screen focus
  const fetchDishes = useCallback(async () => {
    try {
      const res = await apiGet<any>("/api/nutrition/food-items?distinct=true");
      const dishes: DishEntry[] = (res?.dishes ?? []).map((d: any) => ({
        name: d.name,
        calories: d.calories,
        protein: d.protein_g,
        carbs: d.carbs_g,
        fat: d.fat_g,
        lastLogged: d.last_logged,
        timesLogged: d.times_logged,
      }));
      setPreviousDishes(dishes);
    } catch { /* silently fail — show empty */ }
    finally { setLoadingDishes(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchDishes(); }, [fetchDishes]));


  // ── Photo handlers (unchanged logic) ────────────────────────────────────────
  function handleTakePhoto() {
    router.push({ pathname: "/nutrition/photo-confirm", params: { mode: "camera" } } as any);
  }
  function handleUploadPhoto() {
    router.push({ pathname: "/nutrition/photo-confirm", params: { mode: "library" } } as any);
  }

  // ── Dish logging ───────────────────────────────────────────────────────────
  function openDishQty(dish: DishEntry) {
    setSelectedDish(dish);
    setServings(1);
    setShowQty(true);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  async function handleAddDish() {
    if (!selectedDish) return;
    setSaving(true);
    const m = servings;
    try {
      await apiPost("/api/nutrition/food-items", {
        meal_tag:  mealTag,
        name:      selectedDish.name,
        dish_name: selectedDish.name,
        calories:  Math.round(selectedDish.calories  * m),
        protein_g: Math.round(selectedDish.protein   * m * 10) / 10,
        carbs_g:   Math.round(selectedDish.carbs     * m * 10) / 10,
        fat_g:     Math.round(selectedDish.fat       * m * 10) / 10,
        fiber_g:   Math.round((selectedDish.fiber ?? 0) * m * 10) / 10,
      });
      // Add to previousDishes if not already there
      setPreviousDishes(prev =>
        prev.some(d => d.name === selectedDish.name) ? prev : [
          { ...selectedDish, lastLogged: `Today, ${mealTag}`, timesLogged: 1 },
          ...prev,
        ]
      );
      setShowQty(false);
      DeviceEventEmitter.emit('nutrition_updated');
      showToast(`${selectedDish.name} added to ${mealTag}`);
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add.");
    } finally { setSaving(false); }
  }

  // ── Custom dish ────────────────────────────────────────────────────────────
  function openCustom(prefillName = "") {
    setCustomName(prefillName);
    setCustomCals(""); setCustomProtein(""); setCustomCarbs(""); setCustomFat(""); setCustomFiber("");
    setShowCustom(true);
  }

  async function handleSaveCustom() {
    if (!customName || !customCals) return;
    setSavingCustom(true);
    try {
      await apiPost("/api/nutrition/food-items", {
        meal_tag:  mealTag,
        name:      customName,
        dish_name: customName,
        calories:  parseInt(customCals),
        protein_g: parseFloat(customProtein || "0"),
        carbs_g:   parseFloat(customCarbs   || "0"),
        fat_g:     parseFloat(customFat     || "0"),
        fiber_g:   parseFloat(customFiber   || "0"),
      });
      const newDish: DishEntry = {
        name: customName,
        calories: parseInt(customCals),
        protein: parseFloat(customProtein || "0"),
        carbs:   parseFloat(customCarbs   || "0"),
        fat:     parseFloat(customFat     || "0"),
        fiber:   parseFloat(customFiber   || "0"),
        lastLogged: `Today, ${mealTag}`, timesLogged: 1,
      };
      setPreviousDishes(prev => [newDish, ...prev]);
      DeviceEventEmitter.emit('nutrition_updated');
      setShowCustom(false);
      showToast(`${customName} added to ${mealTag}`);
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to save.");
    } finally { setSavingCustom(false); }
  }

  // ── Delete saved dish ───────────────────────────────────────────────────────
  async function handleDeleteSavedDish(dishName: string) {
    // Optimistic remove
    setPreviousDishes(prev => prev.filter(d => d.name.toLowerCase() !== dishName.toLowerCase()));
    try {
      await apiDelete(`/api/nutrition/food-items?dish_name=${encodeURIComponent(dishName)}`);
      DeviceEventEmitter.emit("nutrition_updated");
      showToast(`${dishName} removed`);
    } catch {
      // Re-fetch to restore correct state
      fetchDishes();
      Alert.alert("Error", "Failed to delete dish.");
    }
  }

  // ── Search / filter / sort ──────────────────────────────────────────────────
  const trimmed    = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;

  const sortedDishes = [...previousDishes].sort((a, b) => {
    if (sortBy === "most") return (b.timesLogged ?? 0) - (a.timesLogged ?? 0);
    // "recent" — API returns newest first by default, keep order
    return 0;
  });

  const filteredDishes = isSearching
    ? sortedDishes.filter(d => d.name.toLowerCase().includes(trimmed))
    : sortedDishes;

  const noResults = isSearching && filteredDishes.length === 0;

  // ── Quantity sheet derived ──────────────────────────────────────────────────
  const dish = selectedDish;
  const qCal     = dish ? Math.round(dish.calories * servings) : 0;
  const qProtein = dish ? Math.round(dish.protein  * servings * 10) / 10 : 0;
  const qCarbs   = dish ? Math.round(dish.carbs    * servings * 10) / 10 : 0;
  const qFat     = dish ? Math.round(dish.fat      * servings * 10) / 10 : 0;
  const qFiber   = dish ? Math.round((dish.fiber ?? 0) * servings * 10) / 10 : 0;

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={s.headerBack}>
          <Ionicons name="chevron-back" size={22} color={CREAM} />
          <Text style={s.headerBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Log Food</Text>
        <View style={s.headerRight} />
      </View>

        <View style={{ flex: 1 }}>

          {/* ── Two photo buttons (fixed) ── */}
          <View style={s.photoRow}>
            <TouchableOpacity style={s.photoBtnCamera} onPress={handleTakePhoto} activeOpacity={0.85}>
              <Ionicons name="camera" size={28} color={DARK_TXT} />
              <Text style={s.photoBtnTitle}>Take Photo</Text>
              <Text style={s.photoBtnSub}>AI detects dish + macros</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.photoBtnLibrary} onPress={handleUploadPhoto} activeOpacity={0.85}>
              <Ionicons name="image-outline" size={28} color={GOLD} />
              <Text style={s.photoBtnTitleLight}>From Library</Text>
              <Text style={s.photoBtnSubLight}>AI detects dish + macros</Text>
            </TouchableOpacity>
          </View>

          {/* ── Search bar (fixed) ── */}
          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={20} color="rgba(248,213,97,0.6)" />
            <TextInput
              ref={searchRef}
              style={s.searchInput}
              placeholder="Search a dish..."
              placeholderTextColor="rgba(232,224,208,0.3)"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color={MUTED} />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Section label + filter dropdown (fixed) ── */}
          <View style={s.filterRow}>
            <Text style={s.sectionLabel}>{isSearching ? "RESULTS" : "YOUR DISHES"}</Text>
            {!isSearching && (
              <View>
                <TouchableOpacity
                  onPress={() => setShowFilter(v => !v)}
                  hitSlop={10}
                  activeOpacity={0.7}
                >
                  <Ionicons name="filter-outline" size={18} color={showFilter ? GOLD : MUTED} />
                </TouchableOpacity>
                {showFilter && (
                  <View style={s.filterDropdown}>
                    <TouchableOpacity
                      style={[s.filterOption, sortBy === "recent" && s.filterOptionActive]}
                      onPress={() => { setSortBy("recent"); setShowFilter(false); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.filterOptionText, sortBy === "recent" && s.filterOptionTextActive]}>Date added</Text>
                      {sortBy === "recent" && <Ionicons name="checkmark" size={14} color={GOLD} />}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.filterOption, sortBy === "most" && s.filterOptionActive]}
                      onPress={() => { setSortBy("most"); setShowFilter(false); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.filterOptionText, sortBy === "most" && s.filterOptionTextActive]}>Quantity logged</Text>
                      {sortBy === "most" && <Ionicons name="checkmark" size={14} color={GOLD} />}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ── Dish list card (always visible) ── */}
          <View style={s.dishListCard}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={[s.listContent, filteredDishes.length === 0 && { flex: 1 }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {loadingDishes && !isSearching ? (
                <View style={s.cardEmpty}>
                  <Ionicons name="hourglass-outline" size={32} color={MUTED} />
                  <Text style={s.cardEmptyText}>Loading your dishes...</Text>
                </View>
              ) : noResults ? (
                <View style={s.cardEmpty}>
                  <Ionicons name="search-outline" size={32} color={MUTED} />
                  <Text style={s.cardEmptyTitle}>No dishes found for "{query.trim()}"</Text>
                </View>
              ) : filteredDishes.length === 0 ? (
                <View style={s.cardEmpty}>
                  <Ionicons name="camera-outline" size={32} color={MUTED} />
                  <Text style={s.cardEmptyTitle}>No dishes yet</Text>
                  <Text style={s.cardEmptyText}>Scan a meal to see your history here</Text>
                </View>
              ) : (
                filteredDishes.map((d, idx) => (
                  <SwipeableDishRow
                    key={`${d.name}-${idx}`}
                    dish={d}
                    onAdd={() => openDishQty(d)}
                    onDelete={() => handleDeleteSavedDish(d.name)}
                  />
                ))
              )}
            </ScrollView>
            {/* Always pinned at bottom of card */}
            <TouchableOpacity style={s.createCustom} onPress={() => openCustom()} activeOpacity={0.7}>
              <Text style={s.createCustomText}>+ Create custom dish</Text>
            </TouchableOpacity>
          </View>
        </View>

      {/* ═══════════════════ QUANTITY SHEET ═══════════════════ */}
      <Modal visible={showQty} transparent animationType="slide" onRequestClose={() => setShowQty(false)}>
        <View style={s.overlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowQty(false)} activeOpacity={1} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={s.qtySheet}>
              <View style={s.handle} />

              {/* Dish name */}
              <Text style={s.qtyDishName}>{dish?.name}</Text>

              {/* Meal type selector */}
              <Text style={s.qtyServingHint}>Add to which meal?</Text>
              <View style={s.pillRow}>
                {TAGS.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => setMealTag(tag)}
                    style={[s.pill, mealTag === tag && s.pillActive]}
                    activeOpacity={0.75}
                  >
                    <Text style={[s.pillText, mealTag === tag && s.pillTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.qtyServingHint}>How many servings?</Text>

              {/* Serving selector */}
              <View style={s.servingRow}>
                {([0.5, 1, 2] as const).map(v => (
                  <TouchableOpacity
                    key={v}
                    style={[s.servingPill, servings === v && s.servingPillActive]}
                    onPress={() => setServings(v)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.servingText, servings === v && s.servingTextActive]}>{v}x</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Live macro preview */}
              <View style={s.qtyPreview}>
                <View style={s.qtyMacroItem}>
                  <Text style={[s.qtyMacroVal, { color: CREAM }]}>{qCal}</Text>
                  <Text style={s.qtyMacroLbl}>cal</Text>
                </View>
                <View style={s.qtyMacroDivider} />
                <View style={s.qtyMacroItem}>
                  <Text style={[s.qtyMacroVal, { color: CORAL }]}>{qProtein}g</Text>
                  <Text style={s.qtyMacroLbl}>protein</Text>
                </View>
                <View style={s.qtyMacroDivider} />
                <View style={s.qtyMacroItem}>
                  <Text style={[s.qtyMacroVal, { color: GOLD }]}>{qCarbs}g</Text>
                  <Text style={s.qtyMacroLbl}>carbs</Text>
                </View>
                <View style={s.qtyMacroDivider} />
                <View style={s.qtyMacroItem}>
                  <Text style={[s.qtyMacroVal, { color: MUTED }]}>{qFat}g</Text>
                  <Text style={s.qtyMacroLbl}>fat</Text>
                </View>
                <View style={s.qtyMacroDivider} />
                <View style={s.qtyMacroItem}>
                  <Text style={[s.qtyMacroVal, { color: '#8B9E6E' }]}>{qFiber}g</Text>
                  <Text style={s.qtyMacroLbl}>fiber</Text>
                </View>
              </View>

              {/* Add button */}
              <TouchableOpacity
                style={[s.addToLogBtn, saving && { opacity: 0.6 }]}
                onPress={handleAddDish}
                disabled={saving}
                activeOpacity={0.85}
              >
                <Text style={s.addToLogText}>{saving ? "Adding…" : `Add to ${mealTag}`}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ═══════════════════ CUSTOM DISH SHEET ═══════════════════ */}
      <Modal visible={showCustom} transparent animationType="slide" onRequestClose={() => setShowCustom(false)}>
        <View style={s.overlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowCustom(false)} activeOpacity={1} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={s.qtySheet}>
              <View style={s.handle} />
              <Text style={s.qtyDishName}>New Dish</Text>
              <TextInput
                style={s.customInput}
                placeholder="Dish name"
                placeholderTextColor="rgba(232,224,208,0.3)"
                value={customName}
                onChangeText={setCustomName}
                autoFocus
              />
              <TextInput
                style={s.customInput}
                placeholder="Calories"
                placeholderTextColor="rgba(232,224,208,0.3)"
                value={customCals}
                onChangeText={setCustomCals}
                keyboardType="numeric"
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput style={[s.customInput, { flex: 1 }]} placeholder="Protein g" placeholderTextColor="rgba(232,224,208,0.3)" value={customProtein} onChangeText={setCustomProtein} keyboardType="decimal-pad" />
                <TextInput style={[s.customInput, { flex: 1 }]} placeholder="Carbs g"   placeholderTextColor="rgba(232,224,208,0.3)" value={customCarbs}   onChangeText={setCustomCarbs}   keyboardType="decimal-pad" />
                <TextInput style={[s.customInput, { flex: 1 }]} placeholder="Fat g"     placeholderTextColor="rgba(232,224,208,0.3)" value={customFat}     onChangeText={setCustomFat}     keyboardType="decimal-pad" />
                <TextInput style={[s.customInput, { flex: 1 }]} placeholder="Fiber g"   placeholderTextColor="rgba(232,224,208,0.3)" value={customFiber}   onChangeText={setCustomFiber}   keyboardType="decimal-pad" />
              </View>
              <TouchableOpacity
                style={[s.addToLogBtn, (!customName || !customCals || savingCustom) && { opacity: 0.5 }]}
                onPress={handleSaveCustom}
                disabled={!customName || !customCals || savingCustom}
                activeOpacity={0.85}
              >
                <Text style={s.addToLogText}>{savingCustom ? "Saving…" : "Save Dish"}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ═══════════════════ TOAST ═══════════════════ */}
      {toast ? (
        <View style={s.toast} pointerEvents="none">
          <Text style={s.toastText}>{toast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  headerBack:     { flexDirection: "row", alignItems: "center", gap: 4, minWidth: 64 },
  headerBackText: { fontSize: 16, color: CREAM, fontWeight: "500",  },
  headerTitle:    { fontSize: 18, fontWeight: "700", color: CREAM,  },
  headerRight:    { minWidth: 64, alignItems: "flex-end" },

  // ── Meal pills ───────────────────────────────────────────────────────────────
  pillRow:        { flexDirection: "row", marginHorizontal: 16, marginTop: 16, marginBottom: 0, gap: 8, height: 38 },
  pill:           { flex: 1, height: 38, paddingHorizontal: 20, paddingVertical: 0, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(232,224,208,0.08)", borderWidth: 1, borderColor: "rgba(232,224,208,0.12)" },
  pillActive:     { backgroundColor: GOLD, borderColor: GOLD },
  pillText:       { fontSize: 14, fontWeight: "600", color: "rgba(232,224,208,0.45)",  },
  pillTextActive: { color: DARK_TXT },

  // ── Photo buttons ────────────────────────────────────────────────────────────
  photoRow: { flexDirection: "row", marginHorizontal: 16, marginTop: 20, gap: 12 },
  photoBtnCamera: {
    flex: 1, backgroundColor: CORAL, borderRadius: 20, paddingVertical: 22,
    alignItems: "center", justifyContent: "center", gap: 8,
    shadowColor: CORAL, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  photoBtnLibrary: {
    flex: 1, backgroundColor: "rgba(232,224,208,0.08)", borderRadius: 20, paddingVertical: 22,
    alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: "rgba(248,213,97,0.25)",
  },
  photoBtnTitle:     { fontSize: 15, fontWeight: "700", color: DARK_TXT,  },
  photoBtnSub:       { fontSize: 11, color: "rgba(28,22,18,0.65)",  },
  photoBtnTitleLight:{ fontSize: 15, fontWeight: "700", color: CREAM,  },
  photoBtnSubLight:  { fontSize: 11, color: "rgba(232,224,208,0.4)",  },

  // ── Search bar ───────────────────────────────────────────────────────────────
  searchBox: {
    marginHorizontal: 16, marginTop: 20,
    backgroundColor: CARD, borderRadius: 18,
    borderWidth: 1.5, borderColor: "rgba(248,213,97,0.2)",
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  searchInput: { flex: 1, fontSize: 16, color: CREAM, backgroundColor: "transparent",  },

  // ── Dish list ────────────────────────────────────────────────────────────────
  dishListCard: {
    flex: 1, marginHorizontal: 16, marginBottom: 8,
    backgroundColor: CARD, borderRadius: 18,
    borderWidth: 1, borderColor: "rgba(232,224,208,0.06)",
    overflow: "hidden",
  },
  listContent:  { paddingVertical: 8 },
  filterRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: 16, marginBottom: 8, paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "rgba(232,224,208,0.4)",
    letterSpacing: 1.2,
  },
  filterDropdown: {
    position: "absolute", top: 28, right: 0, zIndex: 10,
    backgroundColor: CARD, borderRadius: 12, borderWidth: 1,
    borderColor: "rgba(232,224,208,0.12)",
    paddingVertical: 4, minWidth: 160,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 12,
  },
  filterOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 11,
  },
  filterOptionActive: {},
  filterOptionText: { fontSize: 14, fontWeight: "500", color: MUTED },
  filterOptionTextActive: { color: CREAM, fontWeight: "600" },

  // ── Empty state (inside card) ────────────────────────────────────────────────
  cardEmpty:      { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 6, paddingVertical: 40 },
  cardEmptyTitle: { fontSize: 15, fontWeight: "600", color: CREAM, textAlign: "center" },
  cardEmptyText:  { fontSize: 13, color: MUTED, textAlign: "center" },

  // ── Create custom (pinned bottom of card) ──────────────────────────────────
  createCustom:    { alignItems: "center", paddingVertical: 14, borderTopWidth: 1, borderTopColor: "rgba(232,224,208,0.06)" },
  createCustomText:{ fontSize: 14, color: GOLD },

  // ── Quantity sheet ───────────────────────────────────────────────────────────
  overlay:     { flex: 1, justifyContent: "flex-end" },
  qtySheet:    { backgroundColor: CARD, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16 },
  handle:      { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(232,224,208,0.15)", alignSelf: "center", marginBottom: 4 },
  qtyDishName: { fontSize: 18, fontWeight: "700", color: CREAM,  },
  qtyServingHint: { fontSize: 13, color: MUTED,  },
  servingRow:  { flexDirection: "row", gap: 12 },
  servingPill: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20,
    backgroundColor: "rgba(232,224,208,0.08)", borderWidth: 1, borderColor: "rgba(232,224,208,0.15)",
  },
  servingPillActive: { backgroundColor: GOLD, borderColor: GOLD },
  servingText:       { fontSize: 15, fontWeight: "600", color: CREAM,  },
  servingTextActive: { color: DARK_TXT },

  // Macro preview
  qtyPreview:     { flexDirection: "row", backgroundColor: "rgba(232,224,208,0.04)", borderRadius: 16, padding: 16 },
  qtyMacroItem:   { flex: 1, alignItems: "center", gap: 4 },
  qtyMacroVal:    { fontSize: 20, fontWeight: "700",  },
  qtyMacroLbl:    { fontSize: 11, color: MUTED,  },
  qtyMacroDivider:{ width: 1, backgroundColor: "rgba(232,224,208,0.08)", marginVertical: 4 },

  addToLogBtn:  { backgroundColor: GOLD, borderRadius: 22, paddingVertical: 16, alignItems: "center" },
  addToLogText: { fontSize: 16, fontWeight: "700", color: DARK_TXT,  },

  // ── Custom dish inputs ────────────────────────────────────────────────────────
  customInput: {
    backgroundColor: "rgba(232,224,208,0.06)", borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: CREAM,
     },

  // ── Toast ────────────────────────────────────────────────────────────────────
  toast: {
    position: "absolute", bottom: 40, left: 20, right: 20,
    backgroundColor: CARD, borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(248,213,97,0.3)",
    paddingVertical: 12, paddingHorizontal: 20, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  toastText: { fontSize: 14, fontWeight: "600", color: CREAM,  },

  // ── History view ─────────────────────────────────────────────────────────────
});
