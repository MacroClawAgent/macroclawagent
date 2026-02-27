"use client";

import { useEffect, useState } from "react";

export function BlogProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      setPct(scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div
      className="fixed top-16 left-0 z-50 h-0.5 bg-indigo-500 transition-[width] duration-75 pointer-events-none"
      style={{ width: `${pct}%` }}
    />
  );
}
