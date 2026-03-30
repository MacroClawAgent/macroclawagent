"use client";

import Image from "next/image";
import { ShoppingBag, Heart, Bot, Watch, Cpu, Circle } from "lucide-react";

const integrations = [
  { icon: <Image src="/strava.png" alt="Strava" width={16} height={16} className="object-contain grayscale" />, name: "Strava", color: "" },
  { icon: <ShoppingBag className="w-4 h-4" />, name: "Uber Eats", color: "text-gray-500" },
  { icon: <Heart className="w-4 h-4" />, name: "Apple Health", color: "text-gray-500" },
  { icon: <Bot className="w-4 h-4" />, name: "Anthropic Claude", color: "text-gray-500" },
  { icon: <Watch className="w-4 h-4" />, name: "Garmin", color: "text-gray-500" },
  { icon: <Cpu className="w-4 h-4" />, name: "Wahoo", color: "text-gray-500" },
  { icon: <Circle className="w-4 h-4" />, name: "Whoop", color: "text-gray-500" },
];

export function LogoMarquee() {
  // Duplicate for seamless loop
  const items = [...integrations, ...integrations, ...integrations, ...integrations];

  return (
    <section className="relative py-14 overflow-hidden border-y" style={{ backgroundColor: "#1C1410", borderColor: "rgba(255,220,150,0.10)" }}>
      <div className="mb-5 text-center">
        <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "rgba(232,224,208,0.40)" }}>
          Trusted integrations
        </p>
      </div>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #1C1410, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #1C1410, transparent)" }} />

      <div className="overflow-hidden">
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-8 py-3 mx-2 rounded-full flex-shrink-0 select-none"
              style={{ backgroundColor: "rgba(255,220,150,0.05)", border: "1px solid rgba(255,220,150,0.12)" }}
            >
              <span style={{ color: "rgba(232,224,208,0.50)" }}>{item.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap" style={{ color: "rgba(232,224,208,0.60)" }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
