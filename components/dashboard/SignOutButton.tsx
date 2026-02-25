"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleSignOut}
      title="Sign out"
      className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
