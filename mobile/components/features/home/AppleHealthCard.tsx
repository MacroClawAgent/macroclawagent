import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { DailyActivitySummary } from "@/types/healthKit";

interface Props {
  authorized: boolean;
  loading: boolean;
  summary: DailyActivitySummary | null;
  error: string | null;
}

function StatPill({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={[s.pill, { borderColor: color + "40" }]}>
      <Text style={s.pillIcon}>{icon}</Text>
      <Text style={[s.pillValue, { color }]}>{value}</Text>
      <Text style={s.pillLabel}>{label}</Text>
    </View>
  );
}

function WorkoutRow({ name, duration, kcal }: { name: string; duration: number; kcal: number }) {
  return (
    <View style={s.workoutRow}>
      <View style={s.workoutDot} />
      <Text style={s.workoutName} numberOfLines={1}>{name}</Text>
      <Text style={s.workoutMeta}>{duration}min · {kcal} kcal</Text>
    </View>
  );
}

export function AppleHealthCard({ authorized, loading, summary, error }: Props) {
  if (Platform.OS !== "ios") {
    return (
      <View style={s.card}>
        <View style={s.centerBox}>
          <Text style={s.unavailIcon}>🍎</Text>
          <Text style={s.unavailTitle}>Apple Health</Text>
          <Text style={s.unavailSub}>Available on iOS only</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={s.card}>
        <View style={s.centerBox}>
          <ActivityIndicator color="#FA4A5B" />
          <Text style={s.loadingText}>Reading Apple Health…</Text>
        </View>
      </View>
    );
  }

  if (!authorized || error) {
    return (
      <View style={s.card}>
        <View style={s.centerBox}>
          <Text style={s.unavailIcon}>🍎</Text>
          <Text style={s.unavailTitle}>Apple Health</Text>
          <Text style={s.unavailSub}>
            {error ?? "Go to Settings → Health → Data Access to grant permission."}
          </Text>
        </View>
      </View>
    );
  }

  const steps = summary?.steps ?? 0;
  const kcal = summary?.activeEnergyBurned ?? 0;
  const bpm = summary?.heartRateAvg;
  const weight = summary?.bodyWeightKg;
  const workouts = summary?.recentWorkouts ?? [];

  const stepsProgress = Math.min(steps / 10000, 1);

  return (
    <View style={s.card}>
      <LinearGradient
        colors={["rgba(224,123,84,0.06)", "rgba(0,0,0,0)"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerIconWrap}>
          <Text style={s.headerIcon}>🍎</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Apple Health</Text>
          <Text style={s.subtitle}>Today's Activity</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={s.pillRow}>
        <StatPill icon="🔥" value={`${kcal}`} label="kcal" color="#FA4A5B" />
        <StatPill icon="👟" value={steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : `${steps}`} label="steps" color="#5C8CFF" />
        {bpm ? (
          <StatPill icon="❤️" value={`${bpm}`} label="bpm" color="#FF6B8A" />
        ) : weight ? (
          <StatPill icon="⚖️" value={`${weight}`} label="kg" color="#2BB6A6" />
        ) : null}
      </View>

      {/* Steps progress bar */}
      <View style={s.progressWrap}>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${Math.round(stepsProgress * 100)}%` as any }]} />
        </View>
        <Text style={s.progressLabel}>{Math.round(stepsProgress * 100)}% of 10k steps</Text>
      </View>

      {/* Recent workouts */}
      {workouts.length > 0 && (
        <View style={s.workoutsSection}>
          <Text style={s.workoutsSectionTitle}>Recent Workouts</Text>
          {workouts.slice(0, 2).map((w) => (
            <WorkoutRow
              key={w.id}
              name={w.activityType}
              duration={w.durationMinutes}
              kcal={w.totalEnergyBurned}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const BG     = '#1C1612';
const CARD   = '#252018';
const BORDER = 'rgba(248,213,97,0.08)';
const TEXT_C = '#E8E0D0';
const MUTED  = 'rgba(232,224,208,0.5)';
const DIM    = 'rgba(232,224,208,0.3)';
const CORAL  = '#E07B54';

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 28,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    gap: 16,
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  unavailIcon: { fontSize: 36 },
  unavailTitle: { fontSize: 17, fontWeight: "700", color: TEXT_C },
  unavailSub: { fontSize: 13, color: MUTED, textAlign: "center", paddingHorizontal: 20 },
  loadingText: { fontSize: 14, color: MUTED, marginTop: 8 },

  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "rgba(224,123,84,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  headerIcon: { fontSize: 22 },
  title: { fontSize: 17, fontWeight: "800", color: TEXT_C, letterSpacing: -0.3 },
  subtitle: { fontSize: 12, color: MUTED, fontWeight: "500" },

  pillRow: { flexDirection: "row", gap: 10 },
  pill: {
    flex: 1, alignItems: "center", gap: 2,
    backgroundColor: BG,
    borderRadius: 14, paddingVertical: 10,
    borderWidth: 1,
  },
  pillIcon: { fontSize: 18 },
  pillValue: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  pillLabel: { fontSize: 10, color: MUTED, fontWeight: "600" },

  progressWrap: { gap: 6 },
  progressTrack: {
    height: 6, borderRadius: 3,
    backgroundColor: "rgba(232,224,208,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: 6, borderRadius: 3,
    backgroundColor: CORAL,
  },
  progressLabel: { fontSize: 11, color: MUTED, fontWeight: "600" },

  workoutsSection: { gap: 6 },
  workoutsSectionTitle: { fontSize: 12, fontWeight: "700", color: DIM, textTransform: "uppercase", letterSpacing: 0.4 },
  workoutRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  workoutDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: CORAL },
  workoutName: { flex: 1, fontSize: 13, fontWeight: "600", color: TEXT_C },
  workoutMeta: { fontSize: 12, color: MUTED },
});
