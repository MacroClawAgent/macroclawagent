import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { apiPost } from '@/lib/api';

// ── Palette (matches agent.tsx) ───────────────────────────────────────────────
const BG     = '#1C1612';
const CARD   = '#252018';
const BORDER = 'rgba(248,213,97,0.10)';
const GOLD   = '#F5C842';
const CORAL  = '#E07B54';
const SAGE   = '#8B9E6E';
const TEXT   = '#E8E0D0';
const MUTED  = 'rgba(232,224,208,0.5)';
const DIM    = 'rgba(232,224,208,0.3)';

type Stage = 'idle' | 'analyzing' | 'confirm' | 'error';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** photoUri is the local device URI of the scanned photo — stored alongside items for thumbnails */
  onItemsConfirmed: (items: string[], photoUri: string) => void;
}

export default function PantryScanner({ visible, onClose, onItemsConfirmed }: Props) {
  const [stage, setStage]           = useState<Stage>('idle');
  const [detectedItems, setDetected] = useState<string[]>([]);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg]     = useState('');
  const [photoUri, setPhotoUri]     = useState('');

  const reset = () => {
    setStage('idle');
    setDetected([]);
    setSelected(new Set());
    setErrorMsg('');
    setPhotoUri('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const scanImage = async (base64: string, mimeType: string, uri: string) => {
    setPhotoUri(uri);
    setStage('analyzing');
    try {
      const result = await apiPost<{ items: string[]; error?: string }>(
        '/api/pantry/scan',
        { imageBase64: base64, mimeType }
      );
      if (result.error || !result.items || result.items.length === 0) {
        setErrorMsg(result.error ?? "Couldn't identify any items in this photo.");
        setStage('error');
        return;
      }
      setDetected(result.items);
      setSelected(new Set(result.items)); // all checked by default
      setStage('confirm');
    } catch {
      setErrorMsg("Couldn't read this photo — please add items manually.");
      setStage('error');
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Camera permission is required to scan your fridge.');
      setStage('error');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      await scanImage(result.assets[0].base64, 'image/jpeg', result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Photo library permission is required.');
      setStage('error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const mimeType = result.assets[0].uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
      await scanImage(result.assets[0].base64, mimeType, result.assets[0].uri);
    }
  };

  const toggleItem = (item: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(item)) { next.delete(item); } else { next.add(item); }
      return next;
    });
  };

  const confirmItems = () => {
    const confirmed = detectedItems.filter(i => selected.has(i));
    if (confirmed.length > 0) onItemsConfirmed(confirmed, photoUri);
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={handleClose} />

      <View style={s.sheet}>
        {/* Handle */}
        <View style={s.handle} />

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>Scan your fridge</Text>
            <Text style={s.subtitle}>Jonno will identify what you have</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={s.closeBtn} activeOpacity={0.75}>
            <Ionicons name="close" size={18} color={MUTED} />
          </TouchableOpacity>
        </View>

        {/* ── IDLE: pick source ── */}
        {stage === 'idle' && (
          <View style={s.optionsRow}>
            <TouchableOpacity style={s.optionBtn} onPress={pickFromCamera} activeOpacity={0.8}>
              <View style={s.optionIcon}>
                <Ionicons name="camera" size={26} color={GOLD} />
              </View>
              <Text style={s.optionLabel}>Take a photo</Text>
              <Text style={s.optionSub}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.optionBtn} onPress={pickFromLibrary} activeOpacity={0.8}>
              <View style={s.optionIcon}>
                <Ionicons name="images" size={26} color={CORAL} />
              </View>
              <Text style={s.optionLabel}>Choose photo</Text>
              <Text style={s.optionSub}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── ANALYZING ── */}
        {stage === 'analyzing' && (
          <View style={s.centerBlock}>
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={s.analyzingText}>Jonno is reading your fridge...</Text>
          </View>
        )}

        {/* ── CONFIRM: checklist ── */}
        {stage === 'confirm' && (
          <>
            <Text style={s.confirmHeader}>
              {detectedItems.length} items detected — uncheck to exclude
            </Text>
            <ScrollView style={s.list} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
              {detectedItems.map((item) => {
                const on = selected.has(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={s.listRow}
                    onPress={() => toggleItem(item)}
                    activeOpacity={0.75}
                  >
                    <View style={[s.checkbox, on && s.checkboxOn]}>
                      {on && <Ionicons name="checkmark" size={13} color={BG} />}
                    </View>
                    <Text style={[s.itemText, !on && s.itemTextOff]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={s.confirmBtn} onPress={confirmItems} activeOpacity={0.85}>
              <Text style={s.confirmBtnText}>
                Add {selected.size} item{selected.size !== 1 ? 's' : ''} to kitchen →
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── ERROR ── */}
        {stage === 'error' && (
          <View style={s.centerBlock}>
            <Ionicons name="alert-circle-outline" size={40} color={CORAL} />
            <Text style={s.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={reset} activeOpacity={0.8}>
              <Text style={s.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },

  sheet: {
    backgroundColor: CARD,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },

  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(232,224,208,0.2)', alignSelf: 'center', marginTop: 12, marginBottom: 4 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 16 },
  title:  { fontSize: 20, fontWeight: '800', color: TEXT },
  subtitle:{ fontSize: 13, color: MUTED, marginTop: 2 },
  closeBtn:{ width: 34, height: 34, borderRadius: 10, backgroundColor: BG, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },

  // Source picker
  optionsRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 28 },
  optionBtn:  { flex: 1, backgroundColor: BG, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 20, alignItems: 'center', gap: 10 },
  optionIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center' },
  optionLabel:{ fontSize: 15, fontWeight: '700', color: TEXT },
  optionSub:  { fontSize: 12, color: MUTED },

  // Analyzing
  centerBlock:  { alignItems: 'center', paddingVertical: 32, gap: 14 },
  analyzingText:{ fontSize: 15, color: MUTED, textAlign: 'center' },

  // Confirm
  confirmHeader:{ fontSize: 13, color: DIM, marginBottom: 10 },
  list:         { maxHeight: 320 },
  listRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(232,224,208,0.06)' },
  checkbox:     { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  checkboxOn:   { backgroundColor: SAGE, borderColor: SAGE },
  itemText:     { fontSize: 15, color: TEXT, flex: 1 },
  itemTextOff:  { color: DIM, textDecorationLine: 'line-through' },
  confirmBtn:   { marginTop: 16, backgroundColor: GOLD, borderRadius: 20, paddingVertical: 15, alignItems: 'center' },
  confirmBtnText:{ fontSize: 16, fontWeight: '800', color: BG },

  // Error
  errorText:  { fontSize: 14, color: MUTED, textAlign: 'center', lineHeight: 20 },
  retryBtn:   { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 24, paddingVertical: 11 },
  retryBtnText:{ fontSize: 14, fontWeight: '600', color: TEXT },
});
