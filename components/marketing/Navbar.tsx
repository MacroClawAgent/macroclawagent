"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { User } from "lucide-react";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const atTop = !scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        atTop
          ? "bg-transparent border-b border-[#CFC7C2]/30"
          : "backdrop-blur-md border-b border-[#CFC7C2]/50 shadow-sm"
      }`}
      style={!atTop ? { backgroundColor: "rgba(255,253,251,0.92)" } : undefined}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Jonno logo"
            width={28}
            height={28}
            className="object-contain"
            priority
          />
          <span className="font-bold text-lg tracking-tight text-[#4A454A] transition-colors duration-300 group-hover:text-[#F29A69]">
            Jonno
          </span>
        </Link>

        {/* Nav Links — desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[#7C7472] hover:text-[#4A454A] transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Sign In + Join Waitlist */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#7C7472] hover:text-[#4A454A] transition-colors duration-200 px-3 py-2"
          >
            <User className="w-4 h-4" />
            Sign In
          </Link>
          <Link
            href="/join"
            className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full text-white text-sm font-bold transition-all duration-200 shadow-sm shadow-[#F29A69]/25 hover:shadow-[#E88367]/35 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #F29A69 0%, #E88367 100%)" }}
          >
            Join Waitlist
          </Link>
          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 transition-all duration-200 bg-[#7C7472] ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-5 transition-all duration-200 bg-[#7C7472] ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 transition-all duration-200 bg-[#7C7472] ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#CFC7C2]/50 px-6 py-4 flex flex-col gap-1 shadow-lg" style={{ backgroundColor: "#FFFDFB" }}>
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="py-3 px-2 text-sm font-medium text-[#7C7472] hover:text-[#4A454A] border-b border-[#CFC7C2]/40 last:border-0 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full px-5 py-3 rounded-full border border-[#CFC7C2] text-[#4A454A] text-sm font-semibold hover:bg-[#F5ECE6] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/join"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full px-5 py-3 rounded-full text-white text-sm font-bold transition-all"
              style={{ background: "linear-gradient(135deg, #F29A69 0%, #E88367 100%)" }}
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
