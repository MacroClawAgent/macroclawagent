import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import type { CommunityPost, CommunityComment } from '@/types/community';
import { getComments } from '@/services/communityService';

const TEAL = '#2DD4BF';

interface Props {
  post: CommunityPost | null;
  onClose: () => void;
}

export function CommentsSheet({ post, onClose }: Props) {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [text, setText] = useState('');
  const slideY = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (post) {
      getComments(post.id).then(setComments);
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
    } else {
      Animated.timing(slideY, { toValue: 600, duration: 220, useNativeDriver: true }).start();
    }
  }, [post]);

  function handleSend() {
    if (!text.trim()) return;
    // TODO: save to backend
    const newComment: CommunityComment = {
      id: `c-${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      userInitial: 'Y',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      timeAgo: 'Just now',
    };
    setComments((prev) => [...prev, newComment]);
    setText('');
  }

  if (!post) return null;

  return (
    <Modal visible={!!post} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.kavWrap}
        pointerEvents="box-none"
      >
        <Animated.View style={[s.sheet, { transform: [{ translateY: slideY }] }]}>
          {/* Handle */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Comments</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Post mini-preview */}
          <View style={s.preview}>
            <Text style={s.previewMeal}>{post.mealName}</Text>
            <Text style={s.previewUser}>by {post.userName}</Text>
          </View>

          {/* Comments */}
          <ScrollView style={s.list} contentContainerStyle={{ gap: 14, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
            {comments.length === 0 ? (
              <Text style={s.emptyText}>No comments yet. Be the first!</Text>
            ) : (
              comments.map((c) => (
                <View key={c.id} style={s.commentRow}>
                  <View style={s.commentAvatar}>
                    <Text style={s.commentAvatarText}>{c.userInitial}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.commentName}>{c.userName} <Text style={s.commentTime}>{c.timeAgo}</Text></Text>
                    <Text style={s.commentText}>{c.text}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Input */}
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="Add a comment..."
              placeholderTextColor="#94A3B8"
              value={text}
              onChangeText={setText}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={[s.sendBtn, !text.trim() && s.sendBtnDisabled]} onPress={handleSend}>
              <Text style={s.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  kavWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    maxHeight: '70%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 16, color: '#94A3B8' },

  preview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  previewMeal: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  previewUser: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  list: { flex: 1 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginTop: 20 },

  commentRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  commentAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(45,212,191,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  commentAvatarText: { fontSize: 13, fontWeight: '700', color: TEAL },
  commentName: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  commentTime: { fontSize: 11, fontWeight: '400', color: '#94A3B8' },
  commentText: { fontSize: 13, color: '#374151', marginTop: 2, lineHeight: 18 },

  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    backgroundColor: TEAL,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
