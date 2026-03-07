"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ShoppingBag, Heart, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
      <p className="text-4xl md:text-5xl font-black gradient-text-light">
        {isInView ? `${count.toLocaleString()}${suffix}` : value}
      </p>
      <p className="text-sm mt-2" style={{ color: "#7C7472" }}>{label}</p>
    </motion.div>
  );
}

const apps = [
  {
    icon: <Image src="/strava.png" alt="Strava" width={24} height={24} className="object-contain" />,
    name: "Strava",
    status: "Connected",
    color: "",
    bg: "bg-orange-50 border-orange-200",
    dot: "bg-orange-400",
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    name: "Uber Eats",
    status: "Connected",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-400",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    name: "Apple Health",
    status: "Connected",
    color: "text-red-500",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-400",
  },
];

const statCards = [
  { value: "12,400+", numericValue: 12400, suffix: "+", label: "Athletes using Jonno", delay: 0 },
  { value: "94%", numericValue: 94, suffix: "%", label: "Macro targets hit", delay: 0.1 },
  { value: "3.2M", numericValue: 3, suffix: ".2M", label: "Meals planned by AI", delay: 0.2 },
  { value: "4.9", numericValue: 4, suffix: ".9★", label: "Average user rating", delay: 0.3 },
];

export function TrustSignals() {
  return (
    <section className="relative py-32 px-6 overflow-hidden" style={{ backgroundColor: "#FFFDFB" }}>

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
          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#F29A69" }}>
            Works With
          </p>
          <h2 className="text-3xl md:text-4xl font-black" style={{ color: "#4A454A" }}>
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
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl min-w-[200px]`} style={{ backgroundColor: "#FFFDFB", border: "1px solid #E8DDD8", boxShadow: "0 2px 8px rgba(74,69,74,0.06)" }}
            >
              <div className={`${app.color} flex-shrink-0`}>{app.icon}</div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm" style={{ color: "#4A454A" }}>{app.name}</span>
                <span className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: "#7C7472" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F29A69" }} />
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
            className="flex items-center gap-4 px-6 py-4 rounded-2xl min-w-[200px]" style={{ backgroundColor: "#FFFDFB", border: "1px solid #E8DDD8", boxShadow: "0 2px 8px rgba(74,69,74,0.06)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              <Plus className="w-5 h-5 text-gray-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-500 text-sm">More Soon</span>
              <span className="text-xs text-gray-400 mt-0.5">Whoop, Garmin, Oura</span>
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
          <div className="p-12 rounded-[24px] max-w-2xl mx-auto relative overflow-hidden" style={{ background: "linear-gradient(135deg, #F29A69 0%, #E88367 50%, #C8E7F5 100%)", boxShadow: "0 12px 40px rgba(242,154,105,0.30)" }}>
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,253,251,0.15) 0%, transparent 70%)" }} />
            <h3 className="text-3xl font-black text-white mb-4 relative z-10">
              Ready to eat like an athlete?
            </h3>
            <p className="mb-8 relative z-10" style={{ color: "rgba(255,253,251,0.85)" }}>
              Join thousands of athletes who never guess their macros again.
            </p>
            <Link
              href="/login"
              className="inline-block font-bold px-8 py-3.5 rounded-full text-sm transition-colors relative z-10"
              style={{ backgroundColor: "#FFFDFB", color: "#E88367" }}
            >
              Start for Free — No Credit Card
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
