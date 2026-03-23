import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import type { CommunityPostType, CreatePostData } from '@/types/community';

const TEAL = '#2DD4BF';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePostData) => Promise<void>;
}

type Step = 1 | 2 | 3;

const POST_TYPE_OPTIONS: { type: CommunityPostType; emoji: string; label: string; sub: string; activeBg: string; activeColor: string }[] = [
  { type: 'home_cooked', emoji: '🏠', label: 'Home Cooked', sub: 'A meal you made yourself', activeBg: 'rgba(34,197,94,0.1)', activeColor: '#22C55E' },
  { type: 'eating_out', emoji: '🍽️', label: 'Eating Out', sub: 'A restaurant or cafe meal', activeBg: 'rgba(59,130,246,0.1)', activeColor: '#3B82F6' },
  { type: 'meal_prep', emoji: '📦', label: 'Meal Prep', sub: 'Batch cooking for the week', activeBg: 'rgba(139,92,246,0.1)', activeColor: '#8B5CF6' },
];

function NutritionInput({
  label, value, onChange, color,
}: { label: string; value: string; onChange: (v: string) => void; color: string }) {
  return (
    <View style={ni.wrap}>
      <Text style={[ni.label, { color }]}>{label}</Text>
      <TextInput
        style={ni.input}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#CBD5E1"
      />
    </View>
  );
}

const ni = StyleSheet.create({
  wrap: { flex: 1 },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 4, letterSpacing: 0.3 },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});

export function CreatePostSheet({ visible, onClose, onSubmit }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [postType, setPostType] = useState<CommunityPostType | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mealName, setMealName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [caption, setCaption] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setStep(1);
    setPostType(null);
    setImageUri(null);
    setMealName('');
    setRestaurantName('');
    setCaption('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setIngredients('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Photo access required' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handlePost() {
    if (!postType || !mealName.trim()) return;
    setSubmitting(true);
    try {
      const data: CreatePostData = {
        postType,
        mealName: mealName.trim(),
        caption: caption.trim(),
        restaurantName: restaurantName.trim() || undefined,
        imageUri,
        nutrition: {
          calories: parseInt(calories) || 0,
          protein: parseInt(protein) || 0,
          carbs: parseInt(carbs) || 0,
          fat: parseInt(fat) || 0,
        },
        ingredients: ingredients
          ? ingredients.split(',').map((i) => i.trim()).filter(Boolean)
          : undefined,
      };
      await onSubmit(data);
      Toast.show({ type: 'success', text1: 'Posted! 🎉', visibilityTime: 2000 });
      reset();
    } finally {
      setSubmitting(false);
    }
  }

  const showIngredients = postType === 'home_cooked' || postType === 'meal_prep';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={step > 1 ? () => setStep((prev) => (prev - 1) as Step) : handleClose} style={s.navBtn}>
              <Text style={s.navBtnText}>{step > 1 ? '← Back' : 'Cancel'}</Text>
            </TouchableOpacity>
            <Text style={s.title}>Share a Meal</Text>
            <View style={s.navBtn} />
          </View>

          {/* Step indicator */}
          <View style={s.stepRow}>
            {([1, 2, 3] as Step[]).map((n) => (
              <View key={n} style={[s.stepDot, step >= n && s.stepDotActive]} />
            ))}
          </View>

          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Step 1: Choose type */}
            {step === 1 && (
              <View style={{ gap: 14 }}>
                <Text style={s.stepLabel}>What kind of meal is this?</Text>
                {POST_TYPE_OPTIONS.map((opt) => {
                  const active = postType === opt.type;
                  return (
                    <TouchableOpacity
                      key={opt.type}
                      style={[s.typeCard, active && { backgroundColor: opt.activeBg, borderColor: opt.activeColor }]}
                      activeOpacity={0.75}
                      onPress={() => setPostType(opt.type)}
                    >
                      <Text style={s.typeEmoji}>{opt.emoji}</Text>
                      <View>
                        <Text style={[s.typeLabel, active && { color: opt.activeColor }]}>{opt.label}</Text>
                        <Text style={s.typeSub}>{opt.sub}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[s.continueBtn, !postType && s.continueBtnDisabled]}
                  onPress={() => postType && setStep(2)}
                  disabled={!postType}
                >
                  <Text style={s.continueBtnText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <View style={{ gap: 16 }}>
                {/* Photo */}
                <TouchableOpacity style={s.photoPicker} onPress={pickImage} activeOpacity={0.75}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={s.photoPreview} />
                  ) : (
                    <>
                      <Text style={s.photoEmoji}>📷</Text>
                      <Text style={s.photoLabel}>Add Photo</Text>
                      <Text style={s.photoSub}>Tap to choose from library</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TextInput
                  style={s.textInput}
                  placeholder="What did you eat? (e.g. Chicken Rice Bowl)"
                  placeholderTextColor="#94A3B8"
                  value={mealName}
                  onChangeText={setMealName}
                />

                {postType === 'eating_out' && (
                  <TextInput
                    style={s.textInput}
                    placeholder="Restaurant name (e.g. Grill'd)"
                    placeholderTextColor="#94A3B8"
                    value={restaurantName}
                    onChangeText={setRestaurantName}
                  />
                )}

                <View>
                  <TextInput
                    style={[s.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
                    placeholder="Tell the community about this meal..."
                    placeholderTextColor="#94A3B8"
                    value={caption}
                    onChangeText={(t) => t.length <= 200 && setCaption(t)}
                    multiline
                    numberOfLines={3}
                  />
                  <Text style={s.charCount}>{caption.length}/200</Text>
                </View>

                {/* Nutrition */}
                <View>
                  <Text style={s.sectionLabel}>Nutrition Info</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                    <NutritionInput label="CALORIES" value={calories} onChange={setCalories} color="#1E293B" />
                    <NutritionInput label="PROTEIN (g)" value={protein} onChange={setProtein} color="#22C55E" />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <NutritionInput label="CARBS (g)" value={carbs} onChange={setCarbs} color="#F59E0B" />
                    <NutritionInput label="FAT (g)" value={fat} onChange={setFat} color="#8B5CF6" />
                  </View>
                </View>

                {showIngredients && (
                  <View>
                    <Text style={s.sectionLabel}>Main Ingredients</Text>
                    <TextInput
                      style={s.textInput}
                      placeholder="e.g. Chicken, Rice, Broccoli"
                      placeholderTextColor="#94A3B8"
                      value={ingredients}
                      onChangeText={setIngredients}
                    />
                    <Text style={s.helpText}>Separate with commas</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[s.continueBtn, !mealName.trim() && s.continueBtnDisabled]}
                  onPress={() => mealName.trim() && setStep(3)}
                  disabled={!mealName.trim()}
                >
                  <Text style={s.continueBtnText}>Preview Post</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
              <View style={{ gap: 16 }}>
                <Text style={s.stepLabel}>Looks good?</Text>
                <View style={s.previewCard}>
                  <Text style={s.previewMeal}>{mealName}</Text>
                  {restaurantName ? <Text style={s.previewRestaurant}>📍 {restaurantName}</Text> : null}
                  <Text style={s.previewCaption}>{caption || 'No caption'}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {[
                      { l: 'Cal', v: calories || '0', c: '#1E293B' },
                      { l: 'Protein', v: `${protein || 0}g`, c: '#22C55E' },
                      { l: 'Carbs', v: `${carbs || 0}g`, c: '#F59E0B' },
                      { l: 'Fat', v: `${fat || 0}g`, c: '#8B5CF6' },
                    ].map((m) => (
                      <View key={m.l} style={s.previewPill}>
                        <Text style={[s.previewPillVal, { color: m.c }]}>{m.v}</Text>
                        <Text style={s.previewPillLabel}>{m.l}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[s.postBtn, submitting && s.continueBtnDisabled]}
                  onPress={handlePost}
                  disabled={submitting}
                >
                  <Text style={s.postBtnText}>{submitting ? 'Posting…' : 'Post to Community'}</Text>
                </TouchableOpacity>
              </View>
            )}

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFCFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  navBtn: { width: 70 },
  navBtnText: { fontSize: 15, color: TEAL, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '700', color: '#1E293B' },

  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0' },
  stepDotActive: { backgroundColor: TEAL },

  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  stepLabel: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, letterSpacing: 0.3 },
  helpText: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  charCount: { fontSize: 11, color: '#94A3B8', textAlign: 'right', marginTop: 4 },

  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  typeEmoji: { fontSize: 28 },
  typeLabel: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  typeSub: { fontSize: 13, color: '#64748B', marginTop: 2 },

  continueBtn: {
    backgroundColor: TEAL,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  photoPicker: {
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 6,
    overflow: 'hidden',
  },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoEmoji: { fontSize: 32 },
  photoLabel: { fontSize: 16, fontWeight: '600', color: '#475569' },
  photoSub: { fontSize: 13, color: '#94A3B8' },

  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#A0C0D8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  previewMeal: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  previewRestaurant: { fontSize: 13, color: '#64748B', marginTop: 2 },
  previewCaption: { fontSize: 13, color: '#374151', marginTop: 6, lineHeight: 18 },
  previewPill: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  previewPillVal: { fontSize: 13, fontWeight: '700' },
  previewPillLabel: { fontSize: 10, color: '#94A3B8' },

  postBtn: {
    backgroundColor: TEAL,
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
  },
  postBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
