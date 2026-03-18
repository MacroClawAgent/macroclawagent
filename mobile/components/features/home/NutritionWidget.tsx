import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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

const BAR_HEIGHT = 96;

const MACRO_CFG: Record<string, { accent: string; trackBg: string; gradient: [string, string] }> = {
  Protein: { accent: "#16A34A", trackBg: "rgba(22,163,74,0.12)",  gradient: ["#1FBF75", "#3ED598"] },
  Carbs:   { accent: "#D97706", trackBg: "rgba(217,119,6,0.12)",  gradient: ["#F4A622", "#F7D07A"] },
  Fat:     { accent: "#7C3AED", trackBg: "rgba(124,58,237,0.12)", gradient: ["#5C5FFF", "#7A7DFF"] },
};

function VerticalBar({
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
  const cfg = MACRO_CFG[label] ?? { accent: color, trackBg: color + "20", gradient: [color, color] as [string, string] };
  const ratio = target > 0 ? Math.min(1, consumed / target) : 0;
  const fillH = Math.round(ratio * BAR_HEIGHT);
  const consumedStr = Number.isInteger(consumed) ? String(consumed) : consumed.toFixed(1);
  const targetStr = Number.isInteger(target) ? String(target) : target.toFixed(0);

  return (
    <View style={vb.col}>
      {/* Consumed value */}
      <Text style={vb.valTop}>
        {consumedStr}<Text style={vb.unit}>g</Text>
      </Text>

      {/* Vertical track */}
      <View style={[vb.track, { backgroundColor: cfg.trackBg }]}>
        {/* Fill from bottom */}
        <View style={vb.fillWrap}>
          <LinearGradient
            colors={cfg.gradient}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={[vb.fill, { height: fillH }]}
          />
        </View>
        {/* Gloss overlay */}
        <View style={vb.gloss} />
      </View>

      {/* Label + target */}
      <Text style={[vb.label, { color: cfg.accent }]}>{label}</Text>
      <Text style={vb.target}>{targetStr}g</Text>
    </View>
  );
}

const vb = StyleSheet.create({
  col: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  valTop: { fontSize: 15, fontWeight: "800", color: "#111827", letterSpacing: -0.4 },
  unit:   { fontSize: 10, fontWeight: "600", color: "#6B7280" },
  track: {
    width: 32,
    height: BAR_HEIGHT,
    borderRadius: 100,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  fillWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  fill: {
    width: "100%",
    borderRadius: 100,
  },
  gloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  label:  { fontSize: 11, fontWeight: "700", letterSpacing: 0.1 },
  target: { fontSize: 10, fontWeight: "500", color: "#9CA3AF" },
});

export function NutritionWidget({ calorieProgress, macros, goalLabel }: NutritionWidgetProps) {
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

      {/* Vertical macro bars */}
      <View style={styles.macroRow}>
        <VerticalBar label="Protein" consumed={macros.protein.consumed} target={macros.protein.target} color="#16A34A" />
        <VerticalBar label="Carbs"   consumed={macros.carbs.consumed}   target={macros.carbs.target}   color="#D97706" />
        <VerticalBar label="Fat"     consumed={macros.fat.consumed}     target={macros.fat.target}     color="#7C3AED" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, gap: 14, flex: 1 },

  // Header
  header:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge:  { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(43,182,166,0.18)" },
  widgetTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.3, color: "#1A1A1A" },
  widgetSub:   { fontSize: 11, fontWeight: "500", marginTop: 1, color: "#6B7280" },
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

  // Vertical macro bars row
  macroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingTop: 14,
    gap: 8,
  },
});
