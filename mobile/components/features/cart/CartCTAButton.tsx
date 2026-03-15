import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

interface CartCTAButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  secondary?: { label: string; onPress: () => void };
}

export function CartCTAButton({ label, onPress, loading = false, secondary }: CartCTAButtonProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={loading}
        style={[styles.primary, { backgroundColor: colors.blue }]}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={styles.primaryLabel}>{label}</Text>
        )}
      </TouchableOpacity>
      {secondary ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={secondary.onPress}
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
        >
          <Text style={[styles.secondaryLabel, { color: colors.textSecondary }]}>{secondary.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 28,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primary: {
    height: 54,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryLabel: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    height: 44,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryLabel: { fontSize: 14, fontWeight: "600" },
});
