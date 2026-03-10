import { View, Text } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface ProgressBarProps {
  progress: number; // 0–1
  label?: string;
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, label, color, height = 6 }: ProgressBarProps) {
  const { colors } = useTheme();
  const pct = Math.min(Math.max(progress, 0), 1);
  const barColor = color ?? colors.primary;
  return (
    <View style={{ gap: 6 }}>
      {label && (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>{label}</Text>
          <Text style={{ fontSize: 12, fontWeight: "700", color: barColor }}>
            {Math.round(pct * 100)}%
          </Text>
        </View>
      )}
      <View
        style={{
          height,
          backgroundColor: colors.inputBg,
          borderRadius: height / 2,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height,
            width: `${pct * 100}%`,
            backgroundColor: barColor,
            borderRadius: height / 2,
          }}
        />
      </View>
    </View>
  );
}
