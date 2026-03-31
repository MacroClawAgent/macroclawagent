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
    fiber?: MacroStat;
  };
  goalLabel: string;
}

// BAR_HEIGHT removed — bars now fill dynamically via flex

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
  return (
    <View style={mb.col}>
      <Text style={[mb.grams, { color }]}>{Math.round(consumed)}g</Text>
      <View style={[mb.track, { backgroundColor: trackColor }]}>
        <View style={{ flex: Math.max(0.001, 1 - pct) }} />
        {pct > 0 && <View style={[mb.fill, { flex: pct, backgroundColor: color }]} />}
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
      <Text style={{ fontSize: 15, fontFamily: 'BebasNeue_400Regular', letterSpacing: 1, color: labelColor }}>{remaining}g left</Text>
      <Text style={{ fontSize: 13, fontFamily: 'BebasNeue_400Regular', letterSpacing: 1, color: 'rgba(232,224,208,0.45)' }}>{label}</Text>
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
    fontSize: 15,
    fontFamily: "BebasNeue_400Regular",
    letterSpacing: 0.8,
  },
  track: {
    width: 36,
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  fill: {
    width: "100%",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  label: {
    fontSize: 14,
    fontFamily: "BebasNeue_400Regular",
    letterSpacing: 1,
    color: "#1E293B",
  },
  target: {
    fontSize: 13,
    fontFamily: "BebasNeue_400Regular",
    letterSpacing: 0.5,
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

      {/* Header row — icon + title left, calorie summary right */}
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
        <View style={styles.calRight}>
          <View style={styles.calRow}>
            <Text style={[styles.calBig, isDark && { color: '#E8E0D0' }]}>
              {calorieProgress.consumed.toLocaleString()}
            </Text>
            <Text style={[styles.calOf, isDark && { color: 'rgba(232,224,208,0.35)' }]}>
              /{calorieProgress.target.toLocaleString()}
            </Text>
          </View>
          <Text style={[styles.calSub, isDark && { color: isDark ? '#F5C842' : '#2DD4BF' }]}>
            {calPct}% · {calorieProgress.remaining.toLocaleString()} kcal left
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.calBar, isDark && { backgroundColor: 'rgba(248,213,97,0.15)' }]}>
        <LinearGradient
          colors={isDark ? ["#E07B54", "#F5C842"] : ["#2DD4BF", "#38BDF8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.calBarFill, { width: `${Math.max(2, calPct)}%` as DimensionValue }]}
        />
      </View>

      {/* Macro bar chart — unified for light + dark */}
      <View style={styles.macroRow}>
        {isDark ? (
          <>
            <MacroBar label="Protein" color="#E07B54" trackColor="rgba(224,123,84,0.18)"  consumed={macros.protein.consumed} target={macros.protein.target} />
            <MacroBar label="Carbs"   color="#F5C842" trackColor="rgba(245,200,66,0.18)"  consumed={macros.carbs.consumed}   target={macros.carbs.target}   />
            <MacroBar label="Fat"     color="#8B9E6E" trackColor="rgba(139,158,110,0.18)" consumed={macros.fat.consumed}     target={macros.fat.target}     />
          </>
        ) : (
          <>
            <MacroBar label="Protein" color="#34D399" trackColor="rgba(52,211,153,0.15)"  consumed={macros.protein.consumed} target={macros.protein.target} />
            <MacroBar label="Carbs"   color="#F59E0B" trackColor="rgba(245,158,11,0.15)"  consumed={macros.carbs.consumed}   target={macros.carbs.target}   />
            <MacroBar label="Fat"     color="#8B9E6E" trackColor="rgba(139,158,110,0.15)" consumed={macros.fat.consumed}     target={macros.fat.target}     />
          </>
        )}
      </View>
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
    paddingTop: 14,
    paddingBottom: 2,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(43,182,166,0.18)",
  },
  widgetTitle: { fontSize: 20, fontFamily: "BebasNeue_400Regular", letterSpacing: 1.5, color: "#1A1A1A" },
  widgetSub: { fontSize: 13, fontFamily: "BebasNeue_400Regular", letterSpacing: 1, marginTop: 1, color: "#6B7280" },

  // Calorie summary (right side of header)
  calRight: { alignItems: "flex-end", gap: 2 },
  calRow: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  calBig: { fontSize: 38, fontFamily: "BebasNeue_400Regular", letterSpacing: 1, color: "#0F172A" },
  calOf: { fontSize: 15, fontFamily: "BebasNeue_400Regular", letterSpacing: 0.5, color: "#94A3B8" },
  calSub: { fontSize: 13, fontFamily: "BebasNeue_400Regular", letterSpacing: 0.8, color: "#2DD4BF" },

  // Progress bar
  calBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "rgba(45,212,191,0.15)",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  calBarFill: { height: 6, borderRadius: 3 },

  // Macro bar chart
  macroRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "stretch",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
