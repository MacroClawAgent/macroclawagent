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
    <section className="relative py-14 overflow-hidden border-y" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
      <div className="mb-5 text-center">
        <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "#6B7280" }}>
          Trusted integrations
        </p>
      </div>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #FFFFFF, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #FFFFFF, transparent)" }} />

      <div className="overflow-hidden">
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-8 py-3 mx-2 rounded-full flex-shrink-0 select-none"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <span style={{ color: "#6B7280" }}>{item.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap" style={{ color: "#6B7280" }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
