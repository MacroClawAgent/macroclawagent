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
      intensity={isDark ? 0 : 60}
      tint={isDark ? "dark" : "light"}
      style={[s.card, isDark && {
        backgroundColor: '#252018',
        borderColor: 'rgba(255,220,150,0.12)',
        shadowColor: '#F5C842',
      }]}
    >
      {/* Top accent strip */}
      <LinearGradient
        colors={isDark ? ["rgba(245,200,66,0.08)", "transparent"] : ["rgba(43,182,166,0.12)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      {/* Top row: badge + live */}
      <View style={s.topRow}>
        <View style={[s.badge, isDark && {
          backgroundColor: 'rgba(245,200,66,0.12)',
          borderColor: 'rgba(245,200,66,0.25)',
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
          colors={isDark ? ["#C8A020", "#F5C842"] : ["#3B6FD4", "#5B8FE8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.cta}
        >
          <Text style={[s.ctaText, isDark && { color: '#1C1612' }]}>Generate meal suggestion</Text>
          <Text style={[s.ctaArrow, isDark && { color: 'rgba(28,22,18,0.7)' }]}>→</Text>
        </LinearGradient>
      </TouchableOpacity>
    </BlurView>
  );
}

const TEAL = "#20C7B7";

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(43,182,166,0.2)",
    shadowColor: "#2BB6A6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
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
  badgeText: { fontSize: 11, fontWeight: "700", color: TEAL, letterSpacing: 0.3 },

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
  liveText: { fontSize: 11, fontWeight: "600", color: "#9CA3AF" },

  // Body
  body: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    lineHeight: 18,
    letterSpacing: 0.1,
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
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.1,
  },
  ctaArrow: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
  },
});
