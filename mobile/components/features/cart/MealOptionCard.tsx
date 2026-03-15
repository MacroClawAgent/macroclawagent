import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../../ui/Card";
import { Pill } from "../../ui/Pill";
import { useTheme } from "../../../context/ThemeContext";

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  Breakfast: { color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  Lunch: { color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  Dinner: { color: "#6366F1", bg: "rgba(99,102,241,0.10)" },
  Snack: { color: "#F97316", bg: "rgba(249,115,22,0.10)" },
};

interface MealOptionCardProps {
  name: string;
  tag: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  prepMin?: number;
  onPress?: () => void;
}

export function MealOptionCard({ name, tag, kcal, protein, carbs, fat, prepMin, onPress }: MealOptionCardProps) {
  const { colors } = useTheme();
  const tagStyle = TAG_COLORS[tag] ?? { color: colors.teal, bg: colors.tealAlpha };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.topRow}>
          <Pill label={tag} color={tagStyle.color} bg={tagStyle.bg} />
          {prepMin ? (
            <Text style={[styles.prep, { color: colors.textMuted }]}>{prepMin} min</Text>
          ) : null}
        </View>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{name}</Text>
        <View style={styles.macros}>
          <MacroChip label="kcal" value={kcal} color={colors.macroCalories} colors={colors} />
          <MacroChip label="P" value={protein} unit="g" color={colors.macroProtein} colors={colors} />
          <MacroChip label="C" value={carbs} unit="g" color={colors.macroCarbs} colors={colors} />
          <MacroChip label="F" value={fat} unit="g" color={colors.macroFat} colors={colors} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function MacroChip({ label, value, unit = "", color, colors }: any) {
  return (
    <View style={[styles.chip, { backgroundColor: color + "14" }]}>
      <Text style={[styles.chipVal, { color }]}>{value}{unit}</Text>
      <Text style={[styles.chipLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  prep: { fontSize: 12, fontWeight: "500" },
  name: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  macros: { flexDirection: "row", gap: 6 },
  chip: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, alignItems: "center" },
  chipVal: { fontSize: 13, fontWeight: "700", lineHeight: 16 },
  chipLabel: { fontSize: 9, fontWeight: "600", textTransform: "uppercase" },
});
