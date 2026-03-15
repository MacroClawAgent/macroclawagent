import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { getInitials } from "../../lib/formatters";

interface AvatarButtonProps {
  name: string;
  onPress: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export function AvatarButton({ name, onPress, size = 36, color = "#20C7B7", style }: AvatarButtonProps) {
  const fontSize = Math.round(size * 0.36);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name || "?")}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
