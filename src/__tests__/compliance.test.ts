import { describe, it, expect } from "vitest";
import { extractFeatures, sanitizeForStorage, assertNoRawStravaFields } from "../strava/features";
import { LLMRequestSchema, AdherenceFeedbackSchema } from "../types/optimizer";

// ── Allowed field names for training_day_features ─────────────
const ALLOWED_FEATURE_FIELDS = new Set([
  "user_id", "day_date", "total_minutes", "run_minutes",
  "total_distance_km", "intensity_score", "long_run_flag", "load_trend",
]);

// Forbidden raw Strava field names
const FORBIDDEN_STRAVA_FIELDS = [
  "gps", "map", "polyline", "latlng", "segment_efforts", "splits_metric",
  "splits_imperial", "best_efforts", "streams", "hr_stream",
  "velocity_smooth", "altitude", "cadence", "watts", "heartrate_stream",
  "distance_stream", "access_token", "refresh_token", "strava_access_token",
  "strava_raw", "hr_data", "gps_data",
];

// Sample raw Strava activity with forbidden fields included
const RAW_STRAVA_ACTIVITY = {
  type: "Run",
  sport_type: "Run",
  start_date_local: "2025-01-15T07:30:00",
  moving_time: 3600,
  distance: 12000,
  average_heartrate: 155,
  average_speed: 3.33,
  // Forbidden fields — should be stripped
  map: { polyline: "abc123", summary_polyline: "xyz" },
  segment_efforts: [{ id: 123, name: "Segment A", elapsed_time: 120 }],
  splits_metric: [{ distance: 1000, elapsed_time: 300 }],
  best_efforts: [{ name: "1k", elapsed_time: 280 }],
  latlng: [[51.5, -0.1], [51.51, -0.11]],
  streams: { heartrate: { data: [140, 150, 160] } },
};

describe("Strava compliance — extractFeatures", () => {
  it("output contains only allowed field names", () => {
    const features = extractFeatures([RAW_STRAVA_ACTIVITY], "user-123", 30);
    for (const feature of features) {
      const featureKeys = Object.keys(feature);
      for (const key of featureKeys) {
        expect(ALLOWED_FEATURE_FIELDS.has(key)).toBe(true);
      }
    }
  });

  it("output does NOT contain any forbidden Strava fields", () => {
    const features = extractFeatures([RAW_STRAVA_ACTIVITY], "user-123", 30);
    for (const feature of features) {
      for (const forbidden of FORBIDDEN_STRAVA_FIELDS) {
        expect(feature).not.toHaveProperty(forbidden);
      }
    }
  });

  it("intensity_score is between 0 and 10", () => {
    const features = extractFeatures([RAW_STRAVA_ACTIVITY], "user-123", 30);
    for (const feature of features) {
      expect(feature.intensity_score).toBeGreaterThanOrEqual(0);
      expect(feature.intensity_score).toBeLessThanOrEqual(10);
    }
  });

  it("load_trend is -1, 0, or 1", () => {
    const features = extractFeatures([RAW_STRAVA_ACTIVITY], "user-123", 30);
    for (const feature of features) {
      expect([-1, 0, 1]).toContain(feature.load_trend);
    }
  });
});

describe("Strava compliance — sanitizeForStorage", () => {
  it("strips all fields not in allowed set", () => {
    const dirtyFeature = {
      user_id: "u1",
      day_date: "2025-01-15",
      total_minutes: 60,
      run_minutes: 60,
      total_distance_km: 12,
      intensity_score: 6,
      long_run_flag: false,
      load_trend: 0 as const,
      // These should be stripped
      gps: [[51.5, -0.1]],
      hr_stream: [140, 150],
      segment_efforts: [],
      strava_access_token: "secret-token",
    };
    const sanitized = sanitizeForStorage(dirtyFeature as never);
    expect(sanitized).not.toHaveProperty("gps");
    expect(sanitized).not.toHaveProperty("hr_stream");
    expect(sanitized).not.toHaveProperty("segment_efforts");
    expect(sanitized).not.toHaveProperty("strava_access_token");
  });

  it("preserves all 7 allowed fields", () => {
    const feature = {
      user_id: "u1",
      day_date: "2025-01-15",
      total_minutes: 60,
      run_minutes: 60,
      total_distance_km: 12,
      intensity_score: 6,
      long_run_flag: false,
      load_trend: 0 as const,
    };
    const sanitized = sanitizeForStorage(feature);
    expect(Object.keys(sanitized)).toHaveLength(8); // 7 fields + user_id
    expect(sanitized.user_id).toBe("u1");
    expect(sanitized.intensity_score).toBe(6);
  });
});

describe("Strava compliance — assertNoRawStravaFields", () => {
  it("throws on GPS data", () => {
    expect(() => assertNoRawStravaFields({ gps: [[51.5, -0.1]] })).toThrow("COMPLIANCE_VIOLATION");
  });

  it("throws on HR stream", () => {
    expect(() => assertNoRawStravaFields({ hr_stream: [140, 150] })).toThrow("COMPLIANCE_VIOLATION");
  });

  it("passes on allowed fields", () => {
    expect(() => assertNoRawStravaFields({
      total_minutes: 60,
      intensity_score: 5,
      long_run_flag: false,
    })).not.toThrow();
  });
});

describe("LLM Gateway compliance — LLMRequestSchema", () => {
  it("strips raw Strava fields via strict schema", () => {
    const dirtyRequest = {
      request_type: "explanation",
      meals: [],
      grocery_list: [],
      daily_targets: [],
      preferences: {
        goal: "performance",
        diet: "omnivore",
        allergies: [],
        dislikes: [],
        budget_level: "med",
        cooking_time_level: "med",
        meals_per_day: 3,
      },
      // These should cause strict() to reject
      strava_raw: { type: "Run", distance: 5000 },
      access_token: "secret",
    };

    // LLMRequestSchema is strict — extra keys will cause parse failure
    const result = LLMRequestSchema.safeParse(dirtyRequest);
    expect(result.success).toBe(false);
  });

  it("accepts valid LLM request without forbidden fields", () => {
    const validRequest = {
      request_type: "explanation",
      meals: [],
      grocery_list: [],
      daily_targets: [],
      preferences: {
        goal: "performance",
        diet: "omnivore",
        allergies: [],
        dislikes: [],
        budget_level: "med",
        cooking_time_level: "med",
        meals_per_day: 3,
      },
    };

    const result = LLMRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it("adherence_feedback schema has no Strava-derived columns", () => {
    const shape = AdherenceFeedbackSchema.shape;
    const keys = Object.keys(shape);
    for (const forbidden of ["intensity_score", "load_trend", "long_run_flag", "strava_athlete_id"]) {
      expect(keys).not.toContain(forbidden);
    }
  });
});
