import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "../../ui/Card";
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
          <View style={styles.iconBadge}>
            <Text style={styles.iconEmoji}>🍽️</Text>
          </View>
          <View>
            <Text style={styles.title}>Meals Today</Text>
            {items.length > 0 && (
              <Text style={styles.sub}>
                {+totalKcal.toFixed(1)} kcal logged
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#2BB6A6" />
        </View>
      ) : grouped.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Nothing logged yet</Text>
          <Text style={styles.emptyBody}>
            Use the + button below to log a meal
          </Text>
        </View>
      ) : (
        <View style={styles.groups}>
          {grouped.map((g) => (
            <View key={g.tag} style={styles.group}>
              <Text style={styles.tagLabel}>{g.tag}</Text>
              {g.items.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemKcal}>
                    {+item.calories.toFixed(1)} kcal
                  </Text>
                </View>
              ))}
              {g.items.length > 3 && (
                <Text style={styles.more}>
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
  card: { marginHorizontal: 20, gap: 12, flex: 1 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(139,158,110,0.15)" },
  iconEmoji: { fontSize: 18 },
  title: { fontSize: 18, fontWeight: "800", color: "#E8E0D0" },
  sub: { fontSize: 12, fontWeight: "500", marginTop: 1, color: "rgba(232,224,208,0.5)" },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 28, gap: 4 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#E8E0D0" },
  emptyBody: { fontSize: 13, fontWeight: "500", color: "rgba(232,224,208,0.4)" },

  groups: { gap: 0 },
  group: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(232,224,208,0.08)", paddingTop: 8, paddingBottom: 4, gap: 4 },
  tagLabel: { fontSize: 13, fontWeight: "700", marginBottom: 2, color: "#F5C842" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemName: { fontSize: 14, fontWeight: "600", flex: 1, marginRight: 8, color: "#E8E0D0" },
  itemKcal: { fontSize: 12, fontWeight: "500", color: "rgba(232,224,208,0.5)" },
  more: { fontSize: 12, fontWeight: "500", marginTop: 2, color: "rgba(232,224,208,0.3)" },
});
