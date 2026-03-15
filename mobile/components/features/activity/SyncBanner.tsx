import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { StatusDot } from "../../ui/StatusDot";

interface SyncBannerProps {
  isConnected: boolean;
  syncing: boolean;
  lastSyncLabel: string;
  onSync: () => void;
  onConnect: () => void;
}

export function SyncBanner({ isConnected, syncing, lastSyncLabel, onSync, onConnect }: SyncBannerProps) {
  const { colors } = useTheme();

  if (!isConnected) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onConnect}
        style={[styles.banner, { backgroundColor: colors.orangeAlpha, borderColor: colors.orange + "44" }]}
      >
        <View style={styles.row}>
          <Text style={styles.stravaLogo}>🔗</Text>
          <View style={styles.text}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Connect Strava</Text>
            <Text style={[styles.sub, { color: colors.textMuted }]}>Sync training to adapt your targets</Text>
          </View>
          <Text style={[styles.arrow, { color: colors.orange }]}>›</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.banner, { backgroundColor: colors.greenAlpha, borderColor: colors.green + "33" }]}>
      <View style={styles.row}>
        <StatusDot color={syncing ? colors.orange : colors.green} pulse={syncing} />
        <Text style={[styles.syncText, { color: colors.textPrimary }]}>
          {syncing ? "Syncing…" : `Strava · ${lastSyncLabel}`}
        </Text>
        <TouchableOpacity onPress={onSync} disabled={syncing} activeOpacity={0.7}>
          {syncing ? (
            <ActivityIndicator size="small" color={colors.teal} />
          ) : (
            <Text style={[styles.syncBtn, { color: colors.teal }]}>Sync now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  stravaLogo: { fontSize: 20 },
  text: { flex: 1 },
  title: { fontSize: 14, fontWeight: "700" },
  sub: { fontSize: 12, fontWeight: "500", marginTop: 1 },
  arrow: { fontSize: 22 },
  syncText: { flex: 1, fontSize: 13, fontWeight: "600" },
  syncBtn: { fontSize: 13, fontWeight: "700" },
});
