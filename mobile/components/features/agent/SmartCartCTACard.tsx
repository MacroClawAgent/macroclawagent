import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

interface SmartCartCTACardProps {
  onConfirm: () => void;
  onDismiss: () => void;
}

export function SmartCartCTACard({ onConfirm, onDismiss }: SmartCartCTACardProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onConfirm}
      activeOpacity={0.85}
      style={[styles.btn, { backgroundColor: colors.teal }]}
    >
      <Text style={styles.label}>Save to Smart Cart</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },
  label: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
