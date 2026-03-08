"use client";

import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    { label: "About", href: "/about" },
    { label: "Learn", href: "/learn" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: "#CFC7C2", background: "linear-gradient(160deg, #4A454A 0%, #3A3538 100%)" }}>
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        {/* Top section: logo col + link cols */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <Image
                src="/logo.png"
                alt="Jonno logo"
                width={84}
                height={26}
                className="object-contain transition-opacity group-hover:opacity-90 duration-200"
              />
              <span className="font-bold text-lg text-white tracking-tight">
                Jonno
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,253,251,0.60)" }}>
              AI-powered nutrition for serious athletes. Sync your training,
              plan your meals, fuel your performance.
            </p>
          </div>

          {/* Col 2: Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,253,251,0.45)" }}>
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white" style={{ color: "rgba(255,253,251,0.60)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,253,251,0.45)" }}>
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white" style={{ color: "rgba(255,253,251,0.60)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-px mb-8" style={{ backgroundColor: "rgba(255,253,251,0.12)" }} />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "rgba(255,253,251,0.45)" }}>
            © 2026 Jonno. Built for athletes who eat with intention.
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,253,251,0.08)", border: "1px solid rgba(255,253,251,0.12)" }}>
            <span className="text-xs font-medium" style={{ color: "rgba(255,253,251,0.65)" }}>Powered by</span>
            <span className="text-xs font-bold text-white">Claude AI</span>
            <span className="text-xs" style={{ color: "rgba(255,253,251,0.35)" }}>·</span>
            <span className="text-xs font-medium" style={{ color: "#F29A69" }}>Strava</span>
            <span className="text-xs" style={{ color: "rgba(255,253,251,0.35)" }}>·</span>
            <span className="text-xs font-medium" style={{ color: "#8FD3F4" }}>Uber Eats</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
