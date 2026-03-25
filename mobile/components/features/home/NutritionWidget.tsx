import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
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

interface MacroTabletProps {
  label: string;
  color1: string;
  color2: string;
  shadowColor: string;
  labelColor: string;
  consumed: number;
  target: number;
}

function MacroTablet({ label, color1, color2, shadowColor: sc, labelColor, consumed, target }: MacroTabletProps) {
  const remaining = Math.max(0, target - Math.round(consumed));
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View style={{ shadowColor: sc, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 }}>
        <LinearGradient
          colors={[color1, color2, color1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ width: 72, height: 88, borderRadius: 24, overflow: 'hidden' }}
        >
          {/* Diagonal highlight slash */}
          <View style={{ position: 'absolute', top: 8, left: -20, width: 80, height: 28, backgroundColor: 'rgba(255,255,255,0.25)', transform: [{ rotate: '-25deg' }], borderRadius: 14 }} />
          {/* Dot highlight */}
          <View style={{ position: 'absolute', top: 12, left: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.45)' }} />
        </LinearGradient>
      </View>
      <Text style={{ fontSize: 13, fontWeight: '700', color: labelColor }}>{remaining}g left</Text>
      <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(232,224,208,0.45)' }}>{label}</Text>
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
    <BlurView
      intensity={isDark ? 52 : 72}
      tint={isDark ? "dark" : "light"}
      style={[styles.outerCard, isDark ? styles.outerCardDark : styles.outerCardLight]}
    >
      {!isDark && (
        <>
          <LinearGradient
            colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.specular}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.leftShimmer}
            pointerEvents="none"
          />
        </>
      )}

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
      <View style={[styles.calBar, isDark && { backgroundColor: 'rgba(248,213,97,0.15)' }]}>
        <LinearGradient
          colors={isDark ? ["#E07B54", "#F5C842"] : ["#2DD4BF", "#38BDF8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.calBarFill, { width: `${calPct}%` as DimensionValue }]}
        />
      </View>

      {/* Macro section */}
      {isDark ? (
        <View style={[styles.macroRow, { alignItems: 'center' }]}>
          <MacroTablet label="Protein" color1="#C4682A" color2="#E07B54" shadowColor="#E07B54" labelColor="#E07B54" consumed={macros.protein.consumed} target={macros.protein.target} />
          <MacroTablet label="Carbs"   color1="#C49A1A" color2="#F5C842" shadowColor="#F5C842" labelColor="#F5C842" consumed={macros.carbs.consumed}   target={macros.carbs.target}   />
          <MacroTablet label="Fat"     color1="#5C6E3A" color2="#8B9E6E" shadowColor="#8B9E6E" labelColor="#8B9E6E" consumed={macros.fat.consumed}     target={macros.fat.target}     />
        </View>
      ) : (
        <View style={styles.macroRow}>
          <MacroBar label="Protein" color="#34D399" trackColor="rgba(52,211,153,0.15)"   consumed={macros.protein.consumed} target={macros.protein.target} />
          <MacroBar label="Carbs"   color="#F59E0B" trackColor="rgba(245,158,11,0.15)"   consumed={macros.carbs.consumed}   target={macros.carbs.target}   />
          <MacroBar label="Fat"     color="#A78BFA" trackColor="rgba(167,139,250,0.15)"  consumed={macros.fat.consumed}     target={macros.fat.target}     />
        </View>
      )}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  outerCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
  },
  outerCardLight: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderColor: "rgba(255,255,255,0.62)",
    shadowColor: "#7BAAC8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
  },
  outerCardDark: {
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
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
  },
  leftShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 56,
    borderTopLeftRadius: 27,
    borderBottomLeftRadius: 27,
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
