import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "../../ui/Card";
import { useTheme } from "../../../context/ThemeContext";
import { apiGet } from "../../../lib/api";

interface FoodItem {
  id: string;
  meal_tag: string;
  name: string;
  calories: number;
  protein_g: number;
}

const MEAL_TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"];

function toLocalDateStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function MealsEatenCard() {
  const { colors } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ items: FoodItem[] }>(`/api/nutrition/food-items?date=${toLocalDateStr()}`)
      .then((res) => setItems(res.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = MEAL_TAGS.map((tag) => ({
    tag,
    items: items.filter((i) => i.meal_tag === tag),
  })).filter((g) => g.items.length > 0);

  const totalKcal = items.reduce((s, i) => s + (i.calories ?? 0), 0);

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: colors.tealAlpha }]}>
            <Text style={styles.iconEmoji}>🍽️</Text>
          </View>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Meals Today</Text>
            {items.length > 0 && (
              <Text style={[styles.sub, { color: colors.textMuted }]}>
                {+totalKcal.toFixed(1)} kcal logged
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/nutrition/log-food" as any)}
          style={styles.logBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.logBtnText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.teal} />
        </View>
      ) : grouped.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nothing logged yet</Text>
          <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
            Tap + Log to add your first meal
          </Text>
        </View>
      ) : (
        <View style={styles.groups}>
          {grouped.map((g) => (
            <View key={g.tag} style={[styles.group, { borderTopColor: colors.border }]}>
              <Text style={[styles.tagLabel, { color: colors.teal }]}>{g.tag}</Text>
              {g.items.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemKcal, { color: colors.textMuted }]}>
                    {+item.calories.toFixed(1)} kcal
                  </Text>
                </View>
              ))}
              {g.items.length > 3 && (
                <Text style={[styles.more, { color: colors.textMuted }]}>
                  +{g.items.length - 3} more
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, gap: 12 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  iconEmoji: { fontSize: 18 },
  title: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  sub: { fontSize: 11, fontWeight: "500", marginTop: 1 },
  logBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: "#4C7DFF" },
  logBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },

  center: { alignItems: "center", justifyContent: "center", paddingVertical: 28, gap: 4 },
  emptyTitle: { fontSize: 14, fontWeight: "700" },
  emptyBody: { fontSize: 12, fontWeight: "500" },

  groups: { gap: 0 },
  group: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8, paddingBottom: 4, gap: 4 },
  tagLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3, marginBottom: 2 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemName: { fontSize: 13, fontWeight: "500", flex: 1, marginRight: 8 },
  itemKcal: { fontSize: 12, fontWeight: "600" },
  more: { fontSize: 11, fontWeight: "500", marginTop: 2 },
});
