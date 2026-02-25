"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const rings = [
  {
    label: "Calories",
    current: 1640,
    target: 2240,
    color: "#4ADE80",
    strokeColor: "#4ADE80",
    shadowColor: "rgba(74, 222, 128, 0.4)",
    radius: 58,
  },
  {
    label: "Protein",
    current: 87,
    target: 120,
    color: "#60A5FA",
    strokeColor: "#60A5FA",
    shadowColor: "rgba(96, 165, 250, 0.4)",
    radius: 44,
  },
  {
    label: "Carbs",
    current: 180,
    target: 250,
    color: "#34D399",
    strokeColor: "#34D399",
    shadowColor: "rgba(52, 211, 153, 0.3)",
    radius: 30,
  },
];

function Ring({
  ring,
  delay,
}: {
  ring: (typeof rings)[0];
  delay: number;
}) {
  const circumference = 2 * Math.PI * ring.radius;
  const progress = ring.current / ring.target;
  const offset = circumference * (1 - progress);

  return (
    <motion.circle
      cx="80"
      cy="80"
      r={ring.radius}
      fill="none"
      stroke={ring.strokeColor}
      strokeWidth="7"
      strokeLinecap="round"
      strokeDasharray={circumference}
      initial={{ strokeDashoffset: circumference }}
      animate={{ strokeDashoffset: offset }}
      transition={{ duration: 1.5, delay, ease: [0.22, 1, 0.36, 1] }}
      transform="rotate(-90 80 80)"
      style={{ filter: `drop-shadow(0 0 6px ${ring.shadowColor})` }}
    />
  );
}

export function ActivityRings() {
  const overallProgress = Math.round(
    (rings.reduce((acc, r) => acc + r.current / r.target, 0) / rings.length) * 100
  );

  return (
    <Card className="glass-card border-0 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-green-200/80">
          Weekly Goal
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {/* SVG Rings */}
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* Background tracks */}
            {rings.map((ring) => (
              <circle
                key={`track-${ring.label}`}
                cx="80"
                cy="80"
                r={ring.radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="7"
              />
            ))}
            {/* Animated rings */}
            {rings.map((ring, i) => (
              <Ring key={ring.label} ring={ring} delay={i * 0.2} />
            ))}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="text-3xl font-black text-green-50"
            >
              {overallProgress}%
            </motion.span>
            <span className="text-xs text-green-300/50 font-medium">complete</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full flex flex-col gap-3">
          {rings.map((ring) => {
            const pct = Math.round((ring.current / ring.target) * 100);
            return (
              <div key={ring.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ring.color }}
                  />
                  <span className="text-sm text-green-300/70">{ring.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: ring.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs text-green-300/50 w-16 text-right font-mono">
                    {ring.current}
                    <span className="text-green-300/30">/{ring.target}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
