import React, { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api";

const BG = "#F4F5F7"; const WHITE = "#FFFFFF"; const BORDER = "#E5E7EB"; const TEAL = "#2BB6A6";

function Divider() { return <View style={s.divider} />; }
function SectionLabel({ title }: { title: string }) { return <Text style={s.sectionLabel}>{title}</Text>; }

export default function SettingsPageScreen() {
  const { userProfile, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [savingUnits, setSavingUnits] = useState(false);
  const isMetric = (userProfile?.unit_preference ?? "metric") === "metric";

  async function toggleUnits() {
    setSavingUnits(true);
    try { await apiPost("/api/profile/update", { unit_preference: isMetric ? "imperial" : "metric" }); await refreshProfile(); }
    catch { Alert.alert("Error", "Could not update units."); }
    finally { setSavingUnits(false); }
  }

  function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <AppHeader title="Settings" showBack />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <SectionLabel title="Preferences" />
        <View style={s.card}>
          {/* Units toggle */}
          <View style={s.row}>
            <Text style={s.rowLabel}>Units</Text>
            <View style={s.toggleWrap}>
              <TouchableOpacity style={[s.toggleOpt, isMetric && s.toggleOptActive]}
                onPress={() => { if (!isMetric) toggleUnits(); }} disabled={savingUnits} activeOpacity={0.7}>
                <Text style={[s.toggleTxt, isMetric && s.toggleTxtActive]}>Metric</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.toggleOpt, !isMetric && s.toggleOptActive]}
                onPress={() => { if (isMetric) toggleUnits(); }} disabled={savingUnits} activeOpacity={0.7}>
                <Text style={[s.toggleTxt, !isMetric && s.toggleTxtActive]}>Imperial</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Divider />
          <View style={s.row}>
            <Text style={s.rowLabel}>Notifications</Text>
            <Text style={s.rowValue}>On</Text>
          </View>
          <Divider />
          <View style={s.row}>
            <Text style={s.rowLabel}>Language</Text>
            <Text style={s.rowValue}>English</Text>
          </View>
        </View>

        <SectionLabel title="Legal" />
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={() => router.push("/profile/terms")} activeOpacity={0.7}>
            <Text style={s.rowLabel}>Terms & Conditions</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={s.row} onPress={() => router.push("/profile/privacy")} activeOpacity={0.7}>
            <Text style={s.rowLabel}>Privacy Policy</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={s.row} onPress={() => Linking.openURL("https://jonnoai.com/cookies")} activeOpacity={0.7}>
            <Text style={s.rowLabel}>Cookie Policy</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <SectionLabel title="App" />
        <View style={s.card}>
          <View style={s.row}><Text style={s.rowLabel}>Version</Text><Text style={s.rowValue}>1.0.0 (MVP)</Text></View>
          <Divider />
          <View style={s.row}><Text style={s.rowLabel}>Build</Text><Text style={s.rowValue}>2026.1</Text></View>
        </View>

        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
          <Text style={s.signOutTxt}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 16, gap: 10, paddingBottom: 60 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4, marginTop: 4 },
  card: { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  row:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  rowLabel: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  rowValue: { fontSize: 14, color: "#1C1C1E", fontWeight: "700" },
  chevron:  { fontSize: 20, color: "#C4C4C4" },
  divider:  { height: 1, backgroundColor: BG, marginHorizontal: 16 },
  toggleWrap: { flexDirection: "row", backgroundColor: BG, borderRadius: 20, padding: 2 },
  toggleOpt:  { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18 },
  toggleOptActive: { backgroundColor: WHITE, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  toggleTxt:       { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },
  toggleTxtActive: { color: "#1C1C1E", fontWeight: "700" },
  signOutBtn: { backgroundColor: WHITE, borderRadius: 14, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: "#FCA5A5", marginTop: 6 },
  signOutTxt: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
});
