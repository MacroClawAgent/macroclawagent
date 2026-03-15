import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { StatusDot } from "../../ui/StatusDot";

const AVATAR = require("../../../assets/images/avatar.png");

interface AgentStatusHeaderProps {
  textColor?: string;
  dotColor?: string;
}

export function AgentStatusHeader({ textColor, dotColor }: AgentStatusHeaderProps = {}) {
  const { colors } = useTheme();
  const resolvedText = textColor ?? colors.textPrimary;
  const resolvedDot = dotColor ?? colors.green;
  return (
    <View style={styles.header}>
      <Image source={AVATAR} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: resolvedText }]}>Jonno</Text>
        <View style={styles.statusRow}>
          <StatusDot color={resolvedDot} size={7} />
          <Text style={[styles.status, { color: textColor ? "rgba(255,255,255,0.7)" : colors.textMuted }]}>Online · Nutrition & Fitness only</Text>
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
  },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: "800" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  status: { fontSize: 12, fontWeight: "500" },
});
