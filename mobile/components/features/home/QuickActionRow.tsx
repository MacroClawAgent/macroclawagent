import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useTheme } from "../../../context/ThemeContext";

const ACTIONS: { label: string; ios: string; android: string; route: string }[] = [
  { label: "Log Food",   ios: "plus.square.fill", android: "add_box",       route: "/nutrition/log-food" },
  { label: "Smart Cart", ios: "cart.fill",         android: "shopping_cart", route: "/(tabs)/cart" },
  { label: "Ask Jonno",  ios: "sparkles",          android: "auto_awesome",  route: "/(tabs)/agent" },
];

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
          <SymbolView
            name={{ ios: a.ios, android: a.android, web: a.android }}
            tintColor={colors.teal}
            size={15}
          />
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
  label: { fontSize: 12, fontWeight: "600" },
});
