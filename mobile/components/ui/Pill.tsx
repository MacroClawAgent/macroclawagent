import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface PillProps {
  label: string;
  color: string;
  bg: string;
  size?: "sm" | "md";
  style?: ViewStyle;
}

export function Pill({ label, color, bg, size = "md", style }: PillProps) {
  const isSmall = size === "sm";
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: bg, paddingHorizontal: isSmall ? 8 : 10, paddingVertical: isSmall ? 3 : 5 },
        style,
      ]}
    >
      <Text style={[styles.text, { color, fontSize: isSmall ? 10 : 11 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
