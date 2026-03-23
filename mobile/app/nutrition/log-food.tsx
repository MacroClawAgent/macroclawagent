import React, { useEffect, useRef, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Modal, Platform,
  RefreshControl, SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const BG   = "#EEF4FA";
const TEAL = "#2DD4BF";

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  Breakfast: { color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  Lunch:     { color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  Dinner:    { color: "#6366F1", bg: "rgba(99,102,241,0.10)" },
  Snack:     { color: "#F97316", bg: "rgba(249,115,22,0.10)" },
};
const TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
type MealTag = typeof TAGS[number];

const MEAL_EMOJIS: Record<string, string> = {
  Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙", Snack: "🍎",
};

const UNITS = ["g", "ml", "pieces", "cups", "tbsp"] as const;
type Unit = typeof UNITS[number];

// ── Food database ─────────────────────────────────────────────────────────────
interface FoodEntry {
  name: string; calories: number; protein: number; carbs: number; fat: number;
}

const FOOD_DATABASE: FoodEntry[] = [
  { name: "Chicken Breast (100g)",          calories: 165, protein: 31,   carbs: 0,    fat: 3.6  },
  { name: "Brown Rice (100g cooked)",       calories: 112, protein: 2.6,  carbs: 23.5, fat: 0.9  },
  { name: "Eggs (1 large)",                 calories: 72,  protein: 6.3,  carbs: 0.4,  fat: 5    },
  { name: "Greek Yogurt (100g)",            calories: 97,  protein: 9,    carbs: 3.6,  fat: 5    },
  { name: "Oats (100g dry)",                calories: 389, protein: 16.9, carbs: 66,   fat: 6.9  },
  { name: "Salmon (100g)",                  calories: 208, protein: 20,   carbs: 0,    fat: 13   },
  { name: "Sweet Potato (100g)",            calories: 86,  protein: 1.6,  carbs: 20,   fat: 0.1  },
  { name: "Banana (1 medium)",              calories: 105, protein: 1.3,  carbs: 27,   fat: 0.4  },
  { name: "Almonds (30g)",                  calories: 173, protein: 6.3,  carbs: 6,    fat: 15   },
  { name: "Avocado (half)",                 calories: 120, protein: 1.5,  carbs: 6.4,  fat: 11   },
  { name: "White Rice (100g cooked)",       calories: 130, protein: 2.7,  carbs: 28,   fat: 0.3  },
  { name: "Tuna in Spring Water (95g can)", calories: 96,  protein: 21,   carbs: 0,    fat: 0.9  },
  { name: "Whey Protein (1 scoop 30g)",     calories: 120, protein: 24,   carbs: 3,    fat: 1.5  },
  { name: "Whole Milk (250ml)",             calories: 150, protein: 8,    carbs: 12,   fat: 8    },
  { name: "Broccoli (100g)",                calories: 34,  protein: 2.8,  carbs: 7,    fat: 0.4  },
  { name: "Bread slice (white)",            calories: 79,  protein: 2.7,  carbs: 15,   fat: 1    },
  { name: "Cheddar Cheese (30g)",           calories: 120, protein: 7.5,  carbs: 0.1,  fat: 10   },
  { name: "Olive Oil (1 tbsp)",             calories: 119, protein: 0,    carbs: 0,    fat: 13.5 },
  { name: "Cottage Cheese (100g)",          calories: 98,  protein: 11.1, carbs: 3.4,  fat: 4.3  },
  { name: "Spinach (100g)",                 calories: 23,  protein: 2.9,  carbs: 3.6,  fat: 0.4  },
];

const POPULAR_FOODS = [
  FOOD_DATABASE[0],  // Chicken Breast
  FOOD_DATABASE[2],  // Eggs
  FOOD_DATABASE[3],  // Greek Yogurt
  FOOD_DATABASE[4],  // Oats
  FOOD_DATABASE[1],  // Brown Rice
  FOOD_DATABASE[5],  // Salmon
  FOOD_DATABASE[7],  // Banana
  FOOD_DATABASE[6],  // Sweet Potato
];

const RECENT_MEALS = [
  { name: "Chicken Bowl",  emoji: "🍗", food: FOOD_DATABASE[0] },
  { name: "Oats",          emoji: "🥣", food: FOOD_DATABASE[4] },
  { name: "Salmon Rice",   emoji: "🐟", food: FOOD_DATABASE[5] },
  { name: "Eggs",          emoji: "🥚", food: FOOD_DATABASE[2] },
  { name: "Greek Yogurt",  emoji: "🥛", food: FOOD_DATABASE[3] },
];

// ── Types ─────────────────────────────────────────────────────────────────────
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

// Helper: auto-select meal tag by time of day
function defaultMealTag(): MealTag {
  const h = new Date().getHours();
  if (h < 11) return "Breakfast";
  if (h < 14) return "Lunch";
  if (h < 18) return "Snack";
  return "Dinner";
}

const MOCK_HISTORY = [
  { date: "Yesterday",  calories: 2100, protein: 168, carbs: 210, fat: 58 },
  { date: "Sun 16 Mar", calories: 1840, protein: 142, carbs: 195, fat: 52 },
  { date: "Sat 15 Mar", calories: 2450, protein: 185, carbs: 240, fat: 72 },
];

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LogFoodScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();

  // data state (unchanged logic)
  const [data,           setData]           = useState<NutritionData | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [showHistory,    setShowHistory]    = useState(false);
  const [expandedDishes, setExpandedDishes] = useState<Set<string>>(new Set());

  // custom food sheet (kept for "Add as custom")
  const [showAdd,    setShowAdd]    = useState(false);
  const [addTag,     setAddTag]     = useState<string>("Breakfast");
  const [addName,    setAddName]    = useState("");
  const [addCals,    setAddCals]    = useState("");
  const [addProtein, setAddProtein] = useState("");
  const [addCarbs,   setAddCarbs]   = useState("");
  const [addFat,     setAddFat]     = useState("");
  const [saving,     setSaving]     = useState(false);

  // core UI state
  const [mealTag,     setMealTag]     = useState<MealTag>(defaultMealTag);
  const [searchQuery, setSearchQuery] = useState("");

  // quantity sheet
  const [selectedFood, setSelectedFood] = useState<FoodEntry | null>(null);
  const [showQty,      setShowQty]      = useState(false);
  const [qty,          setQty]          = useState(100);
  const [qtyStr,       setQtyStr]       = useState("100");
  const [unit,         setUnit]         = useState<Unit>("g");

  // toast
  const [toast, setToast] = useState<string | null>(null);

  const searchRef = useRef<TextInput>(null);

  // Auto-focus search on mount
  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, []);

  // ── data fetching (unchanged) ──────────────────────────────────────────────
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
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── existing handlers (unchanged) ─────────────────────────────────────────
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

  const handleAdd = async () => {
    if (!addName || !addCals) return;
    setSaving(true);
    try {
      await apiPost("/api/nutrition/food-items", {
        meal_tag: addTag, name: addName,
        calories:  parseInt(addCals),
        protein_g: parseFloat(addProtein || "0"),
        carbs_g:   parseFloat(addCarbs   || "0"),
        fat_g:     parseFloat(addFat     || "0"),
      });
      setShowAdd(false);
      setAddName(""); setAddCals(""); setAddProtein(""); setAddCarbs(""); setAddFat("");
      await fetchData();
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add item.");
    } finally { setSaving(false); }
  };

  const toggleDish = (key: string) => {
    setExpandedDishes(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // ── new handlers ───────────────────────────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  function openQty(food: FoodEntry) {
    setSelectedFood(food);
    setQty(100);
    setQtyStr("100");
    setUnit("g");
    setShowQty(true);
  }

  function adjustQty(delta: number) {
    const next = Math.max(1, qty + delta);
    setQty(next);
    setQtyStr(String(next));
  }

  function handleQtyTextChange(text: string) {
    setQtyStr(text);
    const n = parseFloat(text);
    if (!isNaN(n) && n > 0) setQty(n);
  }

  function cycleUnit() {
    const idx = UNITS.indexOf(unit);
    setUnit(UNITS[(idx + 1) % UNITS.length]);
  }

  async function handleAddFoodFromSearch() {
    if (!selectedFood) return;
    const ratio = qty / 100;
    setSaving(true);
    try {
      await apiPost("/api/nutrition/food-items", {
        meal_tag:  mealTag,
        name:      selectedFood.name,
        calories:  Math.round(selectedFood.calories  * ratio),
        protein_g: Math.round(selectedFood.protein   * ratio * 10) / 10,
        carbs_g:   Math.round(selectedFood.carbs     * ratio * 10) / 10,
        fat_g:     Math.round(selectedFood.fat       * ratio * 10) / 10,
      });
      setShowQty(false);
      setSearchQuery("");
      showToast(`${selectedFood.name} added to ${mealTag} ✓`);
      await fetchData();
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add.");
    } finally { setSaving(false); }
  }

  // ── photo handlers ────────────────────────────────────────────────────────
  function handleTakePhoto() {
    router.push({ pathname: "/nutrition/photo-confirm", params: { mode: "camera" } } as any);
  }

  function handleUploadPhoto() {
    router.push({ pathname: "/nutrition/photo-confirm", params: { mode: "library" } } as any);
  }

  // ── derived ───────────────────────────────────────────────────────────────
  const ratio   = qty / 100;
  const food    = selectedFood;
  const previewCal     = food ? Math.round(food.calories  * ratio) : 0;
  const previewProtein = food ? +(food.protein * ratio).toFixed(1) : 0;
  const previewCarbs   = food ? +(food.carbs   * ratio).toFixed(1) : 0;
  const previewFat     = food ? +(food.fat     * ratio).toFixed(1) : 0;

  const trimmed        = searchQuery.trim();
  const displayedFoods = trimmed
    ? FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(trimmed.toLowerCase()))
    : POPULAR_FOODS;
  const isSearching    = trimmed.length > 0;

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

  // ── header right ──────────────────────────────────────────────────────────
  const ClockBtn = (
    <TouchableOpacity style={s.iconBtn} activeOpacity={0.7} onPress={() => setShowHistory(h => !h)}>
      <Ionicons name="time-outline" size={20} color={showHistory ? TEAL : "#374151"} />
    </TouchableOpacity>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <AppHeader title="Log Food" showBack rightElement={ClockBtn} />

      {showHistory ? (
        /* ════════ HISTORY VIEW ════════ */
        <ScrollView
          contentContainerStyle={s.histScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={TEAL} />}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.histHeading}>Today's Log</Text>
          {sections.length === 0 ? (
            <View style={s.histEmpty}>
              <Text style={s.histEmptyText}>Nothing logged today yet</Text>
            </View>
          ) : sections.map(section => {
            const tc = TAG_COLORS[section.tag] ?? { color: TEAL, bg: "" };
            return (
              <View key={section.tag} style={s.histSection}>
                <View style={[s.histSectionHead, { borderLeftColor: tc.color }]}>
                  <Text style={s.histSectionEmoji}>{MEAL_EMOJIS[section.tag]}</Text>
                  <Text style={[s.histSectionTitle, { color: tc.color }]}>{section.tag}</Text>
                  <Text style={s.histDate}>{todayLabel}</Text>
                </View>
                {section.dishes.map(dish => {
                  const expanded = expandedDishes.has(dish.key);
                  const multi    = dish.items.length > 1;
                  return (
                    <View key={dish.key} style={[s.dishCard, { borderLeftColor: tc.color }]}>
                      <View style={s.dishRow}>
                        <View style={s.dishMid}>
                          <Text style={s.dishName}>{dish.dishName}</Text>
                          <Text style={s.dishMeta}>{+dish.totalCals.toFixed(0)} kcal{multi ? ` · ${dish.items.length} ingredients` : ""}</Text>
                        </View>
                        <View style={s.dishActions}>
                          {multi && (
                            <TouchableOpacity onPress={() => toggleDish(dish.key)} style={s.expandBtn}>
                              <Text style={s.expandText}>{expanded ? "▲" : "▼"}</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity onPress={() => multi ? handleDeleteDish(dish) : handleDelete(dish.items[0].id)} style={s.deleteBtn}>
                            <Text style={s.deleteText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      {multi && expanded && (
                        <View style={s.ingredientList}>
                          {dish.items.map((item, idx) => (
                            <View key={item.id} style={[s.ingredientRow, idx === dish.items.length - 1 && { borderBottomWidth: 0 }]}>
                              <View style={{ flex: 1 }}>
                                <Text style={s.ingredientName}>{item.name}</Text>
                                <Text style={s.ingredientMacros}>{+item.calories.toFixed(0)} kcal · P {+item.protein_g.toFixed(1)}g · C {+item.carbs_g.toFixed(1)}g · F {+item.fat_g.toFixed(1)}g</Text>
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
            );
          })}

          <Text style={[s.histHeading, { marginTop: 24 }]}>Past Days</Text>
          {MOCK_HISTORY.map(day => {
            const total = (day.protein + day.carbs + day.fat) || 1;
            return (
              <View key={day.date} style={s.histDayCard}>
                <View style={s.histDayTop}>
                  <Text style={s.histDayDate}>{day.date}</Text>
                  <Text style={s.histDayCal}>{day.calories.toLocaleString()} kcal</Text>
                  <Text style={s.histChevron}>›</Text>
                </View>
                <View style={s.histMacroBar}>
                  <View style={[s.histMacroSeg, { flex: day.protein / total, backgroundColor: "#22C55E" }]} />
                  <View style={[s.histMacroSeg, { flex: day.carbs   / total, backgroundColor: "#F59E0B" }]} />
                  <View style={[s.histMacroSeg, { flex: day.fat     / total, backgroundColor: "#8B5CF6" }]} />
                </View>
                <View style={s.histMacroLbls}>
                  <Text style={[s.histMacroLbl, { color: "#22C55E" }]}>P {day.protein}g</Text>
                  <Text style={[s.histMacroLbl, { color: "#F59E0B" }]}>C {day.carbs}g</Text>
                  <Text style={[s.histMacroLbl, { color: "#8B5CF6" }]}>F {day.fat}g</Text>
                </View>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        /* ════════ MAIN VIEW ════════ */
        <View style={{ flex: 1 }}>

          {/* ── 1. Meal type pills ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pillRow}
          >
            {TAGS.map(tag => {
              const active = mealTag === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  style={[s.pill, active && s.pillActive]}
                  onPress={() => setMealTag(tag)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.pillText, active && s.pillTextActive]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── 2. Search + barcode ── */}
          <View style={s.searchRow}>
            <View style={s.searchBox}>
              <Ionicons name="search" size={20} color={TEAL} />
              <TextInput
                ref={searchRef}
                style={s.searchInput}
                placeholder="Search food..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                cursorColor={TEAL}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={s.barcodeBtn}
              activeOpacity={0.8}
              onPress={() => Alert.alert("Coming Soon", "Barcode scanner — TODO: integrate Open Food Facts API")}
            >
              <Ionicons name="barcode-outline" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* ── Scrollable content below search ── */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={s.resultsContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── 3. Scan card (hidden while typing) ── */}
            {!isSearching && (
              <TouchableOpacity
                style={s.scanCard}
                activeOpacity={0.9}
                onPress={handleTakePhoto}
              >
                <LinearGradient
                  colors={["#CCFBF1", "#99F6E4"]}
                  style={s.scanCardIcon}
                >
                  <Ionicons name="camera-outline" size={28} color="#0D9488" />
                </LinearGradient>

                <View style={{ flex: 1 }}>
                  <Text style={s.scanCardTitle}>Scan Meal with AI</Text>
                  <Text style={s.scanCardSub}>Photo → macros detected instantly</Text>
                </View>

                <TouchableOpacity
                  style={s.scanBtnCamera}
                  activeOpacity={0.8}
                  onPress={handleTakePhoto}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="camera" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.scanBtnLibrary}
                  activeOpacity={0.8}
                  onPress={handleUploadPhoto}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="image-outline" size={20} color={TEAL} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}

            {/* ── 4. Recent meals (hidden while typing) ── */}
            {!isSearching && (
              <>
                <Text style={s.recentLabel}>Recent</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.recentRow}
                  keyboardShouldPersistTaps="handled"
                >
                  {RECENT_MEALS.map((meal, idx) => (
                    <TouchableOpacity
                      key={meal.name}
                      style={[s.recentPill, idx === 0 && { marginLeft: 16 }]}
                      activeOpacity={0.8}
                      onPress={() => openQty(meal.food)}
                    >
                      <Text style={s.recentEmoji}>{meal.emoji}</Text>
                      <Text style={s.recentName}>{meal.name}</Text>
                      <Text style={s.recentPlus}>+</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* ── 5. Popular foods / search results ── */}
            {!isSearching && (
              <Text style={s.listLabel}>Popular Foods</Text>
            )}

            {displayedFoods.length === 0 ? (
              <View style={s.noResults}>
                <Text style={s.noResultsTitle}>No results for "{trimmed}"</Text>
                <TouchableOpacity
                  style={s.addCustomLink}
                  onPress={() => { setAddTag(mealTag); setAddName(trimmed); setShowAdd(true); }}
                >
                  <Text style={s.addCustomText}>+ Add "{trimmed}" as custom food</Text>
                </TouchableOpacity>
              </View>
            ) : (
              displayedFoods.map((food, idx) => (
                <View
                  key={food.name}
                  style={[s.resultRow, idx === displayedFoods.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={s.resultLeft}>
                    <Text style={s.resultName}>{food.name}</Text>
                    <Text style={s.resultMeta}>{food.calories} cal · {food.protein}g protein</Text>
                  </View>
                  <TouchableOpacity style={s.addBtn} onPress={() => openQty(food)} activeOpacity={0.8}>
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {displayedFoods.length > 0 && (
              <TouchableOpacity
                style={s.createCustom}
                onPress={() => { setAddTag(mealTag); setAddName(""); setShowAdd(true); }}
                activeOpacity={0.7}
              >
                <Text style={s.createCustomText}>+ Create custom food</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* ════════ QUANTITY SHEET ════════ */}
      <Modal visible={showQty} transparent animationType="slide" onRequestClose={() => setShowQty(false)}>
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={s.qtySheet}>
            <View style={s.handle} />

            <Text style={s.qtyFoodName} numberOfLines={2}>{selectedFood?.name}</Text>

            {/* Quantity controls */}
            <View style={s.qtyControls}>
              <TouchableOpacity style={s.qtyMinus} onPress={() => adjustQty(-10)} activeOpacity={0.75}>
                <Text style={s.qtyMinusText}>−</Text>
              </TouchableOpacity>

              <TextInput
                style={s.qtyNumInput}
                value={qtyStr}
                onChangeText={handleQtyTextChange}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />

              <TouchableOpacity style={s.qtyPlus} onPress={() => adjustQty(10)} activeOpacity={0.75}>
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={s.unitPill} onPress={cycleUnit} activeOpacity={0.75}>
                <Text style={s.unitText}>{unit} ▾</Text>
              </TouchableOpacity>
            </View>

            {/* Live macro preview */}
            <View style={s.preview}>
              <View style={s.previewItem}>
                <Text style={s.previewVal}>{previewCal}</Text>
                <Text style={s.previewLbl}>kcal</Text>
              </View>
              <View style={s.previewDivider} />
              <View style={s.previewItem}>
                <Text style={[s.previewVal, { color: "#22C55E" }]}>{previewProtein}g</Text>
                <Text style={s.previewLbl}>protein</Text>
              </View>
              <View style={s.previewDivider} />
              <View style={s.previewItem}>
                <Text style={[s.previewVal, { color: "#F59E0B" }]}>{previewCarbs}g</Text>
                <Text style={s.previewLbl}>carbs</Text>
              </View>
              <View style={s.previewDivider} />
              <View style={s.previewItem}>
                <Text style={[s.previewVal, { color: "#8B5CF6" }]}>{previewFat}g</Text>
                <Text style={s.previewLbl}>fat</Text>
              </View>
            </View>

            {/* Add button */}
            <TouchableOpacity
              style={[s.addToLogBtn, saving && { opacity: 0.6 }]}
              onPress={handleAddFoodFromSearch}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Text style={s.addToLogText}>{saving ? "Adding…" : `Add to ${mealTag}`}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowQty(false)} style={s.cancelBtn} activeOpacity={0.7}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ════════ CUSTOM FOOD SHEET ════════ */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <Text style={s.sheetTitle}>Custom Food</Text>
            <View style={s.tagRow}>
              {TAGS.map(t => {
                const tc = TAG_COLORS[t];
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setAddTag(t)}
                    style={[s.tagChip, { backgroundColor: addTag === t ? tc.color : tc.bg, borderColor: tc.color + "60" }]}
                  >
                    <Text style={[s.tagChipLabel, { color: addTag === t ? "#FFF" : tc.color }]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput style={s.input} placeholder="Food name" placeholderTextColor="#9CA3AF" value={addName} onChangeText={setAddName} autoFocus />
            <TextInput style={s.input} placeholder="Calories" placeholderTextColor="#9CA3AF" value={addCals} onChangeText={setAddCals} keyboardType="numeric" />
            <View style={s.twoCol}>
              <TextInput style={[s.input, { flex: 1 }]} placeholder="Protein g" placeholderTextColor="#9CA3AF" value={addProtein} onChangeText={setAddProtein} keyboardType="decimal-pad" />
              <TextInput style={[s.input, { flex: 1 }]} placeholder="Carbs g"   placeholderTextColor="#9CA3AF" value={addCarbs}   onChangeText={setAddCarbs}   keyboardType="decimal-pad" />
              <TextInput style={[s.input, { flex: 1 }]} placeholder="Fat g"     placeholderTextColor="#9CA3AF" value={addFat}     onChangeText={setAddFat}     keyboardType="decimal-pad" />
            </View>
            <TouchableOpacity
              onPress={handleAdd}
              disabled={!addName || !addCals || saving}
              style={[s.addToLogBtn, { opacity: !addName || !addCals ? 0.5 : 1 }]}
            >
              <Text style={s.addToLogText}>{saving ? "Saving…" : "Save"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAdd(false)} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Toast */}
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

  iconBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.75)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },

  // ── Meal pills ─────────────────────────────────────────────────────────────
  pillRow:      { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  pill:         { height: 36, paddingHorizontal: 18, borderRadius: 18, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.8)", borderWidth: 1, borderColor: "#E2E8F0" },
  pillActive:   { backgroundColor: TEAL, borderColor: TEAL },
  pillText:     { fontSize: 14, fontWeight: "500", color: "#94A3B8" },
  pillTextActive:{ fontSize: 14, fontWeight: "600", color: "#fff" },

  // ── Search row ─────────────────────────────────────────────────────────────
  searchRow: { flexDirection: "row", marginHorizontal: 16, gap: 10, marginBottom: 4 },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(45,212,191,0.3)",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#1E293B" },
  barcodeBtn: { width: 52, height: 52, backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 16, borderWidth: 1.5, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center" },

  // ── Results list ───────────────────────────────────────────────────────────
  resultsContent: { paddingBottom: 60 },
  listLabel:      { fontSize: 12, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.6, textTransform: "uppercase", marginLeft: 16, marginTop: 16, marginBottom: 4 },
  resultRow:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 12 },
  resultLeft:     { flex: 1 },
  resultName:     { fontSize: 15, fontWeight: "500", color: "#1E293B" },
  resultMeta:     { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  addBtn:         { width: 32, height: 32, borderRadius: 16, backgroundColor: TEAL, alignItems: "center", justifyContent: "center" },
  noResults:      { alignItems: "center", paddingTop: 48, gap: 10, paddingHorizontal: 32 },
  noResultsTitle: { fontSize: 15, fontWeight: "600", color: "#1E293B", textAlign: "center" },
  addCustomLink:  { paddingVertical: 8 },
  addCustomText:  { fontSize: 14, color: TEAL, fontWeight: "500" },
  createCustom:   { alignItems: "center", paddingVertical: 18 },
  createCustomText:{ fontSize: 14, color: TEAL },

  // ── Scan card ──────────────────────────────────────────────────────────────
  scanCard: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20, borderWidth: 1.5, borderColor: "rgba(45,212,191,0.25)",
    padding: 16, flexDirection: "row", alignItems: "center", gap: 14,
    shadowColor: "#B0C4D8", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 3,
  },
  scanCardIcon:  { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  scanCardTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 2 },
  scanCardSub:   { fontSize: 12, color: "#94A3B8" },
  scanBtnCamera: {
    width: 42, height: 42, backgroundColor: TEAL, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    shadowColor: TEAL, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  scanBtnLibrary: {
    width: 42, height: 42, backgroundColor: "rgba(45,212,191,0.1)", borderRadius: 12,
    borderWidth: 1.5, borderColor: "rgba(45,212,191,0.3)",
    alignItems: "center", justifyContent: "center",
  },

  // ── Recent meals ───────────────────────────────────────────────────────────
  recentLabel: { fontSize: 12, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.6, textTransform: "uppercase", marginLeft: 16, marginTop: 20, marginBottom: 8 },
  recentRow:   { paddingRight: 16, paddingBottom: 4 },
  recentPill:  {
    backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 10, marginRight: 10,
    borderWidth: 1, borderColor: "#F1F5F9",
    flexDirection: "row", alignItems: "center", gap: 8,
    shadowColor: "#B0C4D8", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  recentEmoji: { fontSize: 18 },
  recentName:  { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  recentPlus:  { fontSize: 16, fontWeight: "700", color: TEAL, marginLeft: 2 },

  // ── Quantity sheet ─────────────────────────────────────────────────────────
  qtySheet:      { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 20 },
  qtyFoodName:   { fontSize: 18, fontWeight: "700", color: "#1E293B", lineHeight: 24 },
  qtyControls:   { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyMinus:      { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  qtyMinusText:  { fontSize: 22, color: "#64748B", lineHeight: 26 },
  qtyNumInput:   { width: 80, fontSize: 24, fontWeight: "700", color: "#1E293B", textAlign: "center", borderBottomWidth: 2, borderBottomColor: TEAL, paddingVertical: 4 },
  qtyPlus:       { width: 40, height: 40, borderRadius: 20, backgroundColor: TEAL, alignItems: "center", justifyContent: "center" },
  unitPill:      { marginLeft: "auto" as const, backgroundColor: "#F8FAFC", borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 14, paddingVertical: 8 },
  unitText:      { fontSize: 14, fontWeight: "600", color: "#64748B" },
  preview:       { flexDirection: "row", backgroundColor: "#F8FAFC", borderRadius: 16, padding: 14 },
  previewItem:   { flex: 1, alignItems: "center" },
  previewVal:    { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  previewLbl:    { fontSize: 10, color: "#94A3B8", marginTop: 2 },
  previewDivider:{ width: 1, backgroundColor: "#E2E8F0", marginVertical: 4 },
  addToLogBtn:   { backgroundColor: TEAL, borderRadius: 20, paddingVertical: 16, alignItems: "center" },
  addToLogText:  { fontSize: 16, fontWeight: "600", color: "#fff" },

  // ── Custom food sheet ──────────────────────────────────────────────────────
  sheet:        { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12 },
  sheetTitle:   { fontSize: 20, fontWeight: "800", color: "#1C1C1E" },
  tagRow:       { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  tagChipLabel: { fontSize: 12, fontWeight: "700" },
  input:        { backgroundColor: BG, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#1C1C1E", borderWidth: 1, borderColor: "#E5E7EB" },
  twoCol:       { flexDirection: "row", gap: 8 },

  // ── Shared ─────────────────────────────────────────────────────────────────
  overlay:       { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  handle:        { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  cancelBtn:     { alignItems: "center", paddingVertical: 8 },
  cancelText:    { color: "#9CA3AF", fontWeight: "600", fontSize: 14 },

  // ── Toast ──────────────────────────────────────────────────────────────────
  toast:     { position: "absolute", bottom: 48, alignSelf: "center", backgroundColor: "rgba(30,41,59,0.9)", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12 },
  toastText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  // ── History view ───────────────────────────────────────────────────────────
  histScroll:       { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 60 },
  histHeading:      { fontSize: 15, fontWeight: "600", color: "#1E293B", marginBottom: 10 },
  histEmpty:        { paddingVertical: 32, alignItems: "center" },
  histEmptyText:    { fontSize: 14, color: "#94A3B8" },
  histSection:      { gap: 6, marginBottom: 16 },
  histSectionHead:  { flexDirection: "row", alignItems: "center", gap: 8, borderLeftWidth: 3, paddingLeft: 10, marginBottom: 4 },
  histSectionEmoji: { fontSize: 14 },
  histSectionTitle: { fontSize: 13, fontWeight: "800", flex: 1 },
  histDate:         { fontSize: 11, color: "#9CA3AF" },
  dishCard:         { borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", borderLeftWidth: 3, backgroundColor: "rgba(255,255,255,0.9)", overflow: "hidden", marginBottom: 4 },
  dishRow:          { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  dishMid:          { flex: 1 },
  dishName:         { fontSize: 14, fontWeight: "700", color: "#1C1C1E", marginBottom: 2 },
  dishMeta:         { fontSize: 11, color: "#9CA3AF" },
  dishActions:      { flexDirection: "row", alignItems: "center", gap: 4 },
  expandBtn:        { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  expandText:       { fontSize: 10, fontWeight: "700", color: "#9CA3AF" },
  ingredientList:   { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB", paddingHorizontal: 14, paddingBottom: 6 },
  ingredientRow:    { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  ingredientName:   { fontSize: 12, fontWeight: "600", color: "#1C1C1E", marginBottom: 1 },
  ingredientMacros: { fontSize: 11, color: "#9CA3AF" },
  deleteBtn:        { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239,68,68,0.08)" },
  deleteText:       { fontSize: 18, fontWeight: "700", color: "#EF4444" },
  histDayCard:      { backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: "#B0C4D8", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 },
  histDayTop:       { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  histDayDate:      { flex: 1, fontSize: 14, fontWeight: "600", color: "#1E293B" },
  histDayCal:       { fontSize: 14, fontWeight: "700", color: "#1E293B", marginRight: 6 },
  histChevron:      { fontSize: 18, color: "#94A3B8" },
  histMacroBar:     { flexDirection: "row", height: 5, borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  histMacroSeg:     { height: 5 },
  histMacroLbls:    { flexDirection: "row", gap: 12 },
  histMacroLbl:     { fontSize: 11, fontWeight: "600" },
});
