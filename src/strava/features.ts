/**
 * Strava Signal-Only Feature Extraction
 *
 * COMPLIANCE RULES:
 * - This module processes raw Strava activity data IN MEMORY ONLY.
 * - Only the 7 allowed derived fields are returned for DB persistence.
 * - Raw GPS, HR streams, segment_efforts, splits, and route data are
 *   NEVER stored or forwarded to any LLM.
 * - These features are used as runtime personalization signals only.
 * - Strava-derived data must NEVER be used for model training or fine-tuning.
 */

import { TrainingDayFeature } from "../types/optimizer";

// The 7 allowed field names — nothing else may be persisted
const ALLOWED_FIELDS = new Set<keyof TrainingDayFeature>([
  "user_id",
  "day_date",
  "total_minutes",
  "run_minutes",
  "total_distance_km",
  "intensity_score",
  "long_run_flag",
  "load_trend",
]);

// Minimal interface — only the fields we need from Strava API response
interface RawStravaActivity {
  type: string;
  sport_type?: string;
  start_date_local?: string;
  start_date?: string;
  moving_time?: number;  // seconds
  elapsed_time?: number; // seconds
  distance?: number;     // meters
  average_heartrate?: number;
  average_speed?: number; // m/s
  // Everything else (GPS, streams, segments) is intentionally ignored
}

/** Clamp a number to [min, max] */
function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Map activity type string to canonical type */
function isRunType(type: string): boolean {
  return ["Run", "TrailRun", "VirtualRun", "Hike", "Walk"].includes(type);
}

/**
 * Compute a coarse intensity score (0–10) from HR and pace.
 * Uses only averages — no per-second streams.
 */
function computeIntensity(
  avgHr: number | undefined,
  avgSpeedMs: number | undefined,
  durationMinutes: number
): number {
  let score = 5; // default moderate

  // HR-based component (0–5 pts)
  if (avgHr) {
    if (avgHr < 120) score += -2;
    else if (avgHr < 140) score += -1;
    else if (avgHr < 160) score += 0;
    else if (avgHr < 170) score += 1;
    else score += 2;
  }

  // Pace/speed component (0–3 pts): baseline 6 min/km = 2.78 m/s
  if (avgSpeedMs) {
    const minPerKm = avgSpeedMs > 0 ? (1000 / avgSpeedMs) / 60 : 10;
    if (minPerKm < 4.5) score += 2;
    else if (minPerKm < 5.5) score += 1;
    else if (minPerKm > 7.5) score -= 1;
  }

  // Volume bonus for long sessions
  if (durationMinutes > 90) score += 1;

  return clamp(Math.round(score), 0, 10);
}

/**
 * Extract per-day training features from raw Strava activities.
 * Activities are processed in-memory only — nothing raw is persisted.
 */
export function extractFeatures(
  activities: RawStravaActivity[],
  userId: string,
  windowDays = 14
): TrainingDayFeature[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);

  // Group by date
  const byDate = new Map<string, RawStravaActivity[]>();

  for (const act of activities) {
    const rawDate = act.start_date_local ?? act.start_date;
    if (!rawDate) continue;
    const dayDate = rawDate.split("T")[0];
    if (new Date(dayDate) < cutoff) continue;

    const existing = byDate.get(dayDate) ?? [];
    existing.push(act);
    byDate.set(dayDate, existing);
  }

  const features: TrainingDayFeature[] = [];

  for (const [day_date, dayActivities] of byDate.entries()) {
    let total_minutes = 0;
    let run_minutes = 0;
    let total_distance_km = 0;
    let long_run_flag = false;
    const intensityScores: number[] = [];

    for (const act of dayActivities) {
      const durSec = act.moving_time ?? act.elapsed_time ?? 0;
      const durMin = Math.round(durSec / 60);
      const distKm = (act.distance ?? 0) / 1000;
      const type = act.sport_type ?? act.type ?? "Other";

      total_minutes += durMin;
      total_distance_km += distKm;

      if (isRunType(type)) {
        run_minutes += durMin;
        if (durMin > 75 || distKm > 15) long_run_flag = true;
      }

      intensityScores.push(
        computeIntensity(act.average_heartrate, act.average_speed, durMin)
      );
    }

    const intensity_score = intensityScores.length > 0
      ? clamp(Math.round(intensityScores.reduce((a, b) => a + b, 0) / intensityScores.length), 0, 10)
      : 0;

    features.push(
      sanitizeForStorage({
        user_id: userId,
        day_date,
        total_minutes,
        run_minutes,
        total_distance_km: Math.round(total_distance_km * 100) / 100,
        intensity_score,
        long_run_flag,
        load_trend: 0, // computed separately via computeLoadTrend
      })
    );
  }

  // Compute load trend across the window
  const sorted = features.sort((a, b) => a.day_date.localeCompare(b.day_date));
  const trend = computeLoadTrend(sorted);
  return sorted.map((f) => ({ ...f, load_trend: trend }));
}

/**
 * Compare this week's average daily minutes to last week's.
 * Returns: 1 (increasing), -1 (decreasing), 0 (stable, ±15% threshold)
 */
function computeLoadTrend(
  features: TrainingDayFeature[]
): -1 | 0 | 1 {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);

  const thisWeek = features.filter((f) => new Date(f.day_date) >= weekAgo);
  const lastWeek = features.filter(
    (f) => new Date(f.day_date) >= twoWeeksAgo && new Date(f.day_date) < weekAgo
  );

  const avgThis = thisWeek.length > 0
    ? thisWeek.reduce((s, f) => s + f.total_minutes, 0) / 7
    : 0;
  const avgLast = lastWeek.length > 0
    ? lastWeek.reduce((s, f) => s + f.total_minutes, 0) / 7
    : 0;

  if (avgLast === 0) return avgThis > 0 ? 1 : 0;
  const delta = (avgThis - avgLast) / avgLast;
  if (delta > 0.15) return 1;
  if (delta < -0.15) return -1;
  return 0;
}

/**
 * Strict sanitizer — strips ALL fields not in the allowed set.
 * Call this before any DB upsert to guarantee compliance.
 */
export function sanitizeForStorage(feature: TrainingDayFeature): TrainingDayFeature {
  const sanitized: Partial<TrainingDayFeature> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in feature) {
      (sanitized as Record<string, unknown>)[key] = (feature as Record<string, unknown>)[key];
    }
  }
  return sanitized as TrainingDayFeature;
}

/**
 * Verify no raw Strava fields are present in a feature object.
 * Used in compliance tests.
 */
export function assertNoRawStravaFields(obj: Record<string, unknown>): void {
  const forbidden = [
    "gps", "map", "polyline", "latlng", "segment_efforts", "splits_metric",
    "splits_imperial", "best_efforts", "streams", "hr_stream", "velocity_smooth",
    "altitude", "cadence", "watts", "heartrate_stream", "distance_stream",
  ];
  for (const field of forbidden) {
    if (field in obj) {
      throw new Error(`COMPLIANCE_VIOLATION: Raw Strava field "${field}" found in stored object`);
    }
  }
}
