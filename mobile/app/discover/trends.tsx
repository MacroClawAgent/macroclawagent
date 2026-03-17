import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Screen } from "@/components/ui/Screen";

const STATS = [
  { label: "Avg Calories",  value: "2,340",  delta: "+4%",  up: true,  color: "#F97316" },
  { label: "Protein/day",   value: "142g",   delta: "+12%", up: true,  color: "#20C7B7" },
  { label: "Active days",   value: "5/7",    delta: "+1",   up: true,  color: "#22C55E" },
  { label: "Streak",        value: "6 days", delta: "Best!", up: true,  color: "#EAB308" },
];

const INSIGHTS = [
  { emoji: "💪", title: "Protein on track", body: "You've hit your protein goal 5 out of the last 7 days — up from 3 last week." },
  { emoji: "📉", title: "Calorie dip Wednesday", body: "Last 4 Wednesdays you've been ~350 kcal under. Consider a planned refeed day." },
  { emoji: "🏃", title: "Running volume up 22%", body: "Your weekly mileage has increased steadily. Great base building momentum." },
  { emoji: "💧", title: "Hydration gap", body: "Average hydration is 1.6L — 400ml short of your 2L goal. Consider a mid-morning reminder." },
];

export default function TrendsDiscover() {
  const router = useRouter();

  return (
    <Screen style={{ backgroundColor: "#071A1A" }}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <SymbolView name={{ ios: "chevron.left", android: "chevron_left", web: "chevron_left" }}
            tintColor="#FFF" size={18} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.title}>Trends 📈</Text>
          <Text style={s.sub}>Your last 7 days</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Stat cards */}
        <View style={s.statsGrid}>
          {STATS.map((stat) => (
            <View key={stat.label} style={[s.statCard, { borderColor: stat.color + "30" }]}>
              <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
              <View style={[s.statDelta, { backgroundColor: stat.color + "22" }]}>
                <Text style={[s.statDeltaText, { color: stat.color }]}>
                  {stat.up ? "↑ " : "↓ "}{stat.delta}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Weekly bar chart (visual only) */}
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>Calorie intake — last 7 days</Text>
          <View style={s.bars}>
            {[72, 88, 65, 95, 80, 100, 78].map((pct, i) => (
              <View key={i} style={s.barCol}>
                <View style={[s.bar, { height: pct * 0.9, backgroundColor: pct >= 80 ? "#20C7B7" : "rgba(255,255,255,0.15)" }]} />
                <Text style={s.barDay}>{["M","T","W","T","F","S","S"][i]}</Text>
              </View>
            ))}
          </View>
          <View style={s.chartLegend}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: "#20C7B7" }]} />
              <Text style={s.legendText}>On target</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: "rgba(255,255,255,0.15)" }]} />
              <Text style={s.legendText}>Under target</Text>
            </View>
          </View>
        </View>

        {/* AI insights */}
        <Text style={s.sectionLabel}>AI Insights</Text>
        <View style={s.insights}>
          {INSIGHTS.map((ins) => (
            <View key={ins.title} style={s.insightCard}>
              <Text style={s.insightEmoji}>{ins.emoji}</Text>
              <View style={s.insightBody}>
                <Text style={s.insightTitle}>{ins.title}</Text>
                <Text style={s.insightText}>{ins.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.ctaBtn} activeOpacity={0.85}
          onPress={() => router.push("/(tabs)/agent" as any)}>
          <Text style={s.ctaBtnText}>Ask AI for a personalised plan based on trends →</Text>
        </TouchableOpacity>
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

  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10 },
  statCard: {
    width: "46%", flexGrow: 1, backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18, borderWidth: 1, padding: 16, gap: 6, alignItems: "flex-start",
  },
  statValue: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.5)" },
  statDelta: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statDeltaText: { fontSize: 11, fontWeight: "700" },

  chartCard: {
    marginHorizontal: 20, marginTop: 14, backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20, padding: 16, gap: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  chartTitle: { fontSize: 14, fontWeight: "700", color: "rgba(255,255,255,0.75)" },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 90 },
  barCol: { flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 6, minHeight: 8 },
  barDay: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.4)" },
  chartLegend: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: "500", color: "rgba(255,255,255,0.45)" },

  sectionLabel: { fontSize: 16, fontWeight: "800", color: "#FFF", letterSpacing: -0.3, paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },

  insights: { paddingHorizontal: 20, gap: 10 },
  insightCard: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18, padding: 14,
    flexDirection: "row", gap: 12, alignItems: "flex-start",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  insightEmoji: { fontSize: 26, marginTop: 2 },
  insightBody: { flex: 1, gap: 4 },
  insightTitle: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  insightText: { fontSize: 12, fontWeight: "500", color: "rgba(255,255,255,0.6)", lineHeight: 18 },

  ctaBtn: {
    marginHorizontal: 20, marginTop: 16, backgroundColor: "#20C7B7",
    borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14, alignItems: "center",
  },
  ctaBtnText: { fontSize: 13, fontWeight: "700", color: "#FFF", textAlign: "center", lineHeight: 19 },
});
