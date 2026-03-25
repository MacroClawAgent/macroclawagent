import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

interface InsightCardProps {
  insight?: { title: string; body: string };
}

export function InsightCard({ insight }: InsightCardProps) {
  const router = useRouter();
  const { isDark } = useTheme();

  const body =
    insight?.body ??
    "Log your meals and activity to unlock personalised AI insights for today.";

  return (
    <BlurView
      intensity={isDark ? 52 : 72}
      tint={isDark ? "dark" : "light"}
      style={[s.card, isDark ? s.cardDark : s.cardLight]}
    >
      {!isDark && (
        <>
          <LinearGradient
            colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={s.specular}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.leftShimmer}
            pointerEvents="none"
          />
        </>
      )}

      {/* Top row: badge + live */}
      <View style={s.topRow}>
        <View style={[s.badge, isDark && {
          backgroundColor: 'rgba(248,213,97,0.12)',
          borderColor: 'rgba(248,213,97,0.4)',
        }]}>
          <Text style={[s.badgeDot, isDark && { color: '#F5C842' }]}>✦</Text>
          <Text style={[s.badgeText, isDark && { color: '#F5C842' }]}>AI Insight</Text>
        </View>
        <View style={s.liveChip}>
          <View style={s.liveDot} />
          <Text style={[s.liveText, isDark && { color: 'rgba(232,224,208,0.45)' }]}>Live</Text>
        </View>
      </View>

      {/* Insight body */}
      <Text style={[s.body, isDark && { color: '#E8E0D0' }]}>{body}</Text>

      {/* CTA */}
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => router.push("/(tabs)/agent" as any)}
      >
        <LinearGradient
          colors={isDark ? ['#C49A1A', '#F5C842'] : ['#3B6FD4', '#5B8FE8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.cta}
        >
          <Text style={[s.ctaText, isDark && { color: '#1C1410' }]}>Generate meal suggestion</Text>
          <Text style={[s.ctaArrow, isDark && { color: 'rgba(28,20,16,0.7)' }]}>→</Text>
        </LinearGradient>
      </TouchableOpacity>
    </BlurView>
  );
}

const TEAL = "#20C7B7";

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderColor: "rgba(255,255,255,0.62)",
    shadowColor: "#7BAAC8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
  },
  cardDark: {
    backgroundColor: "#1C1410",
    borderColor: "rgba(255,220,150,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  specular: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 68,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
  },
  leftShimmer: {
    position: "absolute",
    top: 0, left: 0, bottom: 0,
    width: 56,
    borderTopLeftRadius: 27,
    borderBottomLeftRadius: 27,
  },

  // Top row
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(32,199,183,0.12)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(32,199,183,0.25)",
  },
  badgeDot: { fontSize: 9, color: TEAL },
  badgeText: { fontSize: 13, fontFamily: "BebasNeue_400Regular", color: TEAL, letterSpacing: 1 },

  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  liveText: { fontSize: 13, fontFamily: "BebasNeue_400Regular", letterSpacing: 1, color: "#9CA3AF" },

  // Body
  body: {
    fontSize: 14,
    fontFamily: "BebasNeue_400Regular",
    color: "#374151",
    lineHeight: 20,
    letterSpacing: 0.8,
  },

  // CTA button
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: "BebasNeue_400Regular",
    color: "#fff",
    letterSpacing: 1.5,
  },
  ctaArrow: {
    fontSize: 18,
    fontFamily: "BebasNeue_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
});
