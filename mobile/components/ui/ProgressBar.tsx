import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface ProgressBarProps {
  ratio: number; // 0 to 1
  color: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
  borderRadius?: number;
}

export function ProgressBar({
  ratio,
  color,
  trackColor = "rgba(0,0,0,0.06)",
  height = 6,
  style,
  borderRadius = 100,
}: ProgressBarProps) {
  const pct = `${Math.min(100, Math.max(0, ratio * 100))}%` as `${number}%`;
  return (
    <View
      style={[
        styles.track,
        { backgroundColor: trackColor, height, borderRadius },
        style,
      ]}
    >
      <View
        style={[styles.fill, { backgroundColor: color, width: pct, height, borderRadius }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: "hidden",
    width: "100%",
  },
  fill: {},
});
