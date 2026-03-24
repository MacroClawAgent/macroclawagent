import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { UserPreferences } from '@/types/preferences';
import { getPreferencesSummary } from '@/services/preferencesService';

interface Props {
  preferences: UserPreferences;
  onEdit: () => void;
}

export default function PreferencesSummaryBar({ preferences, onEdit }: Props) {
  const tags = getPreferencesSummary(preferences);
  if (tags.length === 0) return null;

  return (
    <View style={s.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.row}
      >
        {tags.map((tag, i) => (
          <View key={i} style={s.tag}>
            <Text style={s.tagText}>{tag}</Text>
          </View>
        ))}
        <TouchableOpacity onPress={onEdit} style={s.editBtn} activeOpacity={0.75}>
          <Text style={s.editText}>Edit ✏️</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: '100%', marginBottom: 8 },
  row:  { gap: 6, paddingVertical: 2 },
  tag:  {
    backgroundColor: 'rgba(45,212,191,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText:  { fontSize: 12, color: '#2DD4BF', fontWeight: '500' },
  editBtn:  { paddingHorizontal: 10, paddingVertical: 4 },
  editText: { fontSize: 12, color: '#94A3B8' },
});
