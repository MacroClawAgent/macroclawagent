import React from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAgentViewModel } from "@/lib/viewModels/useAgentViewModel";
import { SmartCartCTACard } from "@/components/features/agent/SmartCartCTACard";

const AVATAR = require("../../assets/images/avatar.png");
const BG = "#EEF4FA";
const WHITE = "#FFFFFF";
const TEAL = "#2BB6A6";
const BORDER = "#E5E7EB";

// ── Macro pill ────────────────────────────────────────────────────────────────

function MacroPill({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const pctLabel = `${Math.round(pct * 100)}%`;
  return (
    <View style={pill.wrap}>
      <Text style={pill.label}>{label}</Text>
      <Text style={[pill.value, { color }]}>{value}<Text style={pill.unit}>/{target}{label === "Cal" ? "" : "g"}</Text></Text>
      <View style={pill.track}>
        <View style={[pill.fill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[pill.pct, { color }]}>{pctLabel}</Text>
    </View>
  );
}

const pill = StyleSheet.create({
  wrap: { flex: 1, gap: 3 },
  label: { fontSize: 9, fontWeight: "700", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 13, fontWeight: "800" },
  unit: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.65)" },
  track: { height: 3, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.2)", overflow: "hidden" },
  fill: { height: 3, borderRadius: 100 },
  pct: { fontSize: 9, fontWeight: "700" },
});

// ── Action card ───────────────────────────────────────────────────────────────

interface ActionCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
  fullWidth?: boolean;
}

function ActionCard({ emoji, title, subtitle, onPress, disabled, primary, fullWidth }: ActionCardProps) {
  if (primary) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.82}
        style={[card.primaryWrap, disabled && { opacity: 0.5 }]}
      >
        <LinearGradient
          colors={["#3FD4C8", "#2BB6A6", "#1E9E8F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={card.primaryGradient}
        >
          <Text style={card.primaryEmoji}>{emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={card.primaryTitle}>{title}</Text>
            <Text style={card.primarySub}>{subtitle}</Text>
          </View>
          <Text style={card.primaryArrow}>→</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.78}
      style={[card.wrap, fullWidth && card.fullWidth, disabled && { opacity: 0.5 }]}
    >
      <Text style={card.emoji}>{emoji}</Text>
      <Text style={card.title}>{title}</Text>
      <Text style={card.sub}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const card = StyleSheet.create({
  primaryWrap: { marginHorizontal: 20, borderRadius: 20, overflow: "hidden", shadowColor: TEAL, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 6 },
  primaryGradient: { flexDirection: "row", alignItems: "center", padding: 20, gap: 14 },
  primaryEmoji: { fontSize: 32 },
  primaryTitle: { fontSize: 17, fontWeight: "800", color: WHITE, letterSpacing: -0.3 },
  primarySub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2, fontWeight: "500" },
  primaryArrow: { fontSize: 22, color: "rgba(255,255,255,0.7)", fontWeight: "300" },
  wrap: { flex: 1, backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 14, gap: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 },
  fullWidth: { flex: undefined, marginHorizontal: 0 },
  emoji: { fontSize: 24 },
  title: { fontSize: 13, fontWeight: "700", color: "#1C1C1E", lineHeight: 17 },
  sub: { fontSize: 11, fontWeight: "500", color: "#9CA3AF", lineHeight: 15 },
});

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return <Text style={sec.label}>{text}</Text>;
}

const sec = StyleSheet.create({
  label: { fontSize: 11, fontWeight: "800", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8, paddingHorizontal: 20 },
});

// ── Response card ─────────────────────────────────────────────────────────────

function ResponseCard({
  text,
  sending,
  onAdjust,
  onDifferent,
}: {
  text: string | null;
  sending: boolean;
  onAdjust: () => void;
  onDifferent: () => void;
}) {
  if (!sending && !text) return null;

  return (
    <View style={resp.card}>
      <View style={resp.header}>
        <Image source={AVATAR} style={resp.avatar} />
        <View>
          <Text style={resp.name}>Jonno</Text>
          <Text style={resp.sub}>Your nutrition coach</Text>
        </View>
      </View>
      {sending ? (
        <View style={resp.loadingRow}>
          <ActivityIndicator size="small" color={TEAL} />
          <Text style={resp.loadingText}>Thinking…</Text>
        </View>
      ) : (
        <>
          <Text style={resp.text}>{text}</Text>
          <View style={resp.actions}>
            <TouchableOpacity onPress={onAdjust} style={resp.actionBtn} activeOpacity={0.75}>
              <Text style={resp.actionTxt}>Adjust it</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDifferent} style={resp.actionBtn} activeOpacity={0.75}>
              <Text style={resp.actionTxt}>Different option</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const resp = StyleSheet.create({
  card: { marginHorizontal: 20, backgroundColor: WHITE, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 11 },
  name: { fontSize: 14, fontWeight: "800", color: "#1C1C1E" },
  sub: { fontSize: 11, color: "#9CA3AF", fontWeight: "500", marginTop: 1 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  loadingText: { fontSize: 14, color: "#9CA3AF", fontWeight: "500" },
  text: { fontSize: 15, color: "#1C1C1E", lineHeight: 23, fontWeight: "400" },
  actions: { flexDirection: "row", gap: 8, paddingTop: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: BORDER },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, backgroundColor: BG, borderWidth: 1, borderColor: BORDER },
  actionTxt: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AgentScreen() {
  const vm = useAgentViewModel();
  const { macroContext: mc, activityContext: ac } = vm;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* ── Teal header with macro stats ── */}
      <LinearGradient
        colors={["#2BB6A6", "#1E9E8F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <View style={s.headerTop}>
          <Image source={AVATAR} style={s.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={s.coachName}>Jonno</Text>
            <Text style={s.coachSub}>Your AI nutrition coach</Text>
          </View>
          <View style={s.onlineDot} />
        </View>

        {/* Live macro strip */}
        <View style={s.macroStrip}>
          <MacroPill label="Cal" value={mc.calories} target={mc.caloriesTarget} color="#FFFFFF" />
          <View style={s.macroDivider} />
          <MacroPill label="Protein" value={mc.protein} target={mc.proteinTarget} color="#FCD34D" />
          <View style={s.macroDivider} />
          <MacroPill label="Carbs" value={mc.carbs} target={mc.carbsTarget} color="#A5F3FC" />
          <View style={s.macroDivider} />
          <MacroPill label="Fat" value={mc.fat} target={mc.fatTarget} color="#FCA5A5" />
        </View>
      </LinearGradient>

      {/* ── Scrollable action area ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Primary action */}
        <ActionCard
          emoji="🍽"
          title="Generate Today's Meal Plan"
          subtitle="Full day tailored to your macros & goal"
          onPress={() => vm.quickSend("Build a complete meal plan for today tailored to my goals and macros")}
          disabled={vm.sending}
          primary
        />

        {/* Nutrition section */}
        <SectionLabel text="Nutrition" />
        <View style={s.grid}>
          <ActionCard
            emoji="📅"
            title="This Week's Plan"
            subtitle="7-day meal structure"
            onPress={() => vm.quickSend("Create a full meal plan for this week")}
            disabled={vm.sending}
          />
          <ActionCard
            emoji="🥩"
            title="Hit Protein Goal"
            subtitle={`${Math.max(0, mc.proteinTarget - mc.protein)}g still to go today`}
            onPress={() => vm.quickSend("What should I eat to hit my protein goal today?")}
            disabled={vm.sending}
          />
        </View>
        <View style={s.grid}>
          <ActionCard
            emoji="⚡"
            title="Pre-Workout Fuel"
            subtitle="Optimise your energy"
            onPress={() => vm.quickSend("What should I eat before my workout?")}
            disabled={vm.sending}
          />
          <ActionCard
            emoji="🔄"
            title="Recovery Nutrition"
            subtitle={ac ? `After your ${ac.type}` : "Post-training meals"}
            onPress={() => vm.quickSend("What should I eat after training to recover?")}
            disabled={vm.sending}
          />
        </View>

        {/* Training section */}
        <SectionLabel text="Training" />
        <View style={s.grid}>
          <ActionCard
            emoji="💪"
            title="Weekly Workout Plan"
            subtitle="Structured training schedule"
            onPress={() => vm.quickSend("Create a weekly workout plan for me based on my fitness goal")}
            disabled={vm.sending}
          />
          <ActionCard
            emoji="🎯"
            title="Achieve My Goal"
            subtitle="Step-by-step strategy"
            onPress={() => vm.quickSend("What's the best strategy for me to achieve my fitness goal?")}
            disabled={vm.sending}
          />
        </View>

        {/* Smart Cart section */}
        <SectionLabel text="Smart Cart" />
        <View style={[s.grid, { paddingHorizontal: 20 }]}>
          <ActionCard
            emoji="🛒"
            title="Build Smart Cart"
            subtitle="Turn your plan into a cart"
            onPress={() => vm.quickSend("Build today's meals and save to Smart Cart")}
            disabled={vm.sending}
            fullWidth={false}
          />
          <ActionCard
            emoji="🥗"
            title="Budget Meal Plan"
            subtitle="Affordable & balanced"
            onPress={() => vm.quickSend("Create a budget-friendly meal plan for this week")}
            disabled={vm.sending}
          />
        </View>

        {/* Jonno response card */}
        {(vm.sending || vm.latestResponse) && (
          <ResponseCard
            text={vm.latestResponse}
            sending={vm.sending}
            onAdjust={() => vm.quickSend("Can you adjust that plan?")}
            onDifferent={() => vm.quickSend("Give me a completely different option")}
          />
        )}

        {/* Smart Cart CTA */}
        {vm.pendingSmartCartAction && (
          <View style={{ paddingHorizontal: 20 }}>
            <SmartCartCTACard onConfirm={vm.confirmSmartCart} onDismiss={vm.dismissSmartCart} />
          </View>
        )}

        <View style={{ height: Platform.OS === "ios" ? 40 : 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, gap: 16 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 14 },
  coachName: { fontSize: 18, fontWeight: "800", color: WHITE },
  coachSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "500", marginTop: 1 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#A7F3D0", borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" },
  macroStrip: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.12)", borderRadius: 16, padding: 14, gap: 4 },
  macroDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 4 },

  // Scroll
  scroll: { flex: 1 },
  content: { gap: 12, paddingTop: 20, paddingBottom: 40 },

  // Grid
  grid: { flexDirection: "row", gap: 10, paddingHorizontal: 20 },
});
