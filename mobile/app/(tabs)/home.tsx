import React, { useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { NutritionWidget } from "@/components/features/home/NutritionWidget";
import { LatestActivityCard } from "@/components/features/home/LatestActivityCard";
import { JonnoInsightCard } from "@/components/features/home/JonnoInsightCard";
import { QuickActionRow } from "@/components/features/home/QuickActionRow";
import { WeekCalendarStrip } from "@/components/features/home/WeekCalendarStrip";
import { useTheme } from "@/context/ThemeContext";
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
      <AppHeader wordmark showAvatar textColor="#FFF" avatarColor="#4C7DFF" />
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
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.greetingText, { color: "#FFF" }]}>
            {vm.greeting}, {vm.userName} 👋
          </Text>
          <View style={styles.goalPill}>
            <Text style={styles.goalPillText}>{vm.goalEmoji} {vm.goalLabel}</Text>
          </View>
        </View>

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

        {/* Nutrition widget */}
        {vm.loading ? (
          <SkeletonCard />
        ) : (
          <NutritionWidget
            calorieProgress={vm.calorieProgress}
            macros={vm.macros}
            goalEmoji={vm.goalEmoji}
            goalLabel={vm.goalLabel}
          />
        )}

        {/* Latest activity */}
        {vm.loading ? (
          <SkeletonCard />
        ) : (
          <LatestActivityCard
            activity={vm.latestActivity}
            isStravaConnected={vm.isStravaConnected}
          />
        )}

        {/* Jonno AI insight */}
        {!vm.loading && vm.jonnoInsight ? (
          <JonnoInsightCard
            title={vm.jonnoInsight.title}
            body={vm.jonnoInsight.body}
          />
        ) : null}

        {/* Quick actions */}
        <QuickActionRow />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 4,
    gap: 14,
  },
  greeting: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 8,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  goalPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  goalPillText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  skeleton: {
    height: 140,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bottomSpacer: { height: 24 },
});
