import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface TargetTileProps {
  label: string;
  value: string;
  unit: string;
  icon: string;
  color: string;
}

export function TargetTile({ label, value, unit, icon, color }: TargetTileProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: colors.card2 }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text
        style={[styles.value, { color }]}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={[styles.unit, { color: colors.mutedMore }]}>{unit}</Text>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    gap: 2,
    minWidth: 0,
  },
  icon: { fontSize: 16, marginBottom: 2 },
  value: { fontSize: 19, fontWeight: "800", textAlign: "center" },
  unit: { fontSize: 10, fontWeight: "600", textAlign: "center" },
  label: { fontSize: 10, fontWeight: "600", textAlign: "center" },
});
