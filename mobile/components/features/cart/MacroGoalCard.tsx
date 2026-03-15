import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../../ui/Card";
import { ProgressBar } from "../../ui/ProgressBar";
import { useTheme } from "../../../context/ThemeContext";

interface MacroGoalCardProps {
  label: string;
  consumed: number;
  target: number;
  ratio: number;
}

export function MacroGoalCard({ label, consumed, target, ratio }: MacroGoalCardProps) {
  const { colors } = useTheme();
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.ratio, { color: colors.teal }]}>{Math.round(ratio * 100)}%</Text>
      </View>
      <ProgressBar ratio={ratio} color={colors.teal} height={6} style={styles.bar} />
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        {consumed}g consumed · {target}g target
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  label: { fontSize: 15, fontWeight: "700" },
  ratio: { fontSize: 14, fontWeight: "800" },
  bar: { marginBottom: 8 },
  sub: { fontSize: 12, fontWeight: "500" },
});
