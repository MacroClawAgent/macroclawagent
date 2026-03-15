import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

interface JonnoInsightCardProps {
  title: string;
  body: string;
}

export function JonnoInsightCard({ title, body }: JonnoInsightCardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.tealAlpha, borderColor: colors.teal + "33" },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: colors.teal }]}>
          <Text style={styles.icon}>✦</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.teal }]}>{title}</Text>
          <Text style={[styles.body, { color: colors.textPrimary }]}>{body}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  icon: { fontSize: 12, color: "#FFFFFF", fontWeight: "900" },
  content: { flex: 1 },
  title: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  body: { fontSize: 14, fontWeight: "500", lineHeight: 20 },
});
