import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";

const HEVY_SETTINGS_URL = "https://hevy.com/settings?developer";
const PURPLE = "#A855F7";

export function HevyConnectPrompt() {
  return (
    <View style={s.card}>
      <View style={s.row}>
        <View style={s.iconWrap}>
          <Text style={s.icon}>🏋️</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Connect Hevy</Text>
          <Text style={s.sub}>See strength workouts & volume</Text>
        </View>
        <TouchableOpacity
          style={s.btn}
          activeOpacity={0.85}
          onPress={() => Linking.openURL(HEVY_SETTINGS_URL)}
        >
          <Text style={s.btnText}>Connect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: "rgba(168,85,247,0.07)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.18)",
    padding: 12,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 11, backgroundColor: "rgba(168,85,247,0.12)", alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 18 },
  title: { fontSize: 13, fontWeight: "700", color: "#111827" },
  sub: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
  btn: { backgroundColor: PURPLE, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7 },
  btnText: { fontSize: 12, fontWeight: "700", color: "#fff" },
});
