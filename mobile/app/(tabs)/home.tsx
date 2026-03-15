import React from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { HomeHeroCard } from "@/components/features/home/HomeHeroCard";
import { LatestActivityCard } from "@/components/features/home/LatestActivityCard";
import { JonnoInsightCard } from "@/components/features/home/JonnoInsightCard";
import { QuickActionRow } from "@/components/features/home/QuickActionRow";
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

  return (
    <Screen style={{ backgroundColor: "#20C7B7" }}>
      <AppHeader wordmark showAvatar textColor="#FFF" avatarColor="rgba(255,255,255,0.25)" />
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
        </View>

        {/* Hero calorie card */}
        {vm.loading ? (
          <SkeletonCard />
        ) : (
          <HomeHeroCard
            calorieProgress={vm.calorieProgress}
            macros={vm.macros}
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
  },
  greetingText: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  skeleton: {
    height: 140,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bottomSpacer: { height: 24 },
});
