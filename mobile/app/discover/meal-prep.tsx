import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Screen } from "@/components/ui/Screen";

const PLANS = [
  {
    title: "5-Day Lean Bulk",
    subtitle: "2,800 kcal · 200g protein/day",
    tags: ["Chicken", "Rice", "Eggs", "Sweet Potato"],
    sessions: 2,
    badge: "Popular",
  },
  {
    title: "Cut Week",
    subtitle: "1,800 kcal · 160g protein/day",
    tags: ["Turkey", "Broccoli", "Greek Yoghurt"],
    sessions: 1,
    badge: "Low Cal",
  },
  {
    title: "Performance Week",
    subtitle: "3,200 kcal · 180g protein/day",
    tags: ["Salmon", "Oats", "Quinoa", "Nuts"],
    sessions: 3,
    badge: "Athlete",
  },
];

const TIPS = [
  { emoji: "🧊", tip: "Batch cook proteins Sunday & Wednesday to stay fresh all week." },
  { emoji: "📦", tip: "Use glass containers — they reheat evenly and keep flavours better." },
  { emoji: "⚖️",  tip: "Weigh portions raw, not cooked — water weight throws off macros." },
  { emoji: "🥦", tip: "Blanch veg then freeze — retains nutrients up to 3× longer than fridge." },
];

export default function MealPrepDiscover() {
  const router = useRouter();

  return (
    <Screen style={{ backgroundColor: "#110A1E" }}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <SymbolView name={{ ios: "chevron.left", android: "chevron_left", web: "chevron_left" }}
            tintColor="#FFF" size={18} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.title}>Meal Prep 🥡</Text>
          <Text style={s.sub}>Plan once, eat right all week</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* CTA banner */}
        <View style={s.ctaBanner}>
          <Text style={s.ctaLabel}>✦ Smart Cart</Text>
          <Text style={s.ctaTitle}>Build your prep list in one tap</Text>
          <Text style={s.ctaBody}>Choose a plan below and let the AI generate your full shopping list — ordered by aisle.</Text>
          <TouchableOpacity style={s.ctaBtn} activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/cart" as any)}>
            <Text style={s.ctaBtnText}>Open Smart Cart →</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionLabel}>Prep Plans</Text>
        <View style={s.plans}>
          {PLANS.map((plan) => (
            <TouchableOpacity key={plan.title} activeOpacity={0.82} style={s.planCard}>
              <View style={s.planTop}>
                <View style={s.planInfo}>
                  <Text style={s.planTitle}>{plan.title}</Text>
                  <Text style={s.planSub}>{plan.subtitle}</Text>
                </View>
                <View style={s.badge}><Text style={s.badgeText}>{plan.badge}</Text></View>
              </View>
              <View style={s.tags}>
                {plan.tags.map((t) => (
                  <View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>
                ))}
              </View>
              <View style={s.planFooter}>
                <Text style={s.planSessions}>🍳 {plan.sessions} prep session{plan.sessions > 1 ? "s" : ""}/week</Text>
                <TouchableOpacity style={s.buildBtn} activeOpacity={0.85}
                  onPress={() => router.push("/(tabs)/agent" as any)}>
                  <Text style={s.buildBtnText}>Build Plan</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLabel}>Pro Tips</Text>
        <View style={s.tips}>
          {TIPS.map((t) => (
            <View key={t.tip} style={s.tipCard}>
              <Text style={s.tipEmoji}>{t.emoji}</Text>
              <Text style={s.tipText}>{t.tip}</Text>
            </View>
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

  ctaBanner: {
    marginHorizontal: 20, borderRadius: 20, backgroundColor: "#3A1A5C",
    padding: 18, gap: 8, borderWidth: 1, borderColor: "rgba(168,85,247,0.3)",
  },
  ctaLabel: { fontSize: 10, fontWeight: "700", color: "#A855F7", letterSpacing: 0.8, textTransform: "uppercase" },
  ctaTitle: { fontSize: 18, fontWeight: "800", color: "#FFF", letterSpacing: -0.3 },
  ctaBody: { fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.6)", lineHeight: 19 },
  ctaBtn: { alignSelf: "flex-start", backgroundColor: "#A855F7", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  ctaBtnText: { fontSize: 13, fontWeight: "700", color: "#FFF" },

  sectionLabel: { fontSize: 16, fontWeight: "800", color: "#FFF", letterSpacing: -0.3, paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },

  plans: { paddingHorizontal: 20, gap: 12 },
  planCard: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 16, gap: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  planTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  planInfo: { gap: 3, flex: 1 },
  planTitle: { fontSize: 16, fontWeight: "800", color: "#FFF" },
  planSub: { fontSize: 12, fontWeight: "500", color: "rgba(255,255,255,0.55)" },
  badge: { backgroundColor: "rgba(168,85,247,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(168,85,247,0.4)" },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#A855F7" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  planFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planSessions: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.5)" },
  buildBtn: { backgroundColor: "#20C7B7", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  buildBtnText: { fontSize: 12, fontWeight: "700", color: "#FFF" },

  tips: { paddingHorizontal: 20, gap: 10 },
  tipCard: {
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  tipEmoji: { fontSize: 28 },
  tipText: { flex: 1, fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.7)", lineHeight: 19 },
});
