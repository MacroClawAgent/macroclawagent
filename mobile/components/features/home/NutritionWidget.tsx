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

function MacroRow({
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

  return (
    <View style={styles.macroRow}>
      <View style={styles.macroLeft}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <View>
          <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>{label}</Text>
          <View style={styles.macroBarWrap}>
            <View style={[styles.macroBarBg, { backgroundColor: color + "22" }]}>
              <View
                style={[
                  styles.macroBarFill,
                  { backgroundColor: color, width: `${Math.round(ratio * 100)}%` as `${number}%` },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
      <View style={styles.macroRight}>
        <Text style={[styles.macroConsumed, { color: colors.textPrimary }]}>
          {Number.isInteger(consumed) ? consumed : consumed.toFixed(1)}
          <Text style={[styles.macroUnit, { color: colors.textMuted }]}>g</Text>
        </Text>
        <Text style={[styles.macroTarget, { color: colors.textMuted }]}>/ {target}g</Text>
      </View>
      <View style={[styles.remainingBadge, { backgroundColor: color + "18" }]}>
        <Text style={[styles.remainingText, { color }]}>↑{remaining}g</Text>
      </View>
    </View>
  );
}

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
          style={[styles.logBtn, { backgroundColor: colors.teal }]}
          activeOpacity={0.8}
        >
          <Text style={styles.logBtnText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Calorie block */}
      <View style={styles.calorieBlock}>
        <View style={styles.calorieNumbers}>
          <Text style={[styles.calorieConsumed, { color: colors.textPrimary }]}>
            {calorieProgress.consumed.toLocaleString()}
          </Text>
          <Text style={[styles.calorieTarget, { color: colors.textMuted }]}>
            {" / "}{calorieProgress.target.toLocaleString()} kcal
          </Text>
        </View>
        <View style={styles.calorieRight}>
          <Text style={[styles.calPct, { color: colors.teal }]}>{calPct}%</Text>
          <Text style={[styles.calRemaining, { color: colors.textMuted }]}>
            {calorieProgress.remaining.toLocaleString()} left
          </Text>
        </View>
      </View>

      {/* Calorie progress bar */}
      <View style={[styles.calBarBg, { backgroundColor: colors.teal + "22" }]}>
        <View
          style={[
            styles.calBarFill,
            {
              backgroundColor: colors.teal,
              width: `${calPct}%` as `${number}%`,
            },
          ]}
        />
      </View>

      {/* Macro rows */}
      <View style={[styles.macroSection, { borderTopColor: colors.border }]}>
        <MacroRow label="Protein" consumed={macros.protein.consumed} target={macros.protein.target} color={colors.macroProtein} />
        <MacroRow label="Carbs"   consumed={macros.carbs.consumed}   target={macros.carbs.target}   color={colors.macroCarbs} />
        <MacroRow label="Fat"     consumed={macros.fat.consumed}     target={macros.fat.target}     color={colors.macroFat} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, gap: 14 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  widgetTitle: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  widgetSub: { fontSize: 11, fontWeight: "500", marginTop: 1 },
  logBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  logBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },

  calorieBlock: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  calorieNumbers: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  calorieConsumed: { fontSize: 34, fontWeight: "900", letterSpacing: -1 },
  calorieTarget: { fontSize: 14, fontWeight: "500" },
  calorieRight: { alignItems: "flex-end" },
  calPct: { fontSize: 18, fontWeight: "800" },
  calRemaining: { fontSize: 11, fontWeight: "500" },

  calBarBg: { height: 5, borderRadius: 100, overflow: "hidden" },
  calBarFill: { height: 5, borderRadius: 100 },

  macroSection: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 14, gap: 12 },

  macroRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  macroLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  macroDot: { width: 8, height: 8, borderRadius: 4 },
  macroLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  macroBarWrap: { width: 90 },
  macroBarBg: { height: 4, borderRadius: 100, overflow: "hidden" },
  macroBarFill: { height: 4, borderRadius: 100 },
  macroRight: { flexDirection: "row", alignItems: "baseline", gap: 1 },
  macroConsumed: { fontSize: 14, fontWeight: "700" },
  macroUnit: { fontSize: 10, fontWeight: "500" },
  macroTarget: { fontSize: 11, fontWeight: "500" },
  remainingBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  remainingText: { fontSize: 11, fontWeight: "700" },
});
