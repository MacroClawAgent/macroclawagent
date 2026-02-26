"use client";

import Image from "next/image";
import { ShoppingBag, Heart, Bot, Watch, Cpu, Circle } from "lucide-react";

const integrations = [
  { icon: <Image src="/strava.png" alt="Strava" width={16} height={16} className="object-contain" />, name: "Strava", color: "" },
  { icon: <ShoppingBag className="w-4 h-4" />, name: "Uber Eats", color: "text-emerald-400" },
  { icon: <Heart className="w-4 h-4" />, name: "Apple Health", color: "text-pink-400" },
  { icon: <Bot className="w-4 h-4" />, name: "Anthropic Claude", color: "text-indigo-400" },
  { icon: <Watch className="w-4 h-4" />, name: "Garmin", color: "text-slate-400" },
  { icon: <Cpu className="w-4 h-4" />, name: "Wahoo", color: "text-slate-400" },
  { icon: <Circle className="w-4 h-4" />, name: "Whoop", color: "text-slate-400" },
];

export function LogoMarquee() {
  // Duplicate for seamless loop
  const items = [...integrations, ...integrations, ...integrations, ...integrations];

  return (
    <section className="relative py-14 overflow-hidden border-y border-white/[0.04]">
      <div className="mb-5 text-center">
        <p className="text-[11px] text-slate-600 uppercase tracking-widest font-semibold">
          Trusted integrations
        </p>
      </div>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#08090D] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#08090D] to-transparent z-10 pointer-events-none" />

      <div className="overflow-hidden">
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-8 py-3 mx-2 glass rounded-full border border-white/[0.05] flex-shrink-0 select-none"
            >
              <span className={item.color}>{item.icon}</span>
              <span className="text-sm font-medium text-slate-400 whitespace-nowrap">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
