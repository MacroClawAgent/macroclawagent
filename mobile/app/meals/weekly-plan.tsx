import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { MealOptionCard } from "@/components/features/cart/MealOptionCard";
import { useTheme } from "@/context/ThemeContext";
import { getCache } from "@/lib/cache";
import { apiGet } from "@/lib/api";

const DAY_LABELS = ["Today", "Mon", "Tue", "Wed", "Thu", "Fri", "Sun"];

export default function WeeklyPlanScreen() {
  const { colors } = useTheme();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const cached = getCache<any>("cart_plan", 6 * 60 * 60 * 1000);
        const p = cached ?? await apiGet<any>("/api/optimizer/create");
        setPlan(p);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Screen>
        <AppHeader title="Weekly Plan" showBack />
        <View style={styles.centered}><ActivityIndicator color={colors.teal} /></View>
      </Screen>
    );
  }

  const dayKeys = plan ? Object.keys(plan.meal_plan ?? {}) : [];
  const selectedKey = dayKeys[selectedDay] ?? dayKeys[0];
  const meals = plan?.meal_plan?.[selectedKey] ?? [];

  return (
    <Screen>
      <AppHeader title="Weekly Plan" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayPicker}>
          {DAY_LABELS.map((label, i) => (
            <TouchableOpacity
              key={label}
              onPress={() => setSelectedDay(i)}
              style={[styles.dayChip, { backgroundColor: selectedDay === i ? colors.teal : colors.surface, borderColor: selectedDay === i ? colors.teal : colors.border }]}
            >
              <Text style={[styles.dayLabel, { color: selectedDay === i ? "#FFF" : colors.textSecondary }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {meals.map((m: any, i: number) => (
          <MealOptionCard key={i} name={m.name} tag={m.tag} kcal={m.kcal} protein={m.protein} carbs={m.carbs} fat={m.fat} prepMin={m.prepMin} />
        ))}
        {meals.length === 0 && (
          <View style={styles.centered}><Text style={[styles.empty, { color: colors.textMuted }]}>No meals for this day.</Text></View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  scroll: { gap: 12, paddingTop: 4, paddingBottom: 40 },
  dayPicker: { paddingHorizontal: 20, gap: 8, paddingVertical: 4 },
  dayChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  dayLabel: { fontSize: 13, fontWeight: "600" },
  empty: { fontSize: 14, fontWeight: "500" },
});
