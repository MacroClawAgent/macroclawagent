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
    tagColor: "text-[#20C7B7] bg-[rgba(32,199,183,0.10)]",
    tagBorder: "border-[rgba(32,199,183,0.20)]",
    gradient: "from-[rgba(32,199,183,0.40)] to-[#0F111A]",
    coverImage: "/cyclists.png",
    title: "How to Fuel Your Strava Rides with Precision Macros",
    excerpt:
      "Stop guessing your carb intake on ride day. Here's how to sync your training load with your nutrition targets automatically.",
    date: "Feb 18, 2026",
    readTime: "6 min read",
    author: "Marco R.",
    authorInitials: "MR",
    authorGradient: "from-[#20C7B7] to-[#4C7DFF]",
    emoji: "🚴",
  },
  {
    slug: "ai-nutrition-coaching",
    tag: "AI + Nutrition",
    tagColor: "text-[#4C7DFF] bg-[rgba(105,189,235,0.10)]",
    tagBorder: "border-[rgba(105,189,235,0.25)]",
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
      "0.8g/kg? 1.6g/kg? 2.2g/kg? The research on protein needs for endurance athletes is clearer than you think, and the number is probably higher than your app suggests.",
    date: "Jan 28, 2026",
    readTime: "10 min read",
    author: "Yuki T.",
    authorInitials: "YT",
    authorGradient: "from-emerald-500 to-teal-600",
    emoji: "🥩",
  },
  {
    slug: "calories-burned-running",
    tag: "Performance",
    tagColor: "text-[#20C7B7] bg-[rgba(32,199,183,0.10)]",
    tagBorder: "border-[rgba(32,199,183,0.20)]",
    gradient: "from-[rgba(76,125,255,0.40)] to-[#0F111A]",
    coverImage: null,
    title: "How Many Calories Do You Actually Burn Running?",
    excerpt:
      "Your running app's calorie estimate can be off by 30% or more. Here's the real science behind energy expenditure and how to get accurate numbers for your nutrition.",
    date: "Mar 1, 2026",
    readTime: "9 min read",
    author: "Marco R.",
    authorInitials: "MR",
    authorGradient: "from-[#20C7B7] to-[#4C7DFF]",
    emoji: "🏃",
  },
  {
    slug: "carbohydrate-loading-race-day",
    tag: "Science",
    tagColor: "text-emerald-400 bg-emerald-500/10",
    tagBorder: "border-emerald-500/20",
    gradient: "from-amber-900/40 to-[#0F111A]",
    coverImage: null,
    title: "Carbohydrate Loading for Race Day: What the Science Actually Says",
    excerpt:
      "Carb loading is one of the most misunderstood strategies in endurance sport. The protocol most athletes follow is outdated. Here's what the evidence actually supports.",
    date: "Feb 25, 2026",
    readTime: "11 min read",
    author: "Yuki T.",
    authorInitials: "YT",
    authorGradient: "from-emerald-500 to-teal-600",
    emoji: "🍝",
  },
  {
    slug: "sleep-recovery-nutrition",
    tag: "Recovery",
    tagColor: "text-violet-500 bg-violet-500/10",
    tagBorder: "border-violet-500/20",
    gradient: "from-violet-900/40 to-[#0F111A]",
    coverImage: null,
    title: "Sleep, Recovery Nutrition, and Athletic Performance",
    excerpt:
      "Most athletes optimise their training and their diet. Almost none optimise the nutritional window that governs how well they recover between sessions: sleep.",
    date: "Feb 20, 2026",
    readTime: "8 min read",
    author: "Lena W.",
    authorInitials: "LW",
    authorGradient: "from-indigo-500 to-violet-600",
    emoji: "😴",
  },
  {
    slug: "zone-2-fat-adaptation",
    tag: "Performance",
    tagColor: "text-[#20C7B7] bg-[rgba(32,199,183,0.10)]",
    tagBorder: "border-[rgba(32,199,183,0.20)]",
    gradient: "from-orange-900/40 to-[#0F111A]",
    coverImage: null,
    title: "Zone 2 Training and Fat Adaptation: What It Means for Your Diet",
    excerpt:
      "Zone 2 training is having a moment. But does training low actually mean eating low? Here's what fat adaptation really means for your daily nutrition strategy.",
    date: "Feb 14, 2026",
    readTime: "10 min read",
    author: "Marco R.",
    authorInitials: "MR",
    authorGradient: "from-[#20C7B7] to-[#4C7DFF]",
    emoji: "❤️",
  },
  {
    slug: "gut-health-athletes",
    tag: "Science",
    tagColor: "text-emerald-400 bg-emerald-500/10",
    tagBorder: "border-emerald-500/20",
    gradient: "from-green-900/40 to-[#0F111A]",
    coverImage: null,
    title: "Gut Health for Athletes: Why Your Digestion Determines Your Performance",
    excerpt:
      "GI distress is the number one reason athletes abandon race-day nutrition plans. Understanding why your gut fails under stress, and how to fix it, can be the difference between a PR and a DNF.",
    date: "Feb 5, 2026",
    readTime: "9 min read",
    author: "Yuki T.",
    authorInitials: "YT",
    authorGradient: "from-emerald-500 to-teal-600",
    emoji: "🦠",
  },
];

const categories = ["All", "Performance", "AI + Nutrition", "Science", "Recovery"];

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All" ? posts : posts.filter((p) => p.tag === activeCategory);
  const featured = filtered[0] ?? null;
  const secondary = filtered.slice(1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <Navbar />
      <main className="pt-16">

        {/* Header */}
        <section className="relative py-20 md:py-24 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(32,199,183,0.10) 0%, transparent 70%)" }} />
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center md:text-left"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#20C7B7" }}>
                Jonno Learn
              </p>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#20C7B7] mb-4">
                Nutrition intel for
                <br className="hidden md:block" /> serious athletes.
              </h1>
              <p className="text-lg max-w-xl mb-6" style={{ color: "#6B7280" }}>
                Evidence-based articles on performance nutrition, AI coaching, and training fueling.
              </p>

              <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
                {["8 articles", "Evidence-based", "Updated regularly"].map((s) => (
                  <span
                    key={s}
                    className="text-xs px-3 py-1 rounded-full border"
                    style={{ backgroundColor: "#F4F5F7", borderColor: "#E5E7EB", color: "#6B7280" }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200"
                    style={
                      activeCategory === cat
                        ? { backgroundColor: "rgba(32,199,183,0.10)", borderColor: "rgba(32,199,183,0.30)", color: "#20C7B7" }
                        : { backgroundColor: "transparent", borderColor: "#E5E7EB", color: "#6B7280" }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Posts */}
        <section className="pb-24">
          <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">

            {featured && (
              <motion.div
                key={`featured-${featured.slug}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link
                  href={`/learn/${featured.slug}`}
                  className="block light-card overflow-hidden transition-colors duration-300 group border"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    {featured.coverImage ? (
                      <Image
                        src={featured.coverImage}
                        alt={featured.title}
                        fill
                        className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${featured.gradient} flex items-center justify-center`}>
                        <span className="text-7xl group-hover:scale-110 transition-transform duration-300">{featured.emoji}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/20 to-transparent" />
                  </div>

                  <div className="p-8 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${featured.tagColor} ${featured.tagBorder}`}>
                        {featured.tag}
                      </span>
                      <span className="text-xs text-gray-500">{featured.date}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs text-gray-500">{featured.readTime}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black leading-tight transition-colors" style={{ color: "#1C1C1E" }}>
                      {featured.title}
                    </h2>
                    <p className="leading-relaxed max-w-2xl" style={{ color: "#6B7280" }}>
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${featured.authorGradient} flex items-center justify-center text-xs font-black text-white`}>
                          {featured.authorInitials}
                        </div>
                        <span className="text-sm" style={{ color: "#6B7280" }}>{featured.author}</span>
                      </div>
                      <span className="flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all" style={{ color: "#20C7B7" }}>
                        Read article
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {secondary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {secondary.map((post, i) => (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07 + 0.1 }}
                  >
                    <Link
                      href={`/learn/${post.slug}`}
                      className="block light-card overflow-hidden hover:border-blue-200 transition-colors duration-300 group h-full"
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
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${post.tagColor} ${post.tagBorder}`}>
                            {post.tag}
                          </span>
                          <span className="text-xs text-gray-500">{post.readTime}</span>
                        </div>
                        <h2 className="text-lg font-bold leading-snug transition-colors" style={{ color: "#1C1C1E" }}>
                          {post.title}
                        </h2>
                        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "#6B7280" }}>
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${post.authorGradient} flex items-center justify-center text-[10px] font-black text-white`}>
                              {post.authorInitials}
                            </div>
                            <span className="text-xs" style={{ color: "#6B7280" }}>
                              {post.author} · {post.date}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all" style={{ color: "#20C7B7" }}>
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

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-gray-500"
              >
                No articles in this category yet. More coming soon.
              </motion.div>
            )}

            {/* Newsletter strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 border"
              style={{ backgroundColor: "#F4F5F7", borderColor: "#E5E7EB" }}
            >
              <div className="flex-1 text-center md:text-left">
                <p className="font-black text-xl mb-1" style={{ color: "#1C1C1E" }}>
                  Weekly nutrition intel for athletes.
                </p>
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  Evidence-based articles on training fueling, AI coaching, and performance nutrition. No spam.
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 md:w-56 px-4 py-2.5 rounded-xl text-sm focus:outline-none border"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", color: "#1C1C1E" }}
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
