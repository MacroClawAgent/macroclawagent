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
  const fontSize   = Math.round(size * 0.36);
  const ringSize   = size + 6;
  const badgeSize  = Math.round(size * 0.38);
  const badgeFont  = Math.round(badgeSize * 0.52);
  const goal       = userProfile?.fitness_goal ?? "maintain";
  const goalEmoji  = GOAL_EMOJI[goal] ?? "🌿";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[{ width: ringSize, height: ringSize }, style]}>
      {/* White opaque ring */}
      <View style={[
        styles.ring,
        { width: ringSize, height: ringSize, borderRadius: ringSize / 2 },
      ]}>
        {/* Avatar circle */}
        <View style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        ]}>
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name || "?")}</Text>
        </View>
      </View>

      {/* Goal badge — bottom right */}
      <View style={[
        styles.badge,
        { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, bottom: -2, right: -2 },
      ]}>
        <Text style={{ fontSize: badgeFont }}>{goalEmoji}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ring: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
});
