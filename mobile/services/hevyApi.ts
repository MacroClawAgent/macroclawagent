/**
 * Hevy API service
 * Base URL: https://api.hevyapp.com/v1
 * Auth: api-key header — each user generates their own at hevy.com/settings?developer
 *
 * TODO (multi-user): Replace EXPO_PUBLIC_HEVY_API_KEY with per-user key
 * fetched from SecureStore keyed by userId after login.
 */

import type { HevyWorkout, HevyWorkoutsResponse, HevyRoutinesResponse } from "@/types/hevy";

const BASE_URL = "https://api.hevyapp.com/v1";

function getApiKey(): string {
  return process.env.EXPO_PUBLIC_HEVY_API_KEY ?? "";
}

function headers(): HeadersInit {
  return {
    "api-key": getApiKey(),
    "Content-Type": "application/json",
  };
}

export class HevyApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HevyApiError";
  }
}

async function hevyFetch<T>(path: string): Promise<T> {
  const key = getApiKey();
  if (!key) throw new HevyApiError(401, "No Hevy API key configured");

  const res = await fetch(`${BASE_URL}${path}`, { headers: headers() });

  if (res.status === 401) throw new HevyApiError(401, "Invalid Hevy API key");
  if (res.status === 429) throw new HevyApiError(429, "Too many requests — try again later");
  if (!res.ok) throw new HevyApiError(res.status, `Hevy API error: ${res.status}`);

  return res.json() as Promise<T>;
}

/** GET /workouts — paginated list sorted by date descending */
export async function getWorkouts(page = 1, pageSize = 10): Promise<HevyWorkoutsResponse> {
  return hevyFetch<HevyWorkoutsResponse>(`/workouts?page=${page}&pageSize=${pageSize}`);
}

/** GET /workouts/:id — single workout with full exercise detail */
export async function getWorkoutById(workoutId: string): Promise<{ workout: HevyWorkout }> {
  return hevyFetch<{ workout: HevyWorkout }>(`/workouts/${workoutId}`);
}

/** GET /routines — user's saved workout routines */
export async function getRoutines(page = 1, pageSize = 10): Promise<HevyRoutinesResponse> {
  return hevyFetch<HevyRoutinesResponse>(`/routines?page=${page}&pageSize=${pageSize}`);
}

/**
 * Fetch all workouts from the last N days.
 * Pages through results until all recent workouts are collected.
 * Capped at 10 pages to avoid rate limit hammering.
 */
export async function getAllWorkoutsFromLastNDays(days: number): Promise<HevyWorkout[]> {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const collected: HevyWorkout[] = [];
  const MAX_PAGES = 10;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await getWorkouts(page, 10);
    const workouts = res.workouts ?? [];

    for (const w of workouts) {
      if (new Date(w.start_time) >= cutoff) {
        collected.push(w);
      }
    }

    // Stop if we've gone past the cutoff date or exhausted pages
    const oldest = workouts[workouts.length - 1];
    if (!oldest || new Date(oldest.start_time) < cutoff || page >= res.page_count) {
      break;
    }
  }

  return collected;
}
