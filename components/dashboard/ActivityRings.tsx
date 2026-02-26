"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface RingData {
  label: string;
  current: number;
  target: number;
}

interface ActivityRingsProps {
  rings?: RingData[];
}

const RING_DESIGN = [
  { color: "#F97316", strokeColor: "#F97316", shadowColor: "rgba(249, 115, 22, 0.4)",  radius: 58 },
  { color: "#10B981", strokeColor: "#10B981", shadowColor: "rgba(16, 185, 129, 0.4)",  radius: 44 },
  { color: "#F59E0B", strokeColor: "#F59E0B", shadowColor: "rgba(245, 158, 11, 0.3)",  radius: 30 },
];

const DEFAULT_RINGS: RingData[] = [
  { label: "Calories", current: 0, target: 2000 },
  { label: "Protein",  current: 0, target: 120  },
  { label: "Carbs",    current: 0, target: 250  },
];

type RingFull = RingData & (typeof RING_DESIGN)[0];

function Ring({
  ring,
  delay,
}: {
  ring: RingFull;
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

export function ActivityRings({ rings: ringsProp }: ActivityRingsProps) {
  const baseRings = ringsProp ?? DEFAULT_RINGS;
  const rings: RingFull[] = baseRings.map((r, i) => ({
    ...r,
    ...RING_DESIGN[i % RING_DESIGN.length],
  }));

  const overallProgress = Math.round(
    (rings.reduce((acc, r) => acc + Math.min(r.current / r.target, 1), 0) / rings.length) * 100
  );

  return (
    <Card className="glass-card border-0 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-300">
            Today&apos;s Goals
          </CardTitle>
          <Link href="/nutrition" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors">
            Details <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
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
                stroke="rgba(255,255,255,0.04)"
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
              className="text-3xl font-black text-slate-100"
            >
              {overallProgress}%
            </motion.span>
            <span className="text-xs text-slate-500 font-medium">complete</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full flex flex-col gap-3">
          {rings.map((ring) => {
            const pct = Math.min(Math.round((ring.current / ring.target) * 100), 100);
            return (
              <div key={ring.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ring.color }}
                  />
                  <span className="text-sm text-slate-400">{ring.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: ring.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-16 text-right font-mono">
                    {ring.current}
                    <span className="text-slate-700">/{ring.target}</span>
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
