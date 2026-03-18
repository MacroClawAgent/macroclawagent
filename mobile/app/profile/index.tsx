import React, { useState } from "react";
import {
  Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView,
  StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, ActivityIndicator,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { getInitials } from "@/lib/formatters";

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{label}</Text>
  );
}

function InfoRow({ label, value, onEdit, colors }: { label: string; value: string; onEdit?: () => void; colors: any }) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.surfaceAlt }]}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={[styles.rowValue, { color: colors.textPrimary }]} numberOfLines={1}>{value}</Text>
        {onEdit && <TouchableOpacity onPress={onEdit}><Text style={[styles.editLink, { color: colors.teal }]}>Edit</Text></TouchableOpacity>}
      </View>
    </View>
  );
}

interface EditField {
  label: string;
  value: string;
  setter: (v: string) => void;
  keyboardType?: "default" | "numeric" | "decimal-pad";
}

function EditSheet({ visible, title, fields, onSave, onClose, saving }: {
  visible: boolean; title: string; fields: EditField[];
  onSave: () => void; onClose: () => void; saving: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          {fields.map((f) => (
            <View key={f.label} style={{ gap: 5 }}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <TextInput
                style={styles.fieldInput}
                value={f.value}
                onChangeText={f.setter}
                keyboardType={f.keyboardType ?? "default"}
                placeholderTextColor="rgba(245,245,247,0.35)"
              />
            </View>
          ))}
          <TouchableOpacity onPress={onSave} disabled={saving} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Goal selector modal ───────────────────────────────────────────────────────

const GOALS = [
  { id: "lose_weight", emoji: "🔥", label: "Lose Weight", desc: "Burn fat while preserving muscle" },
  { id: "build_muscle", emoji: "💪", label: "Build Muscle", desc: "Fuel growth with targeted surplus" },
  { id: "performance", emoji: "🏃", label: "Performance", desc: "Optimise fuelling for your training" },
  { id: "maintain", emoji: "✅", label: "Stay Healthy", desc: "Balanced nutrition, sustainable habits" },
];

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Lose Weight 🔥",
  build_muscle: "Build Muscle 💪",
  performance: "Performance 🏃",
  maintain: "Stay Healthy ✅",
};

function GoalSheet({ visible, current, onSave, onClose, saving }: {
  visible: boolean; current: string;
  onSave: (goal: string) => void; onClose: () => void; saving: boolean;
}) {
  const [selected, setSelected] = useState(current);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { gap: 12 }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>My Fitness Goal</Text>
          <Text style={{ fontSize: 13, color: "rgba(245,245,247,0.45)", marginBottom: 4 }}>
            Jonno uses this to personalise every recommendation for you.
          </Text>
          {GOALS.map((g) => {
            const active = selected === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                onPress={() => setSelected(g.id)}
                activeOpacity={0.8}
                style={[styles.goalCard, active && styles.goalCardActive]}
              >
                <View style={styles.goalLeft}>
                  <Text style={{ fontSize: 22 }}>{g.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.goalLabel, active && styles.goalLabelActive]}>{g.label}</Text>
                    <Text style={[styles.goalDesc, active && { color: "rgba(245,245,247,0.6)" }]}>{g.desc}</Text>
                  </View>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity onPress={() => onSave(selected)} disabled={saving} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save Goal"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { userProfile, signOut, refreshProfile, session } = useAuth();
  const router = useRouter();

  const [showPersonal, setShowPersonal] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showGoalSheet, setShowGoalSheet] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [savingGoalSheet, setSavingGoalSheet] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [editName, setEditName] = useState(userProfile?.full_name ?? "");
  const [editWeight, setEditWeight] = useState(String(userProfile?.weight_kg ?? ""));
  const [editHeight, setEditHeight] = useState(String(userProfile?.height_cm ?? ""));
  const [editCalories, setEditCalories] = useState(String(userProfile?.calorie_goal ?? ""));
  const [editProtein, setEditProtein] = useState(String(userProfile?.protein_goal ?? ""));
  const [editCarbs, setEditCarbs] = useState(String(userProfile?.carbs_goal ?? ""));
  const [editFat, setEditFat] = useState(String(userProfile?.fat_goal ?? ""));

  const openPersonal = () => {
    setEditName(userProfile?.full_name ?? "");
    setEditWeight(String(userProfile?.weight_kg ?? ""));
    setEditHeight(String(userProfile?.height_cm ?? ""));
    setShowPersonal(true);
  };

  const openGoals = () => {
    setEditCalories(String(userProfile?.calorie_goal ?? ""));
    setEditProtein(String(userProfile?.protein_goal ?? ""));
    setEditCarbs(String(userProfile?.carbs_goal ?? ""));
    setEditFat(String(userProfile?.fat_goal ?? ""));
    setShowGoals(true);
  };

  const savePersonal = async () => {
    setSavingPersonal(true);
    try {
      await apiPost("/api/profile/update", {
        full_name: editName,
        weight_kg: editWeight ? parseFloat(editWeight) : null,
        height_cm: editHeight ? parseFloat(editHeight) : null,
      });
      await refreshProfile();
      setShowPersonal(false);
    } catch {
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setSavingPersonal(false);
    }
  };

  const saveGoals = async () => {
    setSavingGoals(true);
    try {
      await apiPost("/api/profile/update", {
        calorie_goal: parseInt(editCalories),
        protein_goal: parseInt(editProtein),
        carbs_goal: parseInt(editCarbs),
        fat_goal: parseInt(editFat),
      });
      await refreshProfile();
      setShowGoals(false);
    } catch {
      Alert.alert("Error", "Failed to save goals.");
    } finally {
      setSavingGoals(false);
    }
  };

  const saveGoalSheet = async (goal: string) => {
    setSavingGoalSheet(true);
    try {
      await apiPost("/api/profile/update", { fitness_goal: goal });
      await refreshProfile();
      setShowGoalSheet(false);
    } catch {
      Alert.alert("Error", "Failed to save goal.");
    } finally {
      setSavingGoalSheet(false);
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to set a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingAvatar(true);
    try {
      const asset = result.assets[0];
      const userId = session?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      // Fetch and upload to Supabase storage
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const filePath = `${userId}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { contentType: "image/jpeg", upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      await apiPost("/api/profile/update", { avatar_url: publicUrl });
      await refreshProfile();
    } catch {
      Alert.alert("Upload failed", "Could not save photo. Try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleConnectStrava = async () => {
    try {
      const res = await apiGet<{ url: string }>("/api/strava/mobile-init");
      if (!res.url) return;
      const result = await WebBrowser.openAuthSessionAsync(res.url, "jonno://strava-connected");
      if (result.type === "success") {
        if (result.url.includes("error=denied")) {
          Alert.alert("Connection cancelled", "Strava authorisation was declined.");
          return;
        }
        if (result.url.includes("error=")) {
          Alert.alert("Connection failed", "Something went wrong on the server. Check your Strava app settings and try again.");
          return;
        }
        router.push("/strava-connected");
      }
    } catch {
      Alert.alert("Error", "Could not start Strava connection.");
    }
  };

  const handleDisconnectStrava = () => {
    Alert.alert("Disconnect Strava", "Remove Strava connection?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: async () => {
          setDisconnecting(true);
          try {
            await apiDelete("/api/strava/disconnect");
            await refreshProfile();
          } catch {
            Alert.alert("Error", "Failed to disconnect.");
          } finally {
            setDisconnecting(false);
          }
        },
      },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const name = userProfile?.full_name ?? "Profile";
  const email = userProfile?.email ?? "";
  const isStravaConnected = !!userProfile?.strava_athlete_id;
  const avatarUrl = userProfile?.avatar_url;
  const currentGoal = userProfile?.fitness_goal ?? "performance";

  return (
    <Screen>
      <AppHeader title="Profile" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Avatar + identity ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.85} style={styles.avatarWrap}>
            {uploadingAvatar ? (
              <View style={styles.avatar}>
                <ActivityIndicator color="#FFF" />
              </View>
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(name)}</Text>
              </View>
            )}
            {/* Camera badge */}
            <View style={[styles.cameraBadge, { backgroundColor: colors.blue ?? "#4C7DFF" }]}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.nameText, { color: colors.textPrimary }]}>{name}</Text>
          <Text style={[styles.emailText, { color: colors.textMuted }]}>{email}</Text>
          <Text style={[styles.goalBadge, { backgroundColor: colors.surface, color: colors.textSecondary, borderColor: colors.border }]}>
            {GOAL_LABELS[currentGoal] ?? "Performance 🏃"}
          </Text>
        </View>

        {/* ── Fitness Goal ── */}
        <View style={styles.section}>
          <SectionLabel label="My Goal" colors={colors} />
          <Card padding={0} style={styles.cardOverride}>
            <TouchableOpacity style={styles.row} onPress={() => setShowGoalSheet(true)}>
              <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Fitness Goal</Text>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                  {GOAL_LABELS[currentGoal] ?? "Performance 🏃"}
                </Text>
                <Text style={[styles.editLink, { color: colors.teal }]}>Change</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        {/* ── Personal info ── */}
        <View style={styles.section}>
          <SectionLabel label="Personal Info" colors={colors} />
          <Card padding={0} style={styles.cardOverride}>
            <InfoRow label="Name" value={userProfile?.full_name ?? "—"} onEdit={openPersonal} colors={colors} />
            <InfoRow label="Weight" value={userProfile?.weight_kg ? `${userProfile.weight_kg} kg` : "—"} onEdit={openPersonal} colors={colors} />
            <InfoRow label="Height" value={userProfile?.height_cm ? `${userProfile.height_cm} cm` : "—"} onEdit={openPersonal} colors={colors} />
          </Card>
        </View>

        {/* ── Daily goals ── */}
        <View style={styles.section}>
          <SectionLabel label="Daily Targets" colors={colors} />
          <Card padding={0} style={styles.cardOverride}>
            <InfoRow label="Calories" value={`${userProfile?.calorie_goal ?? 0} kcal`} onEdit={openGoals} colors={colors} />
            <InfoRow label="Protein" value={`${userProfile?.protein_goal ?? 0} g`} onEdit={openGoals} colors={colors} />
            <InfoRow label="Carbs" value={`${userProfile?.carbs_goal ?? 0} g`} onEdit={openGoals} colors={colors} />
            <InfoRow label="Fat" value={`${userProfile?.fat_goal ?? 0} g`} onEdit={openGoals} colors={colors} />
          </Card>
        </View>

        {/* ── Integrations ── */}
        <View style={styles.section}>
          <SectionLabel label="Integrations" colors={colors} />
          {isStravaConnected ? (
            <Card style={styles.stravaConnected}>
              <View style={styles.stravaRow}>
                <Text style={styles.stravaEmoji}>🏃</Text>
                <View style={styles.stravaInfo}>
                  <Text style={[styles.stravaTitle, { color: colors.textPrimary }]}>Strava</Text>
                  <Text style={[styles.stravaStatus, { color: colors.green }]}>Connected ✓</Text>
                </View>
                <TouchableOpacity
                  onPress={handleDisconnectStrava}
                  disabled={disconnecting}
                  style={[styles.disconnectBtn, { backgroundColor: colors.danger + "14" }]}
                >
                  <Text style={[styles.disconnectText, { color: colors.danger }]}>
                    {disconnecting ? "…" : "Disconnect"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <TouchableOpacity onPress={handleConnectStrava} activeOpacity={0.85}>
              <Card style={[styles.stravaConnect, { backgroundColor: "#FC4C02", borderColor: "#FC4C02" }]}>
                <View style={styles.stravaRow}>
                  <Text style={styles.stravaEmoji}>🏃</Text>
                  <View style={styles.stravaInfo}>
                    <Text style={[styles.stravaTitle, { color: "#FFF" }]}>Connect Strava</Text>
                    <Text style={[styles.stravaStatus, { color: "rgba(255,255,255,0.75)" }]}>Sync training to adapt macro targets</Text>
                  </View>
                  <Text style={{ color: "#FFF", fontSize: 20 }}>›</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Appearance ── */}
        <View style={styles.section}>
          <SectionLabel label="Appearance" colors={colors} />
          <Card padding={0} style={styles.cardOverride}>
            <View style={[styles.row, { borderBottomColor: colors.surfaceAlt }]}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Dark Mode</Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.teal }}
                thumbColor="#FFF"
              />
            </View>
          </Card>
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity onPress={handleSignOut} style={[styles.signOutBtn, { borderColor: colors.danger + "44" }]}>
          <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* ── Modals ── */}
      <EditSheet
        visible={showPersonal}
        title="Personal Info"
        fields={[
          { label: "Full Name", value: editName, setter: setEditName },
          { label: "Weight (kg)", value: editWeight, setter: setEditWeight, keyboardType: "decimal-pad" },
          { label: "Height (cm)", value: editHeight, setter: setEditHeight, keyboardType: "decimal-pad" },
        ]}
        onSave={savePersonal}
        onClose={() => setShowPersonal(false)}
        saving={savingPersonal}
      />
      <EditSheet
        visible={showGoals}
        title="Daily Targets"
        fields={[
          { label: "Calories (kcal)", value: editCalories, setter: setEditCalories, keyboardType: "numeric" },
          { label: "Protein (g)", value: editProtein, setter: setEditProtein, keyboardType: "numeric" },
          { label: "Carbs (g)", value: editCarbs, setter: setEditCarbs, keyboardType: "numeric" },
          { label: "Fat (g)", value: editFat, setter: setEditFat, keyboardType: "numeric" },
        ]}
        onSave={saveGoals}
        onClose={() => setShowGoals(false)}
        saving={savingGoals}
      />
      <GoalSheet
        visible={showGoalSheet}
        current={currentGoal}
        onSave={saveGoalSheet}
        onClose={() => setShowGoalSheet(false)}
        saving={savingGoalSheet}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 16, paddingBottom: 40, paddingTop: 8 },

  // Avatar
  avatarSection: { alignItems: "center", gap: 8, paddingVertical: 20 },
  avatarWrap: { position: "relative", marginBottom: 2 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "#4C7DFF",
    alignItems: "center", justifyContent: "center",
  },
  avatarImg: { width: 96, height: 96, borderRadius: 48 },
  avatarText: { fontSize: 34, fontWeight: "800", color: "#FFF" },
  cameraBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#FFF",
  },
  cameraIcon: { fontSize: 13 },
  nameText: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  emailText: { fontSize: 13, fontWeight: "500" },
  goalBadge: {
    fontSize: 12, fontWeight: "700",
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
    overflow: "hidden",
  },

  // Section / rows
  section: { paddingHorizontal: 20, gap: 8 },
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4 },
  cardOverride: { padding: 0, overflow: "hidden" },
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 14, fontWeight: "500" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowValue: { fontSize: 14, fontWeight: "600" },
  editLink: { fontSize: 13, fontWeight: "600" },

  // Strava
  stravaConnected: { marginHorizontal: 0 },
  stravaConnect: { marginHorizontal: 0 },
  stravaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stravaEmoji: { fontSize: 26 },
  stravaInfo: { flex: 1 },
  stravaTitle: { fontSize: 15, fontWeight: "700" },
  stravaStatus: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  disconnectBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  disconnectText: { fontSize: 13, fontWeight: "700" },

  // Sign out
  signOutBtn: { marginHorizontal: 20, borderRadius: 16, paddingVertical: 16, alignItems: "center", borderWidth: 1 },
  signOutText: { fontSize: 15, fontWeight: "700" },

  // Goal cards
  goalCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 14, gap: 10,
  },
  goalCardActive: { backgroundColor: "rgba(32,199,183,0.08)", borderColor: "#20C7B7" },
  goalLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  goalLabel: { fontSize: 15, fontWeight: "700", color: "rgba(245,245,247,0.65)" },
  goalLabelActive: { color: "#20C7B7" },
  goalDesc: { fontSize: 12, color: "rgba(245,245,247,0.35)", marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: "#20C7B7" },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#20C7B7" },

  // Edit sheet
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#1C1C1E", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  handle: { width: 40, height: 4, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: "#F5F5F7" },
  fieldLabel: { fontSize: 11, fontWeight: "700", color: "rgba(245,245,247,0.45)", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldInput: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#F5F5F7", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  saveBtn: { backgroundColor: "#20C7B7", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  saveBtnText: { fontWeight: "800", color: "#FFF", fontSize: 16 },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelBtnText: { color: "rgba(245,245,247,0.45)", fontWeight: "600", fontSize: 14 },
});
