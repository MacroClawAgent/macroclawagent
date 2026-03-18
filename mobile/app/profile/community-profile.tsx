import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet, Switch,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api";

const BG = "#F4F5F7"; const WHITE = "#FFFFFF"; const BORDER = "#E5E7EB";
const TEAL = "#2BB6A6"; const RED = "#FF453A";

const BASE_URL: string = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://jonnoai.com");

function validate(u: string): string | null {
  if (!u) return null;
  if (u.length < 3) return "At least 3 characters";
  if (u.length > 20) return "Max 20 characters";
  if (!/^[a-z0-9_]+$/.test(u)) return "Letters, numbers and underscores only";
  return null;
}

export default function CommunityProfileScreen() {
  const { userProfile, refreshProfile } = useAuth();

  const [username, setUsername] = useState(userProfile?.username ?? "");
  const [bio, setBio] = useState(userProfile?.bio ?? "");
  const [isPublic, setIsPublic] = useState(userProfile?.is_public ?? true);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const originalUsername = userProfile?.username ?? "";
  const validationError = validate(username);
  const usernameChanged = username !== originalUsername;

  useEffect(() => {
    if (!usernameChanged || !username || validationError) { setAvailable(null); return; }
    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/users/check-username?username=${encodeURIComponent(username)}`);
        const json = await res.json();
        setAvailable(json.available);
      } catch { setAvailable(null); }
      finally { setChecking(false); }
    }, 600);
    return () => clearTimeout(timer);
  }, [username, usernameChanged, validationError]);

  function getStatus() {
    if (!username || !usernameChanged) return null;
    if (validationError) return { text: validationError, color: RED };
    if (checking) return { text: "Checking...", color: "#9CA3AF" };
    if (available === true) return { text: `@${username} is available ✓`, color: TEAL };
    if (available === false) return { text: "Username already taken", color: RED };
    return null;
  }

  async function handleSave() {
    if (usernameChanged && available !== true && username !== originalUsername) {
      Alert.alert("Username unavailable", "Please choose a different username.");
      return;
    }
    setSaving(true);
    try {
      await apiPost("/api/profile/update", {
        username: username || undefined,
        bio: bio.trim() || undefined,
        is_public: isPublic,
      });
      await refreshProfile();
      Alert.alert("Saved", "Your community profile has been updated.");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const status = getStatus();

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <AppHeader title="Community Profile" showBack />
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Username */}
        <Text style={s.sectionLabel}>Username</Text>
        <View style={s.card}>
          <View style={s.atRow}>
            <Text style={s.atSign}>@</Text>
            <TextInput
              style={s.atInput}
              value={username}
              onChangeText={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="your_handle"
              placeholderTextColor="#C0BAB8"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            {checking && <ActivityIndicator size="small" color={TEAL} style={{ marginRight: 12 }} />}
          </View>
        </View>
        {status && <Text style={[s.statusText, { color: status.color }]}>{status.text}</Text>}
        <Text style={s.hint}>3–20 characters · letters, numbers, underscores</Text>

        {/* Bio */}
        <Text style={[s.sectionLabel, { marginTop: 20 }]}>Bio</Text>
        <View style={s.card}>
          <TextInput
            style={s.bioInput}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell the community about yourself..."
            placeholderTextColor="#C0BAB8"
            multiline
            maxLength={150}
            numberOfLines={4}
          />
          <Text style={s.charCount}>{bio.length}/150</Text>
        </View>

        {/* Privacy */}
        <Text style={[s.sectionLabel, { marginTop: 20 }]}>Privacy</Text>
        <View style={s.card}>
          <View style={s.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.switchLabel}>Public profile</Text>
              <Text style={s.switchSub}>
                {isPublic
                  ? "Your meals and activity are visible to the community"
                  : "Only you can see your posts in the community feed"}
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: "#D1D5DB", true: TEAL }}
              thumbColor={WHITE}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={WHITE} />
            : <Text style={s.saveBtnText}>Save Changes</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 16, paddingBottom: 60, gap: 4 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4, marginBottom: 6 },
  card: { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER },
  atRow: { flexDirection: "row", alignItems: "center" },
  atSign: { paddingLeft: 16, fontSize: 16, fontWeight: "700", color: TEAL },
  atInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 14, fontSize: 16, fontWeight: "600", color: "#1C1C1E" },
  bioInput: { paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: "#1C1C1E", minHeight: 90, textAlignVertical: "top" },
  charCount: { textAlign: "right", paddingRight: 12, paddingBottom: 8, fontSize: 11, color: "#9CA3AF" },
  statusText: { fontSize: 13, fontWeight: "600", paddingLeft: 4, marginTop: 4 },
  hint: { fontSize: 11, color: "#9CA3AF", paddingLeft: 4 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  switchLabel: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  switchSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2, lineHeight: 16 },
  saveBtn: { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  saveBtnText: { color: WHITE, fontWeight: "800", fontSize: 16 },
});
