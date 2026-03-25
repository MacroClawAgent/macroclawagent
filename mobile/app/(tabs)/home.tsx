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
import { AppleHealthCard } from "@/components/features/home/AppleHealthCard";
import { useHealthKit } from "@/hooks/useHealthKit";
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
  const { colors, isDark } = useTheme();
  const { userProfile } = useAuth();
  const router = useRouter();
  const vm = useHomeViewModel();
  const hk = useHealthKit();
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
    <Screen style={{ backgroundColor: isDark ? "#0D0A07" : "#C8DFF0" }}>
      {/* Full-screen gradient backdrop */}
      <LinearGradient
        colors={isDark
          ? ['#000000', '#080603', '#120D08', '#1C1410', '#2E1A0A']
          : ['#E8F2F8', '#D4E7F3', '#C8DFF0']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />
      {/* Top header: greeting left, avatar + goal right */}
      <View style={styles.topHeader}>
        <View style={styles.greetingBlock}>
          <Text style={[styles.greetingWord, isDark && { color: 'rgba(232,224,208,0.55)' }]}>
            {vm.greeting}
          </Text>
          <Text style={[styles.greetingName, isDark && { color: '#E8E0D0' }]}>
            {vm.userName}
          </Text>
        </View>
        <AvatarButton
          name={userProfile?.full_name ?? ""}
          onPress={() => router.push("/profile")}
          size={44}
          color={isDark ? "#F5C842" : "#3B6FD4"}
          textColor={isDark ? "#1C1410" : "#FFFFFF"}
          style={{ borderWidth: 3, borderColor: isDark ? '#F5C842' : vm.goalRingColor }}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.refresh}
            tintColor={isDark ? "#F5C842" : "#35C7B8"}
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
              <View key={i} style={[
                styles.dot,
                isDark && { backgroundColor: 'rgba(255,220,150,0.12)' },
                carouselIdx === i && styles.dotActive,
                carouselIdx === i && isDark && { backgroundColor: '#F5C842' },
              ]} />
            ))}
          </View>
        </View>

        {/* Apple Health standalone card */}
        <AppleHealthCard
          authorized={hk.authorized}
          loading={hk.loading}
          summary={hk.summary}
          error={hk.error}
        />

        {/* Discover */}
        <View style={styles.discoverSection}>
          <Text style={[styles.discoverHeading, isDark && { color: '#E8E0D0' }]}>Discover</Text>
          <View style={styles.discoverGrid}>
            {DISCOVER_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.82}
                onPress={() => router.push(item.route as any)}
              >
                <BlurView intensity={isDark ? 0 : 22} tint={isDark ? "dark" : "light"} style={[styles.discoverCard, isDark && styles.discoverCardDark]}>
                  <View style={styles.discoverHighlight} pointerEvents="none" />
                  <View style={[styles.discoverIconWrap, { backgroundColor: item.iconBg }]}>
                    <SymbolView
                      name={{ ios: item.ios, android: item.android, web: item.android }}
                      tintColor={item.iconColor}
                      size={24}
                    />
                  </View>
                  <Text style={[styles.discoverLabel, isDark && { color: '#E8E0D0' }]}>{item.label}</Text>
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
    fontSize: 16,
    fontFamily: "BebasNeue_400Regular",
    letterSpacing: 1.5,
    color: "#6B7280",
  },
  greetingName: {
    fontSize: 42,
    fontFamily: "BebasNeue_400Regular",
    letterSpacing: 1,
    lineHeight: 44,
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
  discoverHeading: { fontSize: 26, fontFamily: "BebasNeue_400Regular", letterSpacing: 1.5, color: "#111827" },
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
  discoverLabel: { fontSize: 15, fontFamily: "BebasNeue_400Regular", letterSpacing: 1, color: "#1A1A1A" },
  discoverCardDark: {
    backgroundColor: "#252018",
    borderColor: "rgba(255,220,150,0.12)",
  },
});
