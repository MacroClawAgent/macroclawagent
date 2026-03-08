import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface MacroRingProps {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
  size?: number;
}

export function MacroRing({ label, value, goal, unit, color, size = 80 }: MacroRingProps) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = goal > 0 ? Math.min(value / goal, 1) : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={[styles.value, { color }]}>{Math.round(value)}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.goal}>/ {goal}{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 4 },
  center: { position: "absolute", justifyContent: "center", alignItems: "center" },
  value: { fontSize: 16, fontWeight: "800" },
  unit: { fontSize: 9, color: "#9CA3AF", fontWeight: "600" },
  label: { fontSize: 11, fontWeight: "700", color: "#1C1C1E" },
  goal: { fontSize: 10, color: "#9CA3AF" },
});
