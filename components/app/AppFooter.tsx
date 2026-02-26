import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#08090D] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <p className="text-xs text-slate-700">© 2026 MacroClawAgent</p>
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
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/8 border border-indigo-500/12">
          <span className="text-xs text-indigo-400 font-medium">Powered by</span>
          <span className="text-xs font-bold text-indigo-300">Claude AI</span>
          <span className="text-xs text-slate-700">·</span>
          <span className="text-xs text-orange-400 font-medium">Strava</span>
          <span className="text-xs text-slate-700">·</span>
          <span className="text-xs text-emerald-400 font-medium">Uber Eats</span>
        </div>
      </div>
    </footer>
  );
}
