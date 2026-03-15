import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../../ui/Card";
import { ProgressRing } from "../../ui/ProgressRing";
import { useTheme } from "../../../context/ThemeContext";
import { fmtNum } from "../../../lib/formatters";

interface MacroStat {
  consumed: number;
  target: number;
  ratio: number;
}

interface HomeHeroCardProps {
  calorieProgress: { consumed: number; target: number; remaining: number; ratio: number };
  macros: {
    protein: MacroStat;
    carbs: MacroStat;
    fat: MacroStat;
  };
}

function MacroChip({
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
  return (
    <View style={styles.macroChip}>
      <View style={[styles.macroBar, { backgroundColor: color + "22" }]}>
        <View
          style={[
            styles.macroBarFill,
            {
              backgroundColor: color,
              width: `${Math.min(100, Math.round((consumed / Math.max(1, target)) * 100))}%` as `${number}%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.macroValue, { color: colors.textPrimary }]}>{consumed}<Text style={[styles.macroUnit, { color: colors.textMuted }]}>g</Text></Text>
      <Text style={[styles.macroLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

export function HomeHeroCard({ calorieProgress, macros }: HomeHeroCardProps) {
  const { colors } = useTheme();
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {/* Left: calories */}
        <View style={styles.left}>
          <Text style={[styles.todayLabel, { color: colors.textMuted }]}>Today's calories</Text>
          <Text style={[styles.calorieNum, { color: colors.textPrimary }]}>
            {fmtNum(calorieProgress.consumed)}
          </Text>
          <Text style={[styles.calorieTarget, { color: colors.textMuted }]}>
            of {fmtNum(calorieProgress.target)} kcal
          </Text>

          {/* Macro chips */}
          <View style={styles.macrosRow}>
            <MacroChip label="Protein" consumed={macros.protein.consumed} target={macros.protein.target} color={colors.macroProtein} />
            <MacroChip label="Carbs" consumed={macros.carbs.consumed} target={macros.carbs.target} color={colors.macroCarbs} />
            <MacroChip label="Fat" consumed={macros.fat.consumed} target={macros.fat.target} color={colors.macroFat} />
          </View>
        </View>

        {/* Right: ring */}
        <ProgressRing
          ratio={calorieProgress.ratio}
          size={80}
          strokeWidth={7}
          color={colors.teal}
          centerLabel={`${Math.round(calorieProgress.ratio * 100)}%`}
          centerSubLabel="done"
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  left: { flex: 1 },
  todayLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  calorieNum: { fontSize: 38, fontWeight: "900", letterSpacing: -1.5, lineHeight: 42 },
  calorieTarget: { fontSize: 13, fontWeight: "500", marginTop: 2, marginBottom: 16 },
  macrosRow: { flexDirection: "row", gap: 12 },
  macroChip: { alignItems: "flex-start", gap: 4 },
  macroBar: { width: 44, height: 3, borderRadius: 100, overflow: "hidden" },
  macroBarFill: { height: 3, borderRadius: 100 },
  macroValue: { fontSize: 14, fontWeight: "700", lineHeight: 16 },
  macroUnit: { fontSize: 10, fontWeight: "500" },
  macroLabel: { fontSize: 10, fontWeight: "500" },
});
