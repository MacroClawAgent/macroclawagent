"use client";

import { motion } from "framer-motion";
import { Activity, Sparkles, ShoppingCart, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: <Activity className="w-7 h-7" />,
    iconBg: "bg-orange-500/20 text-orange-400",
    glowColor: "rgba(249, 115, 22, 0.15)",
    title: "Sync Your Activity",
    description:
      "Connect Strava and import runs, rides, and workouts automatically. MacroClawAgent reads your real-time calorie deficit.",
    tag: "Strava API",
    tagColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  },
  {
    step: "02",
    icon: <Sparkles className="w-7 h-7" />,
    iconBg: "bg-green-500/20 text-green-400",
    glowColor: "rgba(74, 222, 128, 0.15)",
    title: "AI Plans Your Meals",
    description:
      "Claude analyzes your workout, current macros, and goals. It builds a personalized meal plan optimized for recovery and performance.",
    tag: "Claude AI",
    tagColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    step: "03",
    icon: <ShoppingCart className="w-7 h-7" />,
    iconBg: "bg-blue-500/20 text-blue-400",
    glowColor: "rgba(59, 130, 246, 0.15)",
    title: "Uber Eats Delivers",
    description:
      "Your optimized meal cart is built and ready to order with one tap. The exact macros you need, delivered to your door.",
    tag: "Uber Eats API",
    tagColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
];

export function ProcessFlow() {
  return (
    <section
      id="features"
      className="relative py-32 px-6 bg-mesh-section overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">
            How It Works
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-green-50 tracking-tight">
            How the{" "}
            <span className="gradient-text">Claw Works</span>
          </h2>
          <p className="mt-4 text-green-300/60 max-w-xl mx-auto text-lg">
            Three steps from sweat to sustenance. Fully automated.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px">
            <div className="h-full border-t border-dashed border-white/15" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div
                  className="glass-card p-8 h-full flex flex-col gap-6 hover:border-white/15 transition-all duration-300 group"
                  style={{
                    boxShadow: `0 0 60px ${step.glowColor}`,
                  }}
                >
                  {/* Step number + icon */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${step.iconBg} transition-transform duration-300 group-hover:scale-110`}
                    >
                      {step.icon}
                    </div>
                    <span className="text-5xl font-black text-white/5 leading-none font-mono">
                      {step.step}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-3 flex-1">
                    <h3 className="text-xl font-bold text-green-50">
                      {step.title}
                    </h3>
                    <p className="text-green-300/60 text-sm leading-relaxed flex-1">
                      {step.description}
                    </p>
                  </div>

                  {/* Tag */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${step.tagColor}`}
                    >
                      {step.tag}
                    </span>
                  </div>
                </div>

                {/* Mobile arrow connector */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center py-2">
                    <ArrowRight className="w-5 h-5 text-white/20 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
