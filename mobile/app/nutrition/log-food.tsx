import React, { useEffect, useRef, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Modal, Platform,
  RefreshControl, SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { DimensionValue } from "react-native";
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

const SHADOW = {
  shadowColor: "#B0C4D8" as const,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 3,
};

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
interface FoodEntry {
  name: string; calories: number; protein: number; carbs: number; fat: number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────
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

const RECENT_MEALS = [
  { name: "Chicken Bowl",  calories: 520, emoji: "🍗" },
  { name: "Greek Yogurt",  calories: 180, emoji: "🥛" },
  { name: "Salmon Rice",   calories: 490, emoji: "🐟" },
  { name: "Oats & Banana", calories: 320, emoji: "🥣" },
  { name: "Eggs on Toast", calories: 380, emoji: "🍳" },
];

const MOCK_HISTORY = [
  { date: "Yesterday",  calories: 2100, protein: 168, carbs: 210, fat: 58 },
  { date: "Sun 16 Mar", calories: 1840, protein: 142, carbs: 195, fat: 52 },
  { date: "Sat 15 Mar", calories: 2450, protein: 185, carbs: 240, fat: 72 },
];

const WATER_OPTIONS = [
  { label: "250 ml",  ml: 250  },
  { label: "500 ml",  ml: 500  },
  { label: "750 ml",  ml: 750  },
  { label: "1 L",     ml: 1000 },
];

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LogFoodScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();

  // ── existing data state ────────────────────────────────────────────────────
  const [data,           setData]           = useState<NutritionData | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [showHistory,    setShowHistory]    = useState(false);
  const [expandedDishes, setExpandedDishes] = useState<Set<string>>(new Set());

  // ── manual add state (legacy, kept for "Create custom food") ───────────────
  const [showAdd,    setShowAdd]    = useState(false);
  const [addTag,     setAddTag]     = useState<string>("Breakfast");
  const [addName,    setAddName]    = useState("");
  const [addCals,    setAddCals]    = useState("");
  const [addProtein, setAddProtein] = useState("");
  const [addCarbs,   setAddCarbs]   = useState("");
  const [addFat,     setAddFat]     = useState("");
  const [saving,     setSaving]     = useState(false);

  // ── new UI state ──────────────────────────────────────────────────────────
  const [showSearch,       setShowSearch]       = useState(false);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [searchMealTag,    setSearchMealTag]    = useState<MealTag>("Breakfast");
  const [selectedFood,     setSelectedFood]     = useState<FoodEntry | null>(null);
  const [showQty,          setShowQty]          = useState(false);
  const [qtyStr,           setQtyStr]           = useState("100");
  const [showSavedMeals,   setShowSavedMeals]   = useState(false);
  const [showWater,        setShowWater]        = useState(false);
  const [waterMl,          setWaterMl]          = useState(0);
  const [toast,            setToast]            = useState<string | null>(null);

  const searchInputRef = useRef<TextInput>(null);

  // Auto-open search modal on screen mount
  useEffect(() => {
    const t = setTimeout(() => setShowSearch(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (showSearch) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [showSearch]);

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

  // ── handlers (unchanged) ──────────────────────────────────────────────────
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
        calories: parseInt(addCals),
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

  function handleRelog(meal: typeof RECENT_MEALS[0]) {
    showToast(`${meal.name} added ✓`);
    // TODO: add to today's log
  }

  function openFoodResult(food: FoodEntry) {
    setSelectedFood(food);
    setQtyStr("100");
    setShowQty(true);
  }

  async function handleAddFoodFromSearch() {
    if (!selectedFood) return;
    const qty    = parseFloat(qtyStr) || 100;
    const ratio  = qty / 100;
    setSaving(true);
    try {
      await apiPost("/api/nutrition/food-items", {
        meal_tag:  searchMealTag,
        name:      selectedFood.name,
        calories:  Math.round(selectedFood.calories  * ratio),
        protein_g: Math.round(selectedFood.protein   * ratio * 10) / 10,
        carbs_g:   Math.round(selectedFood.carbs     * ratio * 10) / 10,
        fat_g:     Math.round(selectedFood.fat       * ratio * 10) / 10,
      });
      setShowQty(false);
      setShowSearch(false);
      setSearchQuery("");
      showToast(`${selectedFood.name} added ✓`);
      await fetchData();
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add.");
    } finally { setSaving(false); }
  }

  function handleLogWater(ml: number) {
    setWaterMl(prev => prev + ml);
    showToast(`${ml}ml logged ✓`);
    // TODO: save to health data
  }

  // ── derived values ─────────────────────────────────────────────────────────
  const todayLabel = (() => {
    const d = new Date();
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  })();

  const log   = data?.log;
  const goals = data?.goals;

  const calConsumed  = log?.calories_consumed ?? 0;
  const calGoal      = goals?.calorie_goal    ?? 0;
  const calPct       = calGoal > 0 ? Math.min(1, calConsumed / calGoal) : 0;
  const calRemaining = Math.max(0, calGoal - calConsumed);

  const foodItems = data?.foodItems ?? [];
  const sections  = TAGS.map(tag => {
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

  const searchResults = searchQuery.trim().length > 0
    ? FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : FOOD_DATABASE.slice(0, 5);

  const qtyRatio = (parseFloat(qtyStr) || 100) / 100;

  // ── clock button ───────────────────────────────────────────────────────────
  const ClockBtn = (
    <TouchableOpacity
      style={s.iconBtn}
      activeOpacity={0.7}
      onPress={() => setShowHistory(h => !h)}
    >
      <Ionicons name="time-outline" size={20} color={showHistory ? TEAL : "#374151"} />
    </TouchableOpacity>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <AppHeader title="Log Food" showBack rightElement={ClockBtn} />

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={TEAL} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {showHistory ? (
          /* ════════════ HISTORY VIEW (logic preserved) ════════════ */
          <View style={s.section}>
            <Text style={s.sectionTitle}>Food History</Text>
            {sections.length === 0 && MOCK_HISTORY.length === 0 ? (
              <View style={s.emptyWrap}>
                <Text style={s.emptyTitle}>No food logged yet</Text>
                <Text style={s.emptySub}>Tap the clock icon to go back and log</Text>
              </View>
            ) : (
              <>
                {sections.map(section => {
                  const tc = TAG_COLORS[section.tag] ?? { color: TEAL, bg: "rgba(45,212,191,0.08)" };
                  return (
                    <View key={section.tag} style={s.historySection}>
                      <View style={[s.histSectionHeader, { borderLeftColor: tc.color }]}>
                        <Text style={s.histSectionEmoji}>{MEAL_EMOJIS[section.tag] ?? "🍽️"}</Text>
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
                                    <View style={s.ingredientLeft}>
                                      <Text style={s.ingredientName}>{item.name}</Text>
                                      <Text style={s.ingredientMacros}>
                                        {+item.calories.toFixed(0)} kcal · P {+item.protein_g.toFixed(1)}g · C {+item.carbs_g.toFixed(1)}g · F {+item.fat_g.toFixed(1)}g
                                      </Text>
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

                <Text style={[s.sectionTitle, { marginTop: 20 }]}>Past Days</Text>
                {MOCK_HISTORY.map(day => {
                  const total = day.protein + day.carbs + day.fat || 1;
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
                      <View style={s.histMacroLabels}>
                        <Text style={[s.histMacroLbl, { color: "#22C55E" }]}>P {day.protein}g</Text>
                        <Text style={[s.histMacroLbl, { color: "#F59E0B" }]}>C {day.carbs}g</Text>
                        <Text style={[s.histMacroLbl, { color: "#8B5CF6" }]}>F {day.fat}g</Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        ) : (
          /* ════════════ MAIN LOG VIEW ════════════ */
          <>
            {/* ── Search bar ── */}
            <TouchableOpacity
              style={s.searchBar}
              activeOpacity={0.85}
              onPress={() => setShowSearch(true)}
            >
              <Ionicons name="search" size={22} color={TEAL} />
              <Text style={s.searchPlaceholder}>Search food, meals, recipes...</Text>
              <TouchableOpacity
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={() => Alert.alert("Coming Soon", "Barcode scanner — TODO: integrate Open Food Facts API")}
              >
                <Ionicons name="barcode-outline" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* ── Progress card ── */}
            {log && goals && (
              <View style={s.progressCard}>
                <View style={s.calRow}>
                  <View style={s.calLeft}>
                    <Text style={s.calBig}>{calConsumed.toLocaleString()}</Text>
                    <Text style={s.calGoal}>/ {calGoal.toLocaleString()} kcal</Text>
                  </View>
                  <View style={s.remainBadge}>
                    <Text style={s.remainText}>{calRemaining.toLocaleString()} left</Text>
                  </View>
                </View>
                <View style={s.barTrack}>
                  <LinearGradient
                    colors={["#2DD4BF", "#38BDF8"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[s.barFill, { width: `${Math.round(calPct * 100)}%` as DimensionValue }]}
                  />
                </View>
                <View style={s.macroRow}>
                  <View style={s.macroItem}>
                    <Text style={[s.macroVal, { color: "#22C55E" }]}>{+log.protein_g.toFixed(0)}g</Text>
                    <Text style={s.macroLbl}>Protein</Text>
                  </View>
                  <View style={s.macroDivider} />
                  <View style={s.macroItem}>
                    <Text style={[s.macroVal, { color: "#F59E0B" }]}>{+log.carbs_g.toFixed(0)}g</Text>
                    <Text style={s.macroLbl}>Carbs</Text>
                  </View>
                  <View style={s.macroDivider} />
                  <View style={s.macroItem}>
                    <Text style={[s.macroVal, { color: "#8B5CF6" }]}>{+log.fat_g.toFixed(0)}g</Text>
                    <Text style={s.macroLbl}>Fat</Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── Quick Action Tiles ── */}
            <View style={s.tilesGrid}>
              {/* Scan Meal */}
              <TouchableOpacity
                style={[s.tile, { borderColor: "rgba(45,212,191,0.2)" }]}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: "/nutrition/photo-confirm", params: { mode: "camera" } } as any)}
              >
                <View style={[s.tileIcon, { backgroundColor: "rgba(45,212,191,0.1)" }]}>
                  <Ionicons name="camera-outline" size={28} color={TEAL} />
                </View>
                <View>
                  <Text style={s.tileName}>Scan Meal</Text>
                  <Text style={s.tileSub}>AI powered</Text>
                </View>
              </TouchableOpacity>

              {/* Barcode */}
              <TouchableOpacity
                style={[s.tile, { borderColor: "rgba(99,102,241,0.15)" }]}
                activeOpacity={0.8}
                onPress={() => Alert.alert("Coming Soon", "Barcode scanner — TODO: integrate Open Food Facts API")}
              >
                <View style={[s.tileIcon, { backgroundColor: "rgba(99,102,241,0.1)" }]}>
                  <Ionicons name="barcode-outline" size={28} color="#6366F1" />
                </View>
                <View>
                  <Text style={s.tileName}>Scan Barcode</Text>
                  <Text style={s.tileSub}>Packaged food</Text>
                </View>
              </TouchableOpacity>

              {/* My Meals */}
              <TouchableOpacity
                style={[s.tile, { borderColor: "rgba(245,158,11,0.15)" }]}
                activeOpacity={0.8}
                onPress={() => setShowSavedMeals(true)}
              >
                <View style={[s.tileIcon, { backgroundColor: "rgba(245,158,11,0.1)" }]}>
                  <Ionicons name="bookmark-outline" size={28} color="#F59E0B" />
                </View>
                <View>
                  <Text style={s.tileName}>My Meals</Text>
                  <Text style={s.tileSub}>Saved favourites</Text>
                </View>
              </TouchableOpacity>

              {/* Log Water */}
              <TouchableOpacity
                style={[s.tile, { borderColor: "rgba(56,189,248,0.15)" }]}
                activeOpacity={0.8}
                onPress={() => setShowWater(true)}
              >
                <View style={[s.tileIcon, { backgroundColor: "rgba(56,189,248,0.1)" }]}>
                  <Ionicons name="water-outline" size={28} color="#38BDF8" />
                </View>
                <View>
                  <Text style={s.tileName}>Log Water</Text>
                  <Text style={s.tileSub}>{waterMl > 0 ? `${waterMl}ml today` : "Track hydration"}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ── Recent Meals ── */}
            <View style={s.relogHeader}>
              <Text style={s.relogTitle}>Recent Meals</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={s.relogSeeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.relogSub}>Tap to log again instantly</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.relogRow}
            >
              {RECENT_MEALS.map((meal, idx) => (
                <TouchableOpacity
                  key={meal.name}
                  style={[s.relogCard, idx === 0 && { marginLeft: 16 }]}
                  activeOpacity={0.8}
                  onPress={() => handleRelog(meal)}
                >
                  <Text style={s.relogEmoji}>{meal.emoji}</Text>
                  <Text style={s.relogName} numberOfLines={1}>{meal.name}</Text>
                  <Text style={s.relogCal}>{meal.calories} kcal</Text>
                  <Text style={s.relogAction}>+ Log again</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ════════════ FOOD SEARCH MODAL ════════════ */}
      <Modal visible={showSearch} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setShowSearch(false)}>
        <SafeAreaView style={s.modalSafe}>
          {/* Modal header */}
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(""); }} style={s.modalClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <TextInput
              ref={searchInputRef}
              style={s.modalSearchInput}
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
              <TouchableOpacity onPress={() => setSearchQuery("")} style={s.modalClearBtn}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Meal tag pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tagPillRow}
          >
            {TAGS.map(tag => {
              const tc     = TAG_COLORS[tag];
              const active = searchMealTag === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setSearchMealTag(tag)}
                  style={[s.tagPill, active && { backgroundColor: tc.color, borderColor: tc.color }]}
                  activeOpacity={0.75}
                >
                  <Text style={[s.tagPillText, active && { color: "#fff" }]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Results */}
          <ScrollView
            contentContainerStyle={s.resultsScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.resultsLabel}>
              {searchQuery.trim() ? `Results for "${searchQuery}"` : "Popular Foods"}
            </Text>

            {searchResults.length === 0 && (
              <View style={s.noResults}>
                <Text style={s.noResultsText}>No foods found for "{searchQuery}"</Text>
                <Text style={s.noResultsSub}>Try a different name, or create a custom food below</Text>
              </View>
            )}

            {searchResults.map((food, idx) => (
              <View key={idx} style={s.resultRow}>
                <View style={s.resultLeft}>
                  <Text style={s.resultName}>{food.name}</Text>
                  <Text style={s.resultMeta}>{food.calories} cal · {food.protein}g protein</Text>
                </View>
                <TouchableOpacity style={s.addCircle} activeOpacity={0.8} onPress={() => openFoodResult(food)}>
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Create custom food */}
            <TouchableOpacity
              style={s.createCustom}
              activeOpacity={0.8}
              onPress={() => { setShowSearch(false); setSearchQuery(""); setShowAdd(true); }}
            >
              <Ionicons name="create-outline" size={18} color="#64748B" />
              <Text style={s.createCustomText}>Create custom food...</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ════════════ QUANTITY SHEET ════════════ */}
      <Modal visible={showQty} transparent animationType="slide" onRequestClose={() => setShowQty(false)}>
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <Text style={s.sheetTitle}>{selectedFood?.name ?? ""}</Text>
            <Text style={s.sheetSub}>Adding to {searchMealTag}</Text>

            <View style={s.qtyRow}>
              <TextInput
                style={s.qtyInput}
                value={qtyStr}
                onChangeText={setQtyStr}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
              <Text style={s.qtyUnit}>g / ml</Text>
            </View>

            {/* Live macro preview */}
            {selectedFood && (
              <View style={s.qtyPreview}>
                <View style={s.qtyPreviewItem}>
                  <Text style={s.qtyPreviewVal}>{Math.round(selectedFood.calories * qtyRatio)}</Text>
                  <Text style={s.qtyPreviewLbl}>kcal</Text>
                </View>
                <View style={s.qtyPreviewItem}>
                  <Text style={[s.qtyPreviewVal, { color: "#22C55E" }]}>{(selectedFood.protein * qtyRatio).toFixed(1)}g</Text>
                  <Text style={s.qtyPreviewLbl}>protein</Text>
                </View>
                <View style={s.qtyPreviewItem}>
                  <Text style={[s.qtyPreviewVal, { color: "#F59E0B" }]}>{(selectedFood.carbs * qtyRatio).toFixed(1)}g</Text>
                  <Text style={s.qtyPreviewLbl}>carbs</Text>
                </View>
                <View style={s.qtyPreviewItem}>
                  <Text style={[s.qtyPreviewVal, { color: "#8B5CF6" }]}>{(selectedFood.fat * qtyRatio).toFixed(1)}g</Text>
                  <Text style={s.qtyPreviewLbl}>fat</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleAddFoodFromSearch}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Text style={s.saveBtnText}>{saving ? "Adding…" : "Add to Log"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowQty(false)} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ════════════ SAVED MEALS SHEET ════════════ */}
      <Modal visible={showSavedMeals} transparent animationType="slide" onRequestClose={() => setShowSavedMeals(false)}>
        <View style={s.overlay}>
          <View style={[s.sheet, { paddingBottom: 40 }]}>
            <View style={s.handle} />
            <Text style={s.sheetTitle}>My Meals</Text>
            <Text style={s.sheetSub}>Your saved favourites</Text>
            <View style={s.savedEmpty}>
              <Text style={s.savedEmoji}>🔖</Text>
              <Text style={s.savedEmptyTitle}>No saved meals yet</Text>
              <Text style={s.savedEmptySub}>After logging a meal, tap ··· to save it here for quick access next time</Text>
            </View>
            <TouchableOpacity onPress={() => setShowSavedMeals(false)} style={s.cancelBtn}>
              <Text style={s.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ════════════ WATER SHEET ════════════ */}
      <Modal visible={showWater} transparent animationType="slide" onRequestClose={() => setShowWater(false)}>
        <View style={s.overlay}>
          <View style={[s.sheet, { paddingBottom: 40 }]}>
            <View style={s.handle} />
            <Text style={s.sheetTitle}>Log Water</Text>
            <Text style={s.sheetSub}>{waterMl > 0 ? `${waterMl}ml logged today` : "Track your daily hydration"}</Text>
            <View style={s.waterGrid}>
              {WATER_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.ml}
                  style={s.waterBtn}
                  activeOpacity={0.8}
                  onPress={() => handleLogWater(opt.ml)}
                >
                  <Ionicons name="water-outline" size={22} color="#38BDF8" />
                  <Text style={s.waterBtnLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setShowWater(false)} style={s.cancelBtn}>
              <Text style={s.cancelText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ════════════ MANUAL ADD SHEET (unchanged) ════════════ */}
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
              style={[s.saveBtn, { opacity: !addName || !addCals ? 0.5 : 1 }]}
            >
              <Text style={s.saveBtnText}>{saving ? "Saving…" : "Save"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAdd(false)} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Toast ── */}
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
  safe:   { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 40 },

  // Header icon btn
  iconBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.75)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },

  // ── Search bar ─────────────────────────────────────────────────────────────
  searchBar: {
    marginHorizontal: 16, marginTop: 8, marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20, borderWidth: 1.5, borderColor: "rgba(45,212,191,0.3)",
    paddingHorizontal: 18, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", gap: 12,
    shadowColor: "#2DD4BF", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  searchPlaceholder: { fontSize: 16, color: "#94A3B8", flex: 1 },

  // ── Progress card ──────────────────────────────────────────────────────────
  progressCard: { marginHorizontal: 16, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 20, padding: 16, shadowColor: "#B0C4D8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 3 },
  calRow:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  calLeft:     { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  calBig:      { fontSize: 36, fontWeight: "800", color: "#1E293B", lineHeight: 40 },
  calGoal:     { fontSize: 14, color: "#94A3B8", lineHeight: 24, marginBottom: 4 },
  remainBadge: { backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(200,220,240,0.6)" },
  remainText:  { fontSize: 13, fontWeight: "700", color: TEAL },
  barTrack:    { height: 5, borderRadius: 3, backgroundColor: "rgba(45,212,191,0.12)", overflow: "hidden", marginBottom: 14 },
  barFill:     { height: 5, borderRadius: 3 },
  macroRow:    { flexDirection: "row", alignItems: "center" },
  macroItem:   { flex: 1, alignItems: "center" },
  macroVal:    { fontSize: 16, fontWeight: "700" },
  macroLbl:    { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  macroDivider:{ width: 1, height: 24, backgroundColor: "#F1F5F9" },

  // ── Tiles ──────────────────────────────────────────────────────────────────
  tilesGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: 16, marginTop: 16, gap: 12 },
  tile: {
    width: "47%", aspectRatio: 1.6,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20, borderWidth: 1.5, padding: 16,
    justifyContent: "space-between", alignItems: "flex-start",
    shadowColor: "#B0C4D8", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 2,
  },
  tileIcon:  { borderRadius: 12, padding: 8 },
  tileName:  { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  tileSub:   { fontSize: 11, color: "#94A3B8", marginTop: 2 },

  // ── Recent meals ───────────────────────────────────────────────────────────
  relogHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 16, marginTop: 22 },
  relogTitle:  { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  relogSeeAll: { fontSize: 13, color: TEAL },
  relogSub:    { fontSize: 12, color: "#94A3B8", marginLeft: 16, marginTop: 2, marginBottom: 10 },
  relogRow:    { paddingRight: 16, paddingBottom: 4 },
  relogCard: {
    width: 130, backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20, padding: 14, marginRight: 10, alignItems: "center",
    shadowColor: "#B0C4D8", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 2,
  },
  relogEmoji:  { fontSize: 32, marginBottom: 8 },
  relogName:   { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  relogCal:    { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  relogAction: { fontSize: 12, color: TEAL, fontWeight: "600", marginTop: 8 },

  // ── History ────────────────────────────────────────────────────────────────
  section:         { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  sectionTitle:    { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  emptyWrap:       { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle:      { fontSize: 17, fontWeight: "700", color: "#1C1C1E" },
  emptySub:        { fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingHorizontal: 40 },
  historySection:  { gap: 6, marginTop: 4 },
  histSectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, borderLeftWidth: 3, paddingLeft: 10, marginBottom: 4 },
  histSectionEmoji:  { fontSize: 14 },
  histSectionTitle:  { fontSize: 13, fontWeight: "800", flex: 1 },
  histDate:          { fontSize: 11, color: "#9CA3AF" },
  dishCard:        { borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", borderLeftWidth: 3, backgroundColor: "rgba(255,255,255,0.9)", overflow: "hidden" },
  dishRow:         { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  dishMid:         { flex: 1 },
  dishName:        { fontSize: 14, fontWeight: "700", color: "#1C1C1E", marginBottom: 2 },
  dishMeta:        { fontSize: 11, color: "#9CA3AF" },
  dishActions:     { flexDirection: "row", alignItems: "center", gap: 4 },
  expandBtn:       { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  expandText:      { fontSize: 10, fontWeight: "700", color: "#9CA3AF" },
  ingredientList:  { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB", paddingHorizontal: 14, paddingBottom: 6 },
  ingredientRow:   { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  ingredientLeft:  { flex: 1 },
  ingredientName:  { fontSize: 12, fontWeight: "600", color: "#1C1C1E", marginBottom: 1 },
  ingredientMacros:{ fontSize: 11, color: "#9CA3AF" },
  deleteBtn:       { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239,68,68,0.08)" },
  deleteText:      { fontSize: 18, fontWeight: "700", color: "#EF4444" },
  histDayCard:     { backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 16, padding: 14, shadowColor: "#B0C4D8", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 },
  histDayTop:      { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  histDayDate:     { flex: 1, fontSize: 14, fontWeight: "600", color: "#1E293B" },
  histDayCal:      { fontSize: 14, fontWeight: "700", color: "#1E293B", marginRight: 6 },
  histChevron:     { fontSize: 18, color: "#94A3B8" },
  histMacroBar:    { flexDirection: "row", height: 5, borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  histMacroSeg:    { height: 5 },
  histMacroLabels: { flexDirection: "row", gap: 12 },
  histMacroLbl:    { fontSize: 11, fontWeight: "600" },

  // ── Food search modal ──────────────────────────────────────────────────────
  modalSafe:        { flex: 1, backgroundColor: "#F8FAFB" },
  modalHeader:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  modalClose:       { padding: 4 },
  modalSearchInput: { flex: 1, fontSize: 18, color: "#1E293B", fontWeight: "500", paddingVertical: 4, borderBottomWidth: 2, borderBottomColor: TEAL },
  modalClearBtn:    { padding: 4 },
  tagPillRow:       { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tagPill:          { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, borderColor: "#E2E8F0", backgroundColor: "transparent" },
  tagPillText:      { fontSize: 13, fontWeight: "600", color: "#64748B" },
  resultsScroll:    { paddingHorizontal: 16, paddingBottom: 60 },
  resultsLabel:     { fontSize: 12, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.6, marginTop: 8, marginBottom: 12, textTransform: "uppercase" },
  resultRow:        { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 12 },
  resultLeft:       { flex: 1 },
  resultName:       { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  resultMeta:       { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  addCircle:        { width: 36, height: 36, borderRadius: 18, backgroundColor: TEAL, alignItems: "center", justifyContent: "center" },
  noResults:        { alignItems: "center", paddingVertical: 32, gap: 8 },
  noResultsText:    { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  noResultsSub:     { fontSize: 13, color: "#94A3B8", textAlign: "center" },
  createCustom:     { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 18, marginTop: 4 },
  createCustomText: { fontSize: 14, color: "#64748B", fontWeight: "500" },

  // ── Quantity sheet ─────────────────────────────────────────────────────────
  qtyRow:         { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F8FAFC", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  qtyInput:       { flex: 1, fontSize: 24, fontWeight: "700", color: "#1E293B", textAlign: "center" },
  qtyUnit:        { fontSize: 14, color: "#94A3B8" },
  qtyPreview:     { flexDirection: "row", backgroundColor: "#F8FAFC", borderRadius: 14, padding: 14, gap: 4 },
  qtyPreviewItem: { flex: 1, alignItems: "center" },
  qtyPreviewVal:  { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  qtyPreviewLbl:  { fontSize: 10, color: "#94A3B8", marginTop: 2 },

  // ── Saved meals / water sheets ────────────────────────────────────────────
  savedEmpty:      { alignItems: "center", paddingVertical: 32, gap: 8 },
  savedEmoji:      { fontSize: 40 },
  savedEmptyTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  savedEmptySub:   { fontSize: 13, color: "#94A3B8", textAlign: "center", paddingHorizontal: 20 },
  waterGrid:       { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  waterBtn:        { width: "47%", backgroundColor: "rgba(56,189,248,0.08)", borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(56,189,248,0.2)", paddingVertical: 16, alignItems: "center", gap: 6 },
  waterBtnLabel:   { fontSize: 15, fontWeight: "600", color: "#1E293B" },

  // ── Shared sheet styles ───────────────────────────────────────────────────
  overlay:       { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet:         { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12 },
  handle:        { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  sheetTitle:    { fontSize: 20, fontWeight: "800", color: "#1C1C1E" },
  sheetSub:      { fontSize: 13, color: "#94A3B8", marginTop: -6 },
  tagRow:        { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  tagChipLabel:  { fontSize: 12, fontWeight: "700" },
  input:         { backgroundColor: BG, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#1C1C1E", borderWidth: 1, borderColor: "#E5E7EB" },
  twoCol:        { flexDirection: "row", gap: 8 },
  saveBtn:       { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  saveBtnText:   { color: "#fff", fontWeight: "800", fontSize: 16 },
  cancelBtn:     { alignItems: "center", paddingVertical: 8 },
  cancelText:    { color: "#9CA3AF", fontWeight: "600", fontSize: 14 },

  // Toast
  toast:     { position: "absolute", bottom: 48, alignSelf: "center", backgroundColor: "rgba(30,41,59,0.9)", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12 },
  toastText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
