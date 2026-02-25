"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Activity, ShoppingBag, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/* ── Count-up hook ── */
function useCountUp(target: number, duration = 1500, enabled = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, enabled]);
  return count;
}

function StatCard({ value, numericValue, suffix, label, delay }: {
  value: string;
  numericValue: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const count = useCountUp(numericValue, 1600, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <p className="text-4xl md:text-5xl font-black gradient-text">
        {isInView ? `${count.toLocaleString()}${suffix}` : value}
      </p>
      <p className="text-slate-500 text-sm mt-2">{label}</p>
    </motion.div>
  );
}

const apps = [
  {
    icon: <Activity className="w-6 h-6" />,
    name: "Strava",
    status: "Connected",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    dot: "bg-orange-400",
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    name: "Uber Eats",
    status: "Connected",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    name: "Apple Health",
    status: "Connected",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-400",
  },
];

const statCards = [
  { value: "12,400+", numericValue: 12400, suffix: "+", label: "Athletes using MacroClawAgent", delay: 0 },
  { value: "94%", numericValue: 94, suffix: "%", label: "Macro targets hit", delay: 0.1 },
  { value: "3.2M", numericValue: 3, suffix: ".2M", label: "Meals planned by AI", delay: 0.2 },
  { value: "4.9", numericValue: 4, suffix: ".9★", label: "Average user rating", delay: 0.3 },
];

export function TrustSignals() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Subtle top border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <div className="max-w-5xl mx-auto">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Apps section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-3">
            Works With
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-100">
            Your Favorite Apps
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          {apps.map((app, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl glass border ${app.bg} min-w-[200px]`}
            >
              <div className={`${app.color} flex-shrink-0`}>{app.icon}</div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-100 text-sm">{app.name}</span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${app.dot}`} />
                  {app.status}
                </span>
              </div>
            </motion.div>
          ))}

          {/* More coming */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl glass border border-white/[0.05] min-w-[200px]"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
              <Plus className="w-5 h-5 text-white/25" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-400 text-sm">More Soon</span>
              <span className="text-xs text-slate-600 mt-0.5">Whoop, Garmin, Oura</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="glass-card p-12 glow-border max-w-2xl mx-auto">
            <h3 className="text-3xl font-black text-slate-100 mb-4">
              Ready to eat like an <span className="gradient-text">athlete</span>?
            </h3>
            <p className="text-slate-400 mb-8">
              Join thousands of athletes who never guess their macros again.
            </p>
            <Button size="xl" variant="glow" asChild>
              <Link href="/login">
                Start for Free — No Credit Card
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
