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
    <View style={[styles.strip, { backgroundColor: colors.tealAlpha, borderColor: colors.teal }]}>
      <View style={[styles.accent, { backgroundColor: colors.teal }]} />
      <Text style={[styles.label, { color: colors.teal }]} numberOfLines={1}>
        Save to Smart Cart
      </Text>
      <TouchableOpacity
        onPress={onConfirm}
        activeOpacity={0.85}
        style={[styles.confirmBtn, { backgroundColor: colors.teal }]}
      >
        <Text style={styles.confirmText}>Build Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn} activeOpacity={0.7}>
        <Text style={[styles.dismissText, { color: colors.textMuted }]}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingRight: 10,
    overflow: "hidden",
  },
  accent: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
    marginLeft: 0,
  },
  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  confirmBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  confirmText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
  },
  dismissBtn: {
    paddingHorizontal: 4,
  },
  dismissText: {
    fontSize: 20,
    fontWeight: "400",
    lineHeight: 22,
  },
});
