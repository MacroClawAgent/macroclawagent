"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-[#0A1A0F]/90 border-b border-white/8 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-2xl transition-transform group-hover:scale-110 duration-200">
            🦀
          </span>
          <span className="font-bold text-lg text-green-50 tracking-tight">
            MacroClawAgent
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Dashboard", "Pricing"].map((item) => (
            <Link
              key={item}
              href={item === "Dashboard" ? "/dashboard" : `#${item.toLowerCase()}`}
              className="text-sm text-green-300/70 hover:text-green-100 transition-colors duration-200"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Sign In</Link>
          </Button>
          <Button size="sm" className="hidden sm:flex">
            Get Started Free
          </Button>
        </div>
      </div>
    </nav>
  );
}
