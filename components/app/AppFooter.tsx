import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-blue-400/20 mt-auto" style={{ background: "linear-gradient(150deg, #0052CC 0%, #0066EE 55%, #1a85ff 100%)" }}>
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <p className="text-xs text-white/60">© 2026 Jonno</p>
          <div className="flex items-center gap-4">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Changelog", href: "/changelog" },
              { label: "Support", href: "/faq" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-blue-100/75 hover:text-white transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 border border-white/20">
          <span className="text-xs text-white/80 font-medium">Powered by</span>
          <span className="text-xs font-bold text-white">Claude AI</span>
          <span className="text-xs text-white/50">·</span>
          <span className="text-xs text-orange-300 font-medium">Strava</span>
          <span className="text-xs text-white/50">·</span>
          <span className="text-xs text-emerald-300 font-medium">Uber Eats</span>
        </div>
      </div>
    </footer>
  );
}
