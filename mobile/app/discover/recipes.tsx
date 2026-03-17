import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Screen } from "@/components/ui/Screen";

const FILTERS = ["All", "High Protein", "Low Carb", "Vegan", "Quick (<20min)"];

const RECIPES = [
  { title: "Greek Chicken Bowl",         tag: "High Protein · 520 kcal",  protein: "48g protein", time: "25 min", emoji: "🥗" },
  { title: "Protein Smoothie",           tag: "Quick · 310 kcal",         protein: "35g protein", time: "5 min",  emoji: "🥤" },
  { title: "Salmon & Sweet Potato",      tag: "Low Carb · 480 kcal",      protein: "42g protein", time: "30 min", emoji: "🐟" },
  { title: "Overnight Oats",            tag: "Meal Prep · 380 kcal",      protein: "18g protein", time: "5 min",  emoji: "🥣" },
  { title: "Turkey Stir Fry",           tag: "High Protein · 420 kcal",   protein: "44g protein", time: "20 min", emoji: "🥘" },
  { title: "Avocado Egg Toast",         tag: "Quick · 340 kcal",          protein: "22g protein", time: "10 min", emoji: "🥑" },
];

export default function RecipesDiscover() {
  const router = useRouter();
  const [active, setActive] = useState("All");

  return (
    <Screen style={{ backgroundColor: "#071A14" }}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <SymbolView name={{ ios: "chevron.left", android: "chevron_left", web: "chevron_left" }}
            tintColor="#FFF" size={18} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.title}>Recipes 🥗</Text>
          <Text style={s.sub}>Fuel every goal</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f} onPress={() => setActive(f)} activeOpacity={0.8}
              style={[s.chip, active === f && s.chipActive]}>
              <Text style={[s.chipText, active === f && s.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Hero banner */}
        <View style={s.hero}>
          <Text style={s.heroTag}>✦ AI-Suggested for you</Text>
          <Text style={s.heroTitle}>High-protein dinner tonight?</Text>
          <Text style={s.heroBody}>Based on your macros, you still need ~38g protein. Here are perfect options.</Text>
          <TouchableOpacity style={s.heroBtn} activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/agent" as any)}>
            <Text style={s.heroBtnText}>Ask the AI coach →</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionLabel}>Popular Recipes</Text>
        <View style={s.list}>
          {RECIPES.map((r) => (
            <TouchableOpacity key={r.title} activeOpacity={0.82} style={s.card}>
              <Text style={s.cardEmoji}>{r.emoji}</Text>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{r.title}</Text>
                <Text style={s.cardTag}>{r.tag}</Text>
                <View style={s.cardMeta}>
                  <Text style={s.cardMetaText}>💪 {r.protein}</Text>
                  <Text style={s.cardMetaText}>⏱ {r.time}</Text>
                </View>
              </View>
              <SymbolView name={{ ios: "bookmark", android: "bookmark_border", web: "bookmark_border" }}
                tintColor="rgba(255,255,255,0.3)" size={18} />
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

  hero: {
    marginHorizontal: 20, marginTop: 14, borderRadius: 20,
    backgroundColor: "#0E4A3E", padding: 18, gap: 8,
    borderWidth: 1, borderColor: "rgba(32,199,183,0.25)",
  },
  heroTag: { fontSize: 10, fontWeight: "700", color: "#20C7B7", letterSpacing: 0.8, textTransform: "uppercase" },
  heroTitle: { fontSize: 18, fontWeight: "800", color: "#FFF", letterSpacing: -0.3 },
  heroBody: { fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.65)", lineHeight: 19 },
  heroBtn: { alignSelf: "flex-start", backgroundColor: "#20C7B7", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  heroBtnText: { fontSize: 13, fontWeight: "700", color: "#FFF" },

  sectionLabel: { fontSize: 16, fontWeight: "800", color: "#FFF", letterSpacing: -0.3, paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },

  list: { paddingHorizontal: 20, gap: 10 },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  cardEmoji: { fontSize: 36, width: 48, textAlign: "center" },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  cardTag: { fontSize: 11, fontWeight: "600", color: "#20C7B7" },
  cardMeta: { flexDirection: "row", gap: 12, marginTop: 2 },
  cardMetaText: { fontSize: 11, fontWeight: "500", color: "rgba(255,255,255,0.5)" },
});
