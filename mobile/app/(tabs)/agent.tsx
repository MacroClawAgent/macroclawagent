import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet, apiPost } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/theme/colors";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <View style={[bubble.row, isUser && bubble.rowUser]}>
      {!isUser && (
        <View style={bubble.avatar}>
          <Text style={bubble.avatarText}>✦</Text>
        </View>
      )}
      <View style={[bubble.bubble, isUser ? bubble.userBubble : bubble.assistantBubble]}>
        <Text style={[bubble.text, isUser && bubble.userText]}>{message.content}</Text>
      </View>
    </View>
  );
}

const bubble = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginVertical: 4, alignItems: "flex-end" },
  rowUser: { justifyContent: "flex-end" },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#D4FF00", justifyContent: "center", alignItems: "center", marginBottom: 2 },
  avatarText: { fontSize: 12, color: "#0B0B0B" },
  bubble: { maxWidth: "78%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { backgroundColor: "#D4FF00", borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: "rgba(255,255,255,0.07)", borderBottomLeftRadius: 4 },
  text: { fontSize: 14, lineHeight: 20, color: "#F5F5F7" },
  userText: { color: "#0B0B0B" },
});

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm Jonno, your AI nutrition assistant. Ask me anything about your macros, meal planning, or training fueling. I'm here to help! 💪",
  created_at: new Date().toISOString(),
};

function createStyles(c: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingHorizontal: 20, paddingVertical: 12,
      backgroundColor: c.card, borderBottomWidth: 1, borderBottomColor: c.border,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    jonnoAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.primary, justifyContent: "center", alignItems: "center" },
    jonnoAvatarText: { fontSize: 16, color: c.primaryText },
    headerTitle: { fontSize: 16, fontWeight: "800", color: c.text },
    headerSub: { fontSize: 11, color: c.mutedMore },
    scopeBadge: { backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    scopeText: { fontSize: 11, fontWeight: "700", color: "#10B981" },
    messageList: { paddingTop: 12, paddingBottom: 8 },
    inputRow: {
      flexDirection: "row", alignItems: "flex-end", gap: 8,
      padding: 12, paddingBottom: 20,
      backgroundColor: c.card, borderTopWidth: 1, borderTopColor: c.border,
    },
    input: {
      flex: 1, minHeight: 40, maxHeight: 100,
      backgroundColor: c.inputBg, borderRadius: 20,
      paddingHorizontal: 16, paddingVertical: 10,
      fontSize: 14, color: c.text,
    },
    sendBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: c.primary, justifyContent: "center", alignItems: "center",
    },
    sendBtnDisabled: { opacity: 0.4 },
    sendBtnText: { color: c.primaryText, fontSize: 18, fontWeight: "700" },
  });
}

export default function AgentScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  async function fetchHistory() {
    const res = await apiGet<{ messages: Message[] }>("/api/agent/messages");
    if (res?.messages && res.messages.length > 0) {
      setMessages(res.messages);
    }
    setLoading(false);
  }

  useEffect(() => { fetchHistory(); }, []);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId, role: "user", content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const res = await apiPost<{ userMessage: Message; assistantMessage: Message }>(
      "/api/agent/messages",
      { content: text }
    );

    setSending(false);

    if (res?.userMessage && res?.assistantMessage) {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        res.userMessage,
        res.assistantMessage,
      ]);
    }
  }

  const scrollToBottom = useCallback(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages.length]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.jonnoAvatar}>
            <Text style={styles.jonnoAvatarText}>✦</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Jonno</Text>
            <Text style={styles.headerSub}>Nutrition & Fitness only</Text>
          </View>
        </View>
        <View style={styles.scopeBadge}>
          <Text style={styles.scopeText}>Safe AI</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onLayout={scrollToBottom}
            ListFooterComponent={
              sending ? (
                <View style={[bubble.row, { paddingHorizontal: 16, marginVertical: 4 }]}>
                  <View style={bubble.avatar}>
                    <Text style={bubble.avatarText}>✦</Text>
                  </View>
                  <View style={[bubble.bubble, bubble.assistantBubble]}>
                    <ActivityIndicator size="small" color="rgba(245,245,247,0.35)" />
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Jonno about nutrition..."
            placeholderTextColor={colors.mutedMore}
            returnKeyType="send"
            onSubmitEditing={send}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!input.trim() || sending}
            activeOpacity={0.8}
          >
            <Text style={styles.sendBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

