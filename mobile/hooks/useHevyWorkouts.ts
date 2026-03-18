import { useCallback, useEffect, useState } from "react";
import { getAllWorkoutsFromLastNDays, HevyApiError } from "@/services/hevyApi";
import { computeWorkoutStats } from "@/utils/hevyHelpers";
import type { HevyWorkoutStats } from "@/types/hevy";

interface UseHevyWorkoutsResult {
  workouts: HevyWorkoutStats[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  refetch: () => Promise<void>;
}

export function useHevyWorkouts(days = 30): UseHevyWorkoutsResult {
  const [workouts, setWorkouts] = useState<HevyWorkoutStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getAllWorkoutsFromLastNDays(days);
      const stats = raw.map(computeWorkoutStats);
      setWorkouts(stats);
      setIsConnected(true);
    } catch (e) {
      if (e instanceof HevyApiError) {
        if (e.status === 401) {
          setIsConnected(false);
          setError(null); // Not an error — just not connected
        } else if (e.status === 429) {
          setError("Too many requests — try again later");
        } else {
          setError(e.message);
        }
      } else {
        setError("Could not reach Hevy. Check your connection.");
      }
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { workouts, loading, error, isConnected, refetch: fetch };
}
