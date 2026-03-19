import React, { useEffect, useState } from "react";
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function cleanResponse(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── Category & action data ────────────────────────────────────────────────────

type Category = "nutrition" | "training" | "smart_cart";

interface Action {
  symbol: string;
  color: string;
  bg: string;
  title: string;
  prompt: string;
}

const CATEGORIES: { id: Category; label: string; symbol: string }[] = [
  { id: "nutrition",  label: "Nutrition",   symbol: "fork.knife"   },
  { id: "training",   label: "Training",    symbol: "dumbbell.fill" },
  { id: "smart_cart", label: "Smart Cart",  symbol: "cart.fill"    },
];

const ACTIONS: Record<Category, Action[]> = {
  nutrition: [
    {
      symbol: "fork.knife", color: "#3B82F6", bg: "rgba(59,130,246,0.10)",
      title: "Today's Meal Plan",
      prompt: "Build me a complete meal plan for today based on my remaining macros and fitness goal. List each meal with specific foods and portions. No markdown, plain text only.",
    },
    {
      symbol: "calendar", color: "#8B5CF6", bg: "rgba(139,92,246,0.10)",
      title: "This Week's Plan",
      prompt: "Create a full 7-day meal plan for my fitness goal. List day by day with each meal. No markdown, plain text only.",
    },
    {
      symbol: "chart.bar.fill", color: "#EF4444", bg: "rgba(239,68,68,0.10)",
      title: "Hit Protein Goal",
      prompt: "What should I eat today to hit my protein goal? Give me specific meals and snacks with protein amounts. No markdown, plain text only.",
    },
    {
      symbol: "arrow.clockwise", color: TEAL, bg: "rgba(43,182,166,0.10)",
      title: "Recovery Nutrition",
      prompt: "What should I eat after training to maximise recovery? Give specific meals and timing. No markdown, plain text only.",
    },
  ],
  training: [
    {
      symbol: "dumbbell.fill", color: "#F97316", bg: "rgba(249,115,22,0.10)",
      title: "Weekly Workout Plan",
      prompt: "Create a weekly workout plan for my fitness goal. List training days, rest days, exercises, sets and reps. No markdown, plain text only.",
    },
    {
      symbol: "flag.fill", color: "#10B981", bg: "rgba(16,185,129,0.10)",
      title: "Achieve My Goal",
      prompt: "Give me a clear strategy to achieve my fitness goal. Be specific about nutrition, training frequency and priorities. No markdown, plain text only.",
    },
    {
      symbol: "bolt.fill", color: "#F59E0B", bg: "rgba(245,158,11,0.10)",
      title: "Pre-Workout Fuel",
      prompt: "What should I eat before my workout for maximum energy? Include timing and food options. No markdown, plain text only.",
    },
    {
      symbol: "figure.run", color: "#EC4899", bg: "rgba(236,72,153,0.10)",
      title: "Cardio Plan",
      prompt: "Create a weekly cardio plan for my fitness goal. Include type, duration and intensity per session. No markdown, plain text only.",
    },
  ],
  smart_cart: [
    {
      symbol: "cart.fill", color: TEAL, bg: "rgba(43,182,166,0.10)",
      title: "Build Smart Cart",
      prompt: "Build today's complete meal plan and convert it into a Smart Cart grocery list. No markdown, plain text only.",
    },
    {
      symbol: "dollarsign.circle.fill", color: "#10B981", bg: "rgba(16,185,129,0.10)",
      title: "Budget Meal Plan",
      prompt: "Create a budget-friendly meal plan for this week that still hits my macro targets. No markdown, plain text only.",
    },
    {
      symbol: "list.bullet.clipboard.fill", color: "#3B82F6", bg: "rgba(59,130,246,0.10)",
      title: "Weekly Grocery List",
      prompt: "Generate a complete weekly grocery list for my meal plan goals, grouped by category. No markdown, plain text only.",
    },
    {
      symbol: "timer", color: "#F97316", bg: "rgba(249,115,22,0.10)",
      title: "Meal Prep Plan",
      prompt: "Give me a meal prep plan I can do on Sunday to prepare food for the whole week. Include steps and what to cook. No markdown, plain text only.",
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
  wrap:  { flex: 1, gap: 3 },
  label: { fontSize: 9, fontWeight: "700", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: 0.4 },
  value: { fontSize: 12, fontWeight: "800" },
  unit:  { fontSize: 9, fontWeight: "600", color: "rgba(255,255,255,0.55)" },
  track: { height: 3, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.2)", overflow: "hidden" },
  fill:  { height: 3, borderRadius: 100 },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AgentScreen() {
  const vm = useAgentViewModel();
  const { macroContext: mc } = vm;
  const [category, setCategory] = useState<Category>("nutrition");
  // Local response — seeded from vm.latestResponse so we can clear it independently
  const [localResponse, setLocalResponse] = useState<string | null>(null);

  useEffect(() => {
    if (vm.latestResponse) setLocalResponse(cleanResponse(vm.latestResponse));
  }, [vm.latestResponse]);

  useEffect(() => {
    if (vm.apiError) Alert.alert("Jonno", vm.apiError, [{ text: "OK" }]);
  }, [vm.apiError]);

  function fire(prompt: string) {
    if (vm.sending) return;
    setLocalResponse(null);
    vm.quickSend(prompt);
  }

  const actions = ACTIONS[category];

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>

      {/* ── Header ── */}
      <LinearGradient
        colors={["#2BB6A6", "#1A9488"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <View style={s.headerRow}>
          <Image source={AVATAR} style={s.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={s.name}>Jonno</Text>
            <Text style={s.nameSub}>AI nutrition and fitness coach</Text>
          </View>
          <View style={s.onlineDot} />
        </View>
        <View style={s.macroRow}>
          <MacroPill label="Cal"     value={mc.calories} target={mc.caloriesTarget} color="#fff"     />
          <View style={s.macroDivider} />
          <MacroPill label="Protein" value={mc.protein}  target={mc.proteinTarget}  color="#FCD34D" />
          <View style={s.macroDivider} />
          <MacroPill label="Carbs"   value={mc.carbs}    target={mc.carbsTarget}    color="#A5F3FC" />
          <View style={s.macroDivider} />
          <MacroPill label="Fat"     value={mc.fat}      target={mc.fatTarget}      color="#FCA5A5" />
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
              name={cat.symbol as any}
              size={13}
              tintColor={category === cat.id ? WHITE : "#9CA3AF"}
              style={{ width: 13, height: 13 }}
            />
            <Text style={[s.tabLabel, category === cat.id && s.tabLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Compact action chips (2×2) ── */}
      <View style={s.chips}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.title}
            onPress={() => fire(action.prompt)}
            disabled={vm.sending}
            activeOpacity={0.78}
            style={[s.chip, vm.sending && s.chipDisabled]}
          >
            <View style={[s.chipIcon, { backgroundColor: action.bg }]}>
              <SymbolView
                name={action.symbol as any}
                size={14}
                tintColor={action.color}
                style={{ width: 14, height: 14 }}
              />
            </View>
            <Text style={s.chipLabel} numberOfLines={1}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Section label ── */}
      <View style={s.sectionRow}>
        <View style={s.sectionLine} />
        <Text style={s.sectionLabel}>Response</Text>
        <View style={s.sectionLine} />
      </View>

      {/* ── Response panel (flex: 1 — dominant element) ── */}
      <View style={s.responsePanel}>

        {vm.sending ? (
          <View style={s.centred}>
            <ActivityIndicator size="large" color={TEAL} />
            <Text style={s.loadingText}>Jonno is thinking...</Text>
          </View>

        ) : localResponse ? (
          <>
            <View style={s.respHeader}>
              <Image source={AVATAR} style={s.respAvatar} />
              <Text style={s.respName}>Jonno</Text>
              <TouchableOpacity
                onPress={() => setLocalResponse(null)}
                style={s.clearBtn}
                activeOpacity={0.7}
              >
                <Text style={s.clearTxt}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={s.respDivider} />

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <Text style={s.respText}>{localResponse}</Text>
            </ScrollView>

            <View style={s.respDivider} />

            <View style={s.respActions}>
              <TouchableOpacity
                onPress={() => fire("Can you adjust that? Give me a slightly different version.")}
                style={s.followBtn}
                activeOpacity={0.75}
              >
                <Text style={s.followTxt}>Adjust it</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => fire("Give me a completely different option for the same goal.")}
                style={s.followBtn}
                activeOpacity={0.75}
              >
                <Text style={s.followTxt}>Different option</Text>
              </TouchableOpacity>
            </View>

            {vm.pendingSmartCartAction && (
              <SmartCartCTACard
                onConfirm={vm.confirmSmartCart}
                onDismiss={vm.dismissSmartCart}
              />
            )}
          </>

        ) : (
          <View style={s.centred}>
            <View style={s.emptyIcon}>
              <SymbolView
                name={"sparkles" as any}
                size={26}
                tintColor={TEAL}
                style={{ width: 26, height: 26 }}
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
  header:      { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, gap: 8 },
  headerRow:   { flexDirection: "row", alignItems: "center", gap: 11 },
  avatar:      { width: 36, height: 36, borderRadius: 11 },
  name:        { fontSize: 15, fontWeight: "800", color: WHITE },
  nameSub:     { fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: "500", marginTop: 1 },
  onlineDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: "#A7F3D0", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
  macroRow:    { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.12)", borderRadius: 11, paddingHorizontal: 12, paddingVertical: 8, gap: 4 },
  macroDivider:{ width: 1, backgroundColor: "rgba(255,255,255,0.18)", marginHorizontal: 4 },

  // Category tabs
  tabs:          { flexDirection: "row", gap: 7, paddingHorizontal: 16, paddingVertical: 8 },
  tab:           { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 7, borderRadius: 9, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER },
  tabActive:     { backgroundColor: TEAL, borderColor: TEAL },
  tabLabel:      { fontSize: 12, fontWeight: "700", color: "#9CA3AF" },
  tabLabelActive:{ color: WHITE },

  // Compact action chips
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  chip: {
    width: "47.5%",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 11,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  chipDisabled: { opacity: 0.45 },
  chipIcon:    { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  chipLabel:   { flex: 1, fontSize: 12, fontWeight: "700", color: "#1C1C1E" },

  // Section divider label
  sectionRow:   { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 10, marginBottom: 6, gap: 8 },
  sectionLine:  { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: BORDER },
  sectionLabel: { fontSize: 10, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8 },

  // Response panel
  responsePanel: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: Platform.OS === "ios" ? 6 : 10,
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  centred:     { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  loadingText: { fontSize: 14, color: "#9CA3AF", fontWeight: "500", marginTop: 4 },

  emptyIcon:  { width: 54, height: 54, borderRadius: 16, backgroundColor: "rgba(43,182,166,0.10)", alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  emptySub:   { fontSize: 13, color: "#9CA3AF", fontWeight: "500", textAlign: "center" },

  respHeader:  { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 10 },
  respAvatar:  { width: 28, height: 28, borderRadius: 8 },
  respName:    { flex: 1, fontSize: 13, fontWeight: "800", color: "#1C1C1E" },
  clearBtn:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: BG },
  clearTxt:    { fontSize: 12, fontWeight: "600", color: "#9CA3AF" },
  respDivider: { height: StyleSheet.hairlineWidth, backgroundColor: BORDER, marginBottom: 10 },

  respText:    { fontSize: 14, color: "#1C1C1E", lineHeight: 22, fontWeight: "400" },

  respActions: { flexDirection: "row", gap: 8, paddingTop: 10, marginTop: 4 },
  followBtn:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, backgroundColor: BG, borderWidth: 1, borderColor: BORDER },
  followTxt:   { fontSize: 12, fontWeight: "700", color: "#6B7280" },
});
