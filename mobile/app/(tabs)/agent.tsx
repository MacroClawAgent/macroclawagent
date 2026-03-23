import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAgentViewModel } from "@/lib/viewModels/useAgentViewModel";

// ── Constants ─────────────────────────────────────────────────────────────────

const BG    = "#F0F5FA";
const WHITE = "#FFFFFF";
const TEAL  = "#2BB6A6";
const BLUE  = "#3B6FD4";

// ── Mock data ─────────────────────────────────────────────────────────────────

const JONNO_CONTEXT = {
  status: "You're on track today",
  statusDetail: "3 of 4 meals logged · Great work",
  mealPlan: [
    { time: "7:30 AM",  name: "Breakfast", desc: "Greek yoghurt, banana, granola",         cal: 450, pro: 28, state: "done"     },
    { time: "12:00 PM", name: "Lunch",     desc: "Grilled chicken wrap, side salad",        cal: 620, pro: 42, state: "current"  },
    { time: "3:30 PM",  name: "Snack",     desc: "Protein shake + almonds",                cal: 280, pro: 30, state: "upcoming" },
    { time: "7:00 PM",  name: "Dinner",    desc: "Salmon, sweet potato, broccoli",          cal: 580, pro: 44, state: "upcoming" },
  ],
  macros: { cal: 1070, calT: 1930, pro: 70, proT: 144, carb: 95, carbT: 220, fat: 28, fatT: 64 },
  insights: [
    { border: "#F59E0B", icon: "⚠️", title: "Protein gap",          body: "You need 74g more protein today. Add a shake or chicken breast.",  cta: "Fix it"      },
    { border: TEAL,      icon: "💡", title: "Post-workout window",   body: "Your 5km run was 40 min ago. Eat within the next 20 min.",         cta: "Log meal"    },
    { border: "#8B5CF6", icon: "📈", title: "Weekly pattern spotted",body: "You consistently under-eat on Mondays. Let's build a fix.",        cta: "Adjust plan" },
  ],
  quickActions: [
    { icon: "🍽️", title: "Generate Meal Plan", sub: "Based on your goals",  color: BLUE,      prompt: "Generate a complete meal plan for today based on my macros and fitness goal. Plain text only." },
    { icon: "🛒", title: "Build Smart Cart",    sub: "Order in 2 taps",      color: TEAL,      prompt: "Build a grocery smart cart for today's meals. Plain text only."                                 },
    { icon: "⚖️", title: "Adjust Macros",       sub: "Tweak your targets",   color: "#8B5CF6", prompt: "Suggest macro adjustments for my current fitness goal and activity level. Plain text only."     },
    { icon: "📊", title: "Weekly Review",        sub: "How last week went",   color: "#F59E0B", prompt: "Give me a brief weekly nutrition review based on my typical intake. Plain text only."           },
  ],
  suggestions: ["What should I eat tonight?", "Am I on track today?", "Best post-workout meal?"],
  lastResponse: "Your protein is looking low — I'd suggest adding a chicken breast or protein shake after your next workout window.",
};

// ── Animated pulse dot ────────────────────────────────────────────────────────

function PulseDot() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,   duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[s.pulseDot, { opacity }]} />
  );
}

// ── Fade-slide-in wrapper ─────────────────────────────────────────────────────

function FadeIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim,  { toValue: 1, delay, duration: 420, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, delay, duration: 420, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: slide }] }}>
      {children}
    </Animated.View>
  );
}

// ── Glass card ────────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AgentScreen() {
  const vm = useAgentViewModel();
  const ctx = JONNO_CONTEXT;

  const [chatExpanded, setChatExpanded] = useState(false);
  const [inputText, setInputText]       = useState("");
  const [localResp, setLocalResp]       = useState<string | null>(ctx.lastResponse);

  useEffect(() => {
    if (vm.latestResponse) setLocalResp(vm.latestResponse.replace(/\*\*/g, "").replace(/#{1,6}\s?/g, "").trim());
  }, [vm.latestResponse]);

  function sendMessage() {
    const text = inputText.trim();
    if (!text || vm.sending) return;
    setInputText("");
    setLocalResp(null);
    vm.quickSend(text);
  }

  const m = ctx.macros;
  const calPct = Math.min(m.cal / m.calT, 1);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── SECTION 1: Status Header ── */}
          <FadeIn delay={0}>
            <LinearGradient
              colors={["#3B6FD4", "#2BB6A6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.headerCard}
            >
              <View style={s.headerTop}>
                <View style={s.jonnoIconWrap}>
                  <Text style={s.jonnoIcon}>✦</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.jonnoTitle}>Jonno</Text>
                  <Text style={s.jonnoSub}>Proactive AI nutrition coach</Text>
                </View>
                <View style={s.onlineWrap}>
                  <PulseDot />
                  <Text style={s.onlineLabel}>Active</Text>
                </View>
              </View>

              <View style={s.statusBubble}>
                <Text style={s.statusMain}>{ctx.status}</Text>
                <Text style={s.statusSub}>{ctx.statusDetail}</Text>
              </View>

              <View style={s.datePill}>
                <Text style={s.datePillText}>
                  {new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                </Text>
              </View>
            </LinearGradient>
          </FadeIn>

          {/* ── SECTION 2: Today's Action Plan ── */}
          <FadeIn delay={80}>
            <Card style={{ marginTop: 14 }}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Today's Action Plan</Text>
                <TouchableOpacity
                  onPress={() => vm.quickSend("Regenerate today's meal plan based on my remaining macros. Plain text only.")}
                  disabled={vm.sending}
                  activeOpacity={0.75}
                  style={s.regenBtn}
                >
                  <Ionicons name="refresh" size={13} color={TEAL} />
                  <Text style={s.regenBtnText}>Regenerate</Text>
                </TouchableOpacity>
              </View>

              {/* Timeline */}
              {ctx.mealPlan.map((meal, i) => (
                <View key={meal.name} style={s.timelineRow}>
                  {/* Line */}
                  <View style={s.timelineCol}>
                    <View style={[
                      s.timelineDot,
                      meal.state === "done"    && s.dotDone,
                      meal.state === "current" && s.dotCurrent,
                      meal.state === "upcoming"&& s.dotUpcoming,
                    ]} />
                    {i < ctx.mealPlan.length - 1 && (
                      <View style={[s.timelineLine, meal.state === "done" && s.lineDone]} />
                    )}
                  </View>

                  {/* Content */}
                  <View style={[s.timelineContent, meal.state === "current" && s.contentCurrent]}>
                    <View style={s.mealRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.mealTime, meal.state === "upcoming" && s.textFaded]}>{meal.time}</Text>
                        <Text style={[s.mealName, meal.state === "upcoming" && s.textFaded]}>{meal.name}</Text>
                        <Text style={[s.mealDesc, meal.state === "upcoming" && s.textFaded]} numberOfLines={1}>{meal.desc}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 2 }}>
                        <Text style={[s.mealCal, meal.state === "upcoming" && s.textFaded]}>{meal.cal} kcal</Text>
                        <Text style={[s.mealPro, meal.state === "upcoming" && s.textFaded]}>{meal.pro}g pro</Text>
                        {meal.state === "current" && (
                          <TouchableOpacity style={s.logNowBtn} activeOpacity={0.8}>
                            <Text style={s.logNowText}>Log Now</Text>
                          </TouchableOpacity>
                        )}
                        {meal.state === "done" && (
                          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {/* Macro progress */}
              <View style={s.macroSummary}>
                <View style={s.macroRow}>
                  <Text style={s.macroLabel}>Daily Progress</Text>
                  <Text style={s.macroVal}>{m.cal} / {m.calT} kcal</Text>
                </View>
                <View style={s.macroTrack}>
                  <LinearGradient
                    colors={["#2BB6A6", "#3B6FD4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[s.macroFill, { width: `${Math.round(calPct * 100)}%` as any }]}
                  />
                </View>
                <View style={s.macroMinis}>
                  {[
                    { label: "Protein", val: m.pro, target: m.proT, color: "#10B981" },
                    { label: "Carbs",   val: m.carb,target: m.carbT,color: "#F59E0B" },
                    { label: "Fat",     val: m.fat, target: m.fatT, color: "#8B5CF6" },
                  ].map((mac) => (
                    <View key={mac.label} style={s.macroMini}>
                      <View style={[s.macroMiniDot, { backgroundColor: mac.color }]} />
                      <Text style={s.macroMiniText}>{mac.val}g <Text style={s.macroMiniTarget}>/ {mac.target}g</Text></Text>
                      <Text style={s.macroMiniLabel}>{mac.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          </FadeIn>

          {/* ── SECTION 3: Jonno Noticed ── */}
          <FadeIn delay={160}>
            <Card style={{ marginTop: 14 }}>
              <Text style={s.sectionTitle}>Jonno Noticed</Text>
              <View style={{ gap: 10, marginTop: 12 }}>
                {ctx.insights.map((ins) => (
                  <View key={ins.title} style={[s.insightCard, { borderLeftColor: ins.border }]}>
                    <View style={{ flex: 1 }}>
                      <View style={s.insightHeadRow}>
                        <Text style={s.insightEmoji}>{ins.icon}</Text>
                        <Text style={s.insightTitle}>{ins.title}</Text>
                      </View>
                      <Text style={s.insightBody}>{ins.body}</Text>
                    </View>
                    <TouchableOpacity
                      style={[s.insightCTA, { borderColor: ins.border }]}
                      activeOpacity={0.75}
                      onPress={() => vm.quickSend(`${ins.title}: ${ins.body} What's your recommendation?`)}
                    >
                      <Text style={[s.insightCTAText, { color: ins.border }]}>{ins.cta}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </Card>
          </FadeIn>

          {/* ── SECTION 4: Quick Actions ── */}
          <FadeIn delay={240}>
            <Card style={{ marginTop: 14 }}>
              <Text style={s.sectionTitle}>Quick Actions</Text>
              <View style={s.actionsGrid}>
                {ctx.quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.title}
                    style={s.actionTile}
                    activeOpacity={0.8}
                    disabled={vm.sending}
                    onPress={() => vm.quickSend(action.prompt)}
                  >
                    <View style={[s.actionIconWrap, { backgroundColor: `${action.color}18` }]}>
                      <Text style={s.actionEmoji}>{action.icon}</Text>
                    </View>
                    <Text style={s.actionTitle}>{action.title}</Text>
                    <Text style={s.actionSub}>{action.sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </FadeIn>

          {/* ── SECTION 5: Ask Jonno ── */}
          <FadeIn delay={320}>
            <Card style={{ marginTop: 14, marginBottom: 16 }}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Ask Jonno</Text>
                <Text style={s.askSub}>Last resort — Jonno already works in the background</Text>
              </View>

              {/* Suggestion chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
              >
                {ctx.suggestions.map((s_) => (
                  <TouchableOpacity
                    key={s_}
                    style={chip.wrap}
                    activeOpacity={0.75}
                    onPress={() => { setInputText(s_); }}
                  >
                    <Text style={chip.text}>{s_}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Last response preview */}
              {vm.sending ? (
                <View style={s.thinkingRow}>
                  <ActivityIndicator size="small" color={TEAL} />
                  <Text style={s.thinkingText}>Jonno is thinking...</Text>
                </View>
              ) : localResp ? (
                <View style={s.respPreview}>
                  <View style={s.respPreviewHeader}>
                    <View style={s.jonnoIconSmall}><Text style={s.jonnoIconSmallText}>✦</Text></View>
                    <Text style={s.respPreviewName}>Jonno</Text>
                    <TouchableOpacity onPress={() => setLocalResp(null)}>
                      <Text style={s.clearText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={s.respText} numberOfLines={chatExpanded ? undefined : 4}>{localResp}</Text>
                  {localResp.length > 160 && (
                    <TouchableOpacity onPress={() => setChatExpanded((v) => !v)} activeOpacity={0.75}>
                      <Text style={s.expandText}>{chatExpanded ? "Show less" : "Read more"}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}

              {/* Text input */}
              <View style={s.inputRow}>
                <TextInput
                  style={s.input}
                  placeholder="Ask Jonno anything..."
                  placeholderTextColor="#9CA3AF"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline={false}
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                />
                <TouchableOpacity
                  style={[s.sendBtn, (!inputText.trim() || vm.sending) && s.sendBtnDisabled]}
                  onPress={sendMessage}
                  disabled={!inputText.trim() || vm.sending}
                  activeOpacity={0.8}
                >
                  <Ionicons name="send" size={15} color={WHITE} />
                </TouchableOpacity>
              </View>
            </Card>
          </FadeIn>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Suggestion chip styles ────────────────────────────────────────────────────

const chip = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: "rgba(59,111,212,0.08)",
    borderWidth: 1,
    borderColor: "rgba(59,111,212,0.18)",
  },
  text: { fontSize: 13, fontWeight: "600", color: BLUE },
});

// ── Main styles ───────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30 },

  // Glass card
  card: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#A0C0D8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },

  // ── Header card
  headerCard: {
    borderRadius: 24,
    padding: 20,
    gap: 14,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerTop:     { flexDirection: "row", alignItems: "center", gap: 12 },
  jonnoIconWrap: { width: 42, height: 42, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  jonnoIcon:     { fontSize: 20, color: WHITE },
  jonnoTitle:    { fontSize: 17, fontWeight: "800", color: WHITE },
  jonnoSub:      { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "500", marginTop: 1 },
  onlineWrap:    { alignItems: "center", gap: 4 },
  pulseDot:      { width: 9, height: 9, borderRadius: 5, backgroundColor: "#A7F3D0", borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" },
  onlineLabel:   { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.75)" },

  statusBubble:  { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 3 },
  statusMain:    { fontSize: 14, fontWeight: "700", color: WHITE },
  statusSub:     { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "500" },

  datePill:      { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 },
  datePillText:  { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.9)" },

  // ── Section header
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle:  { fontSize: 15, fontWeight: "800", color: "#0F172A" },

  // Regen btn
  regenBtn:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, borderWidth: 1, borderColor: "rgba(43,182,166,0.3)", backgroundColor: "rgba(43,182,166,0.07)" },
  regenBtnText:  { fontSize: 12, fontWeight: "700", color: TEAL },

  // ── Timeline
  timelineRow:     { flexDirection: "row", marginTop: 14 },
  timelineCol:     { alignItems: "center", width: 22, marginTop: 4 },
  timelineDot:     { width: 10, height: 10, borderRadius: 5 },
  dotDone:         { backgroundColor: "#10B981" },
  dotCurrent:      { backgroundColor: BLUE, borderWidth: 2, borderColor: "rgba(59,111,212,0.35)", width: 13, height: 13, borderRadius: 7 },
  dotUpcoming:     { backgroundColor: "#E5E7EB", borderWidth: 1.5, borderColor: "#D1D5DB" },
  timelineLine:    { width: 2, flex: 1, backgroundColor: "#E5E7EB", marginTop: 4 },
  lineDone:        { backgroundColor: "#10B981" },
  timelineContent: { flex: 1, marginLeft: 10, paddingBottom: 12 },
  contentCurrent:  { backgroundColor: "rgba(59,111,212,0.05)", borderRadius: 14, padding: 10, borderWidth: 1, borderColor: "rgba(59,111,212,0.12)" },

  mealRow:    { flexDirection: "row", alignItems: "flex-start" },
  mealTime:   { fontSize: 10, fontWeight: "600", color: "#9CA3AF", marginBottom: 1 },
  mealName:   { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  mealDesc:   { fontSize: 11, color: "#64748B", fontWeight: "500", marginTop: 2 },
  mealCal:    { fontSize: 12, fontWeight: "700", color: "#0F172A" },
  mealPro:    { fontSize: 10, fontWeight: "600", color: "#9CA3AF" },
  textFaded:  { opacity: 0.45 },

  logNowBtn:  { marginTop: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100, backgroundColor: BLUE },
  logNowText: { fontSize: 11, fontWeight: "800", color: WHITE },

  // Macro summary
  macroSummary: { marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB", gap: 8 },
  macroRow:     { flexDirection: "row", justifyContent: "space-between" },
  macroLabel:   { fontSize: 11, fontWeight: "700", color: "#64748B" },
  macroVal:     { fontSize: 11, fontWeight: "700", color: "#0F172A" },
  macroTrack:   { height: 6, borderRadius: 100, backgroundColor: "#E5E7EB", overflow: "hidden" },
  macroFill:    { height: 6, borderRadius: 100 },
  macroMinis:   { flexDirection: "row", gap: 12, marginTop: 4 },
  macroMini:    { flex: 1, gap: 2 },
  macroMiniDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 1 },
  macroMiniText:{ fontSize: 12, fontWeight: "700", color: "#0F172A" },
  macroMiniTarget: { fontSize: 10, fontWeight: "500", color: "#9CA3AF" },
  macroMiniLabel:  { fontSize: 10, fontWeight: "500", color: "#9CA3AF" },

  // ── Insights
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FAFBFC",
    borderRadius: 14,
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  insightHeadRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  insightEmoji:   { fontSize: 14 },
  insightTitle:   { fontSize: 12, fontWeight: "800", color: "#0F172A" },
  insightBody:    { fontSize: 11, color: "#64748B", fontWeight: "500", lineHeight: 16 },
  insightCTA:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, borderWidth: 1.5, backgroundColor: WHITE },
  insightCTAText: { fontSize: 11, fontWeight: "800" },

  // ── Quick actions
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  actionTile: {
    width: "47.5%",
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#A0C0D8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionEmoji:    { fontSize: 19 },
  actionTitle:    { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  actionSub:      { fontSize: 10, fontWeight: "500", color: "#9CA3AF" },

  // ── Ask Jonno
  askSub:      { fontSize: 10, fontWeight: "500", color: "#9CA3AF", flexShrink: 1, textAlign: "right", maxWidth: 160 },

  thinkingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
  thinkingText:{ fontSize: 13, color: "#9CA3AF", fontWeight: "500" },

  respPreview: { backgroundColor: "#F8FAFC", borderRadius: 16, padding: 14, gap: 8, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  respPreviewHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  jonnoIconSmall:    { width: 24, height: 24, borderRadius: 7, backgroundColor: "rgba(59,111,212,0.12)", alignItems: "center", justifyContent: "center" },
  jonnoIconSmallText:{ fontSize: 12, color: BLUE },
  respPreviewName:   { flex: 1, fontSize: 12, fontWeight: "800", color: "#0F172A" },
  clearText:         { fontSize: 12, fontWeight: "600", color: "#9CA3AF" },
  respText:          { fontSize: 13, color: "#334155", lineHeight: 20, fontWeight: "400" },
  expandText:        { fontSize: 12, fontWeight: "700", color: BLUE, marginTop: 4 },

  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 11 : 9,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  sendBtn:         { width: 42, height: 42, borderRadius: 14, backgroundColor: BLUE, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { opacity: 0.4 },
});
