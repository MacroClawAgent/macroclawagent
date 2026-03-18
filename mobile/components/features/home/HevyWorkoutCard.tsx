import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { formatVolume, formatDuration, formatWorkoutDate } from "@/utils/hevyHelpers";
import type { HevyWorkoutStats } from "@/types/hevy";

interface Props {
  stats: HevyWorkoutStats;
  onPress?: () => void;
}

export function HevyWorkoutCard({ stats, onPress }: Props) {
  const { workout, totalVolume, totalSets, totalReps, uniqueExercises, durationMinutes } = stats;
  const dateLabel = formatWorkoutDate(workout.start_time);
  const durationLabel = formatDuration(durationMinutes);

  const MAX_SHOWN = 4;
  const shown = uniqueExercises.slice(0, MAX_SHOWN);
  const extra = uniqueExercises.length - MAX_SHOWN;
  const exerciseLabel = shown.join(", ") + (extra > 0 ? ` +${extra} more` : "");

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82}>
      <BlurView intensity={55} tint="light" style={s.card}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.iconWrap}>
            <Text style={s.icon}>🏋️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title} numberOfLines={1}>{workout.title}</Text>
            <Text style={s.date}>{dateLabel} · {durationLabel}</Text>
          </View>
          <View style={s.hevyBadge}>
            <Text style={s.hevyBadgeText}>Hevy</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          {totalVolume > 0 && (
            <View style={s.statChip}>
              <Text style={s.statVal}>{formatVolume(totalVolume)}</Text>
              <Text style={s.statLabel}>volume</Text>
            </View>
          )}
          <View style={s.statChip}>
            <Text style={s.statVal}>{totalSets}</Text>
            <Text style={s.statLabel}>sets</Text>
          </View>
          <View style={s.statChip}>
            <Text style={s.statVal}>{totalReps}</Text>
            <Text style={s.statLabel}>reps</Text>
          </View>
        </View>

        {/* Exercise list */}
        {exerciseLabel ? (
          <Text style={s.exercises} numberOfLines={2}>{exerciseLabel}</Text>
        ) : null}
      </BlurView>
    </TouchableOpacity>
  );
}

const PURPLE = "#A855F7";

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.18)",
    padding: 14,
    gap: 10,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(168,85,247,0.12)", alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 20 },
  title: { fontSize: 15, fontWeight: "700", color: "#111827", letterSpacing: -0.2 },
  date: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },

  hevyBadge: { backgroundColor: "rgba(168,85,247,0.12)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(168,85,247,0.2)" },
  hevyBadgeText: { fontSize: 10, fontWeight: "700", color: PURPLE, letterSpacing: 0.3 },

  statsRow: { flexDirection: "row", gap: 8 },
  statChip: { flex: 1, alignItems: "center", backgroundColor: "rgba(168,85,247,0.07)", borderRadius: 12, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(168,85,247,0.12)" },
  statVal: { fontSize: 15, fontWeight: "800", color: "#111827", letterSpacing: -0.3 },
  statLabel: { fontSize: 10, fontWeight: "600", color: "#9CA3AF", marginTop: 1 },

  exercises: { fontSize: 12, color: "#6B7280", lineHeight: 17, fontWeight: "500" },
});
