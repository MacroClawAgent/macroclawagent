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
          ? "bg-transparent border-b border-white/10"
          : "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
      }`}
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
          <span className={`font-bold text-lg tracking-tight transition-colors duration-300 ${atTop ? "text-white" : "text-blue-600"}`}>
            Jonno
          </span>
        </Link>

        {/* Nav Links — desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-medium transition-colors duration-200 ${
                atTop ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Sign In + Join Waitlist */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 px-3 py-2 ${
              atTop ? "text-white/80 hover:text-white" : "text-gray-700 hover:text-blue-600"
            }`}
          >
            <User className="w-4 h-4" />
            Sign In
          </Link>
          <Link
            href="/join"
            className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors duration-200 shadow-sm"
          >
            Join Waitlist
          </Link>
          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 transition-all duration-200 ${atTop ? "bg-white" : "bg-gray-700"} ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-5 transition-all duration-200 ${atTop ? "bg-white" : "bg-gray-700"} ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 transition-all duration-200 ${atTop ? "bg-white" : "bg-gray-700"} ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-1 shadow-lg">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="py-3 px-2 text-sm font-medium text-gray-700 hover:text-blue-600 border-b border-gray-100 last:border-0 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full px-5 py-3 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/join"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full px-5 py-3 rounded-full bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
