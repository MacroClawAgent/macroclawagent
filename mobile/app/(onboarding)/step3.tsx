import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

const BG = "#1C1612";
const CARD = "#252018";
const GOLD = "#F5C842";
const CORAL = "#E07B54";
const SAGE = "#8B9E6E";
const TEXT_C = "#E8E0D0";
const MUTED = "rgba(232,224,208,0.5)";
const DIM = "rgba(232,224,208,0.25)";

const GOALS = [
  { id: "lose_weight", icon: "trending-down-outline", color: CORAL, label: "Lose Weight", desc: "Burn fat while preserving muscle" },
  { id: "build_muscle", icon: "barbell-outline", color: SAGE, label: "Build Muscle", desc: "Fuel growth with the right surplus" },
  { id: "performance", icon: "flash-outline", color: GOLD, label: "Performance", desc: "Optimise fuelling and recovery" },
  { id: "maintain", icon: "heart-outline", color: SAGE, label: "Stay Healthy", desc: "Balanced nutrition every day" },
];

function calcTargets(goal: string, weightKg: number, metabolism: string) {
  const w = weightKg > 0 ? weightKg : 70;
  const metaMul = metabolism === "fast" ? 1.1 : metabolism === "slow" ? 0.9 : 1;
  let cal: number, pro: number, carbs: number, fat: number;
  switch (goal) {
    case "lose_weight":
      cal = Math.round((w * 28 - 350) * metaMul);
      pro = Math.round(w * 2.0); carbs = Math.round(cal * 0.35 / 4); fat = Math.round(cal * 0.25 / 9);
      break;
    case "build_muscle":
      cal = Math.round((w * 32 + 200) * metaMul);
      pro = Math.round(w * 2.2); carbs = Math.round(cal * 0.45 / 4); fat = Math.round(cal * 0.25 / 9);
      break;
    case "performance":
      cal = Math.round(w * 35 * metaMul);
      pro = Math.round(w * 2.0); carbs = Math.round(cal * 0.50 / 4); fat = Math.round(cal * 0.20 / 9);
      break;
    default:
      cal = Math.round(w * 30 * metaMul);
      pro = Math.round(w * 1.8); carbs = Math.round(cal * 0.40 / 4); fat = Math.round(cal * 0.30 / 9);
  }
  return { calories: cal, protein: pro, carbs, fat };
}

function goalDetail(goal: string, targets: ReturnType<typeof calcTargets>) {
  switch (goal) {
    case "lose_weight":
      return { tagline: "Healthy deficit for sustainable fat loss", detail: `~0.5 kg per week · ${targets.calories} kcal/day`, icon: "trending-down-outline", color: CORAL };
    case "build_muscle":
      return { tagline: "Calorie surplus for lean gains", detail: `+200 kcal surplus · ${targets.protein}g protein/day`, icon: "barbell-outline", color: SAGE };
    case "performance":
      return { tagline: "Fuel your training and recovery", detail: `High carbs (${targets.carbs}g) · ${targets.calories} kcal/day`, icon: "flash-outline", color: GOLD };
    default:
      return { tagline: "Balanced nutrition for long-term health", detail: `${targets.calories} kcal · ${targets.protein}g protein/day`, icon: "heart-outline", color: SAGE };
  }
}

export default function OnboardingStep3() {
  const params = useLocalSearchParams<{
    first_name: string; last_name: string; dob?: string; sport?: string;
    weight_kg: string; height_cm: string; metabolism?: string; unit?: string;
  }>();

  const [goal, setGoal] = useState("");
  const weightKg = parseInt(params.weight_kg ?? "70");
  const metabolism = params.metabolism ?? "normal";
  const targets = goal ? calcTargets(goal, weightKg, metabolism) : null;
  const detail = goal && targets ? goalDetail(goal, targets) : null;

  function handleNext() {
    if (!goal || !targets) return;
    router.push({
      pathname: "/(onboarding)/step4",
      params: {
        first_name: params.first_name,
        last_name: params.last_name,
        dob: params.dob ?? "",
        sport: params.sport ?? "",
        weight_kg: params.weight_kg,
        height_cm: params.height_cm,
        metabolism,
        unit: params.unit ?? "metric",
        goal,
        calorie_goal: String(targets.calories),
        protein_goal: String(targets.protein),
        carbs_goal: String(targets.carbs),
        fat_goal: String(targets.fat),
      },
    });
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}>
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={24} color={TEXT_C} />
      </TouchableOpacity>

      {/* Progress */}
      <View style={s.progressRow}>
        <View style={[s.dot, s.dotDone]} />
        <View style={[s.line, s.lineDone]} />
        <View style={[s.dot, s.dotDone]} />
        <View style={[s.line, s.lineDone]} />
        <View style={[s.dot, s.dotActive]} />
        <View style={s.line} />
        <View style={s.dot} />
      </View>

      <Text style={s.step}>Step 3 of 4</Text>
      <Text style={s.title}>What's your goal?</Text>
      <Text style={s.subtitle}>Jonno uses this to personalise every meal plan and recommendation.</Text>

      {/* Goal cards */}
      <View style={{ gap: 10 }}>
        {GOALS.map(g => (
          <TouchableOpacity
            key={g.id}
            style={[s.goalCard, goal === g.id && { borderColor: g.color, backgroundColor: g.color + "08" }]}
            onPress={() => setGoal(g.id)}
            activeOpacity={0.75}
          >
            <View style={[s.goalIcon, { backgroundColor: g.color + "15" }]}>
              <Ionicons name={g.icon as any} size={22} color={g.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.goalLabel, goal === g.id && { color: TEXT_C }]}>{g.label}</Text>
              <Text style={s.goalDesc}>{g.desc}</Text>
            </View>
            {goal === g.id && <Ionicons name="checkmark-circle" size={22} color={g.color} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Goal-specific targets */}
      {detail && targets && (
        <View style={s.targetCard}>
          <View style={s.targetHeader}>
            <Ionicons name={detail.icon as any} size={18} color={detail.color} />
            <Text style={[s.targetTagline, { color: detail.color }]}>{detail.tagline}</Text>
          </View>
          <Text style={s.targetDetail}>{detail.detail}</Text>

          <View style={s.macroRow}>
            <View style={s.macroItem}>
              <Text style={s.macroVal}>{targets.calories}</Text>
              <Text style={s.macroLabel}>kcal</Text>
            </View>
            <View style={s.macroDivider} />
            <View style={s.macroItem}>
              <Text style={[s.macroVal, { color: CORAL }]}>{targets.protein}g</Text>
              <Text style={s.macroLabel}>Protein</Text>
            </View>
            <View style={s.macroDivider} />
            <View style={s.macroItem}>
              <Text style={[s.macroVal, { color: GOLD }]}>{targets.carbs}g</Text>
              <Text style={s.macroLabel}>Carbs</Text>
            </View>
            <View style={s.macroDivider} />
            <View style={s.macroItem}>
              <Text style={[s.macroVal, { color: SAGE }]}>{targets.fat}g</Text>
              <Text style={s.macroLabel}>Fat</Text>
            </View>
          </View>

          <Text style={s.targetHint}>Jonno will adjust these based on your activity and progress</Text>
        </View>
      )}

      <TouchableOpacity
        style={[s.btn, !goal && s.btnDisabled]}
        onPress={handleNext}
        disabled={!goal}
        activeOpacity={0.85}
      >
        <Text style={s.btnText}>Continue</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  inner: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(232,224,208,0.1)" },
  dotActive: { backgroundColor: GOLD },
  dotDone: { backgroundColor: GOLD },
  line: { flex: 1, height: 2, backgroundColor: "rgba(232,224,208,0.1)", marginHorizontal: 6 },
  lineDone: { backgroundColor: GOLD },
  step: { fontSize: 12, fontWeight: "600", color: GOLD, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: TEXT_C, marginBottom: 8 },
  subtitle: { fontSize: 15, color: MUTED, marginBottom: 24, lineHeight: 22 },

  goalCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(232,224,208,0.04)", borderRadius: 16,
    borderWidth: 1.5, borderColor: "rgba(232,224,208,0.08)", padding: 16,
  },
  goalIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  goalLabel: { fontSize: 16, fontWeight: "700", color: MUTED },
  goalDesc: { fontSize: 12, color: DIM, marginTop: 2 },

  targetCard: {
    backgroundColor: "rgba(232,224,208,0.04)", borderRadius: 18,
    borderWidth: 1, borderColor: "rgba(232,224,208,0.08)", padding: 18, marginTop: 20, gap: 12,
  },
  targetHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  targetTagline: { fontSize: 14, fontWeight: "700" },
  targetDetail: { fontSize: 13, color: MUTED },
  macroRow: { flexDirection: "row", paddingVertical: 8 },
  macroItem: { flex: 1, alignItems: "center", gap: 2 },
  macroVal: { fontSize: 18, fontWeight: "800", color: TEXT_C },
  macroLabel: { fontSize: 10, color: DIM },
  macroDivider: { width: 1, backgroundColor: "rgba(232,224,208,0.06)" },
  targetHint: { fontSize: 11, color: DIM, textAlign: "center" },

  btn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 20 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: BG, fontWeight: "800", fontSize: 16 },
});
