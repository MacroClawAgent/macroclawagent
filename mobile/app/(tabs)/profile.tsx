import { useMemo, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Switch, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { apiGet, apiDelete, apiPost, apiPatch } from "@/lib/api";
import { AppColors } from "@/theme/colors";

function createStyles(c: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 20, paddingBottom: 48 },
    avatarSection: { alignItems: "center", gap: 8, paddingVertical: 12 },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: c.primary, justifyContent: "center", alignItems: "center" },
    avatarText: { fontSize: 28, fontWeight: "800", color: c.primaryText },
    name: { fontSize: 20, fontWeight: "800", color: c.text },
    email: { fontSize: 13, color: c.muted },
    editProfileBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border },
    editProfileText: { fontSize: 13, fontWeight: "600", color: c.muted },
    section: { gap: 8 },
    sectionTitle: { fontSize: 12, fontWeight: "700", color: c.muted, textTransform: "uppercase", letterSpacing: 0.5, paddingLeft: 4 },
    card: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: "hidden" },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
    rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    rowLabel: { fontSize: 14, color: c.muted, fontWeight: "500" },
    rowValue: { fontSize: 14, color: c.text, fontWeight: "700" },
    rowEdit: { fontSize: 13, color: c.primary, fontWeight: "600" },
    divider: { height: 1, backgroundColor: c.bg, marginHorizontal: 16 },
    badgeConnected: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981", overflow: "hidden" },
    stravaConnectCard: { backgroundColor: "#FC4C02", borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    stravaLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
    stravaIcon: { fontSize: 28 },
    stravaTitle: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
    stravaSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2, lineHeight: 16 },
    stravaArrow: { fontSize: 20, color: "#FFFFFF", fontWeight: "700" },
    disconnectBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(239,68,68,0.12)" },
    disconnectText: { fontSize: 13, fontWeight: "700", color: "#EF4444" },
    signOutButton: { backgroundColor: c.card, borderRadius: 14, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: "#FCA5A5", marginTop: 8 },
    signOutText: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
    // Edit modal
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
    sheet: { backgroundColor: "#1C1C1E", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
    handle: { width: 40, height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, alignSelf: "center", marginBottom: 4 },
    modalTitle: { fontSize: 20, fontWeight: "800", color: "#F5F5F7" },
    inputGroup: { gap: 6 },
    inputLabel: { fontSize: 11, fontWeight: "700", color: "rgba(245,245,247,0.45)", textTransform: "uppercase", letterSpacing: 0.5 },
    modalInput: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#F5F5F7", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    twoCol: { flexDirection: "row", gap: 10 },
    saveBtn: { backgroundColor: "#D4FF00", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
    saveBtnText: { fontWeight: "800", color: "#0B0B0B", fontSize: 16 },
    cancelBtn: { alignItems: "center", paddingVertical: 8 },
    cancelBtnText: { color: "rgba(245,245,247,0.45)", fontWeight: "600", fontSize: 14 },
  });
}

// ── Edit Modal (reusable shell) ───────────────────────────────

interface EditField { label: string; value: string; setter: (v: string) => void; keyboardType?: "default" | "numeric" | "decimal-pad"; placeholder?: string }

function EditSheet({ visible, title, fields, onSave, onClose, saving }: {
  visible: boolean; title: string; fields: EditField[];
  onSave: () => void; onClose: () => void; saving: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ backgroundColor: "#1C1C1E", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 }}>
          <View style={{ width: 40, height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, alignSelf: "center", marginBottom: 4 }} />
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#F5F5F7" }}>{title}</Text>
          {fields.map((f) => (
            <View key={f.label} style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "rgba(245,245,247,0.45)", textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</Text>
              <TextInput
                style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#F5F5F7", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
                value={f.value}
                onChangeText={f.setter}
                placeholder={f.placeholder ?? ""}
                placeholderTextColor="rgba(245,245,247,0.3)"
                keyboardType={f.keyboardType ?? "default"}
              />
            </View>
          ))}
          <TouchableOpacity style={{ backgroundColor: "#D4FF00", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 4 }} onPress={onSave} disabled={saving} activeOpacity={0.85}>
            {saving ? <ActivityIndicator color="#0B0B0B" /> : <Text style={{ fontWeight: "800", color: "#0B0B0B", fontSize: 16 }}>Save</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: "center", paddingVertical: 8 }} onPress={onClose}>
            <Text style={{ color: "rgba(245,245,247,0.45)", fontWeight: "600", fontSize: 14 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────

export default function SettingsScreen() {
  const { userProfile, signOut, session, refreshProfile } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [connectingStrava, setConnectingStrava] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Personal info edit
  const [showPersonal, setShowPersonal] = useState(false);
  const [editName, setEditName] = useState(userProfile?.full_name ?? "");
  const [editWeight, setEditWeight] = useState(userProfile?.weight_kg?.toString() ?? "");
  const [editHeight, setEditHeight] = useState(userProfile?.height_cm?.toString() ?? "");
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Goals edit
  const [showGoals, setShowGoals] = useState(false);
  const [editCalories, setEditCalories] = useState(userProfile?.calorie_goal?.toString() ?? "2000");
  const [editProtein, setEditProtein] = useState(userProfile?.protein_goal?.toString() ?? "120");
  const [editCarbs, setEditCarbs] = useState(userProfile?.carbs_goal?.toString() ?? "250");
  const [editFat, setEditFat] = useState(userProfile?.fat_goal?.toString() ?? "70");
  const [savingGoals, setSavingGoals] = useState(false);

  const name = userProfile?.full_name ?? "Athlete";
  const email = session?.user?.email ?? userProfile?.email ?? "";
  const isStravaConnected = !!userProfile?.strava_athlete_id;

  async function handleConnectStrava() {
    try {
      setConnectingStrava(true);
      const { url } = await apiGet<{ url: string }>("/api/strava/mobile-init");
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Could not start Strava connection. Please try again.");
    } finally { setConnectingStrava(false); }
  }

  async function handleDisconnectStrava() {
    Alert.alert("Disconnect Strava", "Your training data will no longer sync. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Disconnect", style: "destructive", onPress: async () => {
        try {
          setDisconnecting(true);
          await apiDelete("/api/strava/disconnect");
          await refreshProfile();
        } catch { Alert.alert("Error", "Could not disconnect Strava. Please try again."); }
        finally { setDisconnecting(false); }
      }},
    ]);
  }

  async function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  }

  async function savePersonal() {
    setSavingPersonal(true);
    try {
      await apiPost("/api/profile/update", {
        full_name: editName.trim() || undefined,
        weight_kg: editWeight ? parseFloat(editWeight) : undefined,
        height_cm: editHeight ? parseFloat(editHeight) : undefined,
      });
      await refreshProfile();
      setShowPersonal(false);
    } catch { Alert.alert("Error", "Could not save profile."); }
    finally { setSavingPersonal(false); }
  }

  async function saveGoals() {
    setSavingGoals(true);
    try {
      await apiPost("/api/profile/update", {
        calorie_goal: parseInt(editCalories, 10) || 2000,
        protein_goal: parseInt(editProtein, 10) || 120,
        carbs_goal: parseInt(editCarbs, 10) || 250,
        fat_goal: parseInt(editFat, 10) || 70,
      });
      await refreshProfile();
      setShowGoals(false);
    } catch { Alert.alert("Error", "Could not save goals."); }
    finally { setSavingGoals(false); }
  }

  function openPersonal() {
    setEditName(userProfile?.full_name ?? "");
    setEditWeight(userProfile?.weight_kg?.toString() ?? "");
    setEditHeight(userProfile?.height_cm?.toString() ?? "");
    setShowPersonal(true);
  }

  function openGoals() {
    setEditCalories(userProfile?.calorie_goal?.toString() ?? "2000");
    setEditProtein(userProfile?.protein_goal?.toString() ?? "120");
    setEditCarbs(userProfile?.carbs_goal?.toString() ?? "250");
    setEditFat(userProfile?.fat_goal?.toString() ?? "70");
    setShowGoals(true);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name[0]?.toUpperCase() ?? "A"}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          <TouchableOpacity style={styles.editProfileBtn} onPress={openPersonal} activeOpacity={0.8}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text>{isDark ? "🌙" : "☀️"}</Text>
                <Text style={styles.rowLabel}>{isDark ? "Dark mode" : "Light mode"}</Text>
              </View>
              <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: "#E5E7EB", true: colors.primary }} thumbColor="#FFFFFF" ios_backgroundColor="#E5E7EB" />
            </View>
          </View>
        </View>

        {/* Integrations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integrations</Text>
          {!isStravaConnected ? (
            <TouchableOpacity style={styles.stravaConnectCard} onPress={handleConnectStrava} disabled={connectingStrava} activeOpacity={0.85}>
              <View style={styles.stravaLeft}>
                <Text style={styles.stravaIcon}>🏃</Text>
                <View>
                  <Text style={styles.stravaTitle}>Connect Strava</Text>
                  <Text style={styles.stravaSub}>Sync your training data to personalise your nutrition</Text>
                </View>
              </View>
              {connectingStrava ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.stravaArrow}>→</Text>}
            </TouchableOpacity>
          ) : (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={{ fontSize: 20 }}>🏃</Text>
                  <View>
                    <Text style={styles.rowValue}>Strava</Text>
                    <Text style={styles.badgeConnected}>Connected</Text>
                  </View>
                </View>
                {disconnecting
                  ? <ActivityIndicator size="small" color="#EF4444" />
                  : <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnectStrava}><Text style={styles.disconnectText}>Disconnect</Text></TouchableOpacity>}
              </View>
            </View>
          )}
        </View>

        {/* Daily Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Goals</Text>
          <View style={styles.card}>
            {[
              { label: "Calories", value: `${userProfile?.calorie_goal ?? 2000} kcal` },
              { label: "Protein",  value: `${userProfile?.protein_goal ?? 120} g` },
              { label: "Carbs",    value: `${userProfile?.carbs_goal ?? 250} g` },
              { label: "Fat",      value: `${userProfile?.fat_goal ?? 70} g` },
            ].map((item, i, arr) => (
              <View key={item.label}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Text style={styles.rowValue}>{item.value}</Text>
                    {i === 0 && <TouchableOpacity onPress={openGoals}><Text style={styles.rowEdit}>Edit</Text></TouchableOpacity>}
                  </View>
                </View>
                {i < arr.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Body Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Metrics</Text>
          <View style={styles.card}>
            {[
              { label: "Name",   value: userProfile?.full_name ?? "Not set" },
              { label: "Weight", value: userProfile?.weight_kg ? `${userProfile.weight_kg} kg` : "Not set" },
              { label: "Height", value: userProfile?.height_cm ? `${userProfile.height_cm} cm` : "Not set" },
            ].map((item, i, arr) => (
              <View key={item.label}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Text style={styles.rowValue}>{item.value}</Text>
                    {i === 0 && <TouchableOpacity onPress={openPersonal}><Text style={styles.rowEdit}>Edit</Text></TouchableOpacity>}
                  </View>
                </View>
                {i < arr.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.85}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Edit Personal Info */}
      <EditSheet
        visible={showPersonal}
        title="Edit Profile"
        fields={[
          { label: "Full Name", value: editName, setter: setEditName, placeholder: "Your name" },
          { label: "Weight (kg)", value: editWeight, setter: setEditWeight, keyboardType: "decimal-pad", placeholder: "e.g. 75" },
          { label: "Height (cm)", value: editHeight, setter: setEditHeight, keyboardType: "decimal-pad", placeholder: "e.g. 178" },
        ]}
        onSave={savePersonal}
        onClose={() => setShowPersonal(false)}
        saving={savingPersonal}
      />

      {/* Edit Goals */}
      <EditSheet
        visible={showGoals}
        title="Daily Goals"
        fields={[
          { label: "Calories (kcal)", value: editCalories, setter: setEditCalories, keyboardType: "numeric", placeholder: "2000" },
          { label: "Protein (g)", value: editProtein, setter: setEditProtein, keyboardType: "numeric", placeholder: "120" },
          { label: "Carbs (g)", value: editCarbs, setter: setEditCarbs, keyboardType: "numeric", placeholder: "250" },
          { label: "Fat (g)", value: editFat, setter: setEditFat, keyboardType: "numeric", placeholder: "70" },
        ]}
        onSave={saveGoals}
        onClose={() => setShowGoals(false)}
        saving={savingGoals}
      />
    </SafeAreaView>
  );
}
