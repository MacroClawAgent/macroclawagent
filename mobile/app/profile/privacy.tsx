import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/ui/AppHeader";

const BG    = "#F4F5F7";
const WHITE = "#FFFFFF";
const TEAL  = "#2BB6A6";
const BORDER= "#E5E7EB";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.card}>{children}</View>
    </View>
  );
}
function Para({ children }: { children: React.ReactNode }) {
  return <Text style={s.para}>{children}</Text>;
}
function Bullet({ label, detail }: { label: string; detail: string }) {
  return (
    <View style={s.bulletRow}>
      <View style={s.bulletDot} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.bulletLabel}>{label}</Text>
        <Text style={s.bulletDetail}>{detail}</Text>
      </View>
    </View>
  );
}
function DataRow({ emoji, label, detail }: { emoji: string; label: string; detail: string }) {
  return (
    <View style={s.dataRow}>
      <Text style={s.dataEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.dataLabel}>{label}</Text>
        <Text style={s.dataDetail}>{detail}</Text>
      </View>
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <AppHeader title="Privacy Policy" showBack />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🔒</Text>
          <Text style={s.heroTitle}>Privacy Policy</Text>
          <Text style={s.heroSub}>Last updated: March 2026 · MacroClaw / Jonno AI</Text>
          <View style={s.heroPill}>
            <Text style={s.heroPillText}>We never sell your data.</Text>
          </View>
        </View>

        <Section title="1. Who We Are">
          <Para>
            MacroClaw (operating as Jonno AI) is a nutrition and fitness technology company. This Privacy Policy
            explains how we collect, use, and protect your personal information when you use our App.
          </Para>
          <Para>
            Data Controller: MacroClaw Ltd{"\n"}
            Contact: privacy@jonnoai.com{"\n"}
            Website: jonnoai.com/privacy
          </Para>
        </Section>

        <Section title="2. Data We Collect">
          <DataRow emoji="👤" label="Account Information" detail="Name, email address, and password (hashed) when you register." />
          <View style={s.separator} />
          <DataRow emoji="📏" label="Body Metrics" detail="Weight, height, age, and gender that you voluntarily provide for personalisation." />
          <View style={s.separator} />
          <DataRow emoji="🥗" label="Nutrition Data" detail="Food logs, calorie intake, macro tracking, meal photos, and dietary preferences." />
          <View style={s.separator} />
          <DataRow emoji="🏃" label="Activity Data" detail="Workouts, runs, steps, and fitness data from the App or connected services (e.g. Strava)." />
          <View style={s.separator} />
          <DataRow emoji="💬" label="Chat & AI Interactions" detail="Messages you send to the Jonno AI coach. These are used to generate responses and improve the service." />
          <View style={s.separator} />
          <DataRow emoji="📱" label="Device & Usage" detail="Device type, OS version, app version, crash reports, and anonymised usage analytics." />
        </Section>

        <Section title="3. How We Use Your Data">
          <Bullet label="Personalised Nutrition Coaching" detail="We use your profile, goals, and food/activity logs to power AI-generated meal plans and recommendations." />
          <Bullet label="Service Delivery" detail="To operate the App, process orders via Smart Cart, and sync with connected integrations." />
          <Bullet label="Safety & Security" detail="To detect fraud, prevent abuse, and ensure the security of your account." />
          <Bullet label="Product Improvement" detail="Anonymised usage data helps us improve App features, fix bugs, and build better experiences." />
          <Bullet label="Communications" detail="Transactional emails (password reset, billing), and optional product updates. You can opt out of marketing at any time." />
        </Section>

        <Section title="4. AI & Data Processing">
          <Para>
            Your chat messages and context data are processed by Anthropic's Claude AI to generate coaching
            responses. Data sent to Anthropic is:
          </Para>
          <Bullet label="Minimised" detail="We only send what's needed for your query — we do not send full history or sensitive identifiers." />
          <Bullet label="Not stored by Anthropic" detail="Anthropic does not retain your data to train models per our enterprise agreement." />
          <Bullet label="Encrypted in transit" detail="All API calls are made over TLS 1.3." />
        </Section>

        <Section title="5. Data Sharing">
          <Para>We do not sell your personal data. We share data only in these limited circumstances:</Para>
          <Bullet label="Service Providers" detail="Supabase (database & auth), Anthropic (AI), Uber Eats (order fulfilment), Apple / Google (payments)." />
          <Bullet label="Strava Integration" detail="If you connect Strava, activity data is fetched from Strava with your consent and stored in our database." />
          <Bullet label="Legal Obligations" detail="We may disclose data if required by law, court order, or to protect our legal rights." />
          <Bullet label="Business Transfer" detail="In the event of a merger or acquisition, data may transfer to the new entity under the same privacy protections." />
        </Section>

        <Section title="6. Data Retention">
          <Para>
            We retain your data for as long as your account is active. If you delete your account, we will delete
            your personal data within 30 days, except where we are legally required to retain it (e.g. billing
            records for 7 years).
          </Para>
          <Para>
            AI chat messages are retained for 90 days then permanently deleted. Anonymised aggregate data (no
            personal identifiers) may be retained indefinitely for analytics.
          </Para>
        </Section>

        <Section title="7. Your Rights (GDPR & UK GDPR)">
          <Para>If you are in the UK or European Economic Area, you have the following rights:</Para>
          <Bullet label="Access" detail="Request a copy of all personal data we hold about you." />
          <Bullet label="Rectification" detail="Correct inaccurate or incomplete data." />
          <Bullet label="Erasure" detail='Request deletion of your data ("right to be forgotten").' />
          <Bullet label="Portability" detail="Receive your data in a machine-readable format." />
          <Bullet label="Restriction" detail="Request we restrict processing of your data." />
          <Bullet label="Objection" detail="Object to processing based on legitimate interests." />
          <Para>To exercise any right, email privacy@jonnoai.com. We will respond within 30 days.</Para>
        </Section>

        <Section title="8. Cookies & Tracking">
          <Para>
            The mobile App does not use browser cookies. We use Expo / React Native analytics SDKs to collect
            anonymised crash reports and usage metrics. You can opt out of analytics in Settings → Privacy.
          </Para>
        </Section>

        <Section title="9. Children's Privacy">
          <Para>
            The App is not directed to children under 16. We do not knowingly collect personal data from children.
            If you believe a child has provided us with personal information, please contact us immediately at
            privacy@jonnoai.com.
          </Para>
        </Section>

        <Section title="10. Security">
          <Para>
            We implement industry-standard security measures including TLS encryption in transit, AES-256
            encryption at rest (via Supabase), row-level security policies, and regular security audits. While we
            take security seriously, no system is 100% secure.
          </Para>
        </Section>

        <Section title="11. International Transfers">
          <Para>
            Your data is stored on Supabase infrastructure (EU region by default). If data is transferred outside
            the UK/EEA, we ensure appropriate safeguards are in place (e.g. Standard Contractual Clauses).
          </Para>
        </Section>

        <Section title="12. Changes to This Policy">
          <Para>
            We may update this Privacy Policy periodically. We will notify you of material changes in the App and
            by email. The "Last updated" date at the top reflects the most recent revision.
          </Para>
        </Section>

        <Section title="13. Contact & Complaints">
          <Para>
            For any privacy questions or to exercise your rights:{"\n"}
            📧  privacy@jonnoai.com{"\n"}
            🌐  jonnoai.com/privacy
          </Para>
          <Para>
            You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at
            ico.org.uk if you believe we have not handled your data appropriately.
          </Para>
        </Section>

        <View style={s.footer}>
          <Text style={s.footerText}>MacroClaw Ltd · All rights reserved · 2026</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: BG },
  content: { padding: 20, gap: 0, paddingBottom: 60 },

  hero: {
    alignItems: "center", paddingVertical: 24, gap: 6,
    backgroundColor: WHITE, borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    marginBottom: 20,
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: { fontSize: 22, fontWeight: "900", color: "#1C1C1E", letterSpacing: -0.4 },
  heroSub:   { fontSize: 12, color: "#9CA3AF", fontWeight: "500" },
  heroPill: {
    marginTop: 4, backgroundColor: "rgba(43,182,166,0.12)", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  heroPillText: { fontSize: 13, fontWeight: "700", color: TEAL },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 13, fontWeight: "800", color: TEAL,
    textTransform: "uppercase", letterSpacing: 0.5,
    marginBottom: 6, paddingLeft: 4,
  },
  card: {
    backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    padding: 16, gap: 10,
  },
  para: { fontSize: 14, color: "#4B5563", lineHeight: 22 },

  bulletRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL, marginTop: 6 },
  bulletLabel:  { fontSize: 13, fontWeight: "700", color: "#1C1C1E" },
  bulletDetail: { fontSize: 13, color: "#6B7280", lineHeight: 20 },

  dataRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  dataEmoji:  { fontSize: 20, marginTop: 1 },
  dataLabel:  { fontSize: 13, fontWeight: "700", color: "#1C1C1E" },
  dataDetail: { fontSize: 13, color: "#6B7280", lineHeight: 20, marginTop: 1 },

  separator: { height: 1, backgroundColor: BG },

  footer: { alignItems: "center", paddingTop: 8 },
  footerText: { fontSize: 11, color: "#C4C4C4" },
});
