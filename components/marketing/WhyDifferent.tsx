"use client";

import { motion } from "framer-motion";

const comparisons = [
  {
    them: "Most apps track yesterday.",
    us: "Jonno adjusts for today's training load.",
  },
  {
    them: "Most macro tools stop at numbers.",
    us: "Jonno turns targets into actual meals, ordered and delivered.",
  },
  {
    them: "Most AI tools give generic nutrition tips.",
    us: "Jonno uses your real activity data from Strava.",
  },
  {
    them: "Most delivery apps optimise for convenience.",
    us: "Jonno optimises for performance and recovery.",
  },
];

export function WhyDifferent() {
  return (
    <section className="py-16 lg:py-20 xl:py-24 px-6 overflow-hidden" style={{ backgroundColor: "#0D0A07" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 lg:mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#F5C842" }}>
            Why Jonno
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: "#E8E0D0" }}>
            Not just another{" "}
            <span style={{ color: "#F5C842" }}>nutrition app.</span>
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "rgba(232,224,208,0.55)" }}>
            Your training changes every day. Your nutrition should too.
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {comparisons.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,220,150,0.10)" }}
            >
              {/* Them */}
              <div
                className="flex items-center gap-4 px-6 py-5"
                style={{ backgroundColor: "#1C1410" }}
              >
                <span className="text-lg flex-shrink-0" style={{ color: "rgba(232,224,208,0.25)" }}>✗</span>
                <p className="text-sm" style={{ color: "rgba(232,224,208,0.35)" }}>{c.them}</p>
              </div>
              {/* Us */}
              <div
                className="flex items-center gap-4 px-6 py-5"
                style={{ backgroundColor: "rgba(245,200,66,0.06)", borderLeft: "1px solid rgba(245,200,66,0.15)" }}
              >
                <span className="text-lg flex-shrink-0" style={{ color: "#F5C842" }}>✓</span>
                <p className="text-sm font-semibold" style={{ color: "#E8E0D0" }}>{c.us}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
