import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "../../ui/ProgressBar";
import { useTheme } from "../../../context/ThemeContext";

interface MacroMiniCardProps {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
}

export function MacroMiniCard({ label, consumed, target, unit, color }: MacroMiniCardProps) {
  const { colors } = useTheme();
  const ratio = target > 0 ? consumed / target : 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.textPrimary }]}>
        {consumed}<Text style={[styles.unit, { color: colors.textMuted }]}>{unit}</Text>
      </Text>
      <ProgressBar ratio={ratio} color={color} height={3} />
      <Text style={[styles.target, { color: colors.textMuted }]}>/ {target}{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  label: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 18, fontWeight: "800", lineHeight: 22 },
  unit: { fontSize: 11, fontWeight: "500" },
  target: { fontSize: 10, fontWeight: "500", marginTop: 2 },
});
