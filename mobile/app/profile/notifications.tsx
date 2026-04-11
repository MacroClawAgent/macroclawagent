import React, { useEffect, useState } from "react";
import {
  Alert, ScrollView, StyleSheet, Switch, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/ui/AppHeader";
import {
  loadNotifPrefs, saveNotifPrefs, scheduleAllNotifications,
  cancelAllNotifications, requestNotificationPermission,
  type NotificationPrefs, DEFAULT_NOTIF_PREFS,
} from "@/services/notificationService";

const BG = "#1C1612";
const CARD = "#252018";
const GOLD = "#F5C842";
const SAGE = "#8B9E6E";
const TEXT_C = "#E8E0D0";
const MUTED = "rgba(232,224,208,0.5)";
const DIM = "rgba(232,224,208,0.25)";
const BORDER = "rgba(255,220,150,0.12)";

function TimeInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  // Auto-format HH:MM
  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) { onChange(digits); return; }
    const hh = Math.min(23, parseInt(digits.slice(0, 2)));
    const mm = Math.min(59, parseInt(digits.slice(2)));
    onChange(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }

  return (
    <View style={s.timeRow}>
      <Text style={s.timeLabel}>{label}</Text>
      <TextInput
        style={s.timeInput}
        value={value}
        onChangeText={handleChange}
        placeholder="HH:MM"
        placeholderTextColor={DIM}
        keyboardType="number-pad"
        maxLength={5}
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIF_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadNotifPrefs().then(setPrefs); }, []);

  function update<K extends keyof NotificationPrefs>(key: K, val: NotificationPrefs[K]) {
    setPrefs(prev => ({ ...prev, [key]: val }));
  }

  function updateMealTime(meal: "breakfast" | "lunch" | "dinner", val: string) {
    setPrefs(prev => ({ ...prev, mealTimes: { ...prev.mealTimes, [meal]: val } }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const ok = await requestNotificationPermission();
      if (!ok && (prefs.mealReminders || prefs.dailyNudge || prefs.streaks)) {
        Alert.alert("Notifications Disabled", "Enable notifications in Settings > Jonno to receive reminders.");
        setSaving(false);
        return;
      }
      await saveNotifPrefs(prefs);
      if (prefs.mealReminders || prefs.dailyNudge || prefs.streaks) {
        await scheduleAllNotifications();
      } else {
        await cancelAllNotifications();
      }
      Alert.alert("Saved", "Your notification preferences have been updated.");
    } catch {
      Alert.alert("Error", "Could not save preferences.");
    } finally { setSaving(false); }
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <AppHeader title="Notifications" showBack />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Meal Reminders */}
        <Text style={s.sectionLabel}>MEAL REMINDERS</Text>
        <View style={s.card}>
          <View style={s.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.switchLabel}>Meal logging reminders</Text>
              <Text style={s.switchSub}>Get reminded to log breakfast, lunch, and dinner</Text>
            </View>
            <Switch
              value={prefs.mealReminders}
              onValueChange={v => update("mealReminders", v)}
              trackColor={{ false: DIM, true: "rgba(245,200,66,0.4)" }}
              thumbColor={prefs.mealReminders ? GOLD : "rgba(232,224,208,0.4)"}
            />
          </View>
          {prefs.mealReminders && (
            <View style={s.timesWrap}>
              <TimeInput label="Breakfast" value={prefs.mealTimes.breakfast} onChange={v => updateMealTime("breakfast", v)} />
              <TimeInput label="Lunch" value={prefs.mealTimes.lunch} onChange={v => updateMealTime("lunch", v)} />
              <TimeInput label="Dinner" value={prefs.mealTimes.dinner} onChange={v => updateMealTime("dinner", v)} />
            </View>
          )}
        </View>

        {/* Daily Nudge */}
        <Text style={s.sectionLabel}>DAILY CHECK-IN</Text>
        <View style={s.card}>
          <View style={s.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.switchLabel}>End-of-day nudge</Text>
              <Text style={s.switchSub}>Gentle reminder to review your day</Text>
            </View>
            <Switch
              value={prefs.dailyNudge}
              onValueChange={v => update("dailyNudge", v)}
              trackColor={{ false: DIM, true: "rgba(245,200,66,0.4)" }}
              thumbColor={prefs.dailyNudge ? GOLD : "rgba(232,224,208,0.4)"}
            />
          </View>
          {prefs.dailyNudge && (
            <View style={s.timesWrap}>
              <TimeInput label="Nudge time" value={prefs.nudgeTime} onChange={v => update("nudgeTime", v)} />
            </View>
          )}
        </View>

        {/* Streaks */}
        <Text style={s.sectionLabel}>MOTIVATION</Text>
        <View style={s.card}>
          <View style={s.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.switchLabel}>Streak milestones</Text>
              <Text style={s.switchSub}>Celebrate when you hit 3, 7, 14, 30 day streaks</Text>
            </View>
            <Switch
              value={prefs.streaks}
              onValueChange={v => update("streaks", v)}
              trackColor={{ false: DIM, true: "rgba(245,200,66,0.4)" }}
              thumbColor={prefs.streaks ? GOLD : "rgba(232,224,208,0.4)"}
            />
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={s.saveBtnText}>{saving ? "Saving..." : "Save Preferences"}</Text>
        </TouchableOpacity>

        <Text style={s.hint}>
          Jonno sends max 3-4 notifications per day. All messages are positive and progress-focused — never guilt-based.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 16, paddingBottom: 60, gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: DIM, letterSpacing: 0.6, paddingLeft: 4, marginTop: 8 },
  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  switchLabel: { fontSize: 15, fontWeight: "700", color: TEXT_C },
  switchSub: { fontSize: 12, color: MUTED, marginTop: 2 },
  timesWrap: { borderTopWidth: 1, borderTopColor: "rgba(232,224,208,0.06)", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  timeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  timeLabel: { fontSize: 14, color: MUTED, fontWeight: "500" },
  timeInput: {
    backgroundColor: "rgba(232,224,208,0.06)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(232,224,208,0.1)",
    paddingHorizontal: 14, paddingVertical: 8, fontSize: 15, fontWeight: "700", color: TEXT_C, width: 80, textAlign: "center",
  },
  saveBtn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 12 },
  saveBtnText: { color: BG, fontWeight: "800", fontSize: 16 },
  hint: { fontSize: 12, color: DIM, textAlign: "center", lineHeight: 18, marginTop: 8 },
});
