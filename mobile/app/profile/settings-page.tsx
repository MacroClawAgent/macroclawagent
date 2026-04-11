import React, { useState } from "react";
import { Alert, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { apiPost, apiDelete } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BG = "#0D0A07"; const WHITE = "#1C1410"; const BORDER = "rgba(255,220,150,0.12)"; const TEAL = "#F5C842";

function Divider() { return <View style={s.divider} />; }
function SectionLabel({ title }: { title: string }) { return <Text style={s.sectionLabel}>{title}</Text>; }

export default function SettingsPageScreen() {
  const { session, userProfile, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [savingUnits, setSavingUnits] = useState(false);
  const isMetric = (userProfile?.unit_preference ?? "metric") === "metric";
  const userEmail = session?.user?.email ?? "";

  // Email change
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

  // Password change
  const [showPwModal, setShowPwModal] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  async function handleChangeEmail() {
    if (!newEmail.includes("@")) { Alert.alert("Invalid email"); return; }
    setEmailSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      Alert.alert("Check your inbox", "A confirmation link has been sent to your new email.");
      setShowEmailModal(false);
      setNewEmail("");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not update email.");
    } finally { setEmailSaving(false); }
  }

  async function handleChangePassword() {
    if (newPw.length < 6) { Alert.alert("Too short", "Password must be at least 6 characters."); return; }
    if (newPw !== confirmPw) { Alert.alert("Mismatch", "New passwords don't match."); return; }
    setPwSaving(true);
    try {
      // Verify old password by re-signing in
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: userEmail, password: oldPw });
      if (signInErr) { Alert.alert("Wrong password", "Current password is incorrect."); setPwSaving(false); return; }
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      Alert.alert("Done", "Password updated successfully.");
      setShowPwModal(false);
      setOldPw(""); setNewPw(""); setConfirmPw("");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not update password.");
    } finally { setPwSaving(false); }
  }

  async function toggleUnits() {
    setSavingUnits(true);
    try { await apiPost("/api/profile/update", { unit_preference: isMetric ? "imperial" : "metric" }); await refreshProfile(); }
    catch { Alert.alert("Error", "Could not update units."); }
    finally { setSavingUnits(false); }
  }

  function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: async () => {
        await signOut();
        router.replace("/(auth)/sign-in");
      }},
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await apiDelete("/api/profile/delete");
            // Clear all local data
            await AsyncStorage.clear();
            await signOut();
            router.replace("/(auth)/sign-in");
          } catch {
            Alert.alert("Error", "Could not delete account. Please try again.");
          }
        }},
      ]
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <AppHeader title="Settings" showBack />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <SectionLabel title="Account" />
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.rowLabel}>Username</Text>
            <Text style={s.rowValue}>@{userProfile?.username || "—"}</Text>
          </View>
          <Divider />
          <View style={s.row}>
            <Text style={s.rowLabel}>Email</Text>
            <Text style={s.rowValue} numberOfLines={1}>{userEmail || "—"}</Text>
          </View>
          <Divider />
          <TouchableOpacity style={s.row} onPress={() => { setNewEmail(userEmail); setShowEmailModal(true); }} activeOpacity={0.7}>
            <Text style={s.rowLabel}>Change Email</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
          <Divider />
          <View style={s.row}>
            <Text style={s.rowLabel}>Password</Text>
            <Text style={s.rowValue}>••••••••</Text>
          </View>
          <Divider />
          <TouchableOpacity style={s.row} onPress={() => setShowPwModal(true)} activeOpacity={0.7}>
            <Text style={s.rowLabel}>Change Password</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        </View>

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
            <Text style={[s.rowValue, { color: "rgba(232,224,208,0.3)" }]}>Coming Soon</Text>
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

        <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.85}>
          <Text style={s.deleteBtnTxt}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ═══ Change Email Modal ═══ */}
      <Modal visible={showEmailModal} transparent animationType="slide" onRequestClose={() => setShowEmailModal(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowEmailModal(false)} activeOpacity={1} />
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Change Email</Text>
            <Text style={s.modalHint}>A confirmation link will be sent to the new address</Text>
            <TextInput
              style={s.modalInput}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="New email address"
              placeholderTextColor="rgba(232,224,208,0.3)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            <TouchableOpacity
              style={[s.modalBtn, emailSaving && { opacity: 0.5 }]}
              onPress={handleChangeEmail}
              disabled={emailSaving}
              activeOpacity={0.85}
            >
              <Text style={s.modalBtnTxt}>{emailSaving ? "Sending..." : "Update Email"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══ Change Password Modal ═══ */}
      <Modal visible={showPwModal} transparent animationType="slide" onRequestClose={() => setShowPwModal(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowPwModal(false)} activeOpacity={1} />
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Change Password</Text>
            <View style={s.pwInputWrap}>
              <TextInput
                style={[s.modalInput, { flex: 1, marginBottom: 0 }]}
                value={oldPw}
                onChangeText={setOldPw}
                placeholder="Current password"
                placeholderTextColor="rgba(232,224,208,0.3)"
                secureTextEntry={!showOldPw}
              />
              <TouchableOpacity onPress={() => setShowOldPw(v => !v)} style={s.eyeBtn}>
                <Ionicons name={showOldPw ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(232,224,208,0.4)" />
              </TouchableOpacity>
            </View>
            <View style={s.pwInputWrap}>
              <TextInput
                style={[s.modalInput, { flex: 1, marginBottom: 0 }]}
                value={newPw}
                onChangeText={setNewPw}
                placeholder="New password"
                placeholderTextColor="rgba(232,224,208,0.3)"
                secureTextEntry={!showNewPw}
              />
              <TouchableOpacity onPress={() => setShowNewPw(v => !v)} style={s.eyeBtn}>
                <Ionicons name={showNewPw ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(232,224,208,0.4)" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={s.modalInput}
              value={confirmPw}
              onChangeText={setConfirmPw}
              placeholder="Confirm new password"
              placeholderTextColor="rgba(232,224,208,0.3)"
              secureTextEntry={!showNewPw}
            />
            <TouchableOpacity
              style={[s.modalBtn, pwSaving && { opacity: 0.5 }]}
              onPress={handleChangePassword}
              disabled={pwSaving}
              activeOpacity={0.85}
            >
              <Text style={s.modalBtnTxt}>{pwSaving ? "Updating..." : "Update Password"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 16, gap: 10, paddingBottom: 60 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(232,224,208,0.4)", textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4, marginTop: 4 },
  card: { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  row:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  rowLabel: { fontSize: 14, color: "rgba(232,224,208,0.55)", fontWeight: "500" },
  rowValue: { fontSize: 14, color: "#E8E0D0", fontWeight: "700" },
  chevron:  { fontSize: 20, color: "rgba(232,224,208,0.25)" },
  divider:  { height: 1, backgroundColor: BG, marginHorizontal: 16 },
  toggleWrap: { flexDirection: "row", backgroundColor: BG, borderRadius: 20, padding: 2 },
  toggleOpt:  { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18 },
  toggleOptActive: { backgroundColor: WHITE, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  toggleTxt:       { fontSize: 13, fontWeight: "600", color: "rgba(232,224,208,0.4)" },
  toggleTxtActive: { color: "#E8E0D0", fontWeight: "700" },
  signOutBtn: { backgroundColor: WHITE, borderRadius: 14, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: "#FCA5A5", marginTop: 6 },
  signOutTxt: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
  deleteBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 10 },
  deleteBtnTxt: { color: "rgba(239,68,68,0.5)", fontWeight: "600", fontSize: 13 },
  // Modals
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, gap: 14,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(232,224,208,0.15)", alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#E8E0D0" },
  modalHint: { fontSize: 13, color: "rgba(232,224,208,0.4)", marginTop: -8 },
  modalInput: {
    backgroundColor: "rgba(232,224,208,0.06)", borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: "#E8E0D0",
  },
  modalBtn: { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  modalBtnTxt: { color: "#1C1612", fontWeight: "800", fontSize: 15 },
  pwInputWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 8 },
});
