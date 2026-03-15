import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost } from "../api";
import { formatDate } from "../formatters";
import type { ActivityRow } from "../../types";

export interface ActivityViewModel {
  activities: ActivityRow[];
  filter: string;
  setFilter: (f: string) => void;
  weekStats: { sessions: number; distanceKm: number; durationMin: number; kcalBurned: number };
  isStravaConnected: boolean;
  syncing: boolean;
  lastSyncLabel: string;
  macroAdaptationText: string | null;
  sync: () => Promise<void>;
  loading: boolean;
  refreshing: boolean;
  refresh: () => void;
}

function buildWeekStats(activities: ActivityRow[]) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const recent = activities.filter((a) => new Date(a.started_at) >= cutoff);
  return {
    sessions: recent.length,
    distanceKm: recent.reduce((s, a) => s + (a.distance_meters ?? 0) / 1000, 0),
    durationMin: recent.reduce((s, a) => s + Math.round(a.duration_seconds / 60), 0),
    kcalBurned: recent.reduce((s, a) => s + (a.calories ?? 0), 0),
  };
}

function buildMacroAdaptation(activities: ActivityRow[]): string | null {
  const today = new Date().toDateString();
  const todayActivity = activities.find(
    (a) => new Date(a.started_at).toDateString() === today
  );
  if (!todayActivity) return null;
  const kcal = todayActivity.calories ?? 0;
  if (kcal > 400) return `Macro targets updated for today's ${todayActivity.type.toLowerCase()} — +${kcal} kcal burn accounted for.`;
  return "Macro targets updated for today's training load.";
}

export function useActivityViewModel(): ActivityViewModel {
  const { userProfile } = useAuth();
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncLabel, setLastSyncLabel] = useState("recently");

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await apiGet<{ activities: ActivityRow[] }>("/api/activities?limit=50");
      setActivities(res.activities ?? []);
      setLastSyncLabel("just now");
    } catch {
      // keep state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      await apiPost("/api/strava/sync", {});
      await fetchData();
      setLastSyncLabel("just now");
    } catch {
      // ignore
    } finally {
      setSyncing(false);
    }
  }, [fetchData]);

  const filtered =
    filter === "All" ? activities : activities.filter((a) => a.type === filter);

  return {
    activities: filtered,
    filter,
    setFilter,
    weekStats: buildWeekStats(activities),
    isStravaConnected: !!userProfile?.strava_athlete_id,
    syncing,
    lastSyncLabel,
    macroAdaptationText: buildMacroAdaptation(activities),
    sync,
    loading,
    refreshing,
    refresh: () => fetchData(true),
  };
}
