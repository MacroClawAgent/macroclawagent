import React, { useCallback, useRef, useState } from "react";
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useFocusEffect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Screen } from "@/components/ui/Screen";
import { AvatarButton } from "@/components/ui/AvatarButton";
import { InsightCard } from "@/components/features/home/InsightCard";
import { MealsEatenCard } from "@/components/features/home/MealsEatenCard";
import { NutritionWidget } from "@/components/features/home/NutritionWidget";
import { TodayActivitiesCard } from "@/components/features/home/TodayActivitiesCard";
import { WeekCalendarStrip } from "@/components/features/home/WeekCalendarStrip";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useHomeViewModel } from "@/lib/viewModels/useHomeViewModel";

const SCREEN_W = Dimensions.get("window").width;
const CARD_COUNT = 3;
const CAROUSEL_H = 350;

const DISCOVER_ITEMS = [
  { label: "Workouts",  route: "/discover/workouts",  ios: "dumbbell.fill",          android: "fitness_center",  iconColor: "#5C8CFF", iconBg: "rgba(92,140,255,0.18)" },
  { label: "Recipes",   route: "/discover/recipes",   ios: "leaf.fill",              android: "eco",             iconColor: "#2BB6A6", iconBg: "rgba(43,182,166,0.18)" },
  { label: "Meal Prep", route: "/discover/meal-prep", ios: "tray.2.fill",            android: "inventory_2",     iconColor: "#A78BFA", iconBg: "rgba(167,139,250,0.18)" },
  { label: "Trends",    route: "/discover/trends",    ios: "chart.line.uptrend.xyaxis", android: "trending_up",  iconColor: "#34D399", iconBg: "rgba(52,211,153,0.18)" },
];

function SkeletonCard() {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.skeleton,
        { backgroundColor: "rgba(255,255,255,0.2)", borderColor: "transparent" },
      ]}
    />
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { userProfile } = useAuth();
  const router = useRouter();
  const vm = useHomeViewModel();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselRef = useRef<ScrollView>(null);

  // Refresh nutrition data every time the home tab comes into focus
  // (e.g. after returning from food log or photo confirm screens)
  useFocusEffect(
    useCallback(() => {
      vm.silentRefresh();
    }, [vm.silentRefresh])
  );

  return (
    <Screen style={{ backgroundColor: "#EEF4FA" }}>
      {/* Full-screen cool blue-white gradient backdrop */}
      <LinearGradient
        colors={["#EEF4FA", "#F5F8FC"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />
      {/* Top header: greeting left, avatar + goal right */}
      <View style={styles.topHeader}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingWord}>
            {vm.greeting}
          </Text>
          <Text style={styles.greetingName}>
            {vm.userName}
          </Text>
        </View>
        <AvatarButton
          name={userProfile?.full_name ?? ""}
          onPress={() => router.push("/profile")}
          size={44}
          color="#2BB6A6"
          style={{ borderWidth: 3, borderColor: vm.goalRingColor }}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.refresh}
            tintColor="#35C7B8"
          />
        }
      >

        {/* 7-day week streak strip */}
        <WeekCalendarStrip
          weeklyCalories={vm.weeklyCalories}
          goals={{
            calories: vm.calorieProgress.target,
            protein: vm.macros.protein.target,
            carbs: vm.macros.carbs.target,
            fat: vm.macros.fat.target,
          }}
        />

        {/* AI Insight card */}
        <InsightCard insight={vm.jonnoInsight} />

        {/* Cards carousel: Nutrition → Activities → Meals */}
        <View>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
              setCarouselIdx(idx);
            }}
          >
            <View style={{ width: SCREEN_W, height: CAROUSEL_H }}>
              {vm.loading ? <SkeletonCard /> : (
                <NutritionWidget
                  calorieProgress={vm.calorieProgress}
                  macros={vm.macros}
                  goalLabel={vm.goalLabel}
                />
              )}
            </View>
            <View style={{ width: SCREEN_W, height: CAROUSEL_H }}>
              {vm.loading ? <SkeletonCard /> : (
                <TodayActivitiesCard activities={vm.todayActivities} />
              )}
            </View>
            <View style={{ width: SCREEN_W, height: CAROUSEL_H }}>
              <MealsEatenCard />
            </View>
          </ScrollView>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {Array.from({ length: CARD_COUNT }).map((_, i) => (
              <View key={i} style={[styles.dot, carouselIdx === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Discover */}
        <View style={styles.discoverSection}>
          <Text style={styles.discoverHeading}>Discover</Text>
          <View style={styles.discoverGrid}>
            {DISCOVER_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.82}
                onPress={() => router.push(item.route as any)}
              >
                <BlurView intensity={22} tint="light" style={styles.discoverCard}>
                  <View style={styles.discoverHighlight} pointerEvents="none" />
                  <View style={[styles.discoverIconWrap, { backgroundColor: item.iconBg }]}>
                    <SymbolView
                      name={{ ios: item.ios, android: item.android, web: item.android }}
                      tintColor={item.iconColor}
                      size={24}
                    />
                  </View>
                  <Text style={styles.discoverLabel}>{item.label}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 0,
    gap: 14,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  greetingBlock: {
    gap: 3,
    flex: 1,
  },
  greetingWord: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.2,
    color: "#6B7280",
  },
  greetingName: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 35,
    color: "#111827",
  },

  skeleton: {
    height: 140,
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: "rgba(255,255,255,0.6)",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#35C7B8",
    borderRadius: 3,
  },
  bottomSpacer: { height: 24 },

  discoverSection: { paddingHorizontal: 20, gap: 12 },
  discoverHeading: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3, color: "#111827" },
  discoverGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  discoverCard: {
    width: (SCREEN_W - 40 - 12) / 2,
    aspectRatio: 1,
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "rgba(255,255,255,0.75)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 50,
  },
  discoverHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  discoverIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  discoverLabel: { fontSize: 13, fontWeight: "600", color: "#1A1A1A", letterSpacing: -0.1 },
});
