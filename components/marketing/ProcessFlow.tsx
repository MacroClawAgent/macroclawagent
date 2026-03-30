"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, ShoppingCart, Check } from "lucide-react";

/* ── Mini phone frame wrapper ── */
function MiniPhone({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative mx-auto select-none scale-[0.82] md:scale-90 lg:scale-100 origin-center"
      style={{ width: 228, height: 468 }}
    >
      <div
        className="absolute inset-0 rounded-[42px] p-[9px]"
        style={{
          background: "linear-gradient(145deg, #2A1F14 0%, #1C1410 100%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(245,200,66,0.10) inset",
        }}
      >
        <div className="w-full h-full rounded-[35px] overflow-hidden relative" style={{ backgroundColor: "#0D0A07" }}>
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[76px] h-[22px] rounded-b-[16px] z-20" style={{ backgroundColor: "#1C1410" }} />
          {/* Status bar */}
          <div className="pt-7 px-4 flex justify-between items-center mb-1">
            <span className="text-[8px] font-black" style={{ color: "#E8E0D0" }}>9:41</span>
            <div className="flex items-center gap-1">
              <svg width="10" height="7" viewBox="0 0 10 7"><rect x="0" y="1.5" width="1.8" height="5.5" rx="0.4" fill="#E8E0D0" opacity="0.3"/><rect x="2.6" y="0.8" width="1.8" height="6.2" rx="0.4" fill="#E8E0D0" opacity="0.5"/><rect x="5.2" y="0" width="1.8" height="7" rx="0.4" fill="#E8E0D0" opacity="0.8"/><rect x="7.8" y="0" width="1.8" height="7" rx="0.4" fill="#E8E0D0"/></svg>
              <svg width="12" height="7" viewBox="0 0 12 7"><rect x="0.5" y="0.5" width="9.5" height="6" rx="1.5" stroke="#E8E0D0" strokeOpacity="0.35"/><rect x="1.5" y="1.5" width="6.5" height="4" rx="0.8" fill="#E8E0D0"/><path d="M10.8 2.2v2.6a1.3 1.3 0 0 0 0-2.6z" fill="#E8E0D0" fillOpacity="0.35"/></svg>
            </div>
          </div>
          {children}
        </div>
      </div>
      {/* Side buttons */}
      <div className="absolute top-[88px] -right-[3px] w-[3px] h-8 rounded-r-full" style={{ backgroundColor: "#3D2A1A" }} />
      <div className="absolute top-[138px] -left-[3px] w-[3px] h-6 rounded-l-full" style={{ backgroundColor: "#3D2A1A" }} />
      <div className="absolute top-[170px] -left-[3px] w-[3px] h-6 rounded-l-full" style={{ backgroundColor: "#3D2A1A" }} />
    </div>
  );
}

/* ── Step 1: Strava Sync screen ── */
function StravaScreen() {
  const activities = [
    { type: "Run", name: "Morning Run", km: "10.2", kcal: "847", time: "54 min", bars: [4,6,3,7,5,8,6,5] },
    { type: "Ride", name: "Evening Ride", km: "28.4", kcal: "924", time: "1h 12m", bars: [5,7,4,8,6,9,7,6] },
  ];
  return (
    <MiniPhone>
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black" style={{ color: "#E8E0D0" }}>Activities</p>
          <span className="text-[8px] font-semibold flex items-center gap-1" style={{ color: "#8B9E6E" }}>
            <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: "#8B9E6E" }} />Live
          </span>
        </div>
        {/* Strava connected badge */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3" style={{ backgroundColor: "rgba(224,123,84,0.12)", border: "1px solid rgba(224,123,84,0.25)" }}>
          <Image src="/strava.png" alt="Strava" width={14} height={14} className="object-contain" />
          <p className="text-[9px] font-bold" style={{ color: "#E07B54" }}>Strava synced</p>
          <Check className="w-3 h-3 ml-auto" style={{ color: "#E07B54" }} />
        </div>
        {activities.map((a, i) => (
          <div key={i} className="rounded-[14px] p-3 mb-2" style={{ backgroundColor: "#1C1410", border: "1px solid rgba(255,220,150,0.10)" }}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[7.5px] font-bold uppercase tracking-wider" style={{ color: "#E07B54" }}>{a.type}</span>
                <p className="text-[9.5px] font-black" style={{ color: "#E8E0D0" }}>{a.name}</p>
              </div>
              <span className="text-[8px] font-bold" style={{ color: "rgba(232,224,208,0.40)" }}>{a.time}</span>
            </div>
            <div className="flex items-end gap-[2px] h-5 mb-2">
              {a.bars.map((h, j) => (
                <div key={j} className="flex-1 rounded-full" style={{ height: `${h * 2.2}px`, backgroundColor: "rgba(224,123,84,0.65)" }} />
              ))}
            </div>
            <div className="flex gap-3">
              <span className="text-[8px] font-bold" style={{ color: "rgba(232,224,208,0.70)" }}>{a.km} km</span>
              <span className="text-[8px] font-semibold" style={{ color: "#E07B54" }}>{a.kcal} kcal</span>
            </div>
          </div>
        ))}
        {/* Macro adjusted pill */}
        <div className="mt-2 rounded-xl px-3 py-2 flex items-center gap-2" style={{ backgroundColor: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.20)" }}>
          <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: "#F5C842" }} />
          <p className="text-[8px] font-semibold leading-tight" style={{ color: "#F5C842" }}>Macro targets updated for today&apos;s load</p>
        </div>
      </div>
    </MiniPhone>
  );
}

/* ── Step 2: AI Macro screen ── */
function AIScreen() {
  return (
    <MiniPhone>
      <div className="px-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F5C842" }}>
            <Sparkles className="w-3 h-3" style={{ color: "#1C1410" }} />
          </div>
          <div>
            <p className="text-[10px] font-black" style={{ color: "#E8E0D0" }}>Jonno Agent</p>
            <p className="text-[7.5px] font-semibold flex items-center gap-1" style={{ color: "#8B9E6E" }}>
              <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: "#8B9E6E" }} />Online
            </p>
          </div>
        </div>
        {/* Macro rings row */}
        <div className="flex gap-1.5 mb-3">
          {[
            { label: "Cal", val: "2140", pct: 0.75, color: "#F5C842", track: "rgba(245,200,66,0.15)" },
            { label: "P", val: "142g", pct: 0.79, color: "#E07B54", track: "rgba(224,123,84,0.15)" },
            { label: "C", val: "220g", pct: 0.65, color: "#8B9E6E", track: "rgba(139,158,110,0.15)" },
          ].map((m) => {
            const r = 14; const circ = 2 * Math.PI * r;
            return (
              <div key={m.label} className="flex-1 rounded-[12px] p-2 flex flex-col items-center gap-1" style={{ backgroundColor: "#1C1410", border: "1px solid rgba(255,220,150,0.10)" }}>
                <svg width={r*2+6} height={r*2+6} className="-rotate-90">
                  <circle cx={r+3} cy={r+3} r={r} fill="none" stroke={m.track} strokeWidth={4} />
                  <circle cx={r+3} cy={r+3} r={r} fill="none" stroke={m.color} strokeWidth={4}
                    strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - m.pct)} />
                </svg>
                <p className="text-[7.5px] font-black" style={{ color: "#E8E0D0" }}>{m.val}</p>
                <p className="text-[6.5px] font-medium" style={{ color: "rgba(232,224,208,0.40)" }}>{m.label}</p>
              </div>
            );
          })}
        </div>
        {/* Chat */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <div className="rounded-[12px] rounded-tr-sm px-2.5 py-1.5 text-[8.5px] max-w-[80%]" style={{ backgroundColor: "rgba(255,220,150,0.06)", border: "1px solid rgba(255,220,150,0.12)", color: "rgba(232,224,208,0.80)" }}>
              What should I eat before my long run?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="rounded-[12px] rounded-tl-sm px-2.5 py-2 text-[8.5px] leading-relaxed max-w-[88%]" style={{ backgroundColor: "#F5C842", color: "#1C1410", fontWeight: 600 }}>
              Based on your 15km plan, aim for 80g carbs 3hrs before. Oat porridge + banana fits perfectly. 🍌
            </div>
          </div>
          <div className="flex justify-end">
            <div className="rounded-[12px] rounded-tr-sm px-2.5 py-1.5 text-[8.5px] max-w-[80%]" style={{ backgroundColor: "rgba(255,220,150,0.06)", border: "1px solid rgba(255,220,150,0.12)", color: "rgba(232,224,208,0.80)" }}>
              Can you build my meal plan?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="rounded-[12px] rounded-tl-sm px-2.5 py-2 text-[8.5px] leading-relaxed max-w-[88%]" style={{ backgroundColor: "#F5C842", color: "#1C1410", fontWeight: 600 }}>
              Done ✓ Your plan is ready in Smart Cart.
            </div>
          </div>
        </div>
      </div>
    </MiniPhone>
  );
}

/* ── Step 3: Smart Cart screen ── */
function CartScreen() {
  const meals = [
    { name: "Grilled Salmon Bowl", macros: "42P · 38C · 18F", price: "$18.50" },
    { name: "Greek Chicken Wrap", macros: "38P · 52C · 14F", price: "$13.90" },
    { name: "Quinoa Power Bowl", macros: "22P · 68C · 12F", price: "$15.20" },
  ];
  return (
    <MiniPhone>
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black" style={{ color: "#E8E0D0" }}>Smart Cart</p>
          <span className="text-[7.5px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#8B9E6E", backgroundColor: "rgba(139,158,110,0.12)", border: "1px solid rgba(139,158,110,0.25)" }}>
            Macro-matched
          </span>
        </div>
        {/* Progress to goal */}
        <div className="rounded-xl p-2.5 mb-3" style={{ backgroundColor: "rgba(139,158,110,0.10)", border: "1px solid rgba(139,158,110,0.22)" }}>
          <div className="flex justify-between mb-1">
            <p className="text-[8px] font-semibold" style={{ color: "#8B9E6E" }}>Protein goal</p>
            <p className="text-[8px] font-black" style={{ color: "#8B9E6E" }}>102g / 142g</p>
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: "rgba(139,158,110,0.15)" }}>
            <div className="h-full rounded-full" style={{ width: "72%", backgroundColor: "#8B9E6E" }} />
          </div>
        </div>
        {/* Meals */}
        {meals.map((m, i) => (
          <div key={i} className="flex items-center justify-between rounded-[12px] px-3 py-2 mb-1.5" style={{ backgroundColor: "#1C1410", border: "1px solid rgba(255,220,150,0.10)" }}>
            <div>
              <p className="text-[9px] font-bold" style={{ color: "#E8E0D0" }}>{m.name}</p>
              <p className="text-[7.5px] font-medium" style={{ color: "rgba(232,224,208,0.40)" }}>{m.macros}</p>
            </div>
            <p className="text-[9px] font-black" style={{ color: "#F5C842" }}>{m.price}</p>
          </div>
        ))}
        {/* Order button */}
        <button className="mt-2 w-full py-2.5 rounded-xl text-[9px] font-black tracking-wide" style={{ backgroundColor: "#F5C842", color: "#1C1410" }}>
          Order on Uber Eats →
        </button>
      </div>
    </MiniPhone>
  );
}

const steps = [
  {
    number: "01",
    label: "Strava API",
    labelStyle: { color: "#E07B54", backgroundColor: "rgba(224,123,84,0.10)", border: "1px solid rgba(224,123,84,0.28)" },
    subtitle: "Connected automatically",
    title: "Sync your training.",
    description:
      "Connect Strava once and your activities sync automatically. Jonno reads your training load (runs, rides, swims) and adjusts your daily calorie and macro targets based on session type, intensity, and your goals.",
    screen: <StravaScreen />,
    reverse: false,
  },
  {
    number: "02",
    label: "Claude AI",
    labelStyle: { color: "#F5C842", backgroundColor: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.28)" },
    subtitle: "Personalized to your goals",
    title: "AI plans your macros.",
    description:
      "Claude analyzes your workout intensity, recovery needs, and personal goals. It calculates personalized daily macro targets for protein, carbs, and fat, then answers any nutrition question you have in plain English, 24/7.",
    screen: <AIScreen />,
    reverse: true,
  },
  {
    number: "03",
    label: "Uber Eats",
    labelStyle: { color: "#8B9E6E", backgroundColor: "rgba(139,158,110,0.08)", border: "1px solid rgba(139,158,110,0.28)" },
    subtitle: "One tap to your door",
    title: "Order food that fits.",
    description:
      "Your macro-matched meal cart is built and ready to order with one tap. Real restaurants, real meals, real macros, delivered to your door exactly when you need them. No more guessing.",
    screen: <CartScreen />,
    reverse: false,
  },
];

export function ProcessFlow() {
  return (
    <section id="how-it-works" className="py-16 lg:py-24 px-6 overflow-hidden" style={{ backgroundColor: "#1C1410" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-20"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#F5C842" }}>
            How It Works
          </p>
          <h2 className="text-4xl md:text-5xl font-bebas tracking-wide" style={{ color: "#E8E0D0" }}>
            Hit your goals in{" "}
            <span style={{ color: "#F5C842" }}>3 steps.</span>
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "rgba(232,224,208,0.55)" }}>
            From training session to optimised plate. Fully automated.
          </p>
        </motion.div>

        {/* Alternating steps */}
        <div className="flex flex-col gap-16 lg:gap-24 xl:gap-28">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className={`flex flex-col ${step.reverse ? "lg:flex-row-reverse" : "lg:flex-row"} gap-10 lg:gap-16 xl:gap-20 items-center`}
            >
              {/* Text column */}
              <div className="flex-1 flex flex-col gap-5">
                <span className="text-6xl lg:text-[88px] font-black leading-none font-mono select-none -mb-4" style={{ color: "rgba(255,220,150,0.10)" }}>
                  {step.number}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(232,224,208,0.40)" }}>{step.subtitle}</p>
                  <h3 className="text-3xl md:text-4xl font-bebas tracking-wide leading-tight" style={{ color: "#E8E0D0" }}>{step.title}</h3>
                </div>
                <p className="leading-relaxed text-base max-w-md" style={{ color: "rgba(232,224,208,0.55)" }}>{step.description}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full w-fit" style={step.labelStyle}>
                  {step.label}
                </span>
              </div>

              {/* Phone column */}
              <div className="flex-1 flex justify-center lg:justify-center">
                {step.screen}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
