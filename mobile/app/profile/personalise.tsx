import React, { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api";

const TEAL = "#F5C842"; const BG = "#0D0A07"; const WHITE = "#1C1410"; const BORDER = "rgba(255,220,150,0.12)";
const ASYNC_KEY = "macroClaw:personalise";

const GOAL_OPTIONS = [
  { key: "lose_weight",  label: "Lose Weight",  emoji: "🔥" },
  { key: "build_muscle", label: "Build Muscle",  emoji: "💪" },
  { key: "performance",  label: "Performance",   emoji: "⚡" },
  { key: "maintain",     label: "Stay Healthy",  emoji: "🌿" },
];
const DIET_OPTIONS    = ["Omnivore", "Vegetarian", "Vegan", "Keto", "Paleo", "Halal", "Gluten-Free"];
const ALLERGY_OPTIONS = ["Gluten", "Dairy", "Nuts", "Shellfish", "Eggs", "Soy", "Fish"];
const COOKING_LEVELS  = ["Beginner", "Intermediate", "Advanced", "Chef"];
const BUDGET_LEVELS   = ["Budget", "Moderate", "Premium", "Flexible"];

interface Prefs { diet: string; allergies: string[]; cooking: string; budget: string; }
const DEFAULT: Prefs = { diet: "Omnivore", allergies: [], cooking: "Intermediate", budget: "Moderate" };

function SectionLabel({ title }: { title: string }) { return <Text style={s.sectionLabel}>{title}</Text>; }
function Divider() { return <View style={s.divider} />; }

function EditModal({ visible, title, fields, initial, onCancel, onSave, saving }: {
  visible: boolean; title: string;
  fields: { key: string; label: string; placeholder: string; keyboard?: "default"|"numeric" }[];
  initial: Record<string, string>; onCancel: () => void;
  onSave: (v: Record<string, string>) => void; saving: boolean;
}) {
  const [values, setValues] = useState(initial);
  useEffect(() => { setValues(initial); }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={em.overlay}>
        <View style={em.sheet}>
          <View style={em.handle} />
          <Text style={em.title}>{title}</Text>
          {fields.map((f) => (
            <View key={f.key} style={em.field}>
              <Text style={em.label}>{f.label}</Text>
              <TextInput style={em.input} value={values[f.key] ?? ""} onChangeText={(v) => setValues((p) => ({ ...p, [f.key]: v }))}
                placeholder={f.placeholder} placeholderTextColor="rgba(232,224,208,0.3)" keyboardType={f.keyboard ?? "default"} />
            </View>
          ))}
          <View style={em.actions}>
            <TouchableOpacity style={em.cancel} onPress={onCancel} activeOpacity={0.7}><Text style={em.cancelTxt}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[em.save, saving && { opacity: 0.6 }]} onPress={() => onSave(values)} disabled={saving} activeOpacity={0.7}>
              <Text style={em.saveTxt}>{saving ? "Saving…" : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const em = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, gap: 16 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: BORDER, alignSelf: "center", marginBottom: 4 },
  title: { fontSize: 18, fontWeight: "800", color: "#E8E0D0" },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "700", color: "rgba(232,224,208,0.4)", textTransform: "uppercase", letterSpacing: 0.4 },
  input: { backgroundColor: BG, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: "#E8E0D0" },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancel: { flex: 1, paddingVertical: 15, borderRadius: 14, backgroundColor: BG, alignItems: "center" },
  cancelTxt: { fontSize: 15, fontWeight: "700", color: "rgba(232,224,208,0.55)" },
  save: { flex: 2, paddingVertical: 15, borderRadius: 14, backgroundColor: TEAL, alignItems: "center" },
  saveTxt: { fontSize: 15, fontWeight: "800", color: WHITE },
});

export default function PersonaliseScreen() {
  const { userProfile, refreshProfile } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [editTargets, setEditTargets] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ASYNC_KEY).then((v) => { if (v) setPrefs(JSON.parse(v)); });
  }, []);

  async function savePrefs(updated: Prefs) {
    setPrefs(updated);
    await AsyncStorage.setItem(ASYNC_KEY, JSON.stringify(updated));
  }

  async function saveGoal(goal: string) {
    setSaving(true);
    try { await apiPost("/api/profile/update", { fitness_goal: goal }); await refreshProfile(); }
    catch { Alert.alert("Error", "Could not save."); }
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
      await refreshProfile(); setEditTargets(false);
    } catch { Alert.alert("Error", "Could not save."); }
    finally { setSaving(false); }
  }

  const activeGoal = userProfile?.fitness_goal ?? "maintain";

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <AppHeader title="Personalise" showBack />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <SectionLabel title="Fitness Goal" />
        <View style={s.goalGrid}>
          {GOAL_OPTIONS.map((opt) => {
            const active = activeGoal === opt.key;
            return (
              <TouchableOpacity key={opt.key} style={[s.goalCard, active && s.goalCardActive]}
                onPress={() => saveGoal(opt.key)} activeOpacity={0.75} disabled={saving}>
                <Text style={s.goalEmoji}>{opt.emoji}</Text>
                <Text style={[s.goalLabel, active && s.goalLabelActive]}>{opt.label}</Text>
                {active && <View style={s.goalDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionLabel title="Daily Targets" />
        <View style={s.card}>
          {[
            { label: "Calories", val: `${userProfile?.calorie_goal ?? 2000} kcal` },
            { label: "Protein",  val: `${userProfile?.protein_goal ?? 120} g` },
            { label: "Carbs",    val: `${userProfile?.carbs_goal ?? 250} g` },
            { label: "Fat",      val: `${userProfile?.fat_goal ?? 70} g` },
          ].map((r, i) => (
            <React.Fragment key={r.label}>
              {i > 0 && <Divider />}
              <TouchableOpacity style={s.row} onPress={() => setEditTargets(true)} activeOpacity={0.7}>
                <Text style={s.rowLabel}>{r.label}</Text>
                <View style={s.rowRight}><Text style={s.rowValue}>{r.val}</Text><Text style={s.chevron}>›</Text></View>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <SectionLabel title="Diet Type" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
          {DIET_OPTIONS.map((d) => (
            <TouchableOpacity key={d} style={[s.chip, prefs.diet === d && s.chipActive]}
              onPress={() => savePrefs({ ...prefs, diet: d })} activeOpacity={0.7}>
              <Text style={[s.chipTxt, prefs.diet === d && s.chipTxtActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionLabel title="Allergies & Intolerances" />
        <View style={s.chipWrap}>
          {ALLERGY_OPTIONS.map((a) => {
            const active = prefs.allergies.includes(a);
            return (
              <TouchableOpacity key={a}
                style={[s.chip, active && s.chipDanger]}
                onPress={() => {
                  const next = active ? prefs.allergies.filter((x) => x !== a) : [...prefs.allergies, a];
                  savePrefs({ ...prefs, allergies: next });
                }}
                activeOpacity={0.7}>
                <Text style={[s.chipTxt, active && s.chipTxtDanger]}>{a}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionLabel title="Cooking Skill" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
          {COOKING_LEVELS.map((c) => (
            <TouchableOpacity key={c} style={[s.chip, prefs.cooking === c && s.chipActive]}
              onPress={() => savePrefs({ ...prefs, cooking: c })} activeOpacity={0.7}>
              <Text style={[s.chipTxt, prefs.cooking === c && s.chipTxtActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionLabel title="Grocery Budget" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
          {BUDGET_LEVELS.map((b) => (
            <TouchableOpacity key={b} style={[s.chip, prefs.budget === b && s.chipActive]}
              onPress={() => savePrefs({ ...prefs, budget: b })} activeOpacity={0.7}>
              <Text style={[s.chipTxt, prefs.budget === b && s.chipTxtActive]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      <EditModal visible={editTargets} title="Daily Targets"
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 16, gap: 10, paddingBottom: 60 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(232,224,208,0.4)", textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4, marginTop: 4 },
  goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  goalCard: { width: "47%", backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, alignItems: "center", gap: 6 },
  goalCardActive: { borderColor: TEAL, backgroundColor: "rgba(245,200,66,0.08)" },
  goalEmoji: { fontSize: 28 },
  goalLabel: { fontSize: 13, fontWeight: "700", color: "rgba(232,224,208,0.55)", textAlign: "center" },
  goalLabelActive: { color: TEAL },
  goalDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL },
  card: { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  rowLabel: { fontSize: 14, color: "rgba(232,224,208,0.55)", fontWeight: "500" },
  rowValue: { fontSize: 14, color: "#E8E0D0", fontWeight: "700" },
  chevron:  { fontSize: 20, color: "rgba(232,224,208,0.25)" },
  divider:  { height: 1, backgroundColor: BG, marginHorizontal: 16 },
  chipRow:  { gap: 8, paddingVertical: 2 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER },
  chipActive: { backgroundColor: "rgba(245,200,66,0.10)", borderColor: TEAL },
  chipDanger: { backgroundColor: "rgba(239,68,68,0.10)", borderColor: "#EF4444" },
  chipTxt:       { fontSize: 13, fontWeight: "600", color: "rgba(232,224,208,0.55)" },
  chipTxtActive: { color: TEAL },
  chipTxtDanger: { color: "#EF4444" },
});
