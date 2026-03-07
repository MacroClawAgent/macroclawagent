"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Brain,
  ShoppingCart,
  BarChart3,
  Target,
  RefreshCcw,
  Heart,
  ArrowRight,
  CheckCircle2,
  Bot,
  ShoppingBag,
  Star,
  Watch,
} from "lucide-react";

/* ── Mini SVG Ring (local copy from BentoShowcase) ── */
function Ring({
  pct,
  strokeColor,
  size = 64,
  strokeWidth = 6,
  label,
  value,
}: {
  pct: number;
  strokeColor: string;
  size?: number;
  strokeWidth?: number;
  label: string;
  value: string;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
        />
      </svg>
      <span className="text-[10px]" style={{ color: "#6B7280" }}>{label}</span>
      <span className="text-[11px] font-bold" style={{ color: "#1C1C1E" }}>{value}</span>
    </div>
  );
}

/* ── Hero right-side product preview ── */
function HeroPreview() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: "#6B7280" }}>Dashboard</p>
            <h3 className="text-base font-bold" style={{ color: "#1C1C1E" }}>Today&apos;s Performance</h3>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border" style={{ backgroundColor: "rgba(32,199,183,0.15)", borderColor: "#E5E7EB", color: "#20C7B7" }}>
            A
          </div>
        </div>
        <div className="flex items-center justify-around py-2">
          <Ring pct={0.76} strokeColor="#f97316" size={72} strokeWidth={7} label="Calories" value="2140" />
          <Ring pct={0.79} strokeColor="#10b981" size={72} strokeWidth={7} label="Protein" value="142g" />
          <Ring pct={0.64} strokeColor="#f59e0b" size={72} strokeWidth={7} label="Carbs" value="220g" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "647 kcal burned", color: "text-[#20C7B7]" },
            { label: "8.2km", color: "text-gray-700" },
            { label: "74 BPM avg", color: "text-red-400" },
          ].map((s) => (
            <span
              key={s.label}
              className={`text-[11px] font-semibold ${s.color} px-2.5 py-1 rounded-full border`} style={{ backgroundColor: "#F4F5F7", borderColor: "#E5E7EB" }}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 rounded-2xl flex items-start gap-3">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border" style={{ backgroundColor: "rgba(105,189,235,0.15)", borderColor: "rgba(105,189,235,0.25)" }}>
          <Bot className="w-3.5 h-3.5" style={{ color: "#4C7DFF" }} />
        </div>
        <div>
          <p className="text-[10px] font-semibold mb-1.5" style={{ color: "#6B7280" }}>Jonno Agent</p>
          <div className="rounded-xl px-3 py-2 text-[11px] leading-snug border" style={{ backgroundColor: "rgba(105,189,235,0.15)", borderColor: "#4C7DFF", color: "#1C1C1E" }}>
            Your protein is 34g short. Add grilled chicken to hit your target.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Strava spotlight mockup ── */
function StravaSpotlightCard() {
  return (
    <div className="bg-white rounded-2xl border-[rgba(32,199,183,0.20)] p-6 flex flex-col gap-5 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#20C7B7]" />
          <p className="text-base font-bold" style={{ color: "#1C1C1E" }}>Strava Sync</p>
        </div>
        <span className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: "#4C7DFF" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ backgroundColor: "#4C7DFF" }} />
          Live
        </span>
      </div>
      <div>
        <p className="text-[11px] mb-1" style={{ color: "#6B7280" }}>Last activity synced 2 min ago</p>
        <p className="text-lg font-bold" style={{ color: "#1C1C1E" }}>Morning Ride</p>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>28.4km · 1h 12m · 924 kcal</p>
      </div>
      <div className="flex items-end gap-1 h-10">
        {[45, 60, 40, 75, 65, 85, 55, 70, 80, 50, 65, 90].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full bg-[#20C7B7]/50"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border" style={{ backgroundColor: "rgba(105,189,235,0.10)", borderColor: "rgba(105,189,235,0.25)" }}>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#4C7DFF" }} />
        <p className="text-[11px] font-semibold" style={{ color: "#4C7DFF" }}>TDEE recalculated: 3,140 kcal</p>
      </div>
    </div>
  );
}

/* ── Agent spotlight mockup ── */
function AgentSpotlightCard() {
  return (
    <div className="bg-white rounded-2xl border-blue-200 p-6 flex flex-col gap-4 rounded-2xl">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center border" style={{ backgroundColor: "rgba(105,189,235,0.15)", borderColor: "rgba(105,189,235,0.25)" }}>
          <Bot className="w-4 h-4" style={{ color: "#4C7DFF" }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "#1C1C1E" }}>Jonno Agent</p>
          <p className="text-[10px] flex items-center gap-1" style={{ color: "#4C7DFF" }}>
            <span className="w-1 h-1 rounded-full animate-pulse inline-block" style={{ backgroundColor: "#4C7DFF" }} />
            Online
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-sm px-3 py-2 text-[11px] max-w-[85%] border" style={{ backgroundColor: "#F4F5F7", borderColor: "#E5E7EB", color: "#1C1C1E" }}>
            What should I eat after my 15km run?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] leading-snug max-w-[90%] border" style={{ backgroundColor: "rgba(105,189,235,0.15)", borderColor: "#4C7DFF", color: "#1C1C1E" }}>
            Based on 924 kcal burned, aim for 55g protein + 90g carbs within 45 min. Here&apos;s your top match:
          </div>
        </div>
        <div className="rounded-xl px-3 py-2.5 flex items-center justify-between border" style={{ backgroundColor: "#F4F5F7", borderColor: "#E5E7EB" }}>
          <div>
            <p className="text-[11px] font-semibold" style={{ color: "#1C1C1E" }}>Grilled Salmon Bowl</p>
            <p className="text-[10px]" style={{ color: "#6B7280" }}>42P · 38C · 18F</p>
          </div>
          <button className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
            Order →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Cart spotlight mockup ── */
function CartSpotlightCard() {
  const meals = [
    { name: "Grilled Salmon Bowl", macros: "42P · 38C · 18F", price: "$18.50" },
    { name: "Greek Chicken Wrap", macros: "38P · 52C · 14F", price: "$13.90" },
    { name: "Quinoa Power Bowl", macros: "22P · 68C · 12F", price: "$15.20" },
  ];
  return (
    <div className="bg-white rounded-2xl border-emerald-500/20 p-6 flex flex-col gap-4 rounded-2xl">
      <div className="flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-emerald-400" />
        <p className="text-base font-bold" style={{ color: "#1C1C1E" }}>Smart Cart</p>
        <span className="ml-auto text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          Macro-matched
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {meals.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border"
            style={{ backgroundColor: "#F4F5F7", borderColor: "#E5E7EB" }}
          >
            <div>
              <p className="text-[11px] font-semibold" style={{ color: "#1C1C1E" }}>{m.name}</p>
              <p className="text-[10px] font-medium" style={{ color: "#6B7280" }}>{m.macros}</p>
            </div>
            <span className="text-[11px] font-bold flex-shrink-0" style={{ color: "#1C1C1E" }}>{m.price}</span>
          </div>
        ))}
      </div>
      <div className="px-3 py-2.5 rounded-xl border" style={{ backgroundColor: "#F4F5F7", borderColor: "#E5E7EB" }}>
        <p className="text-[10px] font-medium" style={{ color: "#6B7280" }}>Remaining macros</p>
        <p className="text-[11px] font-bold mt-0.5" style={{ color: "#1C1C1E" }}>102P · 128C · 50F</p>
      </div>
      <button className="w-full py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold tracking-wide hover:bg-emerald-600/30 transition-colors">
        Build Cart →
      </button>
    </div>
  );
}

/* ── Data ── */
const pillars = [
  {
    tag: "Strava API",
    tagColor: "text-[#20C7B7] bg-[rgba(32,199,183,0.10)] border-[rgba(32,199,183,0.20)]",
    heading: "Training-aware nutrition. Automatically.",
    desc: "Every run, ride, and lift auto-syncs from Strava. Jonno reads your training load and recalculates your TDEE in real time — so your calorie targets move with your performance.",
    bullets: [
      "Auto-sync via Strava OAuth",
      "Real-time TDEE recalculation",
      "Workout history & trends",
      "Training load detection",
    ],
    checkColor: "text-[#20C7B7]",
    linkText: "Connect Strava",
    mockupRight: true,
    Mockup: StravaSpotlightCard,
  },
  {
    tag: "Claude AI",
    tagColor: "text-[#4C7DFF] bg-[rgba(105,189,235,0.10)] border-[rgba(105,189,235,0.25)]",
    heading: "An AI coach that knows your training load.",
    desc: "The Jonno Agent — powered by Anthropic's Claude — builds a personalised meal plan around your macros, schedule, and food preferences. Ask it anything: meal swaps, restaurant picks, late-night options.",
    bullets: [
      "Unlimited AI meal planning chats",
      "Macro-optimised meal suggestions",
      "Context-aware food recommendations",
      "Adapts to your eating habits",
    ],
    checkColor: "text-[#4C7DFF]",
    linkText: "Try the Agent",
    mockupRight: false,
    Mockup: AgentSpotlightCard,
  },
  {
    tag: "Uber Eats API",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    heading: "Macro-matched meals. One tap to order.",
    desc: "Stop manually searching for \"high protein options\". The Jonno Agent scans nearby restaurants on Uber Eats, matches meals to your remaining macros, and builds your cart automatically. One click to order.",
    bullets: [
      "Macro-matched restaurant meals",
      "Auto Uber Eats cart builder",
      "One-click order placement",
      "Smart meal library",
    ],
    checkColor: "text-emerald-400",
    linkText: "See how it works",
    mockupRight: true,
    Mockup: CartSpotlightCard,
  },
];

const features = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    accentColor: "bg-indigo-500",
    title: "Macro Tracking",
    desc: "Log calories, protein, carbs, and fat with precision. Visual progress rings update in real time throughout the day.",
  },
  {
    icon: <Activity className="w-5 h-5" />,
    color: "text-[#20C7B7]",
    bg: "bg-[rgba(32,199,183,0.10)]",
    accentColor: "bg-[#20C7B7]",
    title: "Activity Rings",
    desc: "A glanceable summary of your daily targets: calories burned, protein hit, carbs consumed. Like Apple Watch, but for your plate.",
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    accentColor: "bg-emerald-500",
    title: "Smart Cart",
    desc: "The AI builds an Uber Eats cart that fits your remaining macros. Never order the wrong thing again.",
  },
  {
    icon: <Target className="w-5 h-5" />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    accentColor: "bg-amber-500",
    title: "Goal Adaptation",
    desc: "Training for a marathon? Cutting for summer? Set a goal and watch your macro targets adapt automatically.",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    color: "text-red-400",
    bg: "bg-red-500/10",
    accentColor: "bg-red-500",
    title: "Health Score",
    desc: "A daily composite score based on your hydration, macro accuracy, sleep, and training load.",
  },
  {
    icon: <RefreshCcw className="w-5 h-5" />,
    color: "text-purple-600",
    bg: "bg-violet-500/10",
    accentColor: "bg-violet-500",
    title: "Daily Coaching",
    desc: "Morning briefing from the Jonno Agent: today's targets, recommended meals, and performance insights.",
  },
];

const integrations = [
  {
    name: "Strava",
    color: "text-[#20C7B7]",
    bg: "bg-[rgba(32,199,183,0.10)]",
    border: "border-[rgba(32,199,183,0.20)]",
    pulseColor: "bg-emerald-400",
    desc: "Full activity sync",
    status: "Connected",
    statusColor: "text-emerald-400",
    icon: <Activity className="w-6 h-6" />,
  },
  {
    name: "Uber Eats",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    pulseColor: "bg-emerald-400",
    desc: "Auto cart builder",
    status: "Connected",
    statusColor: "text-emerald-400",
    icon: <ShoppingBag className="w-6 h-6" />,
  },
  {
    name: "Apple Health",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    pulseColor: "bg-emerald-400",
    desc: "Health data sync",
    status: "Connected",
    statusColor: "text-emerald-400",
    icon: <Heart className="w-6 h-6" />,
  },
  {
    name: "Whoop / Garmin",
    color: "text-gray-600",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    pulseColor: "bg-amber-400",
    desc: "Coming soon",
    status: "Soon",
    statusColor: "text-amber-400",
    icon: <Watch className="w-6 h-6" />,
  },
];

const testimonials = [
  {
    name: "Marcus T.",
    role: "Triathlete",
    avatar: "MT",
    avatarGradient: "from-[#20C7B7] to-[#4C7DFF]",
    quote: "I went from guessing my post-ride nutrition to nailing my carb targets every single day. The Strava sync is seamless. It knows what I burned before I even open the app.",
  },
  {
    name: "Priya K.",
    role: "Marathon Runner",
    avatar: "PK",
    avatarGradient: "from-indigo-500 to-violet-500",
    quote: "The AI chat is genuinely useful. It doesn't just tell me what to eat. It explains why based on my actual training load. Like having a sports dietitian in my pocket.",
  },
  {
    name: "Jake R.",
    role: "Cyclist",
    avatar: "JR",
    avatarGradient: "from-emerald-500 to-teal-500",
    quote: "The Uber Eats integration alone is worth it. I order food that actually fits my macros after every hard ride. My recovery has noticeably improved.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <Navbar />
      <main className="pt-16">

        {/* ── Hero ── */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(32,199,183,0.10) 0%, transparent 70%)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(32,199,183,0.10) 0%, transparent 70%)" }} />
          <div className="max-w-6xl mx-auto px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-7"
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide self-start border" style={{ backgroundColor: "rgba(32,199,183,0.10)", borderColor: "rgba(32,199,183,0.30)", color: "#1BA89A" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Built for Strava athletes
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.92] text-[#20C7B7]">
                  Every tool a serious athlete needs.
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                  Jonno connects your training data, AI intelligence, and food delivery into one
                  seamless nutrition engine. No spreadsheets. No guesswork.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="glow" size="lg" asChild>
                    <Link href="/login">
                      Start Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/pricing">See Pricing</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "12,400+", label: "Athletes" },
                    { value: "94%", label: "Macro accuracy" },
                    { value: "3.2M", label: "Meals logged" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
                      <span className="text-sm font-black" style={{ color: "#1C1C1E" }}>{s.value}</span>
                      <span className="text-xs" style={{ color: "#6B7280" }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              {/* Right — product preview */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <HeroPreview />
              </motion.div>
            </div>
          </div>
        </section>


        {/* ── Core Features — Alternating Spotlights ── */}
        {pillars.map((pillar, i) => (
          <section
            key={pillar.tag}
            className={`py-24`}
            style={i % 2 === 1 ? { backgroundColor: "#F4F5F7" } : {}}
          >
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Text col */}
                <motion.div
                  initial={{ opacity: 0, x: pillar.mockupRight ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col gap-6 ${!pillar.mockupRight ? "lg:order-last" : ""}`}
                >
                  <span className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border self-start ${pillar.tagColor}`}>
                    {pillar.tag}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight" style={{ color: "#1C1C1E" }}>
                    {pillar.heading}
                  </h2>
                  <p className="leading-relaxed" style={{ color: "#6B7280" }}>{pillar.desc}</p>
                  <ul className="space-y-3">
                    {pillar.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-sm" style={{ color: "#6B7280" }}>
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${pillar.checkColor}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${pillar.checkColor} hover:opacity-80 transition-opacity`}
                  >
                    {pillar.linkText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                {/* Mockup col */}
                <motion.div
                  initial={{ opacity: 0, x: pillar.mockupRight ? 24 : -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={!pillar.mockupRight ? "lg:order-first" : ""}
                >
                  <pillar.Mockup />
                </motion.div>
              </div>
            </div>
          </section>
        ))}

        {/* ── Feature Grid ── */}
        <section className="py-24" style={{ backgroundColor: "#F4F5F7" }}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>
                Built-in tools
              </p>
              <h2 className="text-4xl font-black tracking-tight" style={{ color: "#1C1C1E" }}>
                Everything{" "}
                <span className="text-[#20C7B7]">included.</span>
              </h2>
              <p className="text-lg mt-4 max-w-xl mx-auto" style={{ color: "#6B7280" }}>
                No add-ons, no plugins. Every feature ships in the core product.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  className="bg-white rounded-2xl p-6 flex flex-col gap-4 group hover:border-gray-100 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    {f.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1.5" style={{ color: "#1C1C1E" }}>{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{f.desc}</p>
                  </div>
                  <div className={`h-0.5 w-full rounded-full ${f.accentColor}/30`} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Integrations ── */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>
                Integrations
              </p>
              <h2 className="text-4xl font-black text-[#20C7B7]">Fits into your life.</h2>
              <p className="text-lg mt-4 max-w-xl mx-auto" style={{ color: "#6B7280" }}>
                Works with the apps you already use. More integrations launching soon.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {integrations.map((int, i) => (
                <motion.div
                  key={int.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className={`light-card p-6 flex flex-col items-center text-center gap-4 border ${int.border} hover:border-gray-100 transition-all duration-300`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${int.bg} ${int.color} flex items-center justify-center`}>
                    {int.icon}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${int.color}`}>{int.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{int.desc}</p>
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-1.5 ${int.statusColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${int.pulseColor} ${int.status === "Connected" ? "animate-pulse" : ""}`} />
                    {int.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social Proof ── */}
        <section className="py-24" style={{ backgroundColor: "#F4F5F7" }}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>
                Athlete reviews
              </p>
              <h2 className="text-4xl font-black text-[#20C7B7]">Athletes who eat smarter.</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-7 flex flex-col gap-5"
                >
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-[#20C7B7]" style={{ color: "#20C7B7" }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "#1C1C1E" }}>&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#1C1C1E" }}>{t.name}</p>
                      <p className="text-xs" style={{ color: "#6B7280" }}>{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-10 lg:p-14 flex flex-col lg:flex-row items-center gap-10 lg:gap-14 border" style={{ borderColor: "#E5E7EB" }}
            >
              {/* Mascot — left */}
              <div className="flex-shrink-0">
                <Image
                  src="/fuelsmarter.png"
                  alt="Jonno mascot"
                  width={240}
                  height={240}
                  className="object-contain drop-shadow-xl"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              {/* Text — right */}
              <div className="flex flex-col gap-6 text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-black text-[#20C7B7]">Ready to fuel smarter?</h2>
                <p className="text-lg max-w-md" style={{ color: "#6B7280" }}>
                  Create your free account and let the Jonno Agent take over your nutrition in under 5 minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button variant="glow" size="lg" asChild>
                    <Link href="/login">
                      Get Started Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/pricing">See Pricing</Link>
                  </Button>
                </div>
                <p className="text-xs" style={{ color: "#6B7280" }}>No credit card required · Cancel anytime</p>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
