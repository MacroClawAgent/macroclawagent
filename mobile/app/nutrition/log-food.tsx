import React, { useEffect, useRef, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Modal, Platform,
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
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  lastLogged?: string;
  timesLogged?: number;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const INITIAL_PREVIOUS_DISHES: DishEntry[] = [
  { name: "Chicken Rice Bowl",    emoji: "🍗", calories: 520, protein: 48, carbs: 52, fat: 12, lastLogged: "Yesterday, Lunch",   timesLogged: 8  },
  { name: "Greek Yogurt Parfait", emoji: "🥣", calories: 420, protein: 22, carbs: 58, fat: 10, lastLogged: "Today, Breakfast",   timesLogged: 12 },
  { name: "Salmon & Sweet Potato",emoji: "🐟", calories: 580, protein: 44, carbs: 48, fat: 18, lastLogged: "Mon, Dinner",        timesLogged: 5  },
  { name: "Protein Shake",        emoji: "🥛", calories: 280, protein: 28, carbs: 32, fat: 4,  lastLogged: "Today, Snack",       timesLogged: 24 },
  { name: "Beef Rice Bowl",       emoji: "🥩", calories: 580, protein: 42, carbs: 55, fat: 16, lastLogged: "Yesterday, Dinner",  timesLogged: 3  },
  { name: "Avocado Toast & Eggs", emoji: "🥑", calories: 480, protein: 24, carbs: 42, fat: 24, lastLogged: "Sun, Breakfast",     timesLogged: 6  },
];

const DISH_DATABASE: DishEntry[] = [
  { name: "Scrambled Eggs on Toast",  emoji: "🍳", calories: 380, protein: 22, carbs: 38, fat: 16 },
  { name: "Chicken Caesar Salad",     emoji: "🥗", calories: 420, protein: 36, carbs: 18, fat: 24 },
  { name: "Beef Burger",              emoji: "🍔", calories: 650, protein: 38, carbs: 52, fat: 28 },
  { name: "Pasta Bolognese",          emoji: "🍝", calories: 580, protein: 28, carbs: 72, fat: 18 },
  { name: "Fish & Chips",             emoji: "🐟", calories: 720, protein: 32, carbs: 82, fat: 28 },
  { name: "Sushi Roll (8 pieces)",    emoji: "🍣", calories: 320, protein: 16, carbs: 58, fat: 4  },
  { name: "Steak & Vegetables",       emoji: "🥩", calories: 520, protein: 52, carbs: 22, fat: 24 },
  { name: "Chicken Wrap",             emoji: "🌯", calories: 480, protein: 38, carbs: 48, fat: 14 },
  { name: "Poke Bowl",                emoji: "🍱", calories: 490, protein: 36, carbs: 58, fat: 12 },
  { name: "Pad Thai",                 emoji: "🍜", calories: 620, protein: 24, carbs: 78, fat: 22 },
  { name: "Acai Bowl",                emoji: "🫐", calories: 380, protein: 8,  carbs: 72, fat: 10 },
  { name: "Omelette",                 emoji: "🍳", calories: 320, protein: 24, carbs: 4,  fat: 22 },
  { name: "Grilled Chicken Salad",    emoji: "🥗", calories: 360, protein: 42, carbs: 18, fat: 14 },
  { name: "Overnight Oats",           emoji: "🥣", calories: 380, protein: 16, carbs: 62, fat: 10 },
  { name: "Smoothie Bowl",            emoji: "🫐", calories: 340, protein: 12, carbs: 64, fat: 8  },
  { name: "Bacon & Eggs",             emoji: "🥓", calories: 480, protein: 32, carbs: 4,  fat: 36 },
  { name: "Chicken Schnitzel",        emoji: "🍗", calories: 560, protein: 44, carbs: 38, fat: 22 },
  { name: "Lamb Souvlaki",            emoji: "🥙", calories: 520, protein: 36, carbs: 48, fat: 18 },
  { name: "Laksa",                    emoji: "🍜", calories: 580, protein: 28, carbs: 62, fat: 24 },
  { name: "Nasi Goreng",              emoji: "🍳", calories: 540, protein: 22, carbs: 68, fat: 18 },
];

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
const MOCK_HISTORY = [
  { date: "Yesterday",  calories: 2100, protein: 168, carbs: 210, fat: 58 },
  { date: "Sun 16 Mar", calories: 1840, protein: 142, carbs: 195, fat: 52 },
  { date: "Sat 15 Mar", calories: 2450, protein: 185, carbs: 240, fat: 72 },
];
const MEAL_EMOJIS: Record<string, string> = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙", Snack: "🍎" };

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function LogFoodScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [mealTag,    setMealTag]    = useState<MealTag>(defaultMealTag);
  const [query,      setQuery]      = useState("");
  const [toast,      setToast]      = useState<string | null>(null);
  const [showHistory,setShowHistory]= useState(false);

  // Previous dishes (starts with mock, grows as user adds)
  const [previousDishes, setPreviousDishes] = useState<DishEntry[]>(INITIAL_PREVIOUS_DISHES);

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
      });
      // Add to previousDishes if not already there
      setPreviousDishes(prev =>
        prev.some(d => d.name === selectedDish.name) ? prev : [
          { ...selectedDish, lastLogged: `Today, ${mealTag}`, timesLogged: 1 },
          ...prev,
        ]
      );
      setShowQty(false);
      showToast(`${selectedDish.name} added to ${mealTag} ✓`);
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add.");
    } finally { setSaving(false); }
  }

  // ── Custom dish ────────────────────────────────────────────────────────────
  function openCustom(prefillName = "") {
    setCustomName(prefillName);
    setCustomCals(""); setCustomProtein(""); setCustomCarbs(""); setCustomFat("");
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
      });
      const newDish: DishEntry = {
        name: customName, emoji: "🍽️",
        calories: parseInt(customCals),
        protein: parseFloat(customProtein || "0"),
        carbs:   parseFloat(customCarbs   || "0"),
        fat:     parseFloat(customFat     || "0"),
        lastLogged: `Today, ${mealTag}`, timesLogged: 1,
      };
      setPreviousDishes(prev => [newDish, ...prev]);
      setShowCustom(false);
      showToast(`${customName} added to ${mealTag} ✓`);
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to save.");
    } finally { setSavingCustom(false); }
  }

  // ── Search / filter ────────────────────────────────────────────────────────
  const trimmed    = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;

  const filteredPrev = isSearching
    ? previousDishes.filter(d => d.name.toLowerCase().includes(trimmed))
    : previousDishes;

  const filteredDB = isSearching
    ? DISH_DATABASE.filter(d =>
        d.name.toLowerCase().includes(trimmed) &&
        !previousDishes.some(p => p.name === d.name)
      )
    : [];

  const combinedResults = [...filteredPrev, ...filteredDB];
  const noResults = isSearching && combinedResults.length === 0;

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
                <Text style={s.histSectionEmoji}>{MEAL_EMOJIS[section.tag]}</Text>
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
                  <View style={[s.histMacroSeg, { flex: day.protein / total, backgroundColor: CORAL }]} />
                  <View style={[s.histMacroSeg, { flex: day.carbs   / total, backgroundColor: GOLD  }]} />
                  <View style={[s.histMacroSeg, { flex: day.fat     / total, backgroundColor: "rgba(232,224,208,0.3)" }]} />
                </View>
                <View style={s.histMacroLbls}>
                  <Text style={[s.histMacroLbl, { color: CORAL }]}>P {day.protein}g</Text>
                  <Text style={[s.histMacroLbl, { color: GOLD  }]}>C {day.carbs}g</Text>
                  <Text style={[s.histMacroLbl, { color: MUTED }]}>F {day.fat}g</Text>
                </View>
              </View>
            );
          })}
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
            {noResults ? (
              <View style={s.emptyState}>
                <Text style={s.emptyEmoji}>🍽️</Text>
                <Text style={s.emptyTitle}>No dishes found for "{query.trim()}"</Text>
                <TouchableOpacity onPress={() => openCustom(query.trim())} style={s.emptyLink}>
                  <Text style={s.emptyLinkText}>+ Add "{query.trim()}" as custom dish</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={s.sectionLabel}>{isSearching ? "RESULTS" : "YOUR DISHES"}</Text>

                {combinedResults.map((d, idx) => (
                  <View key={`${d.name}-${idx}`} style={s.dishRow2}>
                    {/* Emoji circle */}
                    <View style={s.dishEmoji}>
                      <Text style={{ fontSize: 22 }}>{d.emoji}</Text>
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                      <Text style={s.dishTitle}>{d.name}</Text>
                      <View style={s.dishMacroRow}>
                        <Text style={s.dishCal}>{d.calories} cal</Text>
                        <Text style={s.dishDot}> · </Text>
                        <Text style={s.dishProt}>{d.protein}g protein</Text>
                        {d.lastLogged && (
                          <Text style={s.dishLastLog} numberOfLines={1}>{d.lastLogged.split(",")[0]}</Text>
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
              <Text style={s.qtyDishName}>{dish?.emoji} {dish?.name}</Text>

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
  headerBackText: { fontSize: 16, color: CREAM, fontWeight: "500", fontFamily: "BebasNeue_400Regular" },
  headerTitle:    { fontSize: 18, fontWeight: "700", color: CREAM, fontFamily: "BebasNeue_400Regular" },
  headerRight:    { minWidth: 64, alignItems: "flex-end" },

  // ── Meal pills ───────────────────────────────────────────────────────────────
  pillRow:        { flexDirection: "row", marginHorizontal: 16, marginTop: 16, marginBottom: 0, gap: 8, height: 38 },
  pill:           { flex: 1, height: 38, paddingHorizontal: 20, paddingVertical: 0, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(232,224,208,0.08)", borderWidth: 1, borderColor: "rgba(232,224,208,0.12)" },
  pillActive:     { backgroundColor: GOLD, borderColor: GOLD },
  pillText:       { fontSize: 14, fontWeight: "600", color: "rgba(232,224,208,0.45)", fontFamily: "BebasNeue_400Regular" },
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
  photoBtnTitle:     { fontSize: 15, fontWeight: "700", color: DARK_TXT, fontFamily: "BebasNeue_400Regular" },
  photoBtnSub:       { fontSize: 11, color: "rgba(28,22,18,0.65)", fontFamily: "BebasNeue_400Regular" },
  photoBtnTitleLight:{ fontSize: 15, fontWeight: "700", color: CREAM, fontFamily: "BebasNeue_400Regular" },
  photoBtnSubLight:  { fontSize: 11, color: "rgba(232,224,208,0.4)", fontFamily: "BebasNeue_400Regular" },

  // ── Search bar ───────────────────────────────────────────────────────────────
  searchBox: {
    marginHorizontal: 16, marginTop: 20,
    backgroundColor: CARD, borderRadius: 18,
    borderWidth: 1.5, borderColor: "rgba(248,213,97,0.2)",
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  searchInput: { flex: 1, fontSize: 16, color: CREAM, backgroundColor: "transparent", fontFamily: "BebasNeue_400Regular" },

  // ── Dish list ────────────────────────────────────────────────────────────────
  listContent:  { paddingBottom: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "rgba(232,224,208,0.4)",
    letterSpacing: 1.2, marginLeft: 20, marginTop: 24, marginBottom: 12,
    fontFamily: "BebasNeue_400Regular",
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
  dishTitle:   { fontSize: 15, fontWeight: "600", color: CREAM, fontFamily: "BebasNeue_400Regular" },
  dishMacroRow:{ flexDirection: "row", alignItems: "center", marginTop: 3, flexWrap: "nowrap" },
  dishCal:     { fontSize: 12, fontWeight: "600", color: GOLD, fontFamily: "BebasNeue_400Regular" },
  dishDot:     { fontSize: 12, color: "rgba(232,224,208,0.3)", fontFamily: "BebasNeue_400Regular" },
  dishProt:    { fontSize: 12, color: CORAL, fontFamily: "BebasNeue_400Regular" },
  dishLastLog: { fontSize: 11, color: "rgba(232,224,208,0.3)", marginLeft: "auto" as const, fontFamily: "BebasNeue_400Regular" },
  addCircle:   { width: 36, height: 36, borderRadius: 18, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },

  // ── Empty state ──────────────────────────────────────────────────────────────
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 4 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: CREAM, marginTop: 12, textAlign: "center", fontFamily: "BebasNeue_400Regular" },
  emptyLink:  { marginTop: 8 },
  emptyLinkText: { fontSize: 14, color: GOLD, fontFamily: "BebasNeue_400Regular" },

  // ── Create custom ────────────────────────────────────────────────────────────
  createCustom:    { alignItems: "center", paddingVertical: 20 },
  createCustomText:{ fontSize: 14, color: GOLD, fontFamily: "BebasNeue_400Regular" },

  // ── Quantity sheet ───────────────────────────────────────────────────────────
  overlay:     { flex: 1, justifyContent: "flex-end" },
  qtySheet:    { backgroundColor: CARD, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16 },
  handle:      { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(232,224,208,0.15)", alignSelf: "center", marginBottom: 4 },
  qtyDishName: { fontSize: 18, fontWeight: "700", color: CREAM, fontFamily: "BebasNeue_400Regular" },
  qtyServingHint: { fontSize: 13, color: MUTED, fontFamily: "BebasNeue_400Regular" },
  servingRow:  { flexDirection: "row", gap: 12 },
  servingPill: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20,
    backgroundColor: "rgba(232,224,208,0.08)", borderWidth: 1, borderColor: "rgba(232,224,208,0.15)",
  },
  servingPillActive: { backgroundColor: GOLD, borderColor: GOLD },
  servingText:       { fontSize: 15, fontWeight: "600", color: CREAM, fontFamily: "BebasNeue_400Regular" },
  servingTextActive: { color: DARK_TXT },

  // Macro preview
  qtyPreview:     { flexDirection: "row", backgroundColor: "rgba(232,224,208,0.04)", borderRadius: 16, padding: 16 },
  qtyMacroItem:   { flex: 1, alignItems: "center", gap: 4 },
  qtyMacroVal:    { fontSize: 20, fontWeight: "700", fontFamily: "BebasNeue_400Regular" },
  qtyMacroLbl:    { fontSize: 11, color: MUTED, fontFamily: "BebasNeue_400Regular" },
  qtyMacroDivider:{ width: 1, backgroundColor: "rgba(232,224,208,0.08)", marginVertical: 4 },

  addToLogBtn:  { backgroundColor: GOLD, borderRadius: 22, paddingVertical: 16, alignItems: "center" },
  addToLogText: { fontSize: 16, fontWeight: "700", color: DARK_TXT, fontFamily: "BebasNeue_400Regular" },

  // ── Custom dish inputs ────────────────────────────────────────────────────────
  customInput: {
    backgroundColor: "rgba(232,224,208,0.06)", borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: CREAM,
    fontFamily: "BebasNeue_400Regular",
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
  toastText: { fontSize: 14, fontWeight: "600", color: CREAM, fontFamily: "BebasNeue_400Regular" },

  // ── History view ─────────────────────────────────────────────────────────────
  histScroll:       { padding: 16, paddingBottom: 60 },
  histHeading:      { fontSize: 18, fontWeight: "700", color: CREAM, marginBottom: 12, fontFamily: "BebasNeue_400Regular" },
  histEmpty:        { alignItems: "center", paddingVertical: 40 },
  histEmptyText:    { fontSize: 15, color: MUTED, fontFamily: "BebasNeue_400Regular" },
  histSection:      { marginBottom: 16 },
  histSectionHead:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, paddingLeft: 4 },
  histSectionEmoji: { fontSize: 16 },
  histSectionTitle: { fontSize: 15, fontWeight: "700", color: GOLD, fontFamily: "BebasNeue_400Regular" },
  histDate:         { fontSize: 12, color: MUTED, marginLeft: "auto" as const, fontFamily: "BebasNeue_400Regular" },
  dishCard: {
    backgroundColor: CARD, borderRadius: 14, marginBottom: 6,
    borderWidth: 1, borderColor: BORDER, overflow: "hidden",
  },
  dishRow:     { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  dishName:    { fontSize: 15, fontWeight: "600", color: CREAM, fontFamily: "BebasNeue_400Regular" },
  dishMeta:    { fontSize: 12, color: MUTED, marginTop: 2, fontFamily: "BebasNeue_400Regular" },
  dishActions: { flexDirection: "row", gap: 8 },
  expandBtn:   { padding: 6 },
  expandText:  { fontSize: 12, color: MUTED, fontFamily: "BebasNeue_400Regular" },
  deleteBtn:   { padding: 6 },
  deleteText:  { fontSize: 20, color: CORAL, lineHeight: 22, fontFamily: "BebasNeue_400Regular" },
  ingredientList: { borderTopWidth: 1, borderTopColor: "rgba(232,224,208,0.06)", paddingHorizontal: 14, paddingBottom: 8 },
  ingredientRow:  { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(232,224,208,0.04)", gap: 8 },
  ingredientName: { fontSize: 13, color: CREAM, fontFamily: "BebasNeue_400Regular" },
  ingredientMacros:{ fontSize: 11, color: MUTED, marginTop: 1, fontFamily: "BebasNeue_400Regular" },
  histDayCard:  { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BORDER },
  histDayTop:   { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  histDayDate:  { fontSize: 15, fontWeight: "600", color: CREAM, fontFamily: "BebasNeue_400Regular" },
  histDayCal:   { fontSize: 15, color: GOLD, fontWeight: "700", marginLeft: "auto" as const, fontFamily: "BebasNeue_400Regular" },
  histChevron:  { fontSize: 22, color: MUTED, marginLeft: 8 },
  histMacroBar: { height: 5, borderRadius: 3, flexDirection: "row", overflow: "hidden", marginBottom: 8 },
  histMacroSeg: { height: 5 },
  histMacroLbls:{ flexDirection: "row", gap: 16 },
  histMacroLbl: { fontSize: 12, fontWeight: "600", fontFamily: "BebasNeue_400Regular" },
});
