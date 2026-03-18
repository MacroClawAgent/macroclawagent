import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

interface InsightCardProps {
  insight?: { title: string; body: string };
}

export function InsightCard({ insight }: InsightCardProps) {
  const router = useRouter();

  const body =
    insight?.body ??
    "Log your meals and activity to unlock personalised AI insights for today.";

  return (
    <BlurView intensity={60} tint="dark" style={s.card}>
      {/* Subtle diagonal highlight */}
      <LinearGradient
        colors={["rgba(255,255,255,0.10)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      {/* Top row: badge + spark */}
      <View style={s.topRow}>
        <View style={s.badge}>
          <Text style={s.badgeDot}>✦</Text>
          <Text style={s.badgeText}>AI Insight</Text>
        </View>
        <View style={s.liveChip}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>Live</Text>
        </View>
      </View>

      {/* Insight body */}
      <Text style={s.body}>{body}</Text>

      {/* CTA */}
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => router.push("/(tabs)/agent" as any)}
      >
        <LinearGradient
          colors={["#2BB6A6", "#35C7B8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.cta}
        >
          <Text style={s.ctaText}>Generate meal suggestion</Text>
          <Text style={s.ctaArrow}>→</Text>
        </LinearGradient>
      </TouchableOpacity>
    </BlurView>
  );
}

const NAVY = "#0E1E45";
const TEAL = "#20C7B7";

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(14,30,69,0.72)",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 8,
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
    backgroundColor: "rgba(32,199,183,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(32,199,183,0.3)",
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
  liveText: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.45)" },

  // Body
  body: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.88)",
    lineHeight: 21,
    letterSpacing: 0.1,
  },

  // CTA button
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
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
