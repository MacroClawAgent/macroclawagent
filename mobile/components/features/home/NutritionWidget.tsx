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

interface MacroTabletProps {
  label: string;
  grams: number;
  target: number;
  gradientColors: [string, string, string];
  shadowColor: string;
  leftColor: string;
}

function MacroTablet({ label, grams, target, gradientColors, shadowColor, leftColor }: MacroTabletProps) {
  const remaining = Math.max(0, target - grams);
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      {/* Gram amount ABOVE shape */}
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 6 }}>
        {grams}g
      </Text>
      {/* The 3D tablet shape */}
      <View style={{
        shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
      }}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{ width: 72, height: 90, borderRadius: 24, overflow: 'hidden', justifyContent: 'flex-end' }}
        >
          {/* Large soft oval highlight — glossy shine */}
          <View style={{
            position: 'absolute', top: -10, left: -8,
            width: 52, height: 52, borderRadius: 26,
            backgroundColor: 'rgba(255,255,255,0.38)',
          }} />
          {/* Small bright dot highlight */}
          <View style={{
            position: 'absolute', top: 10, left: 10,
            width: 18, height: 18, borderRadius: 9,
            backgroundColor: 'rgba(255,255,255,0.55)',
          }} />
          {/* Bottom darker area for depth */}
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 28,
            borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
            backgroundColor: 'rgba(0,0,0,0.08)',
          }} />
        </LinearGradient>
      </View>
      {/* Label below shape */}
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#1E293B', marginTop: 10 }}>
        {label}
      </Text>
      {/* "Xg left" coloured text */}
      <Text style={{ fontSize: 12, fontWeight: '500', color: leftColor, marginTop: 2 }}>
        {remaining}g left
      </Text>
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
        <MacroTablet
          label="Protein"
          grams={Math.round(macros.protein.consumed)}
          target={macros.protein.target}
          gradientColors={['#86EFAC', '#4ADE80', '#22C55E']}
          shadowColor="#16A34A"
          leftColor="#16A34A"
        />
        <MacroTablet
          label="Carbs"
          grams={Math.round(macros.carbs.consumed)}
          target={macros.carbs.target}
          gradientColors={['#FDE68A', '#FCD34D', '#F59E0B']}
          shadowColor="#D97706"
          leftColor="#D97706"
        />
        <MacroTablet
          label="Fat"
          grams={Math.round(macros.fat.consumed)}
          target={macros.fat.target}
          gradientColors={['#C4B5FD', '#A78BFA', '#7C3AED']}
          shadowColor="#7C3AED"
          leftColor="#7C3AED"
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
    overflow: 'visible',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    overflow: 'visible',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
});
