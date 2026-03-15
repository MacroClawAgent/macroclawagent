import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../context/ThemeContext";

const ACTIONS = [
  { label: "Log Food", emoji: "🍽", route: "/nutrition/log-food" },
  { label: "Smart Cart", emoji: "🛒", route: "/(tabs)/cart" },
  { label: "Ask Jonno", emoji: "✦", route: "/(tabs)/agent" },
] as const;

export function QuickActionRow() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.row}>
      {ACTIONS.map((a) => (
        <TouchableOpacity
          key={a.label}
          activeOpacity={0.75}
          onPress={() => router.push(a.route as any)}
          style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={styles.emoji}>{a.emoji}</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, paddingHorizontal: 20 },
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emoji: { fontSize: 14 },
  label: { fontSize: 12, fontWeight: "600" },
});
