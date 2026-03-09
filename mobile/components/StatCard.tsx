import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  const { colors } = useTheme();
  const resolvedAccent = accent ?? colors.primary;
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.value, { color: resolvedAccent }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      {sub && <Text style={[styles.sub, { color: colors.mutedMore }]}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, padding: 16, gap: 2, borderWidth: 1 },
  value: { fontSize: 22, fontWeight: "800" },
  label: { fontSize: 12, fontWeight: "600" },
  sub: { fontSize: 11, marginTop: 2 },
});
