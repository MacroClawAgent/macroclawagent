import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { useTheme } from "@/context/ThemeContext";

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

const BAR_HEIGHT = 96;

interface MacroBarProps {
  label: string;
  color: string;
  trackColor: string;
  consumed: number;
  target: number;
}

function MacroBar({ label, color, trackColor, consumed, target }: MacroBarProps) {
  const { isDark } = useTheme();
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  const fillHeight = Math.round(pct * BAR_HEIGHT);
  return (
    <View style={mb.col}>
      <Text style={[mb.grams, { color }]}>{Math.round(consumed)}g</Text>
      <View style={[mb.track, { backgroundColor: trackColor }]}>
        <View style={mb.trackInner}>
          <LinearGradient
            colors={[color, color]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[mb.fill, { height: fillHeight }]}
          />
        </View>
      </View>
      <Text style={[mb.label, isDark && { color: '#E8E0D0' }]}>{label}</Text>
      <Text style={[mb.target, isDark && { color: 'rgba(232,224,208,0.4)' }]}>{target}g</Text>
    </View>
  );
}

const mb = StyleSheet.create({
  col: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  grams: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  track: {
    width: 36,
    height: BAR_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  trackInner: {
    width: "100%",
    justifyContent: "flex-end",
    height: "100%",
  },
  fill: {
    width: "100%",
    borderRadius: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
  },
  target: {
    fontSize: 11,
    fontWeight: "400",
    color: "#94A3B8",
  },
});

export function NutritionWidget({ calorieProgress, macros, goalLabel }: NutritionWidgetProps) {
  const { isDark } = useTheme();
  const calPct = Math.round(calorieProgress.ratio * 100);

  return (
    <View style={[
      styles.outerCard,
      isDark && { backgroundColor: '#252018', borderColor: 'rgba(255,220,150,0.12)' },
    ]}>
      {/* Inner glow at top of card */}
      <View style={[styles.innerGlow, isDark && { backgroundColor: 'rgba(245,200,66,0.05)' }]} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, isDark && { backgroundColor: 'rgba(245,200,66,0.12)' }]}>
            <SymbolView
              name={{ ios: "fork.knife", android: "restaurant", web: "restaurant" }}
              tintColor={isDark ? "#F5C842" : "#1FA79E"}
              size={16}
            />
          </View>
          <View>
            <Text style={[styles.widgetTitle, isDark && { color: '#E8E0D0' }]}>Nutrition</Text>
            <Text style={[styles.widgetSub, isDark && { color: 'rgba(232,224,208,0.55)' }]}>{goalLabel}</Text>
          </View>
        </View>
      </View>

      {/* Calorie summary row */}
      <View style={styles.calRow}>
        <View style={styles.calLeft}>
          <Text style={[styles.calBig, isDark && { color: '#E8E0D0' }]}>
            {calorieProgress.consumed.toLocaleString()}
          </Text>
          <Text style={[styles.calOf, isDark && { color: 'rgba(232,224,208,0.35)' }]}>
            {" / "}{calorieProgress.target.toLocaleString()} kcal
          </Text>
        </View>
        <View style={[
          styles.calBadge,
          isDark && { backgroundColor: '#2E2822', borderColor: 'rgba(255,220,150,0.15)', shadowColor: '#F5C842' },
        ]}>
          <Text style={[styles.calBadgePct, isDark && { color: '#F5C842' }]}>{calPct}%</Text>
          <Text style={[styles.calBadgeRem, isDark && { color: 'rgba(232,224,208,0.4)' }]}>
            {calorieProgress.remaining.toLocaleString()} left
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.calBar, isDark && { backgroundColor: 'rgba(245,200,66,0.12)' }]}>
        <LinearGradient
          colors={isDark ? ["#F5C842", "#F7D580"] : ["#2DD4BF", "#38BDF8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.calBarFill, { width: `${calPct}%` as DimensionValue }]}
        />
      </View>

      {/* Macro bar chart */}
      <View style={styles.macroRow}>
        <MacroBar label="Protein"
          color={isDark ? "#F5C842" : "#34D399"}
          trackColor={isDark ? "rgba(245,200,66,0.15)" : "rgba(52,211,153,0.15)"}
          consumed={macros.protein.consumed} target={macros.protein.target} />
        <MacroBar label="Carbs"
          color={isDark ? "#E8E0D0" : "#F59E0B"}
          trackColor={isDark ? "rgba(232,224,208,0.12)" : "rgba(245,158,11,0.15)"}
          consumed={macros.carbs.consumed}   target={macros.carbs.target}   />
        <MacroBar label="Fat"
          color={isDark ? "#4CAF7D" : "#A78BFA"}
          trackColor={isDark ? "rgba(76,175,125,0.15)" : "rgba(167,139,250,0.15)"}
          consumed={macros.fat.consumed}     target={macros.fat.target}     />
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

  // Calorie summary
  calRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  calLeft: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  calBig: { fontSize: 46, fontWeight: "800", letterSpacing: -2, color: "#0F172A" },
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
    marginVertical: 10,
  },
  calBarFill: { height: 5, borderRadius: 3 },

  // Macro bar chart
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
});
