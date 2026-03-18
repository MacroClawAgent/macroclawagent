import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const TEAL  = "#2BB6A6";
const TEAL2 = "rgba(43,182,166,0.12)";
const BG    = "#F4F5F7";
const WHITE = "#FFFFFF";
const BORDER= "#E5E7EB";
const TABS  = ["Profile", "Personalise", "Integrations", "Settings"] as const;
type Tab    = typeof TABS[number];

const GOAL_OPTIONS = [
  { key: "lose_weight",  label: "Lose Weight",  emoji: "🔥" },
  { key: "build_muscle", label: "Build Muscle",  emoji: "💪" },
  { key: "performance",  label: "Performance",   emoji: "⚡" },
  { key: "maintain",     label: "Stay Healthy",  emoji: "🌿" },
];

const DIET_OPTIONS = ["Omnivore", "Vegetarian", "Vegan", "Keto", "Paleo", "Halal", "Gluten-Free"];
const ALLERGY_OPTIONS = ["Gluten", "Dairy", "Nuts", "Shellfish", "Eggs", "Soy", "Fish"];
const COOKING_LEVELS = ["Beginner", "Intermediate", "Advanced", "Chef"];
const BUDGET_LEVELS  = ["Budget", "Moderate", "Premium", "Flexible"];

const ASYNC_PREFS_KEY = "macroClaw:personalise";

// ─── Tiny UI helpers ──────────────────────────────────────────────────────────
function Divider() { return <View style={s.divider} />; }
function SectionLabel({ title }: { title: string }) {
  return <Text style={s.sectionLabel}>{title}</Text>;
}
function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.card, style]}>{children}</View>;
}
function Row({
  label, value, onPress, chevron = false,
}: { label: string; value?: string; onPress?: () => void; chevron?: boolean }) {
  const inner = (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {value ? <Text style={s.rowValue}>{value}</Text> : null}
        {chevron && <Text style={s.rowChevron}>›</Text>}
      </View>
    </View>
  );
  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{inner}</TouchableOpacity>;
  return inner;
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
interface EditField { key: string; label: string; placeholder: string; keyboard?: "default" | "numeric" | "email-address" }

function EditModal({
  visible,
  title,
  fields,
  initial,
  onCancel,
  onSave,
  saving,
}: {
  visible: boolean;
  title: string;
  fields: EditField[];
  initial: Record<string, string>;
  onCancel: () => void;
  onSave: (values: Record<string, string>) => void;
  saving: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  useEffect(() => { setValues(initial); }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={em.overlay}>
        <View style={em.sheet}>
          <View style={em.handle} />
          <Text style={em.title}>{title}</Text>
          {fields.map((f) => (
            <View key={f.key} style={em.fieldWrap}>
              <Text style={em.fieldLabel}>{f.label}</Text>
              <TextInput
                style={em.input}
                value={values[f.key] ?? ""}
                onChangeText={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
                placeholder={f.placeholder}
                placeholderTextColor="#C4C4C4"
                keyboardType={f.keyboard ?? "default"}
                autoCapitalize="words"
              />
            </View>
          ))}
          <View style={em.actions}>
            <TouchableOpacity style={em.cancel} onPress={onCancel} activeOpacity={0.7}>
              <Text style={em.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[em.save, saving && { opacity: 0.6 }]}
              onPress={() => onSave(values)}
              activeOpacity={0.7}
              disabled={saving}
            >
              <Text style={em.saveText}>{saving ? "Saving…" : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const em = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet:   { backgroundColor: WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, gap: 16 },
  handle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 4 },
  title:   { fontSize: 18, fontWeight: "800", color: "#1C1C1E", letterSpacing: -0.3 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.4 },
  input: {
    backgroundColor: BG, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: "#1C1C1E", fontWeight: "500",
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancel: { flex: 1, paddingVertical: 15, borderRadius: 14, backgroundColor: BG, alignItems: "center" },
  cancelText: { fontSize: 15, fontWeight: "700", color: "#6B7280" },
  save: { flex: 2, paddingVertical: 15, borderRadius: 14, backgroundColor: TEAL, alignItems: "center" },
  saveText: { fontSize: 15, fontWeight: "800", color: WHITE },
});

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
function ProfileTab({
  userProfile, email, onRefresh,
}: { userProfile: any; email: string; onRefresh: () => void }) {
  const [editOpen, setEditOpen] = useState<"info" | "body" | null>(null);
  const [saving, setSaving] = useState(false);

  const initials = (userProfile?.full_name ?? "A")
    .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const genderLabel: Record<string, string> = {
    male: "Male", female: "Female", other: "Other", prefer_not_to_say: "Prefer not to say",
  };

  async function saveInfo(values: Record<string, string>) {
    setSaving(true);
    try {
      await apiPost("/api/profile/update", { full_name: values.full_name });
      await onRefresh();
      setEditOpen(null);
    } catch { Alert.alert("Error", "Could not save changes."); }
    finally { setSaving(false); }
  }

  async function saveBody(values: Record<string, string>) {
    setSaving(true);
    try {
      await apiPost("/api/profile/update", {
        weight_kg: values.weight_kg ? Number(values.weight_kg) : null,
        height_cm: values.height_cm ? Number(values.height_cm) : null,
      });
      await onRefresh();
      setEditOpen(null);
    } catch { Alert.alert("Error", "Could not save changes."); }
    finally { setSaving(false); }
  }

  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={s.profileHero}>
        <View style={s.avatarRing}>
          <View style={s.bigAvatar}>
            <Text style={s.bigAvatarText}>{initials}</Text>
          </View>
        </View>
        <Text style={s.heroName}>{userProfile?.full_name ?? "Athlete"}</Text>
        <Text style={s.heroEmail}>{email}</Text>
        <TouchableOpacity
          style={s.editProfileBtn}
          onPress={() => setEditOpen("info")}
          activeOpacity={0.7}
        >
          <Text style={s.editProfileBtnText}>Edit Name</Text>
        </TouchableOpacity>
      </View>

      {/* Body metrics */}
      <SectionLabel title="Body Metrics" />
      <Card>
        <Row
          label="Weight"
          value={userProfile?.weight_kg ? `${userProfile.weight_kg} kg` : "Not set"}
          onPress={() => setEditOpen("body")}
          chevron
        />
        <Divider />
        <Row
          label="Height"
          value={userProfile?.height_cm ? `${userProfile.height_cm} cm` : "Not set"}
          onPress={() => setEditOpen("body")}
          chevron
        />
        <Divider />
        <Row
          label="Gender"
          value={genderLabel[userProfile?.gender ?? ""] ?? "Not set"}
        />
      </Card>

      {/* Stats strip */}
      <SectionLabel title="Nutrition Targets" />
      <View style={s.statsStrip}>
        {[
          { label: "Calories", value: `${userProfile?.calorie_goal ?? 2000}`, unit: "kcal" },
          { label: "Protein",  value: `${userProfile?.protein_goal ?? 120}`,  unit: "g" },
          { label: "Carbs",    value: `${userProfile?.carbs_goal ?? 250}`,    unit: "g" },
          { label: "Fat",      value: `${userProfile?.fat_goal ?? 70}`,       unit: "g" },
        ].map((stat) => (
          <View key={stat.label} style={s.statCard}>
            <Text style={s.statValue}>{stat.value}<Text style={s.statUnit}>{stat.unit}</Text></Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Modals */}
      <EditModal
        visible={editOpen === "info"}
        title="Edit Name"
        fields={[{ key: "full_name", label: "Full Name", placeholder: "Your name" }]}
        initial={{ full_name: userProfile?.full_name ?? "" }}
        onCancel={() => setEditOpen(null)}
        onSave={saveInfo}
        saving={saving}
      />
      <EditModal
        visible={editOpen === "body"}
        title="Body Metrics"
        fields={[
          { key: "weight_kg", label: "Weight (kg)", placeholder: "e.g. 75", keyboard: "numeric" },
          { key: "height_cm", label: "Height (cm)", placeholder: "e.g. 178", keyboard: "numeric" },
        ]}
        initial={{
          weight_kg: userProfile?.weight_kg ? String(userProfile.weight_kg) : "",
          height_cm: userProfile?.height_cm ? String(userProfile.height_cm) : "",
        }}
        onCancel={() => setEditOpen(null)}
        onSave={saveBody}
        saving={saving}
      />
    </ScrollView>
  );
}

// ─── PERSONALISE TAB ─────────────────────────────────────────────────────────
interface PersonalPrefs {
  diet: string;
  allergies: string[];
  cooking: string;
  budget: string;
}
const DEFAULT_PREFS: PersonalPrefs = { diet: "Omnivore", allergies: [], cooking: "Intermediate", budget: "Moderate" };

function PersonaliseTab({ userProfile, onRefresh }: { userProfile: any; onRefresh: () => void }) {
  const [prefs, setPrefs] = useState<PersonalPrefs>(DEFAULT_PREFS);
  const [editGoal, setEditGoal] = useState(false);
  const [editTargets, setEditTargets] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ASYNC_PREFS_KEY).then((v) => {
      if (v) setPrefs(JSON.parse(v));
    });
  }, []);

  async function savePrefs(updated: PersonalPrefs) {
    setPrefs(updated);
    await AsyncStorage.setItem(ASYNC_PREFS_KEY, JSON.stringify(updated));
  }

  async function saveGoal(goal: string) {
    setSaving(true);
    try {
      await apiPost("/api/profile/update", { fitness_goal: goal });
      await onRefresh();
    } catch { Alert.alert("Error", "Could not save goal."); }
    finally { setSaving(false); }
  }

  async function saveTargets(values: Record<string, string>) {
    setSaving(true);
    try {
      await apiPost("/api/profile/update", {
        calorie_goal: Number(values.calorie_goal) || 2000,
        protein_goal: Number(values.protein_goal) || 120,
        carbs_goal:   Number(values.carbs_goal)   || 250,
        fat_goal:     Number(values.fat_goal)     || 70,
      });
      await onRefresh();
      setEditTargets(false);
    } catch { Alert.alert("Error", "Could not save targets."); }
    finally { setSaving(false); }
  }

  function toggleAllergy(a: string) {
    const next = prefs.allergies.includes(a)
      ? prefs.allergies.filter((x) => x !== a)
      : [...prefs.allergies, a];
    savePrefs({ ...prefs, allergies: next });
  }

  const activeGoal = userProfile?.fitness_goal ?? "maintain";

  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      {/* Fitness goal */}
      <SectionLabel title="Fitness Goal" />
      <View style={s.goalGrid}>
        {GOAL_OPTIONS.map((opt) => {
          const active = activeGoal === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[s.goalCard, active && s.goalCardActive]}
              onPress={() => saveGoal(opt.key)}
              activeOpacity={0.75}
              disabled={saving}
            >
              <Text style={s.goalEmoji}>{opt.emoji}</Text>
              <Text style={[s.goalLabel, active && s.goalLabelActive]}>{opt.label}</Text>
              {active && <View style={s.goalDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Daily targets */}
      <SectionLabel title="Daily Targets" />
      <Card>
        <Row label="Calories" value={`${userProfile?.calorie_goal ?? 2000} kcal`} onPress={() => setEditTargets(true)} chevron />
        <Divider />
        <Row label="Protein"  value={`${userProfile?.protein_goal ?? 120} g`}  onPress={() => setEditTargets(true)} chevron />
        <Divider />
        <Row label="Carbs"    value={`${userProfile?.carbs_goal ?? 250} g`}    onPress={() => setEditTargets(true)} chevron />
        <Divider />
        <Row label="Fat"      value={`${userProfile?.fat_goal ?? 70} g`}       onPress={() => setEditTargets(true)} chevron />
      </Card>

      {/* Diet type */}
      <SectionLabel title="Diet Type" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
        {DIET_OPTIONS.map((d) => {
          const active = prefs.diet === d;
          return (
            <TouchableOpacity
              key={d}
              style={[s.chip, active && s.chipActive]}
              onPress={() => savePrefs({ ...prefs, diet: d })}
              activeOpacity={0.7}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{d}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Allergies */}
      <SectionLabel title="Allergies & Intolerances" />
      <View style={s.chipWrap}>
        {ALLERGY_OPTIONS.map((a) => {
          const active = prefs.allergies.includes(a);
          return (
            <TouchableOpacity
              key={a}
              style={[s.chip, active && s.chipDanger]}
              onPress={() => toggleAllergy(a)}
              activeOpacity={0.7}
            >
              <Text style={[s.chipText, active && s.chipTextDanger]}>{a}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Cooking skill */}
      <SectionLabel title="Cooking Skill" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
        {COOKING_LEVELS.map((c) => {
          const active = prefs.cooking === c;
          return (
            <TouchableOpacity
              key={c}
              style={[s.chip, active && s.chipActive]}
              onPress={() => savePrefs({ ...prefs, cooking: c })}
              activeOpacity={0.7}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Budget */}
      <SectionLabel title="Grocery Budget" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
        {BUDGET_LEVELS.map((b) => {
          const active = prefs.budget === b;
          return (
            <TouchableOpacity
              key={b}
              style={[s.chip, active && s.chipActive]}
              onPress={() => savePrefs({ ...prefs, budget: b })}
              activeOpacity={0.7}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{b}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Targets modal */}
      <EditModal
        visible={editTargets}
        title="Daily Targets"
        fields={[
          { key: "calorie_goal", label: "Calories (kcal)", placeholder: "e.g. 2000", keyboard: "numeric" },
          { key: "protein_goal", label: "Protein (g)",     placeholder: "e.g. 150",  keyboard: "numeric" },
          { key: "carbs_goal",   label: "Carbs (g)",       placeholder: "e.g. 250",  keyboard: "numeric" },
          { key: "fat_goal",     label: "Fat (g)",         placeholder: "e.g. 70",   keyboard: "numeric" },
        ]}
        initial={{
          calorie_goal: String(userProfile?.calorie_goal ?? 2000),
          protein_goal: String(userProfile?.protein_goal ?? 120),
          carbs_goal:   String(userProfile?.carbs_goal   ?? 250),
          fat_goal:     String(userProfile?.fat_goal     ?? 70),
        }}
        onCancel={() => setEditTargets(false)}
        onSave={saveTargets}
        saving={saving}
      />
    </ScrollView>
  );
}

// ─── INTEGRATIONS TAB ─────────────────────────────────────────────────────────
const INTEGRATIONS = [
  {
    key: "strava",
    name: "Strava",
    sub: "Sync training & activities",
    emoji: "🏃",
    bg: "rgba(252,82,0,0.10)",
    connectUrl: "https://jonnoai.com",
    live: true,
  },
  {
    key: "apple_health",
    name: "Apple Health",
    sub: "Steps, heart rate & sleep",
    emoji: "❤️",
    bg: "rgba(255,59,48,0.10)",
    live: false,
  },
  {
    key: "garmin",
    name: "Garmin Connect",
    sub: "GPS watch & workout data",
    emoji: "⌚",
    bg: "rgba(0,126,200,0.10)",
    live: false,
  },
  {
    key: "myfitnesspal",
    name: "MyFitnessPal",
    sub: "Import food diary & logs",
    emoji: "🥗",
    bg: "rgba(0,180,90,0.10)",
    live: false,
  },
  {
    key: "uber_eats",
    name: "Uber Eats",
    sub: "Order meals from Smart Cart",
    emoji: "🛵",
    bg: "rgba(6,202,127,0.10)",
    live: false,
  },
];

function IntegrationsTab({ userProfile }: { userProfile: any }) {
  const live = INTEGRATIONS.filter((i) => i.live);
  const soon = INTEGRATIONS.filter((i) => !i.live);

  function IntegCard({ item }: { item: typeof INTEGRATIONS[0] }) {
    const connected = item.key === "strava" && !!userProfile?.strava_athlete_id;
    return (
      <View style={s.integCard}>
        <View style={[s.integIcon, { backgroundColor: item.bg }]}>
          <Text style={s.integEmoji}>{item.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.integName}>{item.name}</Text>
          <Text style={s.integSub}>{item.sub}</Text>
        </View>
        {item.live ? (
          connected ? (
            <View style={s.badgeOn}><Text style={s.badgeOnText}>Connected</Text></View>
          ) : (
            <TouchableOpacity
              style={s.connectBtn}
              onPress={() => Linking.openURL(item.connectUrl!)}
              activeOpacity={0.75}
            >
              <Text style={s.connectBtnText}>Connect</Text>
            </TouchableOpacity>
          )
        ) : (
          <View style={s.badgeSoon}><Text style={s.badgeSoonText}>Soon</Text></View>
        )}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      <SectionLabel title="Connected Services" />
      <Card>
        {live.map((item, i) => (
          <React.Fragment key={item.key}>
            {i > 0 && <Divider />}
            <IntegCard item={item} />
          </React.Fragment>
        ))}
      </Card>

      <SectionLabel title="Coming Soon" />
      <Card>
        {soon.map((item, i) => (
          <React.Fragment key={item.key}>
            {i > 0 && <Divider />}
            <IntegCard item={item} />
          </React.Fragment>
        ))}
      </Card>
    </ScrollView>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({
  userProfile, onSignOut, onRefresh,
}: { userProfile: any; onSignOut: () => void; onRefresh: () => void }) {
  const router = useRouter();
  const [savingUnits, setSavingUnits] = useState(false);
  const isMetric = (userProfile?.unit_preference ?? "metric") === "metric";

  async function toggleUnits() {
    const next = isMetric ? "imperial" : "metric";
    setSavingUnits(true);
    try {
      await apiPost("/api/profile/update", { unit_preference: next });
      await onRefresh();
    } catch { Alert.alert("Error", "Could not update units."); }
    finally { setSavingUnits(false); }
  }

  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      {/* Preferences */}
      <SectionLabel title="Preferences" />
      <Card>
        <View style={s.row}>
          <Text style={s.rowLabel}>Units</Text>
          <View style={s.toggleWrap}>
            <TouchableOpacity
              style={[s.toggleOpt, isMetric && s.toggleOptActive]}
              onPress={() => { if (!isMetric) toggleUnits(); }}
              activeOpacity={0.7}
              disabled={savingUnits}
            >
              <Text style={[s.toggleText, isMetric && s.toggleTextActive]}>Metric</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleOpt, !isMetric && s.toggleOptActive]}
              onPress={() => { if (isMetric) toggleUnits(); }}
              activeOpacity={0.7}
              disabled={savingUnits}
            >
              <Text style={[s.toggleText, !isMetric && s.toggleTextActive]}>Imperial</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Divider />
        <Row label="Notifications" value="On" chevron />
        <Divider />
        <Row label="Language" value="English" chevron />
      </Card>

      {/* Legal */}
      <SectionLabel title="Legal" />
      <Card>
        <Row
          label="Terms & Conditions"
          onPress={() => router.push("/profile/terms")}
          chevron
        />
        <Divider />
        <Row
          label="Privacy Policy"
          onPress={() => router.push("/profile/privacy")}
          chevron
        />
        <Divider />
        <Row
          label="Cookie Policy"
          onPress={() => Linking.openURL("https://jonnoai.com/cookies")}
          chevron
        />
      </Card>

      {/* App */}
      <SectionLabel title="App" />
      <Card>
        <Row label="Version" value="1.0.0 (MVP)" />
        <Divider />
        <Row label="Build" value="2026.1" />
      </Card>

      {/* Sign out */}
      <TouchableOpacity style={s.signOutBtn} onPress={onSignOut} activeOpacity={0.85}>
        <Text style={s.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── ROOT SCREEN ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const { userProfile, signOut, session, refreshProfile } = useAuth();
  const email = session?.user?.email ?? userProfile?.email ?? "";

  function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.pageHeader}>
        <Text style={s.pageTitle}>Profile</Text>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabBar}
        style={s.tabBarScroll}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
            style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
          >
            <Text style={[s.tabBtnText, activeTab === tab && s.tabBtnTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === "Profile"      && <ProfileTab     userProfile={userProfile} email={email} onRefresh={refreshProfile} />}
      {activeTab === "Personalise"  && <PersonaliseTab  userProfile={userProfile} onRefresh={refreshProfile} />}
      {activeTab === "Integrations" && <IntegrationsTab userProfile={userProfile} />}
      {activeTab === "Settings"     && <SettingsTab     userProfile={userProfile} onSignOut={handleSignOut} onRefresh={refreshProfile} />}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  pageHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  pageTitle:  { fontSize: 28, fontWeight: "900", color: "#1C1C1E", letterSpacing: -0.5 },

  // Tab bar — horizontal scroll for 4 tabs
  tabBarScroll: { flexGrow: 0 },
  tabBar: { paddingHorizontal: 16, paddingVertical: 8, gap: 6 },
  tabBtn: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER,
  },
  tabBtnActive: { backgroundColor: TEAL, borderColor: TEAL },
  tabBtnText:       { fontSize: 13, fontWeight: "700", color: "#6B7280" },
  tabBtnTextActive: { color: WHITE },

  tabContent: { padding: 16, gap: 10, paddingBottom: 60 },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "#9CA3AF",
    textTransform: "uppercase", letterSpacing: 0.6,
    paddingLeft: 4, marginTop: 6,
  },

  card: { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  row:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  rowLabel:   { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  rowValue:   { fontSize: 14, color: "#1C1C1E", fontWeight: "700" },
  rowChevron: { fontSize: 20, color: "#C4C4C4" },
  divider:    { height: 1, backgroundColor: BG, marginHorizontal: 16 },

  // Profile hero
  profileHero: { alignItems: "center", gap: 6, paddingVertical: 16 },
  avatarRing: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 3, borderColor: TEAL,
    justifyContent: "center", alignItems: "center",
    marginBottom: 4,
  },
  bigAvatar:     { width: 82, height: 82, borderRadius: 41, backgroundColor: TEAL, justifyContent: "center", alignItems: "center" },
  bigAvatarText: { fontSize: 30, fontWeight: "900", color: WHITE },
  heroName:  { fontSize: 22, fontWeight: "800", color: "#1C1C1E" },
  heroEmail: { fontSize: 13, color: "#9CA3AF" },
  editProfileBtn: {
    marginTop: 4, paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 20, backgroundColor: TEAL2,
  },
  editProfileBtnText: { fontSize: 13, fontWeight: "700", color: TEAL },

  // Stats strip
  statsStrip: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1, backgroundColor: WHITE, borderRadius: 14, borderWidth: 1, borderColor: BORDER,
    paddingVertical: 12, alignItems: "center", gap: 3,
  },
  statValue: { fontSize: 16, fontWeight: "800", color: "#1C1C1E", letterSpacing: -0.3 },
  statUnit:  { fontSize: 10, fontWeight: "600", color: "#9CA3AF" },
  statLabel: { fontSize: 10, fontWeight: "600", color: "#9CA3AF" },

  // Goal grid
  goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  goalCard: {
    width: "47%", backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER, padding: 16,
    alignItems: "center", gap: 6,
  },
  goalCardActive: { borderColor: TEAL, backgroundColor: TEAL2 },
  goalEmoji:      { fontSize: 28 },
  goalLabel:      { fontSize: 13, fontWeight: "700", color: "#6B7280", textAlign: "center" },
  goalLabelActive:{ color: TEAL },
  goalDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL },

  // Chips
  chipRow:  { paddingLeft: 0, paddingRight: 16, gap: 8, paddingVertical: 2 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER,
  },
  chipActive:      { backgroundColor: TEAL2, borderColor: TEAL },
  chipDanger:      { backgroundColor: "rgba(239,68,68,0.10)", borderColor: "#EF4444" },
  chipText:        { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  chipTextActive:  { color: TEAL },
  chipTextDanger:  { color: "#EF4444" },

  // Integrations
  integCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  integIcon:  { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  integEmoji: { fontSize: 19 },
  integName:  { fontSize: 14, fontWeight: "700", color: "#1C1C1E" },
  integSub:   { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
  badgeOn:    { backgroundColor: "rgba(16,185,129,0.12)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeOnText:{ fontSize: 12, fontWeight: "700", color: "#10B981" },
  badgeSoon:  { backgroundColor: BG, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeSoonText: { fontSize: 12, fontWeight: "600", color: "#9CA3AF" },
  connectBtn: { backgroundColor: TEAL, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  connectBtnText: { fontSize: 12, fontWeight: "700", color: WHITE },

  // Units toggle
  toggleWrap: { flexDirection: "row", backgroundColor: BG, borderRadius: 20, padding: 2 },
  toggleOpt:  { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18 },
  toggleOptActive: { backgroundColor: WHITE, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  toggleText:       { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },
  toggleTextActive: { color: "#1C1C1E", fontWeight: "700" },

  // Sign out
  signOutBtn: {
    backgroundColor: WHITE, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", borderWidth: 1, borderColor: "#FCA5A5", marginTop: 12,
  },
  signOutText: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
});
