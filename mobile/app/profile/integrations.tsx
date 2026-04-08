import React from "react";
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { useHealthKit } from "@/hooks/useHealthKit";
import { apiGet } from "@/lib/api";

const BG = "#0D0A07"; const WHITE = "#1C1410"; const BORDER = "rgba(255,220,150,0.12)"; const TEAL = "#F5C842";

const ITEMS = [
  { key: "strava",        name: "Strava",          sub: "Sync training & activities",          emoji: "🏃", bg: "rgba(252,82,0,0.10)",    live: true },
  { key: "apple_health",  name: "Apple Health",    sub: "Steps, heart rate & sleep",           emoji: "❤️", bg: "rgba(255,59,48,0.10)",   live: Platform.OS === "ios" },
  { key: "hevy",          name: "Hevy",            sub: "Strength workouts, sets & volume",    emoji: "🏋️", bg: "rgba(168,85,247,0.10)",  live: false },
  { key: "garmin",        name: "Garmin Connect",  sub: "GPS watch & workout data",            emoji: "⌚", bg: "rgba(0,126,200,0.10)",   live: false },
  { key: "myfitnesspal",  name: "MyFitnessPal",    sub: "Import food diary & logs",            emoji: "🥗", bg: "rgba(0,180,90,0.10)",    live: false },
  { key: "uber_eats",     name: "Uber Eats",       sub: "Order meals from Smart Cart",         emoji: "🛵", bg: "rgba(6,202,127,0.10)",   live: false },
  { key: "google_fit",    name: "Google Fit",      sub: "Android health & activity data",      emoji: "🟢", bg: "rgba(66,133,244,0.10)",  live: false },
];

function Divider() { return <View style={s.divider} />; }

export default function IntegrationsScreen() {
  const { userProfile } = useAuth();
  const hk = useHealthKit();
  const live = ITEMS.filter((i) => i.live);
  const soon = ITEMS.filter((i) => !i.live);

  function isConnected(key: string) {
    if (key === "strava") return !!userProfile?.strava_athlete_id;
    if (key === "apple_health") return hk.authorized;
    return false;
  }

  async function handleConnect(item: typeof ITEMS[number]) {
    if (item.key === "apple_health") {
      const ok = await hk.requestPermission();
      if (!ok) {
        Alert.alert(
          "Apple Health",
          "Could not connect to Apple Health. Make sure Health access is enabled in Settings > Privacy > Health > Jonno.",
        );
      }
    } else if (item.key === "strava") {
      try {
        const res = await apiGet<{ url: string }>("/api/strava/mobile-init");
        if (res?.url) {
          Linking.openURL(res.url);
        } else {
          Alert.alert("Error", "Could not start Strava connection. Try again.");
        }
      } catch {
        Alert.alert("Error", "Could not reach the server. Check your connection.");
      }
    }
  }

  function Card({ items }: { items: typeof ITEMS }) {
    return (
      <View style={s.card}>
        {items.map((item, i) => {
          const connected = isConnected(item.key);
          return (
            <React.Fragment key={item.key}>
              {i > 0 && <Divider />}
              <View style={s.row}>
                <View style={[s.icon, { backgroundColor: item.bg }]}>
                  <Text style={s.emoji}>{item.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.sub}>{item.sub}</Text>
                </View>
                {item.live ? (
                  connected ? (
                    <View style={s.badgeOn}><Text style={s.badgeOnTxt}>Connected</Text></View>
                  ) : (
                    <TouchableOpacity style={s.connectBtn} onPress={() => handleConnect(item)} activeOpacity={0.75}>
                      <Text style={s.connectTxt}>Connect</Text>
                    </TouchableOpacity>
                  )
                ) : (
                  <View style={s.badgeSoon}><Text style={s.badgeSoonTxt}>Soon</Text></View>
                )}
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <AppHeader title="Integrations" showBack />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>Connected Services</Text>
        <Card items={live} />
        <Text style={s.sectionLabel}>Coming Soon</Text>
        <Card items={soon} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 16, gap: 10, paddingBottom: 60 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(232,224,208,0.4)", textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4, marginTop: 4 },
  card: { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  row:  { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  icon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 20 },
  name: { fontSize: 15, fontWeight: "700", color: "#E8E0D0" },
  sub:  { fontSize: 12, color: "rgba(232,224,208,0.4)", marginTop: 1 },
  divider: { height: 1, backgroundColor: BG, marginHorizontal: 16 },
  badgeOn:     { backgroundColor: "rgba(16,185,129,0.12)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeOnTxt:  { fontSize: 12, fontWeight: "700", color: "#10B981" },
  badgeSoon:   { backgroundColor: BG, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeSoonTxt:{ fontSize: 12, fontWeight: "600", color: "rgba(232,224,208,0.4)" },
  connectBtn:  { backgroundColor: TEAL, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  connectTxt:  { fontSize: 12, fontWeight: "700", color: WHITE },
});
