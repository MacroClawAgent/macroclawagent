"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marcus T.",
    title: "Triathlete",
    initials: "MT",
    avatarStyle: { background: "linear-gradient(135deg, #4C7DFF, #3A6FEE)" },
    quote:
      "I went from guessing my post-ride nutrition to nailing my carb targets every single day. The Strava sync is seamless — it just works.",
  },
  {
    name: "Priya K.",
    title: "Marathon Runner",
    initials: "PK",
    avatarStyle: { background: "linear-gradient(135deg, #20C7B7, #1BA89A)" },
    quote:
      "The AI chat is genuinely useful. It doesn't just tell me what to eat — it explains why, based on my actual training load and recovery needs.",
  },
  {
    name: "Jake R.",
    title: "Competitive Cyclist",
    initials: "JR",
    avatarStyle: { background: "linear-gradient(135deg, #22C55E, #16A34A)" },
    quote:
      "The Uber Eats integration alone is worth every penny. I order food that actually fits my macros after every hard ride. Life-changing.",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-28 px-6 overflow-hidden" style={{ backgroundColor: "#F4F5F7" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#20C7B7" }}>
            Athletes
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: "#1C1C1E" }}>
            Who eat{" "}
            <span style={{ color: "#20C7B7" }}>smarter.</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="p-7 flex flex-col gap-5 rounded-[20px]"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4" style={{ color: "#20C7B7", fill: "#20C7B7" }} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: "#6B7280" }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid #E5E7EB" }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={t.avatarStyle}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1C1C1E" }}>{t.name}</p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
