import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Screen } from "@/components/ui/Screen";
import { useTheme } from "@/context/ThemeContext";

const CATEGORIES = [
  { label: "Strength",  ios: "dumbbell.fill",         color: "#A855F7", desc: "Build muscle & power" },
  { label: "Cardio",    ios: "figure.run",             color: "#F97316", desc: "Burn calories, boost stamina" },
  { label: "HIIT",      ios: "bolt.fill",              color: "#EAB308", desc: "High-intensity intervals" },
  { label: "Yoga",      ios: "figure.mind.and.body",   color: "#EC4899", desc: "Flexibility & recovery" },
  { label: "Cycling",   ios: "figure.outdoor.cycle",   color: "#6366F1", desc: "Road & indoor rides" },
  { label: "Swimming",  ios: "figure.pool.swim",       color: "#38BDF8", desc: "Full body low-impact" },
];

const FEATURED = [
  { title: "5-Day Push/Pull/Legs",  tag: "Strength · Intermediate", duration: "5×/week", kcal: "~420 kcal/session" },
  { title: "30-min HIIT Blast",     tag: "HIIT · Beginner",         duration: "30 min",  kcal: "~350 kcal" },
  { title: "Morning Yoga Flow",     tag: "Yoga · All levels",       duration: "20 min",  kcal: "~120 kcal" },
];

export default function WorkoutsDiscover() {
  const { colors } = useTheme();
  const router = useRouter();
  const [active, setActive] = useState("All");

  return (
    <Screen style={{ backgroundColor: "#0A1628" }}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <SymbolView name={{ ios: "chevron.left", android: "chevron_left", web: "chevron_left" }}
            tintColor="#FFF" size={18} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.title}>Workouts 💪</Text>
          <Text style={s.sub}>Find your next session</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {["All", ...CATEGORIES.map((c) => c.label)].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActive(cat)}
              activeOpacity={0.8}
              style={[s.chip, active === cat && s.chipActive]}
            >
              <Text style={[s.chipText, active === cat && s.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category grid */}
        <Text style={s.sectionLabel}>Categories</Text>
        <View style={s.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.label} activeOpacity={0.82} style={[s.catCard, { borderColor: cat.color + "40" }]}>
              <View style={[s.catIcon, { backgroundColor: cat.color + "22" }]}>
                <SymbolView name={{ ios: cat.ios, android: "fitness_center", web: "fitness_center" }}
                  tintColor={cat.color} size={26} />
              </View>
              <Text style={s.catLabel}>{cat.label}</Text>
              <Text style={s.catDesc}>{cat.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured plans */}
        <Text style={s.sectionLabel}>Featured Plans</Text>
        <View style={s.plans}>
          {FEATURED.map((plan) => (
            <TouchableOpacity key={plan.title} activeOpacity={0.82} style={s.planCard}>
              <View style={s.planLeft}>
                <Text style={s.planTitle}>{plan.title}</Text>
                <Text style={s.planTag}>{plan.tag}</Text>
                <View style={s.planMeta}>
                  <Text style={s.planMetaText}>⏱ {plan.duration}</Text>
                  <Text style={s.planMetaText}>🔥 {plan.kcal}</Text>
                </View>
              </View>
              <View style={s.planArrow}>
                <SymbolView name={{ ios: "arrow.right.circle.fill", android: "arrow_forward", web: "arrow_forward" }}
                  tintColor="#20C7B7" size={28} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerText: { gap: 2 },
  title: { fontSize: 24, fontWeight: "900", color: "#FFF", letterSpacing: -0.5 },
  sub: { fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.55)" },

  scroll: { paddingBottom: 40, gap: 4 },
  chips: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)" },
  chipActive: { backgroundColor: "#20C7B7" },
  chipText: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  chipTextActive: { color: "#FFF" },

  sectionLabel: { fontSize: 16, fontWeight: "800", color: "#FFF", letterSpacing: -0.3, paddingHorizontal: 20, marginTop: 16, marginBottom: 10 },

  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10 },
  catCard: {
    width: "46%", flexGrow: 1, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, padding: 16, gap: 8,
  },
  catIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  catLabel: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  catDesc: { fontSize: 11, fontWeight: "500", color: "rgba(255,255,255,0.5)" },

  plans: { paddingHorizontal: 20, gap: 10 },
  planCard: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18, padding: 16,
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  planLeft: { flex: 1, gap: 4 },
  planTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  planTag: { fontSize: 11, fontWeight: "600", color: "#20C7B7" },
  planMeta: { flexDirection: "row", gap: 12, marginTop: 2 },
  planMetaText: { fontSize: 11, fontWeight: "500", color: "rgba(255,255,255,0.5)" },
  planArrow: {},
});
