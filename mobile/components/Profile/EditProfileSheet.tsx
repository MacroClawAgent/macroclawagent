import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import type { UserProfile, UserGoal } from '@/types/community';
import { updateProfile } from '@/services/profileService';

const TEAL = '#2DD4BF';

const GOALS: { key: UserGoal; label: string; emoji: string }[] = [
  { key: 'build_muscle', label: 'Build Muscle', emoji: '💪' },
  { key: 'fat_loss',     label: 'Fat Loss',     emoji: '🔥' },
  { key: 'maintenance',  label: 'Maintenance',  emoji: '⚖️' },
  { key: 'performance',  label: 'Performance',  emoji: '⚡' },
];

interface Props {
  visible: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSaved: (updates: Partial<UserProfile>) => void;
}

export function EditProfileSheet({ visible, profile, onClose, onSaved }: Props) {
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username.replace('@', ''));
  const [bio, setBio] = useState(profile.bio ?? '');
  const [instagram, setInstagram] = useState(profile.instagramHandle ?? '');
  const [goal, setGoal] = useState<UserGoal>(profile.goal);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(profile.name);
      setUsername(profile.username.replace('@', ''));
      setBio(profile.bio ?? '');
      setInstagram(profile.instagramHandle ?? '');
      setGoal(profile.goal);
    }
  }, [visible, profile]);

  async function handleSave() {
    setSaving(true);
    const goalMeta = GOALS.find((g) => g.key === goal)!;
    const updates: Partial<UserProfile> = {
      name,
      username: `@${username.replace('@', '')}`,
      bio,
      instagramHandle: instagram,
      goal,
      goalLabel: goalMeta.label,
    };
    try {
      await updateProfile(updates);
      onSaved(updates);
      Toast.show({ type: 'success', text1: 'Profile updated ✓', visibilityTime: 2000 });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.container}>
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} style={s.navBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.title}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={s.navBtn}>
              <Text style={[s.saveText, saving && { opacity: 0.5 }]}>{saving ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            <Text style={s.sectionLabel}>ABOUT</Text>

            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#94A3B8" />

            <View style={s.prefixInput}>
              <Text style={s.prefix}>@</Text>
              <TextInput
                style={s.prefixText}
                value={username}
                onChangeText={(t) => setUsername(t.replace(/\s/g, '').replace('@', ''))}
                placeholder="username"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>

            <View>
              <TextInput
                style={[s.input, { minHeight: 76, textAlignVertical: 'top' }]}
                value={bio}
                onChangeText={(t) => t.length <= 120 && setBio(t)}
                placeholder="Short bio…"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />
              <Text style={s.counter}>{bio.length}/120</Text>
            </View>

            <Text style={s.sectionLabel}>INSTAGRAM</Text>

            <View style={s.prefixInput}>
              <Text style={s.prefix}>📷 @</Text>
              <TextInput
                style={s.prefixText}
                value={instagram}
                onChangeText={(t) => setInstagram(t.replace('@', '').replace(/\s/g, ''))}
                placeholder="your_handle"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>
            <Text style={s.helper}>Tap your handle on your profile to open Instagram</Text>

            <Text style={s.sectionLabel}>GOAL</Text>

            <View style={s.goalGrid}>
              {GOALS.map((g) => {
                const active = goal === g.key;
                return (
                  <TouchableOpacity
                    key={g.key}
                    style={[s.goalPill, active && s.goalPillActive]}
                    onPress={() => setGoal(g.key)}
                    activeOpacity={0.75}
                  >
                    <Text style={[s.goalText, active && s.goalTextActive]}>{g.emoji} {g.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.sectionLabel}>TOP CUISINES</Text>
            <View style={s.cuisineRow}>
              {profile.topCuisines.map((c) => (
                <View key={c} style={s.cuisinePill}>
                  <Text style={s.cuisineText}>{c}</Text>
                </View>
              ))}
            </View>
            <Text style={s.helper}>Auto-generated from your meal history</Text>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFCFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  navBtn: { width: 60 },
  title: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  cancelText: { fontSize: 15, color: '#94A3B8' },
  saveText: { fontSize: 15, fontWeight: '700', color: TEAL, textAlign: 'right' },
  scroll: { paddingHorizontal: 20, paddingBottom: 60, gap: 12 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#94A3B8',
    letterSpacing: 0.8, marginTop: 16, marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#1E293B',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  prefixInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: '#E2E8F0', gap: 4,
  },
  prefix: { fontSize: 15, color: '#94A3B8' },
  prefixText: { flex: 1, fontSize: 15, color: '#1E293B' },
  counter: { fontSize: 11, color: '#94A3B8', textAlign: 'right', marginTop: 4 },
  helper: { fontSize: 11, color: '#94A3B8', marginTop: 4 },

  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalPill: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',
  },
  goalPillActive: { backgroundColor: TEAL, borderColor: TEAL },
  goalText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  goalTextActive: { color: '#fff' },

  cuisineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cuisinePill: {
    backgroundColor: 'rgba(45,212,191,0.08)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(45,212,191,0.25)',
  },
  cuisineText: { fontSize: 13, fontWeight: '500', color: TEAL },
});
