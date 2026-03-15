import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface SectionTitleProps {
  label: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionTitle({ label, action, onAction, style }: SectionTitleProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={[styles.action, { color: colors.teal }]}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 17,
    fontWeight: "700",
  },
  action: {
    fontSize: 13,
    fontWeight: "600",
  },
});
