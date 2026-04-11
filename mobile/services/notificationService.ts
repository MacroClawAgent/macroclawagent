import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ── Types ────────────────────────────────────────────────────────────────────
export interface NotificationPrefs {
  mealReminders: boolean;
  mealTimes: { breakfast: string; lunch: string; dinner: string }; // "HH:MM"
  dailyNudge: boolean;
  nudgeTime: string; // "HH:MM"
  streaks: boolean;
  quietStart: string; // "HH:MM"
  quietEnd: string;   // "HH:MM"
}

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  mealReminders: true,
  mealTimes: { breakfast: "07:30", lunch: "12:00", dinner: "19:00" },
  dailyNudge: true,
  nudgeTime: "20:00",
  streaks: true,
  quietStart: "22:00",
  quietEnd: "07:00",
};

const STORAGE_KEY = "jonno_notification_prefs";

// ── Notification channel (Android) ───────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ── Permissions ──────────────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Jonno",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: "#F5C842",
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ── Save / Load prefs ────────────────────────────────────────────────────────
export async function saveNotifPrefs(prefs: NotificationPrefs): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export async function loadNotifPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_NOTIF_PREFS;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseTime(hhmm: string): { hour: number; minute: number } {
  const [h, m] = hhmm.split(":").map(Number);
  return { hour: h || 0, minute: m || 0 };
}

function nextTriggerDate(hour: number, minute: number): Date {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target;
}

// ── Meal reminder messages ───────────────────────────────────────────────────
const MEAL_MESSAGES = {
  breakfast: [
    "Good morning! Ready to log breakfast?",
    "Start your day right — what did you have for breakfast?",
    "Fuel up! Log your breakfast to stay on track.",
  ],
  lunch: [
    "Lunchtime! What are you having?",
    "Halfway through the day — log your lunch to track your macros.",
    "Quick check-in: what's for lunch today?",
  ],
  dinner: [
    "Dinner time! Log your meal to complete your day.",
    "What's on the plate tonight? Log it to hit your targets.",
    "Almost there — log dinner to see your daily progress.",
  ],
};

const NUDGE_MESSAGES = [
  "Quick check-in — how did you eat today?",
  "End of day! Tap to see how close you got to your targets.",
  "Don't break your streak — log any remaining meals.",
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Schedule all notifications ───────────────────────────────────────────────
export async function scheduleAllNotifications(): Promise<void> {
  // Cancel all existing
  await Notifications.cancelAllScheduledNotificationsAsync();

  const prefs = await loadNotifPrefs();
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  // Meal reminders
  if (prefs.mealReminders) {
    for (const [meal, timeStr] of Object.entries(prefs.mealTimes)) {
      const { hour, minute } = parseTime(timeStr);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Jonno",
          body: randomPick(MEAL_MESSAGES[meal as keyof typeof MEAL_MESSAGES] ?? MEAL_MESSAGES.lunch),
          data: { type: "meal_reminder", meal },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }
  }

  // Daily nudge
  if (prefs.dailyNudge) {
    const { hour, minute } = parseTime(prefs.nudgeTime);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Jonno",
        body: randomPick(NUDGE_MESSAGES),
        data: { type: "daily_nudge" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }
}

// ── Streak notification (called manually after logging) ──────────────────────
export async function checkAndNotifyStreak(streak: number): Promise<void> {
  const prefs = await loadNotifPrefs();
  if (!prefs.streaks) return;

  const milestones = [3, 7, 14, 21, 30, 50, 100];
  if (!milestones.includes(streak)) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Jonno",
      body: `🔥 ${streak}-day logging streak! You're on fire — keep it going.`,
      data: { type: "streak", streak },
    },
    trigger: null, // immediate
  });
}

// ── Cancel all ───────────────────────────────────────────────────────────────
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
