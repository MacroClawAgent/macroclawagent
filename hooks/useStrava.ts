"use client";

import { useEffect, useState } from "react";

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number; // meters
  moving_time: number; // seconds
  calories: number;
  start_date: string;
  average_heartrate?: number;
  max_heartrate?: number;
}

interface StravaState {
  activities: StravaActivity[];
  loading: boolean;
  error: string | null;
  connected: boolean;
}

/**
 * Hook for fetching Strava activity data.
 * Calls the /api/strava/sync endpoint which will eventually
 * fetch real data from the Strava API using the user's token.
 */
export function useStrava(): StravaState {
  const [state, setState] = useState<StravaState>({
    activities: [],
    loading: true,
    error: null,
    connected: false,
  });

  useEffect(() => {
    // Stub: in production, this calls the real Strava sync endpoint
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/strava/sync", { method: "POST" });
        if (!response.ok) throw new Error("Strava sync failed");

        // In production, parse real activities from the response
        // For now, return empty (dashboard uses hardcoded data)
        setState({
          activities: [],
          loading: false,
          error: null,
          connected: false, // will be true once Strava OAuth is wired
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    };

    fetchActivities();
  }, []);

  return state;
}
