import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Twitter } from "lucide-react";
import { BlogProgress } from "@/components/blog/BlogProgress";
import { CopyLinkButton } from "@/components/blog/CopyLinkButton";

type BlogPost = {
  slug: string;
  tag: string;
  tagColor: string;
  tagBorder: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  emoji: string;
  gradient: string;
  coverImage?: string;
  toc: string[];
  author: {
    name: string;
    role: string;
    initials: string;
    gradient: string;
    bio: string;
  };
  relatedSlugs?: [string, string];
  body: React.ReactNode;
};

const posts: Record<string, BlogPost> = {
  "fueling-strava-rides": {
    slug: "fueling-strava-rides",
    tag: "Performance",
    tagColor: "text-orange-400 bg-orange-500/10",
    tagBorder: "border-orange-500/20",
    title: "How to Fuel Your Strava Rides with Precision Macros",
    excerpt: "Stop guessing your carb intake on ride day. Here's how to sync your training load with your nutrition targets — automatically.",
    date: "Feb 18, 2026",
    readTime: "6 min read",
    emoji: "🚴",
    gradient: "from-orange-900/40 to-[#0F111A]",
    coverImage: "/cyclists.png",
    toc: [
      "Why your calorie target needs to move with your rides",
      "Carbohydrate requirements for cyclists",
      "The three-window fueling framework",
      "Protein on ride days",
      "How MacroClawAgent automates this",
      "Practical next step",
    ],
    author: {
      name: "Marco R.",
      role: "Co-founder & CEO",
      initials: "MR",
      gradient: "from-orange-500 to-red-600",
      bio: "Cyclist and ex-consultant. Built MacroClawAgent after years of training hard and eating wrong.",
    },
    relatedSlugs: ["ai-nutrition-coaching", "protein-targets-athletes"],
    body: (
      <div className="prose-content">
        <p>
          If you're logging every watt and every kilometre on Strava but still eating the same 2,000-calorie
          diet on your long ride days as on your rest days, you're leaving recovery on the table.
          Fueling precision isn't just for Tour de France professionals — it's a lever available to any
          cyclist willing to sync their training data with their nutrition.
        </p>

        <h2>Why your calorie target needs to move with your rides</h2>
        <p>
          Total Daily Energy Expenditure (TDEE) is not a static number. A 90-minute Zone 2 ride burns
          roughly 600–900 kcal depending on your body weight and intensity. A 4-hour fondo at threshold
          effort? 2,500–3,500 kcal above your Basal Metabolic Rate.
        </p>
        <p>
          Most nutrition apps calculate your TDEE once during setup — using an activity multiplier like
          "moderately active" — and never update it. This creates systematic underfueling on hard days
          and potential overfueling on recovery days.
        </p>
        <p>
          The fix is simple in principle: your nutrition targets should update every time your Strava
          data updates. MacroClawAgent does this automatically via the Strava OAuth sync.
        </p>

        <h2>Carbohydrate requirements for cyclists</h2>
        <p>
          The dominant fuel source above 70% VO2max is glycogen — stored carbohydrate in your muscles
          and liver. Research consistently shows endurance athletes require:
        </p>
        <ul>
          <li><strong>Zone 2 / recovery rides (under 90 min):</strong> 3–5g carbs per kg bodyweight per day</li>
          <li><strong>Moderate training (90–120 min moderate intensity):</strong> 5–7g/kg/day</li>
          <li><strong>High intensity or long rides (2–5 hours):</strong> 6–10g/kg/day</li>
          <li><strong>Extreme volume (Tour-style):</strong> 8–12g/kg/day</li>
        </ul>
        <p>
          For a 70kg cyclist doing a 3-hour endurance ride, that's 420–700g of carbohydrates on that day.
          That's not a number you hit by accident.
        </p>

        <h2>The three-window fueling framework</h2>
        <p>
          Rather than thinking about daily totals in the abstract, structure your carb intake around three
          windows relative to your ride:
        </p>
        <p>
          <strong>Pre-ride (2–3 hours before):</strong> 1–4g/kg carbs, low fat, moderate protein. The goal
          is to top up liver glycogen without causing GI distress. Oats, banana, white rice, white bread
          with jam are all excellent options. Avoid high-fibre foods.
        </p>
        <p>
          <strong>During (rides over 75 minutes):</strong> 30–90g carbs per hour depending on intensity.
          For rides over 2.5 hours, multiple carbohydrate types (glucose + fructose in a 2:1 ratio) allow
          absorption rates above 90g/hour. Sports gels, chews, or real food like dates and rice cakes work well.
        </p>
        <p>
          <strong>Post-ride (within 30–60 minutes):</strong> 1–1.2g/kg carbs + 0.3–0.4g/kg protein to
          maximise glycogen resynthesis and initiate muscle repair. This is the window where ordering
          the right food via Uber Eats actually matters most — your muscles are most receptive to nutrients
          in this period.
        </p>

        <h2>Protein on ride days</h2>
        <p>
          Endurance athletes often overlook protein on heavy training days, focusing almost entirely on
          carbohydrate replacement. But 2024 meta-analyses confirm that 1.6–2.0g/kg/day of protein
          is optimal even for pure endurance athletes, and this number should be consistent regardless
          of training volume.
        </p>
        <p>
          On a big ride day, protein intake is often crowded out by the carbohydrate volume required.
          Prioritise protein at breakfast and post-ride, then fill carbohydrates around it.
        </p>

        <h2>How MacroClawAgent automates this</h2>
        <p>
          When you sync a Strava ride, MacroClawAgent:
        </p>
        <ol>
          <li>Reads the activity type, duration, average heart rate, and estimated calorie burn from Strava</li>
          <li>Recalculates your TDEE for the day using your profile weight and the activity data</li>
          <li>Updates your macro targets (calories, carbs, protein) in real time</li>
          <li>The Claw Agent uses those updated targets in meal recommendations for the rest of the day</li>
          <li>If it's post-ride, the agent prioritises recovery meals with high carb + protein ratios</li>
        </ol>
        <p>
          The result: you never need to manually calculate ride-day adjustments. The data flows from
          Strava to your nutrition targets automatically.
        </p>

        <h2>Practical next step</h2>
        <p>
          Connect your Strava account in MacroClawAgent settings and do a test ride. After the activity
          syncs, open the dashboard and watch your daily targets update. Then ask the Claw Agent for
          post-ride meal options — it will build an Uber Eats cart matched to your recovery macros.
        </p>
        <p>
          Precision fueling doesn't require a sports dietitian on retainer. It requires the right data
          flowing to the right tools.
        </p>
      </div>
    ),
  },
  "ai-nutrition-coaching": {
    slug: "ai-nutrition-coaching",
    tag: "AI + Nutrition",
    tagColor: "text-indigo-400 bg-indigo-500/10",
    tagBorder: "border-indigo-500/20",
    title: "Why AI Nutrition Coaching is Changing Athletic Performance",
    excerpt: "Human coaches are expensive and unavailable at 11pm when you're logging your third meal. Here's why AI is closing that gap.",
    date: "Feb 10, 2026",
    readTime: "8 min read",
    emoji: "🤖",
    gradient: "from-indigo-900/40 to-[#0F111A]",
    toc: [
      "What makes AI coaching different from a nutrition app",
      "The three gaps AI fills",
      "Where AI nutrition still requires human judgement",
      "The model behind MacroClawAgent",
      "What this looks like in practice",
    ],
    author: {
      name: "Lena W.",
      role: "Co-founder & CTO",
      initials: "LW",
      gradient: "from-indigo-500 to-violet-600",
      bio: "Marathon runner and engineer. Built MacroClawAgent to make intelligent nutrition guidance available at 11pm, not just in scheduled appointments.",
    },
    relatedSlugs: ["fueling-strava-rides", "protein-targets-athletes"],
    body: (
      <div className="prose-content">
        <p>
          The best nutrition coaching in the world used to require two things: a qualified sports
          dietitian and money. A lot of both. Elite coaches charge $200–400 per hour and are booked
          months out. For recreational athletes — even serious ones — personalised nutrition guidance
          has always been out of reach.
        </p>
        <p>
          AI is changing that. Not by replacing good nutritionists, but by making intelligent,
          context-aware nutrition guidance available at the moments it's actually useful: 11pm when
          you're logging your third meal, Sunday morning when you're meal prepping for the week,
          or 30 minutes post-workout when you need a recovery meal recommendation fast.
        </p>

        <h2>What makes AI coaching different from a nutrition app</h2>
        <p>
          Traditional nutrition apps are calculators. They take your profile data, apply a formula
          (Harris-Benedict, Mifflin-St Jeor), and output a target. They don't adapt. They don't reason.
          They don't understand context.
        </p>
        <p>
          Ask MyFitnessPal what to eat after a hard 10km run and it will show you a food search bar.
          Ask the Claw Agent and it will:
        </p>
        <ul>
          <li>Check your Strava data and see you ran at 5:15/km average, burning 650 kcal</li>
          <li>Calculate how much protein and carbohydrate you have remaining for the day</li>
          <li>Factor in your food preferences from your history (you logged Thai food 6 times last month)</li>
          <li>Search nearby restaurants on Uber Eats for high-protein recovery options</li>
          <li>Build you a cart: 45g protein, 80g carbs, under 700 kcal</li>
        </ul>
        <p>
          This is the difference between a tool that stores data and one that reasons about it.
        </p>

        <h2>The three gaps AI fills</h2>

        <h3>1. Availability</h3>
        <p>
          Human coaches are available during business hours. Athletes train at 6am, race on weekends,
          and make food decisions at midnight. AI is available at the exact moment the decision happens.
          The value of nutrition guidance scales massively when it's delivered at decision-point, not
          in a scheduled weekly check-in.
        </p>

        <h3>2. Contextual memory</h3>
        <p>
          A good coach remembers your history: the foods that gave you GI issues, the protein sources
          you prefer, the weeks you over-reached and crashed. AI systems that integrate your training
          logs and food history can build the same contextual model — and recall it instantly.
        </p>
        <p>
          MacroClawAgent's Claw Agent is given your training history, macro targets, and food preferences
          with every interaction. It doesn't start from scratch each conversation.
        </p>

        <h3>3. Cost and access</h3>
        <p>
          This one is obvious but important. Sports nutrition coaching for recreational athletes has
          historically been a luxury. AI democratises that access. Serious athletes earning median
          incomes can now have the same quality of nutrition guidance previously available only to
          professional athletes with sports science support teams.
        </p>

        <h2>Where AI nutrition still requires human judgement</h2>
        <p>
          We should be honest about what AI gets wrong.
        </p>
        <p>
          AI nutrition tools are not medical devices and should not replace clinical nutrition assessment
          for people with disordered eating, specific medical conditions, or complex dietary requirements.
          The Claw Agent operates within a well-defined domain: helping athletes hit macro targets to
          support training and recovery. It is not a dietitian, and it doesn't pretend to be.
        </p>
        <p>
          Where precision matters most — competitive professional athletes, people with medical dietary
          requirements, complex eating disorder recovery — human expertise remains essential. AI
          accelerates good habits. It doesn't replace professional clinical care.
        </p>

        <h2>The model behind MacroClawAgent</h2>
        <p>
          The Claw Agent is built on Anthropic's Claude. Anthropic is one of the leading AI safety
          companies in the world, and Claude is specifically designed to be honest, helpful, and harmless.
          That matters for nutrition advice — where overconfidence or incorrect recommendations can
          genuinely harm performance or health.
        </p>
        <p>
          Claude is given a structured context at the start of every conversation: your profile, your
          day's macros, your recent training, and your preferences. It reasons within that context rather
          than generating generic advice.
        </p>
        <p>
          The result is guidance that feels like it comes from a coach who knows you — because it's
          built on data that does.
        </p>

        <h2>What this looks like in practice</h2>
        <p>
          Athletes using AI nutrition coaching consistently report two outcomes: they hit their protein
          targets more consistently, and they spend less cognitive energy on food decisions. That
          cognitive load reduction — not having to think through "what should I eat" from scratch
          every meal — turns out to be a meaningful performance advantage in itself.
        </p>
        <p>
          Decision fatigue is real. Athletes already make hundreds of micro-decisions in a training
          session. Having a system that eliminates the nutrition decision is, functionally, a
          performance enhancement.
        </p>
      </div>
    ),
  },
  "protein-targets-athletes": {
    slug: "protein-targets-athletes",
    tag: "Science",
    tagColor: "text-emerald-400 bg-emerald-500/10",
    tagBorder: "border-emerald-500/20",
    title: "The Science Behind Protein Targets for Endurance Athletes",
    excerpt: "0.8g/kg? 1.6g/kg? 2.2g/kg? The research on protein needs for endurance athletes is clearer than you think — and the number is probably higher than your app suggests.",
    date: "Jan 28, 2026",
    readTime: "10 min read",
    emoji: "🥩",
    gradient: "from-emerald-900/40 to-[#0F111A]",
    toc: [
      "The outdated RDA and why it's not a target",
      "Why endurance athletes need more protein than expected",
      "Current evidence-based recommendations",
      "Per-meal distribution matters more than daily totals",
      "Food sources and bioavailability",
      "What this means for your app",
    ],
    author: {
      name: "Yuki T.",
      role: "Head of AI",
      initials: "YT",
      gradient: "from-emerald-500 to-teal-600",
      bio: "Triathlete and ex-Anthropic engineer. Digs deep into sports nutrition literature so athletes don't have to.",
    },
    relatedSlugs: ["fueling-strava-rides", "ai-nutrition-coaching"],
    body: (
      <div className="prose-content">
        <p>
          Ask ten endurance athletes what their protein target is and you'll get ten different answers.
          0.8g/kg. 1.2g/kg. 1.6g/kg. Some will say "I just try to eat enough." The variance reflects
          a genuine scientific debate that has evolved significantly over the past decade — and the
          consensus has shifted toward higher intakes than most popular nutrition apps recommend.
        </p>

        <h2>The outdated RDA and why it's not a target</h2>
        <p>
          The Recommended Dietary Allowance (RDA) for protein is 0.8g per kg of bodyweight per day.
          This is the amount required to prevent deficiency in sedentary adults. It is a minimum
          floor, not an optimisation target.
        </p>
        <p>
          For athletes — particularly endurance athletes under high training loads — 0.8g/kg is clearly
          insufficient. The 2024 International Society of Sports Nutrition (ISSN) position stand
          recommends 1.4–2.0g/kg/day for exercising individuals, with higher intakes during caloric
          restriction or periods of increased training load.
        </p>

        <h2>Why endurance athletes need more protein than expected</h2>
        <p>
          Endurance athletes often think of protein as a strength-sport nutrient — for bodybuilders and
          powerlifters, not runners and cyclists. This is a significant misconception.
        </p>
        <p>
          During prolonged aerobic exercise, amino acid oxidation (using protein as fuel) increases
          substantially, particularly of branched-chain amino acids (BCAAs). A 2-hour run can oxidise
          3–5g of leucine alone. This isn't muscle breakdown — it's normal substrate use — but it
          increases the daily protein requirement to maintain nitrogen balance.
        </p>
        <p>
          Beyond fuel, protein is essential for:
        </p>
        <ul>
          <li><strong>Muscle damage repair:</strong> Eccentric loading in running causes significant muscle fibre disruption. Protein is the substrate for repair.</li>
          <li><strong>Connective tissue synthesis:</strong> Tendons, ligaments, and cartilage all require amino acids for maintenance and adaptation. Collagen synthesis specifically requires adequate glycine and proline.</li>
          <li><strong>Immune function:</strong> High training loads suppress immune function. Protein inadequacy compounds this effect.</li>
          <li><strong>Haemoglobin production:</strong> Endurance athletes have higher erythropoiesis (red blood cell production). Haemoglobin is a protein.</li>
          <li><strong>Enzyme synthesis:</strong> Aerobic metabolism depends on mitochondrial enzymes — all of which are proteins.</li>
        </ul>

        <h2>Current evidence-based recommendations</h2>
        <p>
          Based on the 2024 literature, the following ranges represent current best evidence for
          endurance athletes:
        </p>
        <ul>
          <li><strong>Maintenance phase / moderate training:</strong> 1.4–1.6g/kg/day</li>
          <li><strong>High training load / competition phase:</strong> 1.6–2.0g/kg/day</li>
          <li><strong>Caloric restriction + training (cutting):</strong> 1.8–2.4g/kg/day (muscle preservation requires higher intake in a deficit)</li>
          <li><strong>Master athletes (over 40):</strong> 1.8–2.2g/kg/day (anabolic resistance requires higher per-meal doses)</li>
        </ul>

        <h2>Per-meal distribution matters more than daily totals</h2>
        <p>
          The muscle protein synthesis (MPS) response to protein is dose-dependent up to approximately
          0.4g/kg per meal (around 28g protein for a 70kg athlete), after which additional protein in a
          single meal produces diminishing MPS returns — the excess is oxidised.
        </p>
        <p>
          This means distributing protein across 4–5 meals per day produces greater MPS than consuming
          the same daily total in 1–2 large servings. Hitting 160g of daily protein via 4 meals of 40g
          is substantially more anabolic than 160g split between breakfast and dinner.
        </p>
        <p>
          In practice, this means:
        </p>
        <ul>
          <li>A protein-rich breakfast (30–40g) — often skipped by endurance athletes</li>
          <li>A pre-ride/training snack with 15–20g protein if the session is 2+ hours post-breakfast</li>
          <li>A post-training recovery meal with 30–40g protein within 2 hours of finishing</li>
          <li>A protein-rich dinner</li>
          <li>Pre-sleep casein (cottage cheese, Greek yoghurt) shown to increase overnight MPS by ~22% in trained athletes</li>
        </ul>

        <h2>Food sources and bioavailability</h2>
        <p>
          Not all proteins are created equal. The Digestible Indispensable Amino Acid Score (DIAAS)
          replaces the older PDCAAS as the gold standard metric for protein quality:
        </p>
        <ul>
          <li><strong>Highest quality:</strong> Whey, casein, eggs, milk protein (DIAAS &gt; 1.0)</li>
          <li><strong>High quality:</strong> Beef, chicken, fish, soy (DIAAS 0.9–1.0)</li>
          <li><strong>Moderate:</strong> Legumes, tofu (DIAAS 0.6–0.9)</li>
          <li><strong>Lower:</strong> Most plant proteins in isolation (DIAAS &lt; 0.7)</li>
        </ul>
        <p>
          Plant-based athletes should aim for the higher end of protein ranges (1.8–2.2g/kg) and
          combine protein sources to ensure a complete amino acid profile — rice + legumes, for example.
        </p>

        <h2>What this means for your app</h2>
        <p>
          Most nutrition apps set protein targets at 0.8–1.2g/kg — the sedentary adult RDA or the
          lower end of athletic ranges. If you're an endurance athlete with significant training volume,
          you are almost certainly running below optimal.
        </p>
        <p>
          MacroClawAgent sets your protein targets based on your training volume (synced from Strava),
          body weight, and goals — defaulting to performance-optimised ranges rather than minimum
          adequacy thresholds.
        </p>
        <p>
          The Claw Agent also monitors your per-meal protein distribution, flagging when you're
          front-loading or back-loading protein in a way that reduces your MPS window throughout the day.
        </p>
        <p>
          The science is clear: endurance athletes need more protein than most of us eat, distributed
          more evenly than most of us manage. The tools to do this accurately are now available.
        </p>
      </div>
    ),
  },
};

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];
  if (!post) notFound();

  const relatedPosts = post.relatedSlugs
    ? post.relatedSlugs.map((s) => posts[s]).filter(Boolean)
    : [];

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://macroclawagent.com/blog/${post.slug}`)}`;

  return (
    <div className="min-h-screen bg-[#08090D]">
      <Navbar />
      <BlogProgress />
      <main className="pt-16">

        {/* ── Article Hero ── */}
        <section className="relative overflow-hidden">
          <div className="relative min-h-[420px] md:min-h-[520px] flex items-end">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover object-center"
                priority
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient}`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/70 to-[#08090D]/20" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12 w-full">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
                <span>/</span>
                <span className={post.tagColor.split(" ")[0]}>{post.tag}</span>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${post.tagColor} ${post.tagBorder}`}>
                  {post.tag}
                </span>
                <span className="text-xs text-slate-400">{post.date}</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">{post.readTime}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-black text-slate-100 leading-tight mb-4">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg text-slate-300 leading-relaxed mb-6 max-w-2xl">
                {post.excerpt}
              </p>

              {/* Author byline */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${post.author.gradient} flex items-center justify-center text-sm font-black text-white`}>
                  {post.author.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{post.author.name}</p>
                  <p className="text-xs text-slate-500">{post.author.role}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Body + Sidebar ── */}
        <section className="py-12 pb-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid lg:grid-cols-[1fr_260px] gap-10 items-start">

              {/* Main article */}
              <div className="min-w-0">
                <div className="glass-card p-8 md:p-12 article-body">
                  {post.body}
                </div>

                {/* Author card */}
                <div className="mt-8 glass-card p-6 flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${post.author.gradient} flex items-center justify-center text-lg font-black text-white flex-shrink-0`}>
                    {post.author.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 mb-0.5">{post.author.name}</p>
                    <p className="text-xs text-indigo-400 font-medium mb-2">{post.author.role}</p>
                    <p className="text-sm text-slate-400 leading-relaxed">{post.author.bio}</p>
                    <p className="text-xs text-slate-600 mt-3">Written for MacroClawAgent · {post.date}</p>
                  </div>
                </div>

                {/* Share row */}
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-sm text-slate-500 font-medium">Share:</span>
                  <CopyLinkButton />
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all duration-200"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    Share on X
                  </a>
                </div>

                {/* Related posts */}
                {relatedPosts.length > 0 && (
                  <div className="mt-12">
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-5">
                      Related articles
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/blog/${related.slug}`}
                          className="glass-card p-5 flex flex-col gap-2 hover:border-indigo-500/30 transition-colors group"
                        >
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start border ${related.tagColor} ${related.tagBorder}`}>
                            {related.tag}
                          </span>
                          <p className="text-sm font-bold text-slate-200 leading-snug group-hover:text-indigo-200 transition-colors">
                            {related.title}
                          </p>
                          <span className="text-xs text-slate-600">{related.readTime}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom CTA */}
                <div className="mt-12 glass-card glow-border p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
                  <Image
                    src="/mascot.png"
                    alt="MacroClaw"
                    width={72}
                    height={72}
                    className="object-contain flex-shrink-0"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-bold text-slate-100 mb-1">Let the Claw Agent apply this.</p>
                    <p className="text-sm text-slate-400">
                      MacroClawAgent syncs your Strava data and sets evidence-based targets automatically.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <Button variant="glow" size="default" asChild>
                      <Link href="/login">
                        Get Started Free
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="default" asChild>
                      <Link href="/blog">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        More articles
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="hidden lg:block sticky top-24 space-y-4">
                <div className="glass-card p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                    In this article
                  </p>
                  <nav className="flex flex-col gap-1">
                    {post.toc.map((heading, i) => (
                      <span
                        key={i}
                        className="text-sm text-slate-400 hover:text-slate-200 leading-snug cursor-pointer transition-colors py-1 border-l-2 border-transparent hover:border-indigo-500 pl-3"
                      >
                        {heading}
                      </span>
                    ))}
                  </nav>
                </div>

                <div className="glass-card border border-indigo-500/20 p-5 flex flex-col gap-3">
                  <p className="text-sm font-bold text-slate-100">Let the Claw apply this →</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connect Strava. Get evidence-based targets. Order recovery meals automatically.
                  </p>
                  <Button variant="glow" size="sm" asChild className="w-full">
                    <Link href="/login">Start Free</Link>
                  </Button>
                </div>
              </aside>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
