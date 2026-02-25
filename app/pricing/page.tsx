"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, ChevronDown, ArrowRight, Zap } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "The essentials to start tracking smarter.",
    cta: "Get Started",
    featured: false,
    features: [
      "Basic macro tracking (calories, protein, carbs, fat)",
      "1 AI Claw Agent query per day",
      "Strava activity sync",
      "Manual meal logging",
      "Activity rings dashboard",
      "Health profile & goals",
    ],
    missing: [
      "Uber Eats cart builder",
      "Unlimited AI coaching",
      "Smart meal library",
      "Weekly coaching reports",
      "Body composition tracking",
    ],
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    desc: "The full Claw Agent experience for committed athletes.",
    cta: "Start Pro Free",
    featured: true,
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "Unlimited AI Claw Agent chats",
      "Uber Eats smart cart builder",
      "Macro-matched restaurant suggestions",
      "Smart meal library & saved meals",
      "Priority Strava sync (real-time)",
      "Advanced macro analytics",
      "Goal adaptation engine",
    ],
    missing: [
      "Weekly AI coaching reports",
      "Body composition tracking",
    ],
  },
  {
    name: "Elite",
    price: "$24.99",
    period: "/month",
    desc: "For athletes who treat nutrition like a training variable.",
    cta: "Go Elite",
    featured: false,
    features: [
      "Everything in Pro",
      "Weekly AI coaching reports",
      "Body composition tracking",
      "Training periodisation nutrition",
      "Early access to new features",
      "Priority support",
      "Export data (CSV/JSON)",
    ],
    missing: [],
  },
];

const comparison = [
  { feature: "Macro tracking", free: true, pro: true, elite: true },
  { feature: "Strava sync", free: true, pro: true, elite: true },
  { feature: "AI queries per day", free: "1", pro: "Unlimited", elite: "Unlimited" },
  { feature: "Uber Eats cart builder", free: false, pro: true, elite: true },
  { feature: "Smart meal library", free: false, pro: true, elite: true },
  { feature: "Weekly coaching reports", free: false, pro: false, elite: true },
  { feature: "Body composition tracking", free: false, pro: false, elite: true },
  { feature: "Early access", free: false, pro: false, elite: true },
];

const faqs = [
  {
    q: "Is there a free trial for Pro?",
    a: "Yes — new accounts get a 14-day Pro trial with full access to all Pro features. No credit card required to start. You'll only be charged if you choose to stay after the trial.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel from your account settings at any moment. Your access continues until the end of the billing period and you won't be charged again.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Your data is always yours. If you downgrade from Pro to Free, your meal history, activity data, and profile are preserved. You just lose access to Pro-only features going forward.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Annual plans are coming soon with a ~20% discount. Join the waitlist and we'll notify you when they launch.",
  },
  {
    q: "Can I switch between plans mid-cycle?",
    a: "Yes. Upgrades take effect immediately and you're only charged the prorated difference. Downgrades take effect at the end of your current billing cycle.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-white/[0.07] py-5 cursor-pointer"
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-100">{q}</p>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-slate-400 mt-3 leading-relaxed overflow-hidden"
          >
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckOrX({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-xs font-semibold text-indigo-300">{value}</span>;
  }
  return value ? (
    <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
  ) : (
    <X className="w-4 h-4 text-slate-700 mx-auto" />
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#08090D]">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-indigo-900/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-violet-900/08 blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
                Simple pricing
              </p>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight gradient-text mb-4">
                Start free.<br className="hidden md:block" /> Upgrade when you're ready.
              </h1>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">
                No hidden fees. No annual lock-in. Cancel anytime.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tier Cards */}
        <section className="pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {tiers.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`glass-card p-8 flex flex-col gap-6 relative ${
                    tier.featured ? "glow-border" : ""
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/30">
                        <Zap className="w-3 h-3" />
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div>
                    <p className="text-sm font-semibold text-slate-400 mb-1">{tier.name}</p>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-4xl font-black text-slate-100">{tier.price}</span>
                      <span className="text-sm text-slate-500 mb-1.5">{tier.period}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{tier.desc}</p>
                  </div>

                  {/* CTA */}
                  <Button
                    variant={tier.featured ? "glow" : "outline"}
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link href="/login">
                      {tier.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>

                  {/* Features */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Included
                    </p>
                    <ul className="space-y-2.5">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                      {tier.missing.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                          <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-mesh-section">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-black gradient-text">Compare plans</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card overflow-hidden"
            >
              {/* Table header */}
              <div className="grid grid-cols-4 gap-4 p-5 border-b border-white/[0.07] bg-white/[0.02]">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Feature</div>
                {["Free", "Pro", "Elite"].map((t) => (
                  <div key={t} className={`text-xs font-bold text-center uppercase tracking-wide ${t === "Pro" ? "text-indigo-400" : "text-slate-400"}`}>
                    {t}
                  </div>
                ))}
              </div>

              {comparison.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-4 gap-4 px-5 py-4 ${
                    i < comparison.length - 1 ? "border-b border-white/[0.04]" : ""
                  } ${i % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"}`}
                >
                  <div className="text-sm text-slate-300">{row.feature}</div>
                  <div className="text-center"><CheckOrX value={row.free} /></div>
                  <div className="text-center"><CheckOrX value={row.pro} /></div>
                  <div className="text-center"><CheckOrX value={row.elite} /></div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="max-w-2xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-black gradient-text">Billing questions</h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="py-16 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-slate-400 text-lg mb-6">
                Still deciding? Start with Free. Upgrade when the Claw Agent earns it.
              </p>
              <Button variant="glow" size="lg" asChild>
                <Link href="/login">Create Free Account</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
