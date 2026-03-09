import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export function StatCard({ label, value, sub, accent = colors.primary }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: colors.card, borderRadius: 16,
    padding: 16, gap: 2,
    borderWidth: 1, borderColor: colors.border,
  },
  value: { fontSize: 22, fontWeight: "800" },
  label: { fontSize: 12, fontWeight: "600", color: colors.muted },
  sub: { fontSize: 11, color: colors.mutedMore, marginTop: 2 },
});
