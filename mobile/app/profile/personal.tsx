import React, { useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api";

const TEAL = "#2BB6A6"; const BG = "#F4F5F7"; const WHITE = "#FFFFFF"; const BORDER = "#E5E7EB";

function Divider() { return <View style={s.divider} />; }
function SectionLabel({ title }: { title: string }) { return <Text style={s.sectionLabel}>{title}</Text>; }

function EditModal({ visible, title, fields, initial, onCancel, onSave, saving }: {
  visible: boolean; title: string;
  fields: { key: string; label: string; placeholder: string; keyboard?: "default"|"numeric" }[];
  initial: Record<string, string>; onCancel: () => void;
  onSave: (v: Record<string, string>) => void; saving: boolean;
}) {
  const [values, setValues] = useState(initial);
  React.useEffect(() => { setValues(initial); }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={em.overlay}>
        <View style={em.sheet}>
          <View style={em.handle} />
          <Text style={em.title}>{title}</Text>
          {fields.map((f) => (
            <View key={f.key} style={em.field}>
              <Text style={em.label}>{f.label}</Text>
              <TextInput
                style={em.input} value={values[f.key] ?? ""}
                onChangeText={(v) => setValues((p) => ({ ...p, [f.key]: v }))}
                placeholder={f.placeholder} placeholderTextColor="#C4C4C4"
                keyboardType={f.keyboard ?? "default"} autoCapitalize="words"
              />
            </View>
          ))}
          <View style={em.actions}>
            <TouchableOpacity style={em.cancel} onPress={onCancel} activeOpacity={0.7}>
              <Text style={em.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
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
  title: { fontSize: 18, fontWeight: "800", color: "#1C1C1E" },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.4 },
  input: { backgroundColor: BG, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: "#1C1C1E" },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancel: { flex: 1, paddingVertical: 15, borderRadius: 14, backgroundColor: BG, alignItems: "center" },
  cancelTxt: { fontSize: 15, fontWeight: "700", color: "#6B7280" },
  save: { flex: 2, paddingVertical: 15, borderRadius: 14, backgroundColor: TEAL, alignItems: "center" },
  saveTxt: { fontSize: 15, fontWeight: "800", color: WHITE },
});

export default function PersonalScreen() {
  const { userProfile, refreshProfile } = useAuth();
  const [editOpen, setEditOpen] = useState<"name" | "body" | null>(null);
  const [saving, setSaving] = useState(false);

  const initials = (userProfile?.full_name ?? "A").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const genderLabel: Record<string, string> = { male: "Male", female: "Female", other: "Other", prefer_not_to_say: "Prefer not to say" };

  async function save(payload: object) {
    setSaving(true);
    try { await apiPost("/api/profile/update", payload); await refreshProfile(); setEditOpen(null); }
    catch { Alert.alert("Error", "Could not save changes."); }
    finally { setSaving(false); }
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <AppHeader title="My Profile" showBack />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={s.hero}>
          <View style={s.avatarRing}>
            <View style={s.avatar}><Text style={s.avatarTxt}>{initials}</Text></View>
          </View>
          <Text style={s.name}>{userProfile?.full_name ?? "Athlete"}</Text>
          <TouchableOpacity style={s.editBtn} onPress={() => setEditOpen("name")} activeOpacity={0.7}>
            <Text style={s.editBtnTxt}>Edit Name</Text>
          </TouchableOpacity>
        </View>

        <SectionLabel title="Body Metrics" />
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={() => setEditOpen("body")} activeOpacity={0.7}>
            <Text style={s.rowLabel}>Weight</Text>
            <View style={s.rowRight}><Text style={s.rowValue}>{userProfile?.weight_kg ? `${userProfile.weight_kg} kg` : "Not set"}</Text><Text style={s.chevron}>›</Text></View>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={s.row} onPress={() => setEditOpen("body")} activeOpacity={0.7}>
            <Text style={s.rowLabel}>Height</Text>
            <View style={s.rowRight}><Text style={s.rowValue}>{userProfile?.height_cm ? `${userProfile.height_cm} cm` : "Not set"}</Text><Text style={s.chevron}>›</Text></View>
          </TouchableOpacity>
          <Divider />
          <View style={s.row}>
            <Text style={s.rowLabel}>Gender</Text>
            <Text style={s.rowValue}>{genderLabel[userProfile?.gender ?? ""] ?? "Not set"}</Text>
          </View>
        </View>

        <SectionLabel title="Daily Targets" />
        <View style={s.statsRow}>
          {[
            { label: "Calories", value: String(userProfile?.calorie_goal ?? 2000), unit: "kcal" },
            { label: "Protein",  value: String(userProfile?.protein_goal ?? 120),  unit: "g" },
            { label: "Carbs",    value: String(userProfile?.carbs_goal ?? 250),    unit: "g" },
            { label: "Fat",      value: String(userProfile?.fat_goal ?? 70),       unit: "g" },
          ].map((st) => (
            <View key={st.label} style={s.statCard}>
              <Text style={s.statVal}>{st.value}<Text style={s.statUnit}>{st.unit}</Text></Text>
              <Text style={s.statLbl}>{st.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <EditModal visible={editOpen === "name"} title="Edit Name"
        fields={[{ key: "full_name", label: "Full Name", placeholder: "Your name" }]}
        initial={{ full_name: userProfile?.full_name ?? "" }}
        onCancel={() => setEditOpen(null)}
        onSave={(v) => save({ full_name: v.full_name })}
        saving={saving}
      />
      <EditModal visible={editOpen === "body"} title="Body Metrics"
        fields={[
          { key: "weight_kg", label: "Weight (kg)", placeholder: "e.g. 75", keyboard: "numeric" },
          { key: "height_cm", label: "Height (cm)", placeholder: "e.g. 178", keyboard: "numeric" },
        ]}
        initial={{ weight_kg: String(userProfile?.weight_kg ?? ""), height_cm: String(userProfile?.height_cm ?? "") }}
        onCancel={() => setEditOpen(null)}
        onSave={(v) => save({ weight_kg: Number(v.weight_kg) || null, height_cm: Number(v.height_cm) || null })}
        saving={saving}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 16, gap: 10, paddingBottom: 60 },
  hero: { alignItems: "center", gap: 8, paddingVertical: 20, backgroundColor: WHITE, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
  avatarRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 2.5, borderColor: TEAL, justifyContent: "center", alignItems: "center" },
  avatar: { width: 74, height: 74, borderRadius: 37, backgroundColor: TEAL, justifyContent: "center", alignItems: "center" },
  avatarTxt: { fontSize: 28, fontWeight: "900", color: WHITE },
  name: { fontSize: 20, fontWeight: "800", color: "#1C1C1E" },
  editBtn: { backgroundColor: "rgba(43,182,166,0.12)", borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7 },
  editBtnTxt: { fontSize: 13, fontWeight: "700", color: TEAL },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4, marginTop: 4 },
  card: { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  rowLabel: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  rowValue: { fontSize: 14, color: "#1C1C1E", fontWeight: "700" },
  chevron:  { fontSize: 20, color: "#C4C4C4" },
  divider:  { height: 1, backgroundColor: BG, marginHorizontal: 16 },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, backgroundColor: WHITE, borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingVertical: 12, alignItems: "center", gap: 2 },
  statVal:  { fontSize: 15, fontWeight: "800", color: "#1C1C1E", letterSpacing: -0.3 },
  statUnit: { fontSize: 10, fontWeight: "600", color: "#9CA3AF" },
  statLbl:  { fontSize: 10, fontWeight: "600", color: "#9CA3AF" },
});
