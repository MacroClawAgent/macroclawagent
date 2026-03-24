import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DietaryRequirement, Allergy, Cuisine, BudgetRange, CookingTime, SpiceLevel } from '@/types/preferences';
import { usePreferences } from '@/hooks/usePreferences';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// ── Option data ────────────────────────────────────────────────────────────────

const DIETARY_OPTIONS: { value: DietaryRequirement; label: string; emoji: string }[] = [
  { value: 'none',         label: 'No restriction', emoji: '🍽️' },
  { value: 'halal',        label: 'Halal',           emoji: '🕌' },
  { value: 'kosher',       label: 'Kosher',          emoji: '✡️' },
  { value: 'vegetarian',   label: 'Vegetarian',      emoji: '🥗' },
  { value: 'vegan',        label: 'Vegan',            emoji: '🌱' },
  { value: 'pescatarian',  label: 'Pescatarian',     emoji: '🐟' },
];

const ALLERGY_OPTIONS: { value: Allergy; label: string }[] = [
  { value: 'gluten',    label: 'Gluten'    },
  { value: 'dairy',     label: 'Dairy'     },
  { value: 'nuts',      label: 'Nuts'      },
  { value: 'eggs',      label: 'Eggs'      },
  { value: 'soy',       label: 'Soy'       },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'sesame',    label: 'Sesame'    },
];

const CUISINE_OPTIONS: { value: Cuisine; label: string; emoji: string }[] = [
  { value: 'asian',          label: 'Asian',          emoji: '🥢' },
  { value: 'mediterranean',  label: 'Mediterranean',  emoji: '🫒' },
  { value: 'middle_eastern', label: 'Middle Eastern', emoji: '🧆' },
  { value: 'italian',        label: 'Italian',        emoji: '🍝' },
  { value: 'mexican',        label: 'Mexican',        emoji: '🌮' },
  { value: 'indian',         label: 'Indian',         emoji: '🍛' },
  { value: 'thai',           label: 'Thai',           emoji: '🍜' },
  { value: 'japanese',       label: 'Japanese',       emoji: '🍱' },
  { value: 'australian',     label: 'Australian',     emoji: '🦘' },
  { value: 'greek',          label: 'Greek',          emoji: '🏛️' },
  { value: 'lebanese',       label: 'Lebanese',       emoji: '🫓' },
  { value: 'korean',         label: 'Korean',         emoji: '🍲' },
  { value: 'vietnamese',     label: 'Vietnamese',     emoji: '🍃' },
];

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ title }: { title: string }) {
  return <Text style={s.sectionLabel}>{title}</Text>;
}

// ── Chip ──────────────────────────────────────────────────────────────────────

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.chip, active && s.chipActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Option row ─────────────────────────────────────────────────────────────────

function OptionRow({
  label, emoji, active, onPress,
}: { label: string; emoji?: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.optionRow, active && s.optionRowActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {emoji ? <Text style={s.optionEmoji}>{emoji}</Text> : null}
      <Text style={[s.optionText, active && s.optionTextActive]}>{label}</Text>
      {active && <Text style={s.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

// ── Segmented control ─────────────────────────────────────────────────────────

function SegmentedControl<T extends string>({
  options, value, onChange,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={s.segmented}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[s.segment, value === opt.value && s.segmentActive]}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.8}
        >
          <Text style={[s.segmentText, value === opt.value && s.segmentTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PreferencesSheet({ visible, onClose }: Props) {
  const {
    preferences,
    updatePreference,
    toggleAllergy,
    toggleCuisine,
    completeOnboarding,
  } = usePreferences();

  function handleClose() {
    completeOnboarding();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Your Preferences</Text>
            <Text style={s.headerSub}>Jonno uses these to personalise every meal plan</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={s.doneBtn} activeOpacity={0.8}>
            <Text style={s.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Dietary requirement */}
          <SectionLabel title="Dietary requirement" />
          {DIETARY_OPTIONS.map(opt => (
            <OptionRow
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              active={preferences.dietaryRequirement === opt.value}
              onPress={() => updatePreference('dietaryRequirement', opt.value)}
            />
          ))}

          {/* Allergies */}
          <SectionLabel title="Allergies & intolerances" />
          <View style={s.chipRow}>
            {ALLERGY_OPTIONS.map(opt => (
              <Chip
                key={opt.value}
                label={opt.label}
                active={preferences.allergies.includes(opt.value)}
                onPress={() => toggleAllergy(opt.value)}
              />
            ))}
          </View>

          {/* Cuisines */}
          <SectionLabel title="Preferred cuisines" />
          <Text style={s.sectionHint}>Select cuisines you enjoy — Jonno will rotate through them</Text>
          <View style={s.chipRow}>
            {CUISINE_OPTIONS.map(opt => (
              <Chip
                key={opt.value}
                label={`${opt.emoji} ${opt.label}`}
                active={preferences.cuisines.includes(opt.value)}
                onPress={() => toggleCuisine(opt.value)}
              />
            ))}
          </View>

          {/* Budget */}
          <SectionLabel title="Weekly grocery budget" />
          <SegmentedControl
            options={[
              { value: 'budget',   label: '💰 Budget\n<$80/wk'   },
              { value: 'moderate', label: '🛒 Moderate\n$80–150'  },
              { value: 'flexible', label: '💎 Flexible\n$150+'    },
            ]}
            value={preferences.budget}
            onChange={v => updatePreference('budget', v as BudgetRange)}
          />

          {/* Cooking time */}
          <SectionLabel title="Cooking time preference" />
          <SegmentedControl
            options={[
              { value: 'quick',     label: '⚡ Quick\n<20 min'    },
              { value: 'normal',    label: '🍳 Normal\n20–40 min' },
              { value: 'elaborate', label: '👨‍🍳 Enjoy\n40+ min'  },
            ]}
            value={preferences.cookingTime}
            onChange={v => updatePreference('cookingTime', v as CookingTime)}
          />

          {/* Spice level */}
          <SectionLabel title="Spice level" />
          <SegmentedControl
            options={[
              { value: 'mild',   label: '🌿 Mild'   },
              { value: 'medium', label: '🌶️ Medium' },
              { value: 'spicy',  label: '🔥 Spicy'  },
            ]}
            value={preferences.spiceLevel}
            onChange={v => updatePreference('spiceLevel', v as SpiceLevel)}
          />

          {/* Servings */}
          <SectionLabel title="Servings per meal" />
          <View style={s.chipRow}>
            {([1, 2, 3, 4, 5] as const).map(n => (
              <Chip
                key={n}
                label={`${n} ${n === 1 ? 'person' : 'people'}`}
                active={preferences.servings === n}
                onPress={() => updatePreference('servings', n)}
              />
            ))}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity style={s.saveBtn} onPress={handleClose} activeOpacity={0.85}>
            <Text style={s.saveBtnText}>Save preferences</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Modal>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const TEAL = '#2DD4BF';

const s = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  headerSub:   { fontSize: 13, color: '#94A3B8', marginTop: 2, maxWidth: 240 },
  doneBtn:     { backgroundColor: TEAL, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8 },
  doneBtnText: { fontSize: 14, fontWeight: '700', color: 'white' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 24, marginBottom: 10 },
  sectionHint:  { fontSize: 12, color: '#94A3B8', marginBottom: 10, marginTop: -6 },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
    backgroundColor: '#F8FAFC',
    gap: 10,
  },
  optionRowActive: { backgroundColor: 'rgba(45,212,191,0.08)', borderColor: 'rgba(45,212,191,0.4)' },
  optionEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
  optionText:  { flex: 1, fontSize: 15, color: '#334155', fontWeight: '500' },
  optionTextActive: { color: '#1E293B', fontWeight: '600' },
  checkmark:   { fontSize: 16, color: TEAL, fontWeight: '700' },

  chipRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  chipActive:{ backgroundColor: 'rgba(45,212,191,0.12)', borderColor: 'rgba(45,212,191,0.4)' },
  chipText:  { fontSize: 13, fontWeight: '600', color: '#64748B' },
  chipTextActive: { color: TEAL },

  segmented:     { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 4, gap: 4 },
  segment:       { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  segmentActive: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  segmentText:   { fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 16 },
  segmentTextActive: { color: '#1E293B', fontWeight: '700' },

  footer:  { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  saveBtn: { backgroundColor: TEAL, borderRadius: 20, paddingVertical: 16, alignItems: 'center', shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },
});
