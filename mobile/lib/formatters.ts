// Shared formatting utilities used across screens

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

export function formatPace(secondsPerKm: number): string {
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")} /km`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (d.toDateString() === now.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function greetingWord(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function getDayType(activityType?: string): string {
  if (!activityType) return "Rest";
  const map: Record<string, string> = {
    Run: "Run day",
    Ride: "Ride day",
    Swim: "Swim day",
    Other: "Training day",
  };
  return map[activityType] ?? "Training day";
}

export function loadLabel(
  heartRate?: number | null,
  durationSeconds?: number
): { label: string; color: string } {
  const dur = durationSeconds ?? 0;
  const hr = heartRate ?? 0;
  if (hr > 160 || dur > 5400) return { label: "High", color: "#EF4444" };
  if (hr > 130 || dur > 2700) return { label: "Moderate", color: "#F97316" };
  return { label: "Low", color: "#22C55E" };
}

export function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
