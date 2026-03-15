import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

interface AdaptiveMacroNoticeProps {
  text: string;
}

export function AdaptiveMacroNotice({ text }: AdaptiveMacroNoticeProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.notice,
        { backgroundColor: colors.tealAlpha, borderColor: colors.teal + "33" },
      ]}
    >
      <Text style={styles.icon}>✦</Text>
      <Text style={[styles.text, { color: colors.teal }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: { fontSize: 14, color: "#20C7B7" },
  text: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 18 },
});
