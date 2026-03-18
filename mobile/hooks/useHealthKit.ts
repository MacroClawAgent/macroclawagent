import { useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  initHealthKit,
  getDailyActivitySummary,
} from "@/services/healthKit";
import type { DailyActivitySummary } from "@/types/healthKit";

interface UseHealthKitResult {
  authorized: boolean;
  loading: boolean;
  summary: DailyActivitySummary | null;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useHealthKit(): UseHealthKitResult {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(Platform.OS === "ios");
  const [summary, setSummary] = useState<DailyActivitySummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (Platform.OS !== "ios") return;
    try {
      setLoading(true);
      const data = await getDailyActivitySummary();
      setSummary(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to read Apple Health data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Platform.OS !== "ios") {
      setLoading(false);
      return;
    }
    (async () => {
      const ok = await initHealthKit();
      setAuthorized(ok);
      if (ok) await refresh();
      else setLoading(false);
    })();
  }, []);

  return { authorized, loading, summary, error, refresh };
}
