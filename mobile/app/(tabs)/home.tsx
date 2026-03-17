import React, { useCallback, useRef, useState } from "react";
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
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
      vm.refresh();
    }, [vm.refresh])
  );

  return (
    <Screen style={{ backgroundColor: "#20C7B7" }}>
      {/* Top header: greeting left, avatar + goal right */}
      <View style={styles.topHeader}>
        <View style={styles.greetingBlock}>
          <Text style={[styles.greetingWord, { color: "rgba(255,255,255,0.72)" }]}>
            {vm.greeting}
          </Text>
          <Text style={[styles.greetingName, { color: "#FFF" }]}>
            {vm.userName}
          </Text>
        </View>
        <AvatarButton
          name={userProfile?.full_name ?? ""}
          onPress={() => router.push("/profile")}
          size={44}
          color="#4C7DFF"
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
            tintColor="#FFF"
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
            <View style={{ width: SCREEN_W }}>
              {vm.loading ? <SkeletonCard /> : (
                <NutritionWidget
                  calorieProgress={vm.calorieProgress}
                  macros={vm.macros}
                  goalLabel={vm.goalLabel}
                />
              )}
            </View>
            <View style={{ width: SCREEN_W }}>
              {vm.loading ? <SkeletonCard /> : (
                <TodayActivitiesCard activities={vm.todayActivities} />
              )}
            </View>
            <View style={{ width: SCREEN_W }}>
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
          <Text style={[styles.discoverHeading, { color: "#FFF" }]}>Discover</Text>
          <View style={styles.discoverGrid}>
            {[
              { label: "Workouts", emoji: "💪", route: "/discover/workouts", bg: "#1A2B6B" },
              { label: "Recipes",  emoji: "🥗", route: "/discover/recipes",  bg: "#0E4A3E" },
              { label: "Meal Prep",emoji: "🥡", route: "/discover/meal-prep",bg: "#3A1A5C" },
              { label: "Trends",   emoji: "📈", route: "/discover/trends",   bg: "#1A3A3A" },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.82}
                onPress={() => router.push(item.route as any)}
                style={[styles.discoverCard, { backgroundColor: item.bg }]}
              >
                <Text style={styles.discoverEmoji}>{item.emoji}</Text>
                <Text style={styles.discoverLabel}>{item.label}</Text>
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
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  greetingName: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 36,
  },

  skeleton: {
    height: 140,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
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
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#FFF",
    borderRadius: 3,
  },
  bottomSpacer: { height: 24 },

  discoverSection: { paddingHorizontal: 20, gap: 12 },
  discoverHeading: { fontSize: 18, fontWeight: "800", letterSpacing: -0.4 },
  discoverGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  discoverCard: {
    width: (SCREEN_W - 40 - 12) / 2,
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  discoverEmoji: { fontSize: 36 },
  discoverLabel: { fontSize: 14, fontWeight: "700", color: "#FFF", letterSpacing: -0.2 },
});
