"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Leaf, Activity, UtensilsCrossed, Sparkles,
  Bell, Settings, LogOut, ChevronDown, User, Menu, X,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const navLinks = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Nutrition", href: "/nutrition", icon: Leaf },
  { label: "Activities", href: "/activities", icon: Activity },
  { label: "Meal Plans", href: "/meal-plans", icon: UtensilsCrossed },
  { label: "Agent", href: "/agent", icon: Sparkles },
];

type UserInfo = {
  full_name: string | null;
  avatar_url: string | null;
  email: string;
};

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) return;
      const { data: profile } = await supabase
        .from("users")
        .select("full_name, avatar_url")
        .eq("id", authUser.id)
        .single();
      setUser({
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
        email: authUser.email ?? "",
      });
    });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    if (!isSupabaseConfigured()) {
      router.push("/login");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "A";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#08090D]/95 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
          <Image
            src="/logo.png"
            alt="MacroClawAgent"
            width={72}
            height={22}
            className="object-contain transition-opacity group-hover:opacity-85"
            onError={() => {}}
          />
          <span className="font-bold text-sm text-slate-100 tracking-tight hidden lg:block">
            MacroClawAgent
          </span>
        </Link>

        {/* Nav Links — desktop */}
        <div className="hidden md:flex items-center gap-0.5 flex-1">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                  active
                    ? "bg-indigo-500/10 text-indigo-300"
                    : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Notification bell */}
          <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
          </button>

          {/* Settings */}
          <Link
            href="/settings"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              pathname.startsWith("/settings")
                ? "bg-indigo-500/10 text-indigo-300"
                : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Avatar dropdown */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-white/[0.04] transition-all"
            >
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-8 h-8 rounded-lg object-cover border border-white/10"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {initials}
                </div>
              )}
              <ChevronDown
                className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 glass-card rounded-xl border border-white/[0.08] shadow-2xl shadow-black/60 overflow-hidden py-1.5">
                <div className="px-3.5 py-2.5 border-b border-white/[0.06]">
                  <p className="text-xs font-bold text-slate-100 truncate">{user?.full_name ?? "Athlete"}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Profile Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#08090D]/98 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-indigo-500/10 text-indigo-300"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}

          <div className="mt-2 pt-3 border-t border-white/[0.06] flex flex-col gap-1">
            {user && (
              <div className="px-3.5 py-2 mb-1">
                <p className="text-xs font-bold text-slate-200">{user.full_name ?? "Athlete"}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>
            )}
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] transition-all"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
