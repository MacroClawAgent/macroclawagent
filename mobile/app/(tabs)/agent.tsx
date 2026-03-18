import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useAgentViewModel } from "@/lib/viewModels/useAgentViewModel";
import { SmartCartCTACard } from "@/components/features/agent/SmartCartCTACard";

const AVATAR = require("../../assets/images/avatar.png");
const BG = "#EEF4FA";
const WHITE = "#FFFFFF";
const TEAL = "#2BB6A6";
const BORDER = "#E5E7EB";

// ── Category definitions ──────────────────────────────────────────────────────

type Category = "nutrition" | "training" | "smart_cart";

interface Action {
  emoji: string;
  title: string;
  subtitle: string;
  prompt: string;
}

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "nutrition", label: "Nutrition", emoji: "🍽" },
  { id: "training", label: "Training", emoji: "💪" },
  { id: "smart_cart", label: "Smart Cart", emoji: "🛒" },
];

const ACTIONS: Record<Category, Action[]> = {
  nutrition: [
    { emoji: "🍽", title: "Today's Meal Plan", subtitle: "Full day of meals", prompt: "Build a complete meal plan for today based on my goals and remaining macros" },
    { emoji: "📅", title: "This Week's Plan", subtitle: "7-day meal structure", prompt: "Create a full 7-day meal plan tailored to my fitness goal and dietary preferences" },
    { emoji: "🥩", title: "Hit Protein Goal", subtitle: "Meals to close the gap", prompt: "What should I eat to hit my protein goal today? Show me specific meals." },
    { emoji: "🔄", title: "Recovery Nutrition", subtitle: "Post-training meals", prompt: "What should I eat after training to maximise recovery?" },
  ],
  training: [
    { emoji: "💪", title: "Weekly Workout Plan", subtitle: "Structured schedule", prompt: "Create a weekly workout plan for me based on my fitness goal. Include days, exercises, sets and reps." },
    { emoji: "🎯", title: "Achieve My Goal", subtitle: "Step-by-step strategy", prompt: "Give me a clear step-by-step strategy to achieve my fitness goal. Be specific and practical." },
    { emoji: "⚡", title: "Pre-Workout Fuel", subtitle: "Optimise your energy", prompt: "What should I eat before my workout to maximise performance and energy?" },
    { emoji: "🏃", title: "Cardio Plan", subtitle: "Endurance & fat burn", prompt: "Create a weekly cardio plan for me that supports my fitness goal." },
  ],
  smart_cart: [
    { emoji: "🛒", title: "Build Smart Cart", subtitle: "Convert plan to cart", prompt: "Build today's meals and save everything to Smart Cart" },
    { emoji: "🥗", title: "Budget Meal Plan", subtitle: "Affordable & balanced", prompt: "Create a budget-friendly meal plan for this week and add it to Smart Cart" },
    { emoji: "🛍", title: "Weekly Grocery List", subtitle: "All ingredients", prompt: "Create a complete weekly grocery list based on my meal plan" },
    { emoji: "🍱", title: "Meal Prep Plan", subtitle: "Cook once, eat all week", prompt: "Give me a meal prep plan I can do on Sunday for the whole week" },
  ],
};

// ── Macro pill ────────────────────────────────────────────────────────────────

function MacroPill({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
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
  value: { fontSize: 13, fontWeight: "800" },
  unit: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.55)" },
  track: { height: 3, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.2)", overflow: "hidden" },
  fill: { height: 3, borderRadius: 100 },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AgentScreen() {
  const vm = useAgentViewModel();
  const { macroContext: mc } = vm;
  const [category, setCategory] = useState<Category>("nutrition");
  const [lastPrompt, setLastPrompt] = useState("");

  function fire(prompt: string) {
    setLastPrompt(prompt);
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
            <Text style={s.nameSub}>AI nutrition & fitness coach</Text>
          </View>
          <View style={s.dot} />
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

      {/* ── Category pills ── */}
      <View style={s.pillsRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setCategory(cat.id)}
            style={[s.catPill, category === cat.id && s.catPillActive]}
            activeOpacity={0.75}
          >
            <Text style={s.catPillEmoji}>{cat.emoji}</Text>
            <Text style={[s.catPillLabel, category === cat.id && s.catPillLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── 2×2 Action grid ── */}
      <View style={s.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.title}
            onPress={() => fire(action.prompt)}
            disabled={vm.sending}
            activeOpacity={0.78}
            style={[s.actionCard, vm.sending && { opacity: 0.5 }]}
          >
            <Text style={s.actionEmoji}>{action.emoji}</Text>
            <Text style={s.actionTitle}>{action.title}</Text>
            <Text style={s.actionSub}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Response area (fills remaining space) ── */}
      <View style={s.responseArea}>
        {vm.sending ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="small" color={TEAL} />
            <Text style={s.loadingText}>Jonno is thinking…</Text>
          </View>
        ) : vm.apiError ? (
          <View style={s.errorWrap}>
            <Text style={s.errorText}>{vm.apiError}</Text>
            <TouchableOpacity
              onPress={() => fire(lastPrompt)}
              style={s.retryBtn}
              activeOpacity={0.75}
            >
              <Text style={s.retryTxt}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : vm.latestResponse ? (
          <>
            <View style={s.responseHeader}>
              <Image source={AVATAR} style={s.responseAvatar} />
              <Text style={s.responseLabel}>Jonno says</Text>
            </View>
            <ScrollView
              style={s.responseScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <Text style={s.responseText}>{vm.latestResponse}</Text>
            </ScrollView>
            <View style={s.responseActions}>
              <TouchableOpacity
                onPress={() => fire("Can you adjust that?")}
                style={s.followBtn}
                activeOpacity={0.75}
              >
                <Text style={s.followTxt}>Adjust it</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => fire("Give me a completely different option")}
                style={s.followBtn}
                activeOpacity={0.75}
              >
                <Text style={s.followTxt}>Different option</Text>
              </TouchableOpacity>
            </View>
            {vm.pendingSmartCartAction && (
              <SmartCartCTACard onConfirm={vm.confirmSmartCart} onDismiss={vm.dismissSmartCart} />
            )}
          </>
        ) : (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>👆</Text>
            <Text style={s.emptyText}>Choose an action above</Text>
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
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 12 },
  name: { fontSize: 17, fontWeight: "800", color: WHITE },
  nameSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "500", marginTop: 1 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#A7F3D0", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
  macroRow: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.12)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  macroDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.18)", marginHorizontal: 4 },

  // Category pills
  pillsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  catPill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER },
  catPillActive: { backgroundColor: TEAL, borderColor: TEAL },
  catPillEmoji: { fontSize: 14 },
  catPillLabel: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  catPillLabelActive: { color: WHITE },

  // 2×2 grid
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10 },
  actionCard: {
    width: "47.5%",
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  actionEmoji: { fontSize: 22 },
  actionTitle: { fontSize: 13, fontWeight: "700", color: "#1C1C1E", lineHeight: 17 },
  actionSub: { fontSize: 11, fontWeight: "500", color: "#9CA3AF", lineHeight: 15 },

  // Response area
  responseArea: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: Platform.OS === "ios" ? 4 : 8,
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    overflow: "hidden",
  },

  // Loading
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { fontSize: 14, color: "#9CA3AF", fontWeight: "500" },

  // Error
  errorWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 14, color: "#EF4444", textAlign: "center", lineHeight: 20 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 9, borderRadius: 100, backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  retryTxt: { fontSize: 13, fontWeight: "700", color: "#EF4444" },

  // Response
  responseHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  responseAvatar: { width: 28, height: 28, borderRadius: 9 },
  responseLabel: { fontSize: 13, fontWeight: "800", color: "#1C1C1E" },
  responseScroll: { flex: 1 },
  responseText: { fontSize: 15, color: "#1C1C1E", lineHeight: 24, fontWeight: "400" },
  responseActions: { flexDirection: "row", gap: 8, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: BORDER, marginTop: 8 },
  followBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, backgroundColor: BG, borderWidth: 1, borderColor: BORDER },
  followTxt: { fontSize: 12, fontWeight: "700", color: "#6B7280" },

  // Empty state
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  emptyEmoji: { fontSize: 28 },
  emptyText: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  emptySub: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
});
