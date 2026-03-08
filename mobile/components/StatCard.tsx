import { View, Text, StyleSheet } from "react-native";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export function StatCard({ label, value, sub, accent = "#20C7B7" }: StatCardProps) {
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
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16,
    padding: 16, gap: 2,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  value: { fontSize: 22, fontWeight: "800" },
  label: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  sub: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
});
