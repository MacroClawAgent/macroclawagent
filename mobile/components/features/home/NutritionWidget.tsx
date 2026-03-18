import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Card } from "../../ui/Card";

interface MacroStat {
  consumed: number;
  target: number;
  ratio: number;
}

interface NutritionWidgetProps {
  calorieProgress: { consumed: number; target: number; remaining: number; ratio: number };
  macros: {
    protein: MacroStat;
    carbs: MacroStat;
    fat: MacroStat;
  };
  goalLabel: string;
}

const MACRO_CARDS: Record<string, { bg: string; accent: string; gradient: [string, string] }> = {
  Protein: { bg: "#DCFCE7", accent: "#16A34A", gradient: ["#3ED598", "#1FBF75"] },
  Carbs:   { bg: "#FEF9C3", accent: "#D97706", gradient: ["#F7D07A", "#F4A622"] },
  Fat:     { bg: "#EDE9FE", accent: "#7C3AED", gradient: ["#7A7DFF", "#5C5FFF"] },
};

function MacroCard({
  label,
  consumed,
  target,
  color,
}: {
  label: string;
  consumed: number;
  target: number;
  color: string;
}) {
  const cfg = MACRO_CARDS[label] ?? { bg: "#F3F4F6", accent: color, gradient: [color, color] as [string, string] };
  const ratio = target > 0 ? Math.min(1, consumed / target) : 0;
  const remaining = Math.max(0, target - consumed);
  const pct = Math.round(ratio * 100);

  return (
    <View style={[mc.card, { backgroundColor: cfg.bg }]}>
      {/* Top gloss shimmer */}
      <View style={mc.gloss} />
      <Text style={mc.consumed}>
        {Number.isInteger(consumed) ? consumed : +consumed.toFixed(1)}
        <Text style={mc.unit}>g</Text>
      </Text>
      {/* Horizontal progress bar */}
      <View style={[mc.track, { backgroundColor: cfg.accent + "28" }]}>
        <LinearGradient
          colors={cfg.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[mc.fill, { width: `${pct}%` as `${number}%` }]}
        />
      </View>
      <Text style={mc.label}>{label}</Text>
      <Text style={[mc.rem, { color: cfg.accent }]}>
        {Number.isInteger(remaining) ? remaining : +remaining.toFixed(1)}g left
      </Text>
    </View>
  );
}

const mc = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    gap: 5,
    overflow: "hidden",
  },
  gloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  consumed: { fontSize: 20, fontWeight: "800", color: "#111827", letterSpacing: -0.5 },
  unit:     { fontSize: 11, fontWeight: "600", color: "#6B7280" },
  track: {
    width: "100%",
    height: 5,
    borderRadius: 100,
    overflow: "hidden",
  },
  fill: { height: 5, borderRadius: 100 },
  label: { fontSize: 11, fontWeight: "600", color: "#6B7280", letterSpacing: 0.1 },
  rem:   { fontSize: 10, fontWeight: "700" },
});

export function NutritionWidget({ calorieProgress, macros, goalLabel }: NutritionWidgetProps) {
  const router = useRouter();
  const calPct = Math.round(calorieProgress.ratio * 100);

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <SymbolView
              name={{ ios: "fork.knife", android: "restaurant", web: "restaurant" }}
              tintColor="#1FA79E"
              size={16}
            />
          </View>
          <View>
            <Text style={styles.widgetTitle}>Nutrition</Text>
            <Text style={styles.widgetSub}>{goalLabel}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/nutrition/log-food" as any)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#3B82F6", "#60A5FA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logBtn}
          >
            <Text style={styles.logBtnText}>+ Log</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Calorie summary row */}
      <View style={styles.calRow}>
        <View style={styles.calLeft}>
          <Text style={styles.calBig}>
            {calorieProgress.consumed.toLocaleString()}
          </Text>
          <Text style={styles.calOf}>
            {" / "}{calorieProgress.target.toLocaleString()} kcal
          </Text>
        </View>
        <View style={styles.calBadge}>
          <Text style={styles.calBadgePct}>{calPct}%</Text>
          <Text style={styles.calBadgeRem}>
            {calorieProgress.remaining.toLocaleString()} left
          </Text>
        </View>
      </View>

      {/* Glowing calorie capsule bar */}
      <View style={styles.calBar}>
        <LinearGradient
          colors={["#2BB6A6", "#35C7B8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.calBarFill, { width: `${calPct}%` as `${number}%` }]}
        />
      </View>

      {/* Pastel macro cards */}
      <View style={styles.macroRow}>
        <MacroCard label="Protein" consumed={macros.protein.consumed} target={macros.protein.target} color="#16A34A" />
        <MacroCard label="Carbs"   consumed={macros.carbs.consumed}   target={macros.carbs.target}   color="#D97706" />
        <MacroCard label="Fat"     consumed={macros.fat.consumed}     target={macros.fat.target}     color="#7C3AED" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, gap: 14 },

  // Header
  header:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge:  { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(43,182,166,0.18)" },
  widgetTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.3, color: "#1A1A1A" },
  widgetSub:   { fontSize: 11, fontWeight: "500", marginTop: 1, color: "#6B7280" },
  logBtn:     { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  logBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

  // Calorie summary
  calRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  calLeft: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  calBig:  { fontSize: 32, fontWeight: "800", letterSpacing: -1, color: "#1A1A1A" },
  calOf:   { fontSize: 13, fontWeight: "500", color: "#6B7280" },
  calBadge:    { alignItems: "center", backgroundColor: "rgba(43,182,166,0.12)", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  calBadgePct: { fontSize: 18, fontWeight: "800", color: "#1FA79E" },
  calBadgeRem: { fontSize: 10, fontWeight: "500", marginTop: 1, color: "#6B7280" },

  // Calorie bar — glowing capsule
  calBar:    { height: 12, borderRadius: 100, overflow: "hidden", backgroundColor: "rgba(43,182,166,0.15)" },
  calBarFill: { height: 12, borderRadius: 100 },

  // Macro cards row
  macroRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
});
