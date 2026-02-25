"use client";

import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "How It Works", href: "/#features" },
    { label: "Changelog", href: "/changelog" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#08090D]">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        {/* Top section: logo col + link cols */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <Image
                src="/logo.png"
                alt="MacroClawAgent logo"
                width={84}
                height={26}
                className="object-contain transition-opacity group-hover:opacity-90 duration-200"
              />
              <span className="font-bold text-lg text-slate-100 tracking-tight">
                MacroClawAgent
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              AI-powered nutrition for serious athletes. Sync your training,
              plan your meals, fuel your performance.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-500 hover:text-slate-200 hover:border-white/20 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.902-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-500 hover:text-slate-200 hover:border-white/20 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Support + Legal */}
          <div>
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
              Support
            </h3>
            <ul className="space-y-3 mb-8">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-px bg-white/[0.06] mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2026 MacroClawAgent. Built for athletes who eat with intention.
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20">
            <span className="text-xs text-indigo-400 font-medium">Powered by</span>
            <span className="text-xs font-bold text-indigo-300">Claude AI</span>
            <span className="text-xs text-indigo-400">·</span>
            <span className="text-xs text-orange-400 font-medium">Strava</span>
            <span className="text-xs text-indigo-400">·</span>
            <span className="text-xs text-emerald-400 font-medium">Uber Eats</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
