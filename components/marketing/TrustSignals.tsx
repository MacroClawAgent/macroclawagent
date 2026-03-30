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
    <section className="relative py-16 lg:py-24 xl:py-32 px-6 overflow-hidden" style={{ backgroundColor: "#0D0A07" }}>

      <div className="max-w-5xl mx-auto">
        {/* Feature pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 lg:mb-20 xl:mb-24">
          {featurePillars.map((p, i) => (
            <motion.div
              key={p.headline}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center p-5 rounded-2xl"
              style={{ backgroundColor: "#1C1410", border: "1px solid rgba(255,220,150,0.10)" }}
            >
              <p className="text-3xl mb-3">{p.icon}</p>
              <p className="text-sm font-bold mb-1" style={{ color: "#E8E0D0" }}>{p.headline}</p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(232,224,208,0.45)" }}>{p.sub}</p>
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
          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#F5C842" }}>
            Works With
          </p>
          <h2 className="text-3xl md:text-4xl font-bebas tracking-wide" style={{ color: "#E8E0D0" }}>
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
              className="flex items-center gap-4 px-6 py-4 rounded-2xl min-w-[200px]" style={{ backgroundColor: "#1C1410", border: "1px solid rgba(255,220,150,0.10)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
            >
              <div className="flex-shrink-0" style={{ color: "rgba(232,224,208,0.65)" }}>{app.icon}</div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm" style={{ color: "#E8E0D0" }}>{app.name}</span>
                <span className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: "rgba(232,224,208,0.45)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#8B9E6E" }} />
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
            className="flex items-center gap-4 px-6 py-4 rounded-2xl min-w-[200px]" style={{ backgroundColor: "#1C1410", border: "1px solid rgba(255,220,150,0.10)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,220,150,0.06)" }}>
              <Plus className="w-5 h-5" style={{ color: "rgba(232,224,208,0.25)" }} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm" style={{ color: "rgba(232,224,208,0.50)" }}>More Soon</span>
              <span className="text-xs mt-0.5" style={{ color: "rgba(232,224,208,0.30)" }}>Whoop, Garmin, Oura</span>
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
          <div className="p-12 rounded-[24px] max-w-2xl mx-auto relative overflow-hidden" style={{ background: "linear-gradient(135deg, #E07B54 0%, #3D2218 100%)", boxShadow: "0 12px 40px rgba(224,123,84,0.25)", border: "1px solid rgba(224,123,84,0.25)" }}>
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(245,200,66,0.15) 0%, transparent 70%)" }} />
            <h3 className="text-3xl font-bebas tracking-wide mb-4 relative z-10" style={{ color: "#F5C842" }}>
              Fuel smarter with Jonno.
            </h3>
            <p className="mb-8 relative z-10" style={{ color: "rgba(232,224,208,0.75)" }}>
              Stop guessing your macros. Get early access to adaptive nutrition built for serious athletes.
            </p>
            <Link
              href="/join"
              className="inline-block font-bold px-8 py-3.5 rounded-full text-sm transition-colors relative z-10 hover:opacity-90"
              style={{ backgroundColor: "#F5C842", color: "#1C1410" }}
            >
              Join the Waitlist
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
