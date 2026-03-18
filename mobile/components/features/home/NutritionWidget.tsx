import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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

const MACRO_GRADIENTS: Record<string, [string, string]> = {
  Protein: ["#3ED598", "#1FBF75"],
  Carbs:   ["#F7D07A", "#F4A622"],
  Fat:     ["#7A7DFF", "#5C5FFF"],
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
  const ratio = target > 0 ? Math.min(1, consumed / target) : 0;
  const remaining = Math.max(0, target - consumed);
  const pct = Math.round(ratio * 100);
  const gradient = MACRO_GRADIENTS[label] ?? ([color, color] as [string, string]);

  return (
    <View style={vb.col}>
      <Text style={vb.consumed}>
        {Number.isInteger(consumed) ? consumed : +consumed.toFixed(1)}
        <Text style={vb.unit}>g</Text>
      </Text>
      {/* Capsule track */}
      <View style={[vb.track, { backgroundColor: gradient[0] + "20" }]}>
        {/* Gradient fill from bottom */}
        <LinearGradient
          colors={[gradient[1], gradient[0]]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={[vb.fill, { height: `${pct}%` as `${number}%` }]}
        />
        {/* Glass shine overlay */}
        <View style={vb.shine} />
      </View>
      <Text style={vb.label}>{label}</Text>
      <Text style={[vb.rem, { color: gradient[0] }]}>
        {Number.isInteger(remaining) ? remaining : +remaining.toFixed(1)}g left
      </Text>
    </View>
  );
}

const vb = StyleSheet.create({
  col:      { flex: 1, alignItems: "center", gap: 5 },
  consumed: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
  unit:     { fontSize: 10, fontWeight: "500", color: "#6B7280" },
  track: {
    width: 48,
    height: 88,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  fill:  { width: "100%", borderRadius: 24 },
  shine: {
    position: "absolute",
    top: 0,
    left: 4,
    width: 8,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 8,
  },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 0.1, color: "#6B7280" },
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
          <View style={styles.iconBadge}>
            <SymbolView
              name={{ ios: "fork.knife", android: "restaurant", web: "restaurant" }}
              tintColor="#1FA79E"
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
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#5C8CFF", "#6BA9FF"]}
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

      {/* Vertical macro bars */}
      <View style={[styles.barsRow, { borderTopColor: colors.border }]}>
        <VerticalBar label="Protein" consumed={macros.protein.consumed} target={macros.protein.target} color={colors.macroProtein} />
        <VerticalBar label="Carbs"   consumed={macros.carbs.consumed}   target={macros.carbs.target}   color={colors.macroCarbs} />
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
  calBar:    { height: 8, borderRadius: 100, overflow: "hidden", backgroundColor: "rgba(43,182,166,0.15)" },
  calBarFill: { height: 8, borderRadius: 100 },

  // Vertical macro bars
  barsRow: { flexDirection: "row", alignItems: "flex-start", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.06)", paddingTop: 16, gap: 4 },
});
