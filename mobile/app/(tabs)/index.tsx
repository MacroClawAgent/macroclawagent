import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Colors from "@/constants/Colors";

const C = Colors.light;

/** Home / Dashboard screen — full implementation coming soon */
export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Good morning 👋</Text>
      <Text style={styles.sub}>Your dashboard is coming soon.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: 24, gap: 8 },
  heading: { fontSize: 24, fontWeight: "800", color: C.text },
  sub: { fontSize: 15, color: C.textSecondary },
});
