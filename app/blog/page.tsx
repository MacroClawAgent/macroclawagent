"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const posts = [
  {
    slug: "fueling-strava-rides",
    tag: "Performance",
    tagColor: "text-orange-400 bg-orange-500/10",
    tagBorder: "border-orange-500/20",
    gradient: "from-orange-900/40 to-[#0F111A]",
    coverImage: "/cyclists.png",
    title: "How to Fuel Your Strava Rides with Precision Macros",
    excerpt:
      "Stop guessing your carb intake on ride day. Here's how to sync your training load with your nutrition targets — automatically.",
    date: "Feb 18, 2026",
    readTime: "6 min read",
    author: "Marco R.",
    authorInitials: "MR",
    authorGradient: "from-orange-500 to-red-600",
    emoji: "🚴",
  },
  {
    slug: "ai-nutrition-coaching",
    tag: "AI + Nutrition",
    tagColor: "text-indigo-400 bg-indigo-500/10",
    tagBorder: "border-indigo-500/20",
    gradient: "from-indigo-900/40 to-[#0F111A]",
    coverImage: "/gym.png" as string | null,
    title: "Why AI Nutrition Coaching is Changing Athletic Performance",
    excerpt:
      "Human coaches are expensive and unavailable at 11pm when you're logging your third meal. Here's why AI is closing that gap.",
    date: "Feb 10, 2026",
    readTime: "8 min read",
    author: "Lena W.",
    authorInitials: "LW",
    authorGradient: "from-indigo-500 to-violet-600",
    emoji: "🤖",
  },
  {
    slug: "protein-targets-athletes",
    tag: "Science",
    tagColor: "text-emerald-400 bg-emerald-500/10",
    tagBorder: "border-emerald-500/20",
    gradient: "from-emerald-900/40 to-[#0F111A]",
    coverImage: "/nutrition.png" as string | null,
    title: "The Science Behind Protein Targets for Endurance Athletes",
    excerpt:
      "0.8g/kg? 1.6g/kg? 2.2g/kg? The research on protein needs for endurance athletes is clearer than you think — and the number is probably higher than your app suggests.",
    date: "Jan 28, 2026",
    readTime: "10 min read",
    author: "Yuki T.",
    authorInitials: "YT",
    authorGradient: "from-emerald-500 to-teal-600",
    emoji: "🥩",
  },
];

const categories = ["All", "Performance", "AI + Nutrition", "Science"];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All" ? posts : posts.filter((p) => p.tag === activeCategory);
  const featured = filtered[0] ?? null;
  const secondary = filtered.slice(1);

  return (
    <div className="min-h-screen bg-[#08090D]">
      <Navbar />
      <main className="pt-16">

        {/* ── Header ── */}
        <section className="relative py-20 md:py-24 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-indigo-900/10 blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center md:text-left"
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
                The Claw Blog
              </p>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight gradient-text mb-4">
                Nutrition intel for
                <br className="hidden md:block" /> serious athletes.
              </h1>
              <p className="text-lg text-slate-400 max-w-xl mb-6">
                Evidence-based articles on performance nutrition, AI coaching, and training fueling.
              </p>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
                {["3 articles", "Evidence-based", "Updated regularly"].map((s) => (
                  <span
                    key={s}
                    className="text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-500"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                      activeCategory === cat
                        ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                        : "bg-transparent border-white/[0.08] text-slate-500 hover:text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Posts ── */}
        <section className="pb-24">
          <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">

            {/* Featured post */}
            {featured && (
              <motion.div
                key={`featured-${featured.slug}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link
                  href={`/blog/${featured.slug}`}
                  className="block glass-card glow-border overflow-hidden hover:border-indigo-500/40 transition-colors duration-300 group"
                >
                  {/* Cover */}
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    {featured.coverImage ? (
                      <Image
                        src={featured.coverImage}
                        alt={featured.title}
                        fill
                        className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${featured.gradient}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/20 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${featured.tagColor} ${featured.tagBorder}`}
                      >
                        {featured.tag}
                      </span>
                      <span className="text-xs text-slate-600">{featured.date}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs text-slate-600">{featured.readTime}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-100 leading-tight group-hover:text-indigo-200 transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-slate-400 leading-relaxed max-w-2xl">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg bg-gradient-to-br ${featured.authorGradient} flex items-center justify-center text-xs font-black text-white`}
                        >
                          {featured.authorInitials}
                        </div>
                        <span className="text-sm text-slate-400">{featured.author}</span>
                      </div>
                      <span className="flex items-center gap-1.5 text-sm text-indigo-400 font-semibold group-hover:gap-2.5 transition-all">
                        Read article
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Secondary posts */}
            {secondary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {secondary.map((post, i) => (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 + 0.1 }}
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block glass-card overflow-hidden hover:border-indigo-500/30 transition-colors duration-300 group h-full"
                    >
                      <div className="relative h-40 overflow-hidden">
                        {post.coverImage ? (
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
                          />
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                              {post.emoji}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D]/60 to-transparent" />
                      </div>
                      <div className="p-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${post.tagColor} ${post.tagBorder}`}
                          >
                            {post.tag}
                          </span>
                          <span className="text-xs text-slate-600">{post.readTime}</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-100 leading-snug group-hover:text-indigo-200 transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-md bg-gradient-to-br ${post.authorGradient} flex items-center justify-center text-[10px] font-black text-white`}
                            >
                              {post.authorInitials}
                            </div>
                            <span className="text-xs text-slate-500">
                              {post.author} · {post.date}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-indigo-400 font-semibold group-hover:gap-2 transition-all">
                            Read
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}

            {/* Empty state */}
            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-slate-500"
              >
                No articles in this category yet. More coming soon.
              </motion.div>
            )}

            {/* Newsletter strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-heavy rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6"
            >
              <div className="flex-1 text-center md:text-left">
                <p className="font-black text-xl text-slate-100 mb-1">
                  Weekly nutrition intel for athletes.
                </p>
                <p className="text-sm text-slate-400">
                  Evidence-based articles on training fueling, AI coaching, and performance nutrition.
                  No spam.
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 md:w-56 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.09] text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40"
                />
                <Button variant="glow" size="default">
                  Subscribe
                </Button>
              </div>
            </motion.div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
