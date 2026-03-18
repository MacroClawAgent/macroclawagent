import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";

const HEVY_SETTINGS_URL = "https://hevy.com/settings?developer";
const PURPLE = "#A855F7";

export function HevyConnectPrompt() {
  return (
    <BlurView intensity={50} tint="light" style={s.card}>
      <View style={s.iconWrap}>
        <Text style={s.icon}>🏋️</Text>
      </View>
      <Text style={s.title}>Track Strength Training</Text>
      <Text style={s.sub}>
        Connect Hevy to see your workouts, volume and exercise details alongside your other activity.
      </Text>
      <TouchableOpacity
        style={s.btn}
        activeOpacity={0.85}
        onPress={() => Linking.openURL(HEVY_SETTINGS_URL)}
      >
        <Text style={s.btnText}>Connect Hevy →</Text>
      </TouchableOpacity>
      <Text style={s.note}>Requires a Hevy Pro account to generate an API key</Text>
    </BlurView>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.18)",
    padding: 20,
    alignItems: "center",
    gap: 10,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  iconWrap: { width: 56, height: 56, borderRadius: 18, backgroundColor: "rgba(168,85,247,0.12)", alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 28 },
  title: { fontSize: 16, fontWeight: "700", color: "#111827", textAlign: "center" },
  sub: { fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 18, paddingHorizontal: 8 },
  btn: { backgroundColor: PURPLE, borderRadius: 22, paddingHorizontal: 28, paddingVertical: 12, marginTop: 4 },
  btnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  note: { fontSize: 11, color: "#9CA3AF", textAlign: "center" },
});
