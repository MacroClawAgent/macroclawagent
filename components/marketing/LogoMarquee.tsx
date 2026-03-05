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
    <section className="relative py-14 overflow-hidden bg-gray-50 border-y border-gray-100">
      <div className="mb-5 text-center">
        <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
          Trusted integrations
        </p>
      </div>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

      <div className="overflow-hidden">
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-8 py-3 mx-2 bg-white border border-gray-200 rounded-full flex-shrink-0 select-none shadow-sm"
            >
              <span className={item.color}>{item.icon}</span>
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
