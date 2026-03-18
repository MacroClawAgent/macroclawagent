import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { getInitials } from "../../lib/formatters";
import { useAuth } from "../../context/AuthContext";

const GOAL_EMOJI: Record<string, string> = {
  lose_weight: "🔥", build_muscle: "💪", performance: "⚡", maintain: "🌿",
};

interface AvatarButtonProps {
  name: string;
  onPress: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export function AvatarButton({ name, onPress, size = 36, color = "#20C7B7", style }: AvatarButtonProps) {
  const { userProfile } = useAuth();
  const fontSize  = Math.round(size * 0.36);
  const badgeSize = Math.round(size * 0.36);
  const badgeFont = Math.round(badgeSize * 0.55);
  const goal      = userProfile?.fitness_goal ?? "maintain";
  const goalEmoji = GOAL_EMOJI[goal] ?? "🌿";
  const totalSize = size + 8; // ring adds 4px each side

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[{ width: totalSize, height: totalSize }, style]}
    >
      {/* White ring */}
      <View style={[styles.ring, { width: totalSize, height: totalSize, borderRadius: totalSize / 2 }]}>
        {/* Teal avatar */}
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name || "?")}</Text>
        </View>
      </View>

      {/* Goal badge — bottom right */}
      <View style={[styles.badge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, bottom: 0, right: 0 }]}>
        <Text style={{ fontSize: badgeFont, lineHeight: badgeSize }}>{goalEmoji}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  badge: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    overflow: "hidden",
  },
});
