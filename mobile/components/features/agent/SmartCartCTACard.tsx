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
    <View style={[styles.card, { backgroundColor: colors.tealAlpha, borderColor: colors.teal }]}>
      <Text style={[styles.label, { color: colors.teal }]}>✦ Ready to build</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        Save this plan to Smart Cart and start building your week.
      </Text>
      <TouchableOpacity
        onPress={onConfirm}
        activeOpacity={0.85}
        style={[styles.confirmBtn, { backgroundColor: colors.teal }]}
      >
        <Text style={styles.confirmText}>Build Smart Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
        <Text style={[styles.dismissText, { color: colors.textMuted }]}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  confirmBtn: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 2,
  },
  confirmText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 15,
  },
  dismissBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  dismissText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
