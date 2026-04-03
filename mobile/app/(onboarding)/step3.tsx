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

// ── Mifflin-St Jeor BMR + activity/goal adjustment ──────────────────────────
// BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(years) + s
// where s = +5 for male (default), −161 for female
// We don't ask gender yet so we use the average: s = −78

const SPORT_ACTIVITY: Record<string, number> = {
  "Running":         1.55,  // moderate-high cardio
  "Cycling":         1.55,
  "Gym / Strength":  1.50,  // moderate lifting
  "Swimming":        1.60,  // full-body high output
  "Triathlon":       1.725, // very active
  "Other":           1.45,  // light-moderate
};

function calcAge(dob: string): number {
  if (!dob || dob.length !== 10) return 25; // default
  const [dd, mm, yyyy] = dob.split("/").map(Number);
  const birth = new Date(yyyy, mm - 1, dd);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return Math.max(13, Math.min(80, age));
}

function calcTargets(goal: string, weightKg: number, heightCm: number, dob: string, sport: string, metabolism: string) {
  const w = weightKg > 0 ? weightKg : 70;
  const h = heightCm > 0 ? heightCm : 175;
  const age = calcAge(dob);

  // Mifflin-St Jeor (gender-neutral average)
  const bmr = 10 * w + 6.25 * h - 5 * age - 78;

  // Activity multiplier from sport
  const activityMul = SPORT_ACTIVITY[sport] ?? 1.45;

  // Metabolism adjustment
  const metaMul = metabolism === "fast" ? 1.08 : metabolism === "slow" ? 0.92 : 1;

  // TDEE (Total Daily Energy Expenditure)
  const tdee = Math.round(bmr * activityMul * metaMul);

  let cal: number, pro: number, carbs: number, fat: number;
  switch (goal) {
    case "lose_weight":
      // 20% deficit for ~0.5kg/week loss
      cal = Math.round(tdee * 0.80);
      pro = Math.round(w * 2.0);   // high protein to preserve muscle
      fat = Math.round(w * 0.9);   // ~0.9g/kg
      carbs = Math.round((cal - pro * 4 - fat * 9) / 4);
      break;
    case "build_muscle":
      // 10-15% surplus
      cal = Math.round(tdee * 1.12);
      pro = Math.round(w * 2.2);   // peak muscle protein synthesis
      fat = Math.round(w * 1.0);   // healthy hormones
      carbs = Math.round((cal - pro * 4 - fat * 9) / 4);
      break;
    case "performance":
      // Maintenance + slightly higher carbs
      cal = Math.round(tdee * 1.05);
      pro = Math.round(w * 1.8);
      fat = Math.round(w * 0.8);
      carbs = Math.round((cal - pro * 4 - fat * 9) / 4);
      break;
    default: // maintain / stay healthy
      cal = tdee;
      pro = Math.round(w * 1.6);
      fat = Math.round(w * 0.9);
      carbs = Math.round((cal - pro * 4 - fat * 9) / 4);
  }
  // Safety: ensure carbs don't go negative
  if (carbs < 50) { carbs = 50; cal = pro * 4 + fat * 9 + carbs * 4; }

  return { calories: cal, protein: pro, carbs, fat, tdee, bmr: Math.round(bmr), age };
}

function goalDetail(goal: string, targets: ReturnType<typeof calcTargets>) {
  const deficit = targets.tdee - targets.calories;
  const surplus = targets.calories - targets.tdee;
  switch (goal) {
    case "lose_weight":
      return { tagline: "20% deficit for sustainable fat loss", detail: `${deficit} kcal deficit · ~${(deficit * 7 / 7700).toFixed(1)} kg/week`, icon: "trending-down-outline", color: CORAL };
    case "build_muscle":
      return { tagline: "Controlled surplus for lean gains", detail: `+${surplus} kcal surplus · ${targets.protein}g protein/day`, icon: "barbell-outline", color: SAGE };
    case "performance":
      return { tagline: "Fuel your training and recovery", detail: `High carbs (${targets.carbs}g) for energy + endurance`, icon: "flash-outline", color: GOLD };
    default:
      return { tagline: "Balanced nutrition for long-term health", detail: `Maintenance at ${targets.tdee} TDEE`, icon: "heart-outline", color: SAGE };
  }
}

export default function OnboardingStep3() {
  const params = useLocalSearchParams<{
    first_name: string; last_name: string; dob?: string; sport?: string;
    weight_kg: string; height_cm: string; metabolism?: string; unit?: string;
  }>();

  const [goal, setGoal] = useState("");
  const weightKg = parseInt(params.weight_kg ?? "70");
  const heightCm = parseInt(params.height_cm ?? "175");
  const dob = params.dob ?? "";
  const sport = params.sport ?? "Other";
  const metabolism = params.metabolism ?? "normal";
  const targets = goal ? calcTargets(goal, weightKg, heightCm, dob, sport, metabolism) : null;
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
      <View style={{ gap: 8 }}>
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
  subtitle: { fontSize: 15, color: MUTED, marginBottom: 16, lineHeight: 22 },

  goalCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(232,224,208,0.04)", borderRadius: 14,
    borderWidth: 1.5, borderColor: "rgba(232,224,208,0.08)", padding: 13,
  },
  goalIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  goalLabel: { fontSize: 16, fontWeight: "700", color: MUTED },
  goalDesc: { fontSize: 12, color: DIM, marginTop: 2 },

  targetCard: {
    backgroundColor: "rgba(232,224,208,0.04)", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(232,224,208,0.08)", padding: 14, marginTop: 14, gap: 8,
  },
  targetHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  targetTagline: { fontSize: 14, fontWeight: "700" },
  targetDetail: { fontSize: 13, color: MUTED },
  macroRow: { flexDirection: "row", paddingVertical: 4 },
  macroItem: { flex: 1, alignItems: "center", gap: 2 },
  macroVal: { fontSize: 16, fontWeight: "800", color: TEXT_C },
  macroLabel: { fontSize: 10, color: DIM },
  macroDivider: { width: 1, backgroundColor: "rgba(232,224,208,0.06)" },
  btn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 14 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: BG, fontWeight: "800", fontSize: 16 },
});
