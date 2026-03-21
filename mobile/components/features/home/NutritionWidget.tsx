import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";

interface MacroStat {
  consumed: number;
  target: number;
  ratio: number;
}

interface NutritionWidgetProps {
  calorieProgress: { consumed: number; target: number; remaining: number; ratio: number };
  macros: {
    protein: MacroStat;
    carbs: MacroStat;
    fat: MacroStat;
  };
  goalLabel: string;
}

interface MacroTabletProps {
  label: string;
  grams: number;
  target: number;
  gradientColors: [string, string, string];
  shadowColor: string;
  accentColor: string;
}

function MacroTablet({ label, grams, target, gradientColors, shadowColor, accentColor }: MacroTabletProps) {
  const remaining = Math.max(0, target - grams);
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      {/* Gram amount above */}
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E293B", marginBottom: 8, letterSpacing: -0.3 }}>
        {grams}g
      </Text>

      {/* The 3D tablet */}
      <View style={{
        shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 10,
      }}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ width: 88, height: 88, borderRadius: 26, overflow: "hidden" }}
        >
          {/* Diagonal light streak — key 3D glass effect */}
          <View style={{
            position: "absolute",
            top: -15,
            left: -20,
            width: 80,
            height: 55,
            borderRadius: 28,
            backgroundColor: "rgba(255,255,255,0.45)",
            transform: [{ rotate: "-25deg" }],
          }} />

          {/* Bright glint at top-left corner */}
          <View style={{
            position: "absolute",
            top: 8,
            left: 8,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: "rgba(255,255,255,0.6)",
          }} />

          {/* Bottom depth gradient */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.12)"]}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 35,
              borderBottomLeftRadius: 26,
              borderBottomRightRadius: 26,
            }}
          />

          {/* Right-edge depth shadow */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.08)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: 20,
              borderTopRightRadius: 26,
              borderBottomRightRadius: 26,
            }}
          />
        </LinearGradient>
      </View>

      {/* Label */}
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginTop: 10 }}>
        {label}
      </Text>

      {/* Xg left */}
      <Text style={{ fontSize: 12, fontWeight: "500", color: accentColor, marginTop: 2 }}>
        {remaining}g left
      </Text>
    </View>
  );
}

export function NutritionWidget({ calorieProgress, macros, goalLabel }: NutritionWidgetProps) {
  const router = useRouter();
  const calPct = Math.round(calorieProgress.ratio * 100);

  return (
    <View style={styles.outerCard}>
      {/* Inner glow at top of card */}
      <View style={styles.innerGlow} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <SymbolView
              name={{ ios: "fork.knife", android: "restaurant", web: "restaurant" }}
              tintColor="#1FA79E"
              size={16}
            />
          </View>
          <View>
            <Text style={styles.widgetTitle}>Nutrition</Text>
            <Text style={styles.widgetSub}>{goalLabel}</Text>
          </View>
        </View>

        {/* + Log button */}
        <TouchableOpacity
          onPress={() => router.push("/nutrition/log-food" as any)}
          activeOpacity={0.75}
          style={styles.logBtn}
        >
          <Text style={styles.logBtnText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Calorie summary row */}
      <View style={styles.calRow}>
        <View style={styles.calLeft}>
          <Text style={styles.calBig}>
            {calorieProgress.consumed.toLocaleString()}
          </Text>
          <Text style={styles.calOf}>
            {" / "}{calorieProgress.target.toLocaleString()} kcal
          </Text>
        </View>
        <View style={styles.calBadge}>
          <Text style={styles.calBadgePct}>{calPct}%</Text>
          <Text style={styles.calBadgeRem}>
            {calorieProgress.remaining.toLocaleString()} left
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.calBar}>
        <LinearGradient
          colors={["#2DD4BF", "#38BDF8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.calBarFill, { width: `${calPct}%` as DimensionValue }]}
        />
      </View>

      {/* 3D Macro tablets */}
      <View style={styles.macroRow}>
        <MacroTablet
          label="Protein"
          grams={Math.round(macros.protein.consumed)}
          target={macros.protein.target}
          gradientColors={["#6EE7B7", "#34D399", "#059669"]}
          shadowColor="#059669"
          accentColor="#059669"
        />
        <MacroTablet
          label="Carbs"
          grams={Math.round(macros.carbs.consumed)}
          target={macros.carbs.target}
          gradientColors={["#FDE68A", "#FCD34D", "#F59E0B"]}
          shadowColor="#D97706"
          accentColor="#D97706"
        />
        <MacroTablet
          label="Fat"
          grams={Math.round(macros.fat.consumed)}
          target={macros.fat.target}
          gradientColors={["#DDD6FE", "#A78BFA", "#7C3AED"]}
          shadowColor="#6D28D9"
          accentColor="#7C3AED"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    flex: 1,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "rgba(255,255,255,0.72)",
    shadowColor: "#7DB9D8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 16,
    overflow: "hidden",
  },

  innerGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.45)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(43,182,166,0.18)",
  },
  widgetTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.3, color: "#1A1A1A" },
  widgetSub: { fontSize: 11, fontWeight: "500", marginTop: 1, color: "#6B7280" },

  // + Log button
  logBtn: {
    backgroundColor: "rgba(235,240,255,0.9)",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(180,195,255,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  logBtnText: {
    color: "#6366F1",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Calorie summary
  calRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  calLeft: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  calBig: { fontSize: 56, fontWeight: "800", letterSpacing: -2, color: "#0F172A" },
  calOf: {
    fontSize: 16,
    fontWeight: "400",
    color: "#94A3B8",
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  calBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#2DD4BF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  calBadgePct: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5, color: "#2DD4BF" },
  calBadgeRem: { fontSize: 12, fontWeight: "500", marginTop: 1, color: "#94A3B8" },

  // Progress bar
  calBar: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "rgba(45,212,191,0.15)",
    marginHorizontal: 20,
    marginVertical: 16,
  },
  calBarFill: { height: 5, borderRadius: 3 },

  // 3D macro tablets row
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 20,
  },
});
