import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";

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

function MacroShape({ color1, color2, highlight, width, height, value, label }: {
  color1: string; color2: string; highlight: string;
  width: number; height: number; value: number; label: string;
}) {
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <LinearGradient
        colors={[color1, color2]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{ width, height, borderRadius: width * 0.38, overflow: 'hidden' }}
      >
        <View style={{
          position: 'absolute', top: 6, left: 6,
          width: width * 0.45, height: height * 0.38,
          backgroundColor: highlight,
          borderRadius: width * 0.25,
          transform: [{ rotate: '-15deg' }],
          opacity: 0.55,
        }} />
      </LinearGradient>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>{value}g</Text>
      <Text style={{ fontSize: 10, fontWeight: '500', color: '#64748B' }}>{label}</Text>
    </View>
  );
}

export function NutritionWidget({ calorieProgress, macros, goalLabel }: NutritionWidgetProps) {
  const calPct = Math.round(calorieProgress.ratio * 100);

  return (
    <View style={styles.card}>
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

      {/* Glowing calorie capsule bar */}
      <View style={styles.calBar}>
        <LinearGradient
          colors={['#2DD4BF', '#38BDF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.calBarFill, { width: `${calPct}%` as DimensionValue }]}
        />
      </View>

      {/* 3D Macro tablet shapes */}
      <View style={styles.macroRow}>
        <MacroShape
          color1="#1FBF75" color2="#3ED598" highlight="rgba(255,255,255,0.6)"
          width={85} height={105}
          value={Math.round(macros.protein.consumed)} label="Protein"
        />
        <MacroShape
          color1="#F4A622" color2="#F7D07A" highlight="rgba(255,255,255,0.55)"
          width={80} height={88}
          value={Math.round(macros.carbs.consumed)} label="Carbs"
        />
        <MacroShape
          color1="#5C5FFF" color2="#7A7DFF" highlight="rgba(255,255,255,0.5)"
          width={78} height={95}
          value={Math.round(macros.fat.consumed)} label="Fat"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    gap: 14,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#A0C0D8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },

  // Header
  header:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge:  { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(43,182,166,0.18)" },
  widgetTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.3, color: "#1A1A1A" },
  widgetSub:   { fontSize: 11, fontWeight: "500", marginTop: 1, color: "#6B7280" },
  // Calorie summary
  calRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  calLeft: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  calBig:  { fontSize: 52, fontWeight: "800", letterSpacing: -1, color: "#0F172A" },
  calOf:   { fontSize: 13, fontWeight: "500", color: "#6B7280" },
  calBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(200,220,240,0.6)",
  },
  calBadgePct: { fontSize: 18, fontWeight: "800", color: "#1FA79E" },
  calBadgeRem: { fontSize: 10, fontWeight: "500", marginTop: 1, color: "#6B7280" },

  // Calorie bar — teal→blue gradient
  calBar:    { height: 6, borderRadius: 100, overflow: "hidden", backgroundColor: "rgba(43,182,166,0.15)" },
  calBarFill: { height: 6, borderRadius: 100 },

  // 3D macro tablets row
  macroRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingTop: 14,
  },
});
