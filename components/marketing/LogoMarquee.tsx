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
    <section className="relative py-14 overflow-hidden border-y" style={{ backgroundColor: "#FAF4EF", borderColor: "#CFC7C2" }}>
      <div className="mb-5 text-center">
        <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "#7C7472" }}>
          Trusted integrations
        </p>
      </div>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #FAF4EF, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #FAF4EF, transparent)" }} />

      <div className="overflow-hidden">
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-8 py-3 mx-2 rounded-full flex-shrink-0 select-none"
              style={{ backgroundColor: "#FFFDFB", border: "1px solid #E8DDD8", boxShadow: "0 1px 4px rgba(74,69,74,0.05)" }}
            >
              <span style={{ color: "#7C7472" }}>{item.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap" style={{ color: "#7C7472" }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
