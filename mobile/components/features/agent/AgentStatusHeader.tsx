import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { StatusDot } from "../../ui/StatusDot";

export function AgentStatusHeader() {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <View style={[styles.avatar, { backgroundColor: colors.teal }]}>
        <Text style={styles.avatarText}>✦</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>Jonno</Text>
        <View style={styles.statusRow}>
          <StatusDot color={colors.green} size={7} />
          <Text style={[styles.status, { color: colors.textMuted }]}>Online · Nutrition & Fitness only</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, color: "#FFF", fontWeight: "900" },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: "800" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  status: { fontSize: 12, fontWeight: "500" },
});
