import React, { useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { AvatarButton } from "@/components/ui/AvatarButton";
import { InsightCard } from "@/components/features/home/InsightCard";
import { NutritionWidget } from "@/components/features/home/NutritionWidget";
import { TodayActivitiesCard } from "@/components/features/home/TodayActivitiesCard";
import { WeekCalendarStrip } from "@/components/features/home/WeekCalendarStrip";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useHomeViewModel } from "@/lib/viewModels/useHomeViewModel";

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

        {/* Nutrition widget */}
        {vm.loading ? (
          <SkeletonCard />
        ) : (
          <NutritionWidget
            calorieProgress={vm.calorieProgress}
            macros={vm.macros}
            goalLabel={vm.goalLabel}
          />
        )}

        {/* Today's activities */}
        {vm.loading ? (
          <SkeletonCard />
        ) : (
          <TodayActivitiesCard activities={vm.todayActivities} />
        )}

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
  bottomSpacer: { height: 24 },
});
