import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { deletePost, deletePostWithFoodLog } from "@/services/communityService";
import { getPostImage } from "@/data/communityMockData";
import { apiPost } from "@/lib/api";

const BG = "#0D0A07"; const WHITE = "#1C1410"; const BORDER = "rgba(255,220,150,0.12)";
const TEAL = "#F5C842"; const RED = "#FF453A";

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
  const { posts, currentUserId, loadPosts, removePost } = useCommunity();

  useEffect(() => { loadPosts(); }, []);

  const myPosts = posts.filter(p => p.userId === currentUserId);
  const totalLikes = myPosts.reduce((sum, p) => sum + p.likes, 0);

  function handleDeletePost(post: typeof myPosts[0]) {
    const logDate = post.createdAt.split("T")[0];
    Alert.alert("Delete post", "Also delete this meal from your food log?", [
      { text: "Cancel", style: "cancel" },
      { text: "Post only", onPress: async () => { await deletePost(post.id); removePost(post.id); } },
      { text: "Post + log", style: "destructive", onPress: async () => { await deletePostWithFoodLog(post.id, post.mealName, logDate); removePost(post.id); } },
    ]);
  }

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
    if (checking) return { text: "Checking...", color: "rgba(232,224,208,0.4)" };
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
              placeholderTextColor="rgba(232,224,208,0.3)"
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
            placeholderTextColor="rgba(232,224,208,0.3)"
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
              trackColor={{ false: "rgba(232,224,208,0.15)", true: "rgba(245,200,66,0.4)" }}
              thumbColor={TEAL}
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

        {/* My Posts */}
        <Text style={[s.sectionLabel, { marginTop: 28 }]}>My Posts</Text>
        <View style={s.card}>
          <View style={cp.statsRow}>
            {[
              { label: "Posts", value: String(myPosts.length) },
              { label: "Likes", value: String(totalLikes) },
            ].map((stat, i) => (
              <View key={stat.label} style={[cp.statCell, i > 0 && cp.statBorder]}>
                <Text style={cp.statVal}>{stat.value}</Text>
                <Text style={cp.statLbl}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {myPosts.length === 0 ? (
          <View style={cp.empty}>
            <Text style={{ fontSize: 36 }}>🍽️</Text>
            <Text style={cp.emptyText}>No posts yet</Text>
            <Text style={cp.emptySub}>Share a meal in the Community tab</Text>
          </View>
        ) : (
          myPosts.map(post => {
            const localImg = getPostImage(post.id);
            return (
              <View key={post.id} style={cp.postCard}>
                <View style={cp.thumb}>
                  {localImg ? (
                    <Image source={localImg} style={cp.thumbImg} resizeMode="cover" />
                  ) : post.imageUri ? (
                    <Image source={{ uri: post.imageUri }} style={cp.thumbImg} resizeMode="cover" />
                  ) : (
                    <View style={cp.thumbPlaceholder}><Text style={{ fontSize: 28 }}>🥗</Text></View>
                  )}
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={cp.postName} numberOfLines={1}>{post.mealName}</Text>
                  <Text style={cp.postMeta}>{post.timeAgo} · {post.nutrition.calories} cal · ♥ {post.likes}</Text>
                  <View style={cp.macroRow}>
                    <Text style={cp.macroChip}>P {post.nutrition.protein}g</Text>
                    <Text style={cp.macroChip}>C {post.nutrition.carbs}g</Text>
                    <Text style={cp.macroChip}>F {post.nutrition.fat}g</Text>
                  </View>
                </View>
                <TouchableOpacity style={cp.deleteBtn} onPress={() => handleDeletePost(post)} activeOpacity={0.7}>
                  <Text style={{ fontSize: 18 }}>🗑</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 16, paddingBottom: 60, gap: 4 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(232,224,208,0.4)", textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4, marginBottom: 6 },
  card: { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER },
  atRow: { flexDirection: "row", alignItems: "center" },
  atSign: { paddingLeft: 16, fontSize: 16, fontWeight: "700", color: TEAL },
  atInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 14, fontSize: 16, fontWeight: "600", color: "#E8E0D0" },
  bioInput: { paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: "#E8E0D0", minHeight: 90, textAlignVertical: "top" },
  charCount: { textAlign: "right", paddingRight: 12, paddingBottom: 8, fontSize: 11, color: "rgba(232,224,208,0.4)" },
  statusText: { fontSize: 13, fontWeight: "600", paddingLeft: 4, marginTop: 4 },
  hint: { fontSize: 11, color: "rgba(232,224,208,0.4)", paddingLeft: 4 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  switchLabel: { fontSize: 15, fontWeight: "700", color: "#E8E0D0" },
  switchSub: { fontSize: 12, color: "rgba(232,224,208,0.4)", marginTop: 2, lineHeight: 16 },
  saveBtn: { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  saveBtnText: { color: WHITE, fontWeight: "800", fontSize: 16 },
});

const cp = StyleSheet.create({
  statsRow: { flexDirection: "row", paddingVertical: 16 },
  statCell: { flex: 1, alignItems: "center", gap: 2 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: "rgba(255,220,150,0.08)" },
  statVal: { fontSize: 20, fontWeight: "800", color: "#E8E0D0" },
  statLbl: { fontSize: 11, fontWeight: "600", color: "rgba(232,224,208,0.4)", textTransform: "uppercase", letterSpacing: 0.4 },
  empty: { alignItems: "center", paddingVertical: 24, gap: 6 },
  emptyText: { fontSize: 15, fontWeight: "700", color: "#E8E0D0" },
  emptySub: { fontSize: 12, color: "rgba(232,224,208,0.4)" },
  postCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: WHITE, borderRadius: 16, padding: 12, marginTop: 8, borderWidth: 1, borderColor: BORDER },
  thumb: { width: 60, height: 60, borderRadius: 12, overflow: "hidden", backgroundColor: "#252018" },
  thumbImg: { width: 60, height: 60 },
  thumbPlaceholder: { width: 60, height: 60, alignItems: "center", justifyContent: "center", backgroundColor: "#252018" },
  postName: { fontSize: 14, fontWeight: "700", color: "#E8E0D0" },
  postMeta: { fontSize: 11, color: "rgba(232,224,208,0.4)" },
  macroRow: { flexDirection: "row", gap: 6, marginTop: 2 },
  macroChip: { fontSize: 10, fontWeight: "600", color: TEAL, backgroundColor: "rgba(245,200,66,0.10)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  deleteBtn: { padding: 8 },
});
