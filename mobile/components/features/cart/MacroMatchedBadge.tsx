import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

export function MacroMatchedBadge() {
  const { colors } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: colors.greenAlpha, borderColor: colors.green + "33" }]}>
      <Text style={[styles.text, { color: colors.green }]}>Macro matched ✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
  },
  text: { fontSize: 11, fontWeight: "700" },
});
