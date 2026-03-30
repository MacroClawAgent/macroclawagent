"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Learn", href: "/learn" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

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
          ? "bg-transparent border-b border-transparent"
          : "backdrop-blur-md border-b shadow-sm"
      }`}
      style={!atTop ? { backgroundColor: "rgba(28,20,16,0.95)", borderColor: "rgba(255,220,150,0.12)" } : undefined}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo — always visible */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Jonno logo"
            width={28}
            height={28}
            className="object-contain"
            priority
          />
          <span className="font-bebas text-2xl tracking-widest transition-colors duration-300" style={{ color: "#E8E0D0" }}>
            Jonno
          </span>
        </Link>

        {/* Nav Links — desktop, hidden until scrolled */}
        <div className={`hidden md:flex items-center gap-8 transition-all duration-300 ${atTop && isHome ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "rgba(232,224,208,0.60)" }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Join Waitlist — always visible */}
        <div className="flex items-center gap-3">
          <Link
            href="/join"
            className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "#F5C842", color: "#1C1410", boxShadow: "0 2px 10px rgba(245,200,66,0.25)" }}
          >
            Join Waitlist
          </Link>
          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} style={{ backgroundColor: "rgba(232,224,208,0.65)" }} />
            <span className={`block h-0.5 w-5 transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} style={{ backgroundColor: "rgba(232,224,208,0.65)" }} />
            <span className={`block h-0.5 w-5 transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} style={{ backgroundColor: "rgba(232,224,208,0.65)" }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-6 py-4 flex flex-col gap-1 shadow-lg" style={{ backgroundColor: "#1C1410", borderTop: "1px solid rgba(255,220,150,0.12)" }}>
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="py-3 px-2 text-sm font-medium transition-colors"
              style={{ color: "rgba(232,224,208,0.65)", borderBottom: "1px solid rgba(255,220,150,0.08)" }}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/join"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full px-5 py-3 rounded-full text-sm font-bold transition-all"
              style={{ backgroundColor: "#F5C842", color: "#1C1410" }}
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
