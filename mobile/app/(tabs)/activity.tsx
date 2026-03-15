import React from "react";
import { Linking, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusDot } from "@/components/ui/StatusDot";
import { SyncBanner } from "@/components/features/activity/SyncBanner";
import { ActivityCard } from "@/components/features/activity/ActivityCard";
import { AdaptiveMacroNotice } from "@/components/features/activity/AdaptiveMacroNotice";
import { useTheme } from "@/context/ThemeContext";
import { useActivityViewModel } from "@/lib/viewModels/useActivityViewModel";
import { apiGet } from "@/lib/api";

function WeekStatChip({ value, label, colors }: { value: string; label: string; colors: any }) {
  return (
    <View style={[styles.weekChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.weekChipValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.weekChipLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

export default function ActivityScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const vm = useActivityViewModel();

  const handleConnect = async () => {
    try {
      const res = await apiGet<{ url: string }>("/api/strava/mobile-init");
      if (res.url) await Linking.openURL(res.url);
    } catch {
      router.push("/profile" as any);
    }
  };

  return (
    <Screen>
      <AppHeader
        title="Activities"
        showAvatar
        rightElement={
          vm.isStravaConnected ? (
            <StatusDot color={vm.syncing ? colors.orange : colors.green} />
          ) : undefined
        }
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} tintColor={colors.teal} />
        }
      >
        <SyncBanner
          isConnected={vm.isStravaConnected}
          syncing={vm.syncing}
          lastSyncLabel={vm.lastSyncLabel}
          onSync={vm.sync}
          onConnect={handleConnect}
        />

        {vm.isStravaConnected && (
          <View style={styles.weekStats}>
            <WeekStatChip value={String(vm.weekStats.sessions)} label="Sessions" colors={colors} />
            <WeekStatChip value={`${vm.weekStats.distanceKm.toFixed(0)}km`} label="Distance" colors={colors} />
            <WeekStatChip value={`${vm.weekStats.durationMin}m`} label="Active" colors={colors} />
            <WeekStatChip value={`${vm.weekStats.kcalBurned}`} label="kcal" colors={colors} />
          </View>
        )}

        {vm.activities.length > 0 ? (
          <>
            <SectionTitle label="Recent" style={styles.sectionTitle} />
            {vm.activities.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </>
        ) : vm.isStravaConnected && !vm.loading ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No activities yet — sync Strava above to load your training.
            </Text>
          </View>
        ) : null}

        {vm.macroAdaptationText ? (
          <AdaptiveMacroNotice text={vm.macroAdaptationText} />
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 4, gap: 12 },
  weekStats: { flexDirection: "row", gap: 8, paddingHorizontal: 20 },
  weekChip: {
    flex: 1, padding: 12, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center", gap: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  weekChipValue: { fontSize: 16, fontWeight: "800" },
  weekChipLabel: { fontSize: 10, fontWeight: "600" },
  sectionTitle: { paddingHorizontal: 20 },
  empty: { paddingHorizontal: 20, paddingVertical: 20 },
  emptyText: { fontSize: 14, fontWeight: "500", lineHeight: 20, textAlign: "center" },
  bottomSpacer: { height: 24 },
});
