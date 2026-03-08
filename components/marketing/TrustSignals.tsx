"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Heart, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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

const featurePillars = [
  { icon: "🏃", headline: "Built for endurance athletes", sub: "Runners, cyclists, triathletes, and hybrid athletes" },
  { icon: "📡", headline: "Syncs with your training data", sub: "Strava and Apple Health connected on day one" },
  { icon: "🎯", headline: "Adaptive targets, every day", sub: "Macros update based on your actual training load" },
  { icon: "🛒", headline: "Targets turned into meals", sub: "From macro numbers to a real food order in one tap" },
];

export function TrustSignals() {
  return (
    <section className="relative py-32 px-6 overflow-hidden" style={{ backgroundColor: "#F4F5F7" }}>

      <div className="max-w-5xl mx-auto">
        {/* Feature pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {featurePillars.map((p, i) => (
            <motion.div
              key={p.headline}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center p-5 rounded-2xl"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB" }}
            >
              <p className="text-3xl mb-3">{p.icon}</p>
              <p className="text-sm font-bold mb-1" style={{ color: "#1C1C1E" }}>{p.headline}</p>
              <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>{p.sub}</p>
            </motion.div>
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
          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#20C7B7" }}>
            Works With
          </p>
          <h2 className="text-3xl md:text-4xl font-black" style={{ color: "#1C1C1E" }}>
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
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl min-w-[200px]`} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <div className={`${app.color} flex-shrink-0`}>{app.icon}</div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm" style={{ color: "#1C1C1E" }}>{app.name}</span>
                <span className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: "#6B7280" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22C55E" }} />
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
            className="flex items-center gap-4 px-6 py-4 rounded-2xl min-w-[200px]" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F4F5F7" }}>
              <Plus className="w-5 h-5" style={{ color: "#D1D5DB" }} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm" style={{ color: "#6B7280" }}>More Soon</span>
              <span className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Whoop, Garmin, Oura</span>
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
          <div className="p-12 rounded-[24px] max-w-2xl mx-auto relative overflow-hidden" style={{ background: "linear-gradient(135deg, #4C7DFF 0%, #3A6FEE 100%)", boxShadow: "0 12px 40px rgba(76,125,255,0.28)" }}>
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, transparent 70%)" }} />
            <h3 className="text-3xl font-black text-white mb-4 relative z-10">
              Fuel smarter with Jonno.
            </h3>
            <p className="mb-8 relative z-10" style={{ color: "rgba(255,255,255,0.80)" }}>
              Stop guessing your macros. Get early access to adaptive nutrition built for serious athletes.
            </p>
            <Link
              href="/join"
              className="inline-block font-bold px-8 py-3.5 rounded-full text-sm transition-colors relative z-10"
              style={{ backgroundColor: "#FFFFFF", color: "#4C7DFF" }}
            >
              Join the Waitlist
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
