"use client";

import { motion } from "framer-motion";
import { Sparkles, ShoppingCart, ArrowRight } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    step: "01",
    icon: <Image src="/strava.png" alt="Strava" width={28} height={28} className="object-contain" />,
    iconBg: "bg-orange-50 text-orange-500 border border-orange-200",
    title: "Sync Your Activity",
    description:
      "Connect Strava and import runs, rides, and workouts automatically. MacroClawAgent reads your real-time calorie deficit.",
    tag: "Strava API",
    tagColor: "text-orange-600 bg-orange-50 border-orange-200",
  },
  {
    step: "02",
    icon: <Sparkles className="w-7 h-7" />,
    iconBg: "bg-blue-50 text-blue-600 border border-blue-200",
    title: "AI Plans Your Meals",
    description:
      "Claude analyzes your workout, current macros, and goals. It builds a personalized meal plan optimized for recovery and performance.",
    tag: "Claude AI",
    tagColor: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    step: "03",
    icon: <ShoppingCart className="w-7 h-7" />,
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    title: "Uber Eats Delivers",
    description:
      "Your optimized meal cart is built and ready to order with one tap. The exact macros you need, delivered to your door.",
    tag: "Uber Eats API",
    tagColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
];

export function ProcessFlow() {
  return (
    <section
      id="how-it-works"
      className="relative py-32 px-6 bg-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative flex flex-col items-center gap-8 mb-20 sm:min-h-[280px] sm:justify-center"
        >
          {/* Mascot image — absolute left on desktop, stacked on mobile */}
          <div className="sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2">
            <Image
              src="/howitworks.png"
              alt="MacroClaw surfing"
              width={300}
              height={300}
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {/* Text — centered across full container width */}
          <div className="text-center">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-4">
              How It Works
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              How the{" "}
              <span className="gradient-text-light">Claw Works</span>
            </h2>
            <p className="mt-4 text-gray-600 max-w-xl text-lg mx-auto">
              Three steps from sweat to sustenance. Fully automated.
            </p>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px">
            <div className="h-full border-t border-dashed border-gray-200" />
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
                  className="light-card p-8 h-full flex flex-col gap-6 hover:border-gray-200 transition-all duration-300 group"
                >
                  {/* Step number + icon */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${step.iconBg} transition-transform duration-300 group-hover:scale-110`}
                    >
                      {step.icon}
                    </div>
                    <span className="text-4xl font-black text-blue-100 leading-none font-mono">
                      {step.step}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-3 flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed flex-1">
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
                    <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
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
