import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Card } from "../../ui/Card";
import { useTheme } from "../../../context/ThemeContext";

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
  const { colors } = useTheme();
  const ratio = target > 0 ? Math.min(1, consumed / target) : 0;
  const remaining = Math.max(0, target - consumed);
  const pct = Math.round(ratio * 100);

  return (
    <View style={vb.col}>
      <Text style={[vb.consumed, { color: colors.textPrimary }]}>
        {Number.isInteger(consumed) ? consumed : +consumed.toFixed(1)}
        <Text style={[vb.unit, { color: colors.textMuted }]}>g</Text>
      </Text>
      <View style={[vb.track, { backgroundColor: color + "20" }]}>
        <View
          style={[vb.fill, { backgroundColor: color, height: `${pct}%` as `${number}%` }]}
        />
      </View>
      <Text style={[vb.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[vb.rem, { color }]}>
        {Number.isInteger(remaining) ? remaining : +remaining.toFixed(1)}g left
      </Text>
    </View>
  );
}

const vb = StyleSheet.create({
  col:      { flex: 1, alignItems: "center", gap: 6 },
  consumed: { fontSize: 15, fontWeight: "700" },
  unit:     { fontSize: 10, fontWeight: "500" },
  track: {
    width: 42,
    height: 96,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  fill:  { width: "100%", borderRadius: 14 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
  rem:   { fontSize: 10, fontWeight: "600" },
});

export function NutritionWidget({ calorieProgress, macros, goalLabel }: NutritionWidgetProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const calPct = Math.round(calorieProgress.ratio * 100);

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: colors.tealAlpha }]}>
            <SymbolView
              name={{ ios: "fork.knife", android: "restaurant", web: "restaurant" }}
              tintColor={colors.teal}
              size={16}
            />
          </View>
          <View>
            <Text style={[styles.widgetTitle, { color: colors.textPrimary }]}>Nutrition</Text>
            <Text style={[styles.widgetSub, { color: colors.textMuted }]}>{goalLabel}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/nutrition/log-food" as any)}
          style={styles.logBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.logBtnText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Calorie summary row */}
      <View style={styles.calRow}>
        <View style={styles.calLeft}>
          <Text style={[styles.calBig, { color: colors.textPrimary }]}>
            {calorieProgress.consumed.toLocaleString()}
          </Text>
          <Text style={[styles.calOf, { color: colors.textMuted }]}>
            {" / "}{calorieProgress.target.toLocaleString()} kcal
          </Text>
        </View>
        <View style={[styles.calBadge, { backgroundColor: colors.tealAlpha }]}>
          <Text style={[styles.calBadgePct, { color: colors.teal }]}>{calPct}%</Text>
          <Text style={[styles.calBadgeRem, { color: colors.textMuted }]}>
            {calorieProgress.remaining.toLocaleString()} left
          </Text>
        </View>
      </View>

      {/* Thick calorie bar */}
      <View style={[styles.calBar, { backgroundColor: colors.teal + "22" }]}>
        <View
          style={[styles.calBarFill, { backgroundColor: colors.teal, width: `${calPct}%` as `${number}%` }]}
        />
      </View>

      {/* Vertical macro bars */}
      <View style={[styles.barsRow, { borderTopColor: colors.border }]}>
        <VerticalBar label="Protein" consumed={macros.protein.consumed} target={macros.protein.target} color={colors.macroProtein} />
        <View style={[styles.barDivider, { backgroundColor: colors.border }]} />
        <VerticalBar label="Carbs"   consumed={macros.carbs.consumed}   target={macros.carbs.target}   color={colors.macroCarbs} />
        <View style={[styles.barDivider, { backgroundColor: colors.border }]} />
        <VerticalBar label="Fat"     consumed={macros.fat.consumed}     target={macros.fat.target}     color={colors.macroFat} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, gap: 14 },

  // Header
  header:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge:  { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  widgetTitle: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  widgetSub:   { fontSize: 11, fontWeight: "500", marginTop: 1 },
  logBtn:     { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: "#4C7DFF" },
  logBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },

  // Calorie summary
  calRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  calLeft: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  calBig:  { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  calOf:   { fontSize: 13, fontWeight: "500" },
  calBadge:    { alignItems: "center", backgroundColor: "transparent", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  calBadgePct: { fontSize: 18, fontWeight: "800" },
  calBadgeRem: { fontSize: 10, fontWeight: "500", marginTop: 1 },

  // Calorie bar
  calBar:    { height: 8, borderRadius: 100, overflow: "hidden" },
  calBarFill: { height: 8, borderRadius: 100 },

  // Vertical macro bars
  barsRow:    { flexDirection: "row", alignItems: "flex-end", borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 16 },
  barDivider: { width: StyleSheet.hairlineWidth, height: 80, alignSelf: "center" },
});
