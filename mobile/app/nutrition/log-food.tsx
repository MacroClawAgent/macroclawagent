import React, { useEffect, useRef, useState } from "react";
import {
  Alert, DeviceEventEmitter, KeyboardAvoidingView, Modal, Platform,
  SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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


// ── History types (for clock view) ────────────────────────────────────────────
interface FoodItem {
  id: string; meal_tag: string; name: string; calories: number;
  protein_g: number; carbs_g: number; fat_g: number;
  batch_id?: string | null; dish_name?: string | null;
}
type Dish = { key: string; dishName: string; items: FoodItem[]; totalCals: number };
interface NutritionData {
  log:   { calories_consumed: number; protein_g: number; carbs_g: number; fat_g: number };
  goals: { calorie_goal: number; protein_goal: number; carbs_goal: number; fat_goal: number };
  foodItems: FoodItem[];
}
const MEAL_ICONS: Record<string, string> = {
  Breakfast: "sunny-outline",
  Lunch: "restaurant-outline",
  Dinner: "moon-outline",
  Snack: "cafe-outline",
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function LogFoodScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [mealTag,    setMealTag]    = useState<MealTag>(defaultMealTag);
  const [query,      setQuery]      = useState("");
  const [toast,      setToast]      = useState<string | null>(null);
  const [showHistory,setShowHistory]= useState(false);

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

  // History / today log
  const [data,           setData]           = useState<NutritionData | null>(null);
  const [refreshing,     setRefreshing]     = useState(false);
  const [expandedDishes, setExpandedDishes] = useState<Set<string>>(new Set());

  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, []);

  // Fetch real logged dishes from API
  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // ── Data fetching (unchanged logic) ────────────────────────────────────────
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [logRes, itemsRes] = await Promise.allSettled([
        apiGet<any>("/api/nutrition/today"),
        apiGet<any>("/api/nutrition/food-items"),
      ]);
      const log   = logRes.status === "fulfilled" ? logRes.value : null;
      const items = itemsRes.status === "fulfilled" ? itemsRes.value?.items ?? [] : [];
      setData({
        log:       log?.today ?? { calories_consumed: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
        goals:     log?.goals ?? userProfile,
        foodItems: items,
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { if (showHistory) fetchData(); }, [showHistory]);

  // ── Delete handlers (unchanged logic) ──────────────────────────────────────
  const handleDelete = (id: string) => {
    Alert.alert("Remove item?", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => {
        try { await apiDelete(`/api/nutrition/food-items/${id}`); await fetchData(); }
        catch { Alert.alert("Error", "Failed to delete."); }
      }},
    ]);
  };

  const handleDeleteDish = (dish: Dish) => {
    Alert.alert("Delete dish?", `Remove "${dish.dishName}" and all its ingredients?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          const batchId  = dish.items[0]?.batch_id;
          const todayStr = new Date().toISOString().split("T")[0];
          if (batchId) {
            await apiDelete(`/api/nutrition/food-items?batch_id=${batchId}&date=${todayStr}`);
          } else {
            await Promise.all(dish.items.map(i => apiDelete(`/api/nutrition/food-items/${i.id}`)));
          }
          await fetchData();
        } catch { Alert.alert("Error", "Failed to delete dish."); }
      }},
    ]);
  };

  const toggleDish = (key: string) => {
    setExpandedDishes(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

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

  // ── Search / filter ────────────────────────────────────────────────────────
  const trimmed    = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;

  const filteredDishes = isSearching
    ? previousDishes.filter(d => d.name.toLowerCase().includes(trimmed))
    : previousDishes;

  const noResults = isSearching && filteredDishes.length === 0;

  // ── History derived ────────────────────────────────────────────────────────
  const foodItems = data?.foodItems ?? [];
  const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const sections = TAGS.map(tag => {
    const tagItems = foodItems.filter(i => i.meal_tag === tag);
    const batchMap = new Map<string, FoodItem[]>();
    for (const item of tagItems) {
      const k   = item.batch_id ?? `solo_${item.id}`;
      const arr = batchMap.get(k) ?? [];
      arr.push(item);
      batchMap.set(k, arr);
    }
    const dishes: Dish[] = Array.from(batchMap.entries()).map(([key, items]) => ({
      key,
      dishName: items[0].dish_name ?? (items.length > 1
        ? [...items].sort((a, b) => b.calories - a.calories).slice(0, 2).map(i => i.name).join(" & ")
        : items[0].name),
      items,
      totalCals: items.reduce((s, i) => s + i.calories, 0),
    }));
    return { tag, dishes };
  }).filter(s => s.dishes.length > 0);

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
        <TouchableOpacity onPress={() => setShowHistory(h => !h)} hitSlop={12} style={s.headerRight}>
          <Ionicons name="time-outline" size={22} color={showHistory ? GOLD : MUTED} />
        </TouchableOpacity>
      </View>

      {showHistory ? (
        /* ═══════════════════ HISTORY VIEW ═══════════════════ */
        <ScrollView contentContainerStyle={s.histScroll} showsVerticalScrollIndicator={false}>
          <Text style={s.histHeading}>Today's Log</Text>
          {sections.length === 0 ? (
            <View style={s.histEmpty}>
              <Text style={s.histEmptyText}>Nothing logged today yet</Text>
            </View>
          ) : sections.map(section => (
            <View key={section.tag} style={s.histSection}>
              <View style={s.histSectionHead}>
                <Ionicons name={(MEAL_ICONS[section.tag] ?? "nutrition-outline") as any} size={16} color={GOLD} />
                <Text style={s.histSectionTitle}>{section.tag}</Text>
                <Text style={s.histDate}>{todayLabel}</Text>
              </View>
              {section.dishes.map(d => {
                const expanded = expandedDishes.has(d.key);
                const multi    = d.items.length > 1;
                return (
                  <View key={d.key} style={s.dishCard}>
                    <View style={s.dishRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.dishName}>{d.dishName}</Text>
                        <Text style={s.dishMeta}>{+d.totalCals.toFixed(0)} kcal{multi ? ` · ${d.items.length} ingredients` : ""}</Text>
                      </View>
                      <View style={s.dishActions}>
                        {multi && (
                          <TouchableOpacity onPress={() => toggleDish(d.key)} style={s.expandBtn}>
                            <Text style={s.expandText}>{expanded ? "▲" : "▼"}</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => multi ? handleDeleteDish(d) : handleDelete(d.items[0].id)} style={s.deleteBtn}>
                          <Text style={s.deleteText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {multi && expanded && (
                      <View style={s.ingredientList}>
                        {d.items.map((item, idx) => (
                          <View key={item.id} style={[s.ingredientRow, idx === d.items.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={{ flex: 1 }}>
                              <Text style={s.ingredientName}>{item.name}</Text>
                              <Text style={s.ingredientMacros}>{+item.calories.toFixed(0)} kcal · P {+item.protein_g.toFixed(1)}g</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(item.id)} style={s.deleteBtn}>
                              <Text style={s.deleteText}>×</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
          <View style={{ height: 60 }} />
        </ScrollView>
      ) : (
        /* ═══════════════════ MAIN LOG VIEW ═══════════════════ */
        <View style={{ flex: 1 }}>

          {/* ── Two photo buttons ── */}
          <View style={s.photoRow}>
            {/* Take Photo */}
            <TouchableOpacity style={s.photoBtnCamera} onPress={handleTakePhoto} activeOpacity={0.85}>
              <Ionicons name="camera" size={28} color={DARK_TXT} />
              <Text style={s.photoBtnTitle}>Take Photo</Text>
              <Text style={s.photoBtnSub}>AI detects dish + macros</Text>
            </TouchableOpacity>

            {/* Upload from Library */}
            <TouchableOpacity style={s.photoBtnLibrary} onPress={handleUploadPhoto} activeOpacity={0.85}>
              <Ionicons name="image-outline" size={28} color={GOLD} />
              <Text style={s.photoBtnTitleLight}>From Library</Text>
              <Text style={s.photoBtnSubLight}>AI detects dish + macros</Text>
            </TouchableOpacity>
          </View>

          {/* ── Search bar ── */}
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

          {/* ── Dish list ── */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={s.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {loadingDishes && !isSearching ? (
              <View style={s.emptyState}>
                <Ionicons name="hourglass-outline" size={36} color={MUTED} />
                <Text style={[s.emptyTitle, { color: MUTED }]}>Loading your dishes...</Text>
              </View>
            ) : noResults ? (
              <View style={s.emptyState}>
                <Ionicons name="search-outline" size={36} color={MUTED} />
                <Text style={s.emptyTitle}>No dishes found for "{query.trim()}"</Text>
                <TouchableOpacity onPress={() => openCustom(query.trim())} style={s.emptyLink}>
                  <Text style={s.emptyLinkText}>+ Add "{query.trim()}" as custom dish</Text>
                </TouchableOpacity>
              </View>
            ) : !isSearching && filteredDishes.length === 0 ? (
              <View style={s.emptyState}>
                <Ionicons name="restaurant-outline" size={36} color={MUTED} />
                <Text style={s.emptyTitle}>No dishes yet</Text>
                <Text style={[s.emptyTitle, { fontSize: 13, color: MUTED, fontWeight: "400", marginTop: 4 }]}>
                  Scan a meal or create a custom dish to get started
                </Text>
                <TouchableOpacity onPress={() => openCustom()} style={s.emptyLink}>
                  <Text style={s.emptyLinkText}>+ Create custom dish</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={s.sectionLabel}>{isSearching ? "RESULTS" : "YOUR DISHES"}</Text>

                {filteredDishes.map((d, idx) => (
                  <View key={`${d.name}-${idx}`} style={s.dishRow2}>
                    {/* Icon circle */}
                    <View style={s.dishEmoji}>
                      <Ionicons name="nutrition-outline" size={22} color={GOLD} />
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                      <Text style={s.dishTitle}>{d.name}</Text>
                      <View style={s.dishMacroRow}>
                        <Text style={s.dishCal}>{d.calories} cal</Text>
                        <Text style={s.dishDot}> · </Text>
                        <Text style={s.dishProt}>{d.protein}g protein</Text>
                        {d.timesLogged && d.timesLogged > 1 && (
                          <Text style={s.dishLastLog} numberOfLines={1}>{d.timesLogged}x logged</Text>
                        )}
                      </View>
                    </View>

                    {/* Add button */}
                    <TouchableOpacity style={s.addCircle} onPress={() => openDishQty(d)} activeOpacity={0.8}>
                      <Ionicons name="add" size={20} color={DARK_TXT} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Create custom dish */}
                <TouchableOpacity style={s.createCustom} onPress={() => openCustom()} activeOpacity={0.7}>
                  <Text style={s.createCustomText}>+ Create custom dish</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      )}

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
  listContent:  { paddingBottom: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "rgba(232,224,208,0.4)",
    letterSpacing: 1.2, marginLeft: 20, marginTop: 24, marginBottom: 12,
     },
  dishRow2: {
    backgroundColor: CARD, borderRadius: 16, marginHorizontal: 16, marginBottom: 8,
    padding: 16, flexDirection: "row", alignItems: "center", gap: 14,
    borderWidth: 1, borderColor: "rgba(232,224,208,0.06)",
  },
  dishEmoji: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(232,224,208,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  dishTitle:   { fontSize: 15, fontWeight: "600", color: CREAM,  },
  dishMacroRow:{ flexDirection: "row", alignItems: "center", marginTop: 3, flexWrap: "nowrap" },
  dishCal:     { fontSize: 12, fontWeight: "600", color: GOLD,  },
  dishDot:     { fontSize: 12, color: "rgba(232,224,208,0.3)",  },
  dishProt:    { fontSize: 12, color: CORAL,  },
  dishLastLog: { fontSize: 11, color: "rgba(232,224,208,0.3)", marginLeft: "auto" as const,  },
  addCircle:   { width: 36, height: 36, borderRadius: 18, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },

  // ── Empty state ──────────────────────────────────────────────────────────────
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 4 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: CREAM, marginTop: 12, textAlign: "center",  },
  emptyLink:  { marginTop: 8 },
  emptyLinkText: { fontSize: 14, color: GOLD,  },

  // ── Create custom ────────────────────────────────────────────────────────────
  createCustom:    { alignItems: "center", paddingVertical: 20 },
  createCustomText:{ fontSize: 14, color: GOLD,  },

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
  histScroll:       { padding: 16, paddingBottom: 60 },
  histHeading:      { fontSize: 18, fontWeight: "700", color: CREAM, marginBottom: 12,  },
  histEmpty:        { alignItems: "center", paddingVertical: 40 },
  histEmptyText:    { fontSize: 15, color: MUTED,  },
  histSection:      { marginBottom: 16 },
  histSectionHead:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, paddingLeft: 4 },
  histSectionTitle: { fontSize: 15, fontWeight: "700", color: GOLD,  },
  histDate:         { fontSize: 12, color: MUTED, marginLeft: "auto" as const,  },
  dishCard: {
    backgroundColor: CARD, borderRadius: 14, marginBottom: 6,
    borderWidth: 1, borderColor: BORDER, overflow: "hidden",
  },
  dishRow:     { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  dishName:    { fontSize: 15, fontWeight: "600", color: CREAM,  },
  dishMeta:    { fontSize: 12, color: MUTED, marginTop: 2,  },
  dishActions: { flexDirection: "row", gap: 8 },
  expandBtn:   { padding: 6 },
  expandText:  { fontSize: 12, color: MUTED,  },
  deleteBtn:   { padding: 6 },
  deleteText:  { fontSize: 20, color: CORAL, lineHeight: 22,  },
  ingredientList: { borderTopWidth: 1, borderTopColor: "rgba(232,224,208,0.06)", paddingHorizontal: 14, paddingBottom: 8 },
  ingredientRow:  { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(232,224,208,0.04)", gap: 8 },
  ingredientName: { fontSize: 13, color: CREAM,  },
  ingredientMacros:{ fontSize: 11, color: MUTED, marginTop: 1,  },
});
