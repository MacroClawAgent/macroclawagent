import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ProgressRingProps {
  ratio: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor?: string;
  centerLabel?: string;
  centerSubLabel?: string;
}

export function ProgressRing({
  ratio,
  size = 72,
  strokeWidth = 6,
  color,
  trackColor = "rgba(0,0,0,0.06)",
  centerLabel,
  centerSubLabel,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(1, Math.max(0, ratio)));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      {centerLabel ? (
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#1C1C1E" }}>{centerLabel}</Text>
          {centerSubLabel ? (
            <Text style={{ fontSize: 9, fontWeight: "500", color: "#9CA3AF" }}>{centerSubLabel}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
