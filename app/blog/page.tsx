"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { ArrowRight } from "lucide-react";

const posts = [
  {
    slug: "fueling-strava-rides",
    tag: "Performance",
    tagColor: "text-orange-400 bg-orange-500/10",
    gradient: "from-orange-900/40 to-[#0F111A]",
    title: "How to Fuel Your Strava Rides with Precision Macros",
    excerpt:
      "Stop guessing your carb intake on ride day. Here's how to sync your training load with your nutrition targets — automatically.",
    date: "Feb 18, 2026",
    readTime: "6 min read",
    emoji: "🚴",
  },
  {
    slug: "ai-nutrition-coaching",
    tag: "AI + Nutrition",
    tagColor: "text-indigo-400 bg-indigo-500/10",
    gradient: "from-indigo-900/40 to-[#0F111A]",
    title: "Why AI Nutrition Coaching is Changing Athletic Performance",
    excerpt:
      "Human coaches are expensive and unavailable at 11pm when you're logging your third meal. Here's why AI is closing that gap.",
    date: "Feb 10, 2026",
    readTime: "8 min read",
    emoji: "🤖",
  },
  {
    slug: "protein-targets-athletes",
    tag: "Science",
    tagColor: "text-emerald-400 bg-emerald-500/10",
    gradient: "from-emerald-900/40 to-[#0F111A]",
    title: "The Science Behind Protein Targets for Endurance Athletes",
    excerpt:
      "0.8g/kg? 1.6g/kg? 2.2g/kg? The research on protein needs for endurance athletes is clearer than you think — and the number is probably higher than your app suggests.",
    date: "Jan 28, 2026",
    readTime: "10 min read",
    emoji: "🥩",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#08090D]">
      <Navbar />
      <main className="pt-16">
        {/* Header */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-indigo-900/10 blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
                The Claw Blog
              </p>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight gradient-text mb-4">
                Nutrition intel for<br className="hidden md:block" /> serious athletes.
              </h1>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">
                Evidence-based articles on performance nutrition, AI coaching, and training fueling.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Posts grid */}
        <section className="pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block glass-card overflow-hidden hover:border-indigo-500/30 transition-colors duration-300 group"
                  >
                    {/* Cover */}
                    <div className={`h-40 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                        {post.emoji}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.tagColor}`}>
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
                        <span className="text-xs text-slate-600">{post.date}</span>
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
