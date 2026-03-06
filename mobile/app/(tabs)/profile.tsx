import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Colors from "@/constants/Colors";

const C = Colors.light;

/** User profile screen */
export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Profile</Text>
      <Text style={styles.sub}>Goals, settings and account coming soon.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: 24, gap: 8 },
  heading: { fontSize: 24, fontWeight: "800", color: C.text },
  sub: { fontSize: 15, color: C.textSecondary },
});
