import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { useAgentViewModel } from "@/lib/viewModels/useAgentViewModel";
import { SmartCartCTACard } from "@/components/features/agent/SmartCartCTACard";

const AVATAR = require("../../assets/images/avatar.png");
const BG = "#EEF4FA";
const WHITE = "#FFFFFF";
const TEAL = "#2BB6A6";
const BORDER = "#E5E7EB";

// ── Category & action data ────────────────────────────────────────────────────

type Category = "nutrition" | "training" | "smart_cart";

interface Action {
  iosSymbol: string;
  androidSymbol: string;
  color: string;
  bg: string;
  title: string;
  subtitle: string;
  prompt: string;
}

const CATEGORIES: { id: Category; label: string; iosSymbol: string; androidSymbol: string }[] = [
  { id: "nutrition", label: "Nutrition", iosSymbol: "fork.knife", androidSymbol: "restaurant" },
  { id: "training", label: "Training", iosSymbol: "dumbbell.fill", androidSymbol: "fitness_center" },
  { id: "smart_cart", label: "Smart Cart", iosSymbol: "cart.fill", androidSymbol: "shopping_cart" },
];

const ACTIONS: Record<Category, Action[]> = {
  nutrition: [
    {
      iosSymbol: "fork.knife", androidSymbol: "restaurant",
      color: "#3B82F6", bg: "rgba(59,130,246,0.10)",
      title: "Today's Meal Plan", subtitle: "Full day based on your macros",
      prompt: "Build me a complete meal plan for today based on my remaining macros and fitness goal. Show each meal with foods and portion sizes.",
    },
    {
      iosSymbol: "calendar", androidSymbol: "calendar_today",
      color: "#8B5CF6", bg: "rgba(139,92,246,0.10)",
      title: "This Week's Plan", subtitle: "7-day structured meals",
      prompt: "Create a full 7-day meal plan tailored to my fitness goal and dietary preferences. Break it down by day with each meal.",
    },
    {
      iosSymbol: "chart.bar.fill", androidSymbol: "bar_chart",
      color: "#EF4444", bg: "rgba(239,68,68,0.10)",
      title: "Hit Protein Goal", subtitle: "Close the gap today",
      prompt: "What should I eat today to hit my protein goal? Show me specific meals and snacks with protein amounts.",
    },
    {
      iosSymbol: "arrow.clockwise", androidSymbol: "refresh",
      color: TEAL, bg: "rgba(43,182,166,0.10)",
      title: "Recovery Nutrition", subtitle: "Optimise post-training",
      prompt: "What should I eat after training to maximise recovery? Give me specific meals and timing.",
    },
  ],
  training: [
    {
      iosSymbol: "dumbbell.fill", androidSymbol: "fitness_center",
      color: "#F97316", bg: "rgba(249,115,22,0.10)",
      title: "Weekly Workout Plan", subtitle: "Structured training schedule",
      prompt: "Create a weekly workout plan based on my fitness goal. Include training days, rest days, exercises, sets and reps.",
    },
    {
      iosSymbol: "flag.fill", androidSymbol: "flag",
      color: "#10B981", bg: "rgba(16,185,129,0.10)",
      title: "Achieve My Goal", subtitle: "Clear step-by-step strategy",
      prompt: "Give me a clear strategy to achieve my fitness goal. Be specific about nutrition, training frequency and what to prioritise.",
    },
    {
      iosSymbol: "bolt.fill", androidSymbol: "bolt",
      color: "#F59E0B", bg: "rgba(245,158,11,0.10)",
      title: "Pre-Workout Fuel", subtitle: "Maximise your energy",
      prompt: "What should I eat before my workout for maximum energy and performance? Include timing and specific food options.",
    },
    {
      iosSymbol: "figure.run", androidSymbol: "directions_run",
      color: "#EC4899", bg: "rgba(236,72,153,0.10)",
      title: "Cardio Plan", subtitle: "Endurance & fat burn",
      prompt: "Create a weekly cardio plan that supports my fitness goal. Include type, duration and intensity for each session.",
    },
  ],
  smart_cart: [
    {
      iosSymbol: "cart.fill", androidSymbol: "shopping_cart",
      color: TEAL, bg: "rgba(43,182,166,0.10)",
      title: "Build Smart Cart", subtitle: "Convert plan to a cart",
      prompt: "Build today's complete meal plan and save it to my Smart Cart.",
    },
    {
      iosSymbol: "dollarsign.circle.fill", androidSymbol: "payments",
      color: "#10B981", bg: "rgba(16,185,129,0.10)",
      title: "Budget Meal Plan", subtitle: "Affordable and balanced",
      prompt: "Create a budget-friendly meal plan for this week. Keep it practical, affordable and still hitting my macro targets.",
    },
    {
      iosSymbol: "list.bullet.clipboard.fill", androidSymbol: "list_alt",
      color: "#3B82F6", bg: "rgba(59,130,246,0.10)",
      title: "Weekly Grocery List", subtitle: "All ingredients in one place",
      prompt: "Generate a complete weekly grocery list based on my meal plan goals. Group by category.",
    },
    {
      iosSymbol: "timer", androidSymbol: "timer",
      color: "#F97316", bg: "rgba(249,115,22,0.10)",
      title: "Meal Prep Plan", subtitle: "Cook once, eat all week",
      prompt: "Give me a meal prep plan I can do on Sunday to prepare food for the whole week. Include steps and what to cook.",
    },
  ],
};

// ── Macro pill ────────────────────────────────────────────────────────────────

function MacroPill({ label, value, target, color }: {
  label: string; value: number; target: number; color: string;
}) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  return (
    <View style={pill.wrap}>
      <Text style={pill.label}>{label}</Text>
      <Text style={[pill.value, { color }]}>
        {value}<Text style={pill.unit}>/{target}{label === "Cal" ? "" : "g"}</Text>
      </Text>
      <View style={pill.track}>
        <View style={[pill.fill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const pill = StyleSheet.create({
  wrap: { flex: 1, gap: 3 },
  label: { fontSize: 9, fontWeight: "700", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: 0.4 },
  value: { fontSize: 12, fontWeight: "800" },
  unit: { fontSize: 9, fontWeight: "600", color: "rgba(255,255,255,0.55)" },
  track: { height: 3, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.2)", overflow: "hidden" },
  fill: { height: 3, borderRadius: 100 },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AgentScreen() {
  const vm = useAgentViewModel();
  const { macroContext: mc } = vm;
  const [category, setCategory] = useState<Category>("nutrition");
  const [response, setResponse] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showSmartCart, setShowSmartCart] = useState(false);
  const lastPromptRef = useRef("");

  // Fire a prompt directly — manages local state for reliability
  const fire = useCallback(async (prompt: string) => {
    if (sending) return;
    lastPromptRef.current = prompt;
    setSending(true);
    setResponse(null);
    setShowSmartCart(false);

    try {
      // Use the viewmodel's quickSend but capture the result via messages
      await vm.quickSend(prompt);
    } catch {
      // quickSend doesn't throw — errors go to vm.apiError
    } finally {
      setSending(false);
    }
  }, [sending, vm]);

  // Sync response from viewmodel whenever messages update
  useEffect(() => {
    const latest = vm.messages
      .filter((m) => m.role === "assistant" && m.id !== "welcome")
      .slice(-1)[0];
    if (latest) {
      setResponse(latest.content);
      setSending(false);
    }
  }, [vm.messages]);

  // Sync error from viewmodel
  useEffect(() => {
    if (vm.apiError) {
      setSending(false);
      Alert.alert("Couldn't reach Jonno", vm.apiError, [{ text: "OK" }]);
    }
  }, [vm.apiError]);

  // Sync smart cart suggestion
  useEffect(() => {
    if (vm.pendingSmartCartAction) setShowSmartCart(true);
  }, [vm.pendingSmartCartAction]);

  const actions = ACTIONS[category];

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>

      {/* ── Teal header ── */}
      <LinearGradient colors={["#2BB6A6", "#1A9488"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
        <View style={s.headerRow}>
          <Image source={AVATAR} style={s.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={s.name}>Jonno</Text>
            <Text style={s.nameSub}>AI nutrition & fitness coach</Text>
          </View>
          <View style={s.onlineDot} />
        </View>
        <View style={s.macroRow}>
          <MacroPill label="Cal" value={mc.calories} target={mc.caloriesTarget} color="#fff" />
          <View style={s.macroDivider} />
          <MacroPill label="Protein" value={mc.protein} target={mc.proteinTarget} color="#FCD34D" />
          <View style={s.macroDivider} />
          <MacroPill label="Carbs" value={mc.carbs} target={mc.carbsTarget} color="#A5F3FC" />
          <View style={s.macroDivider} />
          <MacroPill label="Fat" value={mc.fat} target={mc.fatTarget} color="#FCA5A5" />
        </View>
      </LinearGradient>

      {/* ── Category tabs ── */}
      <View style={s.tabs}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setCategory(cat.id)}
            style={[s.tab, category === cat.id && s.tabActive]}
            activeOpacity={0.75}
          >
            <SymbolView
              name={{ ios: cat.iosSymbol, android: cat.androidSymbol, web: cat.androidSymbol }}
              size={14}
              tintColor={category === cat.id ? WHITE : "#9CA3AF"}
            />
            <Text style={[s.tabLabel, category === cat.id && s.tabLabelActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── 2×2 Action grid ── */}
      <View style={s.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.title}
            onPress={() => fire(action.prompt)}
            disabled={sending}
            activeOpacity={0.78}
            style={[s.card, sending && s.cardDisabled]}
          >
            <View style={[s.iconBox, { backgroundColor: action.bg }]}>
              <SymbolView
                name={{ ios: action.iosSymbol, android: action.androidSymbol, web: action.androidSymbol }}
                size={18}
                tintColor={action.color}
              />
            </View>
            <Text style={s.cardTitle}>{action.title}</Text>
            <Text style={s.cardSub}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Response panel ── */}
      <View style={s.responsePanel}>
        {sending ? (
          <View style={s.centred}>
            <ActivityIndicator size="large" color={TEAL} />
            <Text style={s.loadingText}>Jonno is thinking…</Text>
          </View>
        ) : response ? (
          <>
            <View style={s.respHeader}>
              <Image source={AVATAR} style={s.respAvatar} />
              <View>
                <Text style={s.respName}>Jonno</Text>
                <Text style={s.respSub}>Your nutrition coach</Text>
              </View>
              <TouchableOpacity
                onPress={() => { setResponse(null); setShowSmartCart(false); }}
                style={s.clearBtn}
                activeOpacity={0.7}
              >
                <Text style={s.clearTxt}>Clear</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 12 }}
            >
              <Text style={s.respText}>{response}</Text>
            </ScrollView>

            <View style={s.respActions}>
              <TouchableOpacity onPress={() => fire("Can you adjust that?")} style={s.followBtn} activeOpacity={0.75}>
                <Text style={s.followTxt}>Adjust it</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => fire("Give me a completely different option")} style={s.followBtn} activeOpacity={0.75}>
                <Text style={s.followTxt}>Different option</Text>
              </TouchableOpacity>
            </View>

            {showSmartCart && (
              <View style={{ marginTop: 8 }}>
                <SmartCartCTACard
                  onConfirm={() => { vm.confirmSmartCart(); setShowSmartCart(false); }}
                  onDismiss={() => setShowSmartCart(false)}
                />
              </View>
            )}
          </>
        ) : (
          <View style={s.centred}>
            <View style={s.emptyIcon}>
              <SymbolView
                name={{ ios: "sparkles", android: "auto_awesome", web: "auto_awesome" }}
                size={24}
                tintColor={TEAL}
              />
            </View>
            <Text style={s.emptyTitle}>Choose an action above</Text>
            <Text style={s.emptySub}>Jonno's response will appear here</Text>
          </View>
        )}
      </View>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, gap: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 38, height: 38, borderRadius: 12 },
  name: { fontSize: 16, fontWeight: "800", color: WHITE },
  nameSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "500", marginTop: 1 },
  onlineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#A7F3D0", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
  macroRow: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.12)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  macroDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.18)", marginHorizontal: 4 },

  // Tabs
  tabs: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 10, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER },
  tabActive: { backgroundColor: TEAL, borderColor: TEAL },
  tabLabel: { fontSize: 12, fontWeight: "700", color: "#9CA3AF" },
  tabLabelActive: { color: WHITE },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16 },
  card: {
    width: "47.5%",
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardDisabled: { opacity: 0.45 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#1C1C1E", lineHeight: 17 },
  cardSub: { fontSize: 11, fontWeight: "500", color: "#9CA3AF", lineHeight: 14 },

  // Response panel
  responsePanel: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: Platform.OS === "ios" ? 4 : 8,
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },

  centred: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  loadingText: { fontSize: 14, color: "#9CA3AF", fontWeight: "500", marginTop: 4 },

  emptyIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(43,182,166,0.1)", alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  emptySub: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },

  respHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BORDER, paddingBottom: 10 },
  respAvatar: { width: 30, height: 30, borderRadius: 9 },
  respName: { fontSize: 13, fontWeight: "800", color: "#1C1C1E" },
  respSub: { fontSize: 11, color: "#9CA3AF", fontWeight: "500" },
  clearBtn: { marginLeft: "auto" as any, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: BG },
  clearTxt: { fontSize: 12, fontWeight: "600", color: "#9CA3AF" },

  respText: { fontSize: 15, color: "#1C1C1E", lineHeight: 24, fontWeight: "400" },

  respActions: { flexDirection: "row", gap: 8, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: BORDER, marginTop: 6 },
  followBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, backgroundColor: BG, borderWidth: 1, borderColor: BORDER },
  followTxt: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
});
