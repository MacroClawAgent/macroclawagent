import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Twitter } from "lucide-react";
import { BlogProgress } from "@/components/blog/BlogProgress";
import { CopyLinkButton } from "@/components/blog/CopyLinkButton";

type LearnPost = {
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

const posts: Record<string, LearnPost> = {
  "fueling-strava-rides": {
    slug: "fueling-strava-rides",
    tag: "Performance",
    tagColor: "text-[#20C7B7] bg-[rgba(32,199,183,0.10)]",
    tagBorder: "border-[rgba(32,199,183,0.20)]",
    title: "How to Fuel Your Strava Rides with Precision Macros",
    excerpt: "Stop guessing your carb intake on ride day. Here's how to sync your training load with your nutrition targets automatically.",
    date: "Feb 18, 2026",
    readTime: "6 min read",
    emoji: "🚴",
    gradient: "from-[rgba(32,199,183,0.40)] to-[#0F111A]",
    coverImage: "/cyclists.png",
    toc: [
      "Why your calorie target needs to move with your rides",
      "Carbohydrate requirements for cyclists",
      "The three-window fueling framework",
      "Protein on ride days",
      "How Jonno automates this",
      "Practical next step",
    ],
    author: {
      name: "Marco R.",
      role: "Co-founder & CEO",
      initials: "MR",
      gradient: "from-[#20C7B7] to-[#4C7DFF]",
      bio: "Cyclist and ex-consultant. Built Jonno after years of training hard and eating wrong.",
    },
    relatedSlugs: ["ai-nutrition-coaching", "zone-2-fat-adaptation"],
    body: (
      <div className="prose-content">
        <p>
          If you're logging every watt and every kilometre on Strava but still eating the same 2,000-calorie diet on your long ride days as on your rest days, you're leaving performance and recovery on the table. Most cyclists are meticulous about their training data, power, cadence, heart rate, elevation, yet nutrition remains a daily guess. Fueling precision isn't reserved for Tour de France professionals. It's a lever available to any cyclist willing to connect their training data to their plate, and the technology to do it automatically now exists.
        </p>

        <h2>Why your calorie target needs to move with your rides</h2>
        <p>
          Total Daily Energy Expenditure (TDEE) is not a fixed number, it shifts dramatically depending on what you did that day. A 90-minute Zone 2 ride burns roughly 600–900 kcal depending on body weight and intensity, while a 4-hour fondo at threshold effort can add 2,500–3,500 kcal above your Basal Metabolic Rate. These are not marginal differences; they represent the difference between a recovery day and a day where you need to essentially eat an extra meal's worth of fuel just to break even on energy balance. The tragedy is that most nutrition apps calculate your TDEE once during initial setup, choosing a static activity multiplier like "moderately active", and never revisit it again regardless of what your Strava feed actually looks like. The result is systematic underfueling on hard training days and potential overfueling on recovery days, both of which compromise adaptation. Your nutrition targets should update every time your training data updates, which is exactly what Jonno does via the Strava OAuth sync.
        </p>

        <h2>Carbohydrate requirements for cyclists</h2>
        <p>
          Glycogen, the polymerised form of glucose stored in your muscles and liver, is the dominant fuel source above approximately 70% of VO2max. At the intensities most amateur cyclists train and race at, glycogen provides the majority of energy, and its depletion is what causes the dreaded "bonk." Research on carbohydrate requirements for endurance athletes has produced fairly consistent ranges across training loads. Recovery rides under 90 minutes call for 3–5g of carbohydrate per kg of bodyweight per day; moderate sessions of 90–120 minutes at moderate intensity require 5–7g/kg; high-intensity or long rides of two to five hours demand 6–10g/kg; and extreme training volumes comparable to stage racing require 8–12g/kg per day. For a 70kg cyclist doing a 3-hour endurance ride, that translates to 420–700g of carbohydrates on that single day, a quantity that simply doesn't happen by accident and requires deliberate planning.
        </p>

        <h2>The three-window fueling framework</h2>
        <p>
          Rather than thinking about daily carbohydrate totals in the abstract, the most practical framework structures intake around three specific windows relative to the ride. In the two to three hours before riding, the goal is consuming 1–4g/kg of easily digestible carbohydrates with low fat and moderate protein to top up liver glycogen without causing gastrointestinal distress. Oats, banana, white rice, and white bread with jam are excellent choices here, the key characteristic being low fibre content, which accelerates gastric emptying. During efforts lasting over 75 minutes, 30–90g of carbohydrates per hour is the evidence-based target, with the higher end of that range achievable only when mixing glucose and fructose in a 2:1 ratio, which engages two separate intestinal transporters and allows absorption rates above 90g/hour. Sports gels, chews, dates, or rice cakes all work well depending on personal preference. Finally, the post-ride window within 30–60 minutes of finishing calls for 1–1.2g/kg of carbohydrates combined with 0.3–0.4g/kg of protein to maximise glycogen resynthesis while simultaneously initiating muscle repair, this is the window where getting the right food quickly matters most, as muscle glycogen synthesis rates are highest immediately after exercise.
        </p>

        <h2>Protein on ride days</h2>
        <p>
          Endurance cyclists frequently fall into the trap of thinking that big ride days are purely about carbohydrate replacement, letting protein intake slide in favour of hitting the carb targets. This is a meaningful error. Meta-analyses published in 2024 confirm that 1.6–2.0g of protein per kg of bodyweight per day represents the optimal range even for pure endurance athletes, and this target should hold steady regardless of training volume or intensity. The challenge on high-volume training days is that the sheer quantity of carbohydrates required, potentially 600–800g, can crowd protein out of the diet if it isn't prioritised strategically. The practical solution is to front-load protein at breakfast and prioritise it in the post-ride recovery meal, then fill remaining calories with carbohydrates in the meals that follow. Spreading protein evenly across four to five meals throughout the day also produces superior muscle protein synthesis compared to concentrating it in one or two large servings.
        </p>

        <h2>How Jonno automates this</h2>
        <p>
          When a Strava ride syncs to Jonno, the system reads the activity type, duration, average heart rate, and estimated calorie burn from the Strava data feed. Using your current profile weight alongside this activity data, it recalculates your TDEE for the day and updates your macro targets, calories, carbohydrates, and protein, in real time. The Jonno Agent then incorporates these updated targets into every meal recommendation it makes for the remainder of the day. If the sync occurs post-ride, the agent prioritises recovery meals with high carbohydrate-to-protein ratios and can surface specific options from nearby restaurants on Uber Eats that match the calculated targets. The end result is that you never need to manually calculate ride-day nutrition adjustments. The data flows from Strava through to your nutrition plan entirely automatically, eliminating the daily cognitive overhead of figuring out how much more you need to eat when you've done a long session.
        </p>

        <h2>Practical next step</h2>
        <p>
          Connect your Strava account in Jonno settings and complete a training ride. Once the activity syncs, which takes under a minute, open your dashboard and observe how your daily macro targets have shifted relative to a rest day. From there, open the Jonno Agent and ask for post-ride meal options. It will build an Uber Eats cart matched to your exact recovery macros based on what's available near you. Precision fueling at this level doesn't require a sports dietitian on retainer or hours of manual calculation. It requires the right data flowing into the right tools, and the entire setup takes less than five minutes.
        </p>
      </div>
    ),
  },

  "ai-nutrition-coaching": {
    slug: "ai-nutrition-coaching",
    tag: "AI + Nutrition",
    tagColor: "text-blue-600 bg-blue-50",
    tagBorder: "border-blue-200",
    title: "Why AI Nutrition Coaching is Changing Athletic Performance",
    excerpt: "Human coaches are expensive and unavailable at 11pm when you're logging your third meal. Here's why AI is closing that gap.",
    date: "Feb 10, 2026",
    readTime: "8 min read",
    emoji: "🤖",
    gradient: "from-indigo-900/40 to-[#0F111A]",
    coverImage: "/gym.png",
    toc: [
      "What makes AI coaching different from a nutrition app",
      "The three gaps AI fills",
      "Where AI nutrition still requires human judgement",
      "The model behind Jonno",
      "What this looks like in practice",
    ],
    author: {
      name: "Lena W.",
      role: "Co-founder & CTO",
      initials: "LW",
      gradient: "from-indigo-500 to-violet-600",
      bio: "Marathon runner and engineer. Built Jonno to make intelligent nutrition guidance available at 11pm, not just in scheduled appointments.",
    },
    relatedSlugs: ["fueling-strava-rides", "protein-targets-athletes"],
    body: (
      <div className="prose-content">
        <p>
          The best nutrition coaching in the world used to require two things: a qualified sports
          dietitian and money. A lot of both. Elite coaches charge $200–400 per hour and are booked
          months out. For recreational athletes, even serious ones, personalised nutrition guidance
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
          Ask the Jonno Agent and it will:
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
          logs and food history can build the same contextual model, and recall it instantly.
        </p>
        <p>
          Jonno's agent is given your training history, macro targets, and food preferences
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
          The Jonno Agent operates within a well-defined domain: helping athletes hit macro targets to
          support training and recovery. It is not a dietitian, and it doesn't pretend to be.
        </p>
        <p>
          Where precision matters most, competitive professional athletes, people with medical dietary
          requirements, complex eating disorder recovery, human expertise remains essential. AI
          accelerates good habits. It doesn't replace professional clinical care.
        </p>

        <h2>The model behind Jonno</h2>
        <p>
          The Jonno Agent is built on Anthropic's Claude. Anthropic is one of the leading AI safety
          companies in the world, and Claude is specifically designed to be honest, helpful, and harmless.
          That matters for nutrition advice, where overconfidence or incorrect recommendations can
          genuinely harm performance or health.
        </p>
        <p>
          Claude is given a structured context at the start of every conversation: your profile, your
          day's macros, your recent training, and your preferences. It reasons within that context rather
          than generating generic advice.
        </p>
        <p>
          The result is guidance that feels like it comes from a coach who knows you, because it's
          built on data that does.
        </p>

        <h2>What this looks like in practice</h2>
        <p>
          Athletes using AI nutrition coaching consistently report two outcomes: they hit their protein
          targets more consistently, and they spend less cognitive energy on food decisions. That
          cognitive load reduction, not having to think through "what should I eat" from scratch
          every meal, turns out to be a meaningful performance advantage in itself.
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
    excerpt: "0.8g/kg? 1.6g/kg? 2.2g/kg? The research on protein needs for endurance athletes is clearer than you think, and the number is probably higher than your app suggests.",
    date: "Jan 28, 2026",
    readTime: "10 min read",
    emoji: "🥩",
    gradient: "from-emerald-900/40 to-[#0F111A]",
    coverImage: "/nutrition.png",
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
          a genuine scientific debate that has evolved significantly over the past decade, and the
          consensus has shifted toward higher intakes than most popular nutrition apps recommend.
        </p>

        <h2>The outdated RDA and why it's not a target</h2>
        <p>
          The Recommended Dietary Allowance (RDA) for protein is 0.8g per kg of bodyweight per day.
          This is the amount required to prevent deficiency in sedentary adults. It is a minimum
          floor, not an optimisation target.
        </p>
        <p>
          For athletes, particularly endurance athletes under high training loads, 0.8g/kg is clearly
          insufficient. The 2024 International Society of Sports Nutrition (ISSN) position stand
          recommends 1.4–2.0g/kg/day for exercising individuals, with higher intakes during caloric
          restriction or periods of increased training load.
        </p>

        <h2>Why endurance athletes need more protein than expected</h2>
        <p>
          Endurance athletes often think of protein as a strength-sport nutrient, for bodybuilders and
          powerlifters, not runners and cyclists. This is a significant misconception.
        </p>
        <p>
          During prolonged aerobic exercise, amino acid oxidation (using protein as fuel) increases
          substantially, particularly of branched-chain amino acids (BCAAs). A 2-hour run can oxidise
          3–5g of leucine alone. This isn't muscle breakdown, it's normal substrate use, but it
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
          <li><strong>Enzyme synthesis:</strong> Aerobic metabolism depends on mitochondrial enzymes, all of which are proteins.</li>
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
          single meal produces diminishing MPS returns, the excess is oxidised.
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
          <li>A protein-rich breakfast (30–40g), often skipped by endurance athletes</li>
          <li>A pre-training snack with 15–20g protein if the session is 2+ hours post-breakfast</li>
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
          <li><strong>Highest quality:</strong> Whey, casein, eggs, milk protein (DIAAS greater than 1.0)</li>
          <li><strong>High quality:</strong> Beef, chicken, fish, soy (DIAAS 0.9–1.0)</li>
          <li><strong>Moderate:</strong> Legumes, tofu (DIAAS 0.6–0.9)</li>
          <li><strong>Lower:</strong> Most plant proteins in isolation (DIAAS less than 0.7)</li>
        </ul>
        <p>
          Plant-based athletes should aim for the higher end of protein ranges (1.8–2.2g/kg) and
          combine protein sources to ensure a complete amino acid profile, rice plus legumes, for example.
        </p>

        <h2>What this means for your app</h2>
        <p>
          Most nutrition apps set protein targets at 0.8–1.2g/kg, the sedentary adult RDA or the
          lower end of athletic ranges. If you're an endurance athlete with significant training volume,
          you are almost certainly running below optimal.
        </p>
        <p>
          Jonno sets your protein targets based on your training volume (synced from Strava),
          body weight, and goals, defaulting to performance-optimised ranges rather than minimum
          adequacy thresholds.
        </p>
        <p>
          The Jonno Agent also monitors your per-meal protein distribution, flagging when you're
          front-loading or back-loading protein in a way that reduces your MPS window throughout the day.
        </p>
        <p>
          The science is clear: endurance athletes need more protein than most of us eat, distributed
          more evenly than most of us manage. The tools to do this accurately are now available.
        </p>
      </div>
    ),
  },

  "calories-burned-running": {
    slug: "calories-burned-running",
    tag: "Performance",
    tagColor: "text-[#20C7B7] bg-[rgba(32,199,183,0.10)]",
    tagBorder: "border-[rgba(32,199,183,0.20)]",
    title: "How Many Calories Do You Actually Burn Running?",
    excerpt: "Your running app's calorie estimate can be off by 30% or more. Here's the real science behind energy expenditure and how to get accurate numbers for your nutrition.",
    date: "Mar 1, 2026",
    readTime: "9 min read",
    emoji: "🏃",
    coverImage: "/caloriesburning.png",
    gradient: "from-[rgba(76,125,255,0.40)] to-[#0F111A]",
    toc: [
      "Why calorie estimates are often wrong",
      "The science of energy expenditure during running",
      "Body weight: the biggest variable",
      "The speed paradox: faster is not always more efficient",
      "Terrain, temperature, and other modifiers",
      "Heart rate as a calorie proxy",
      "How Jonno uses this data",
      "Practical implications for your nutrition",
    ],
    author: {
      name: "Marco R.",
      role: "Co-founder & CEO",
      initials: "MR",
      gradient: "from-[#20C7B7] to-[#4C7DFF]",
      bio: "Cyclist and ex-consultant. Built Jonno after years of training hard and eating wrong.",
    },
    relatedSlugs: ["fueling-strava-rides", "carbohydrate-loading-race-day"],
    body: (
      <div className="prose-content">
        <p>
          Ask any runner how many calories they burned on their morning 10km and they'll quote their
          GPS watch with confidence. 650 calories. 720 calories. Whatever the app said. The problem is
          that wearable calorie estimates can be off by anywhere from 15% to 40% depending on the device,
          the algorithm, and the individual. For athletes making nutrition decisions based on these numbers,
          that margin of error matters enormously.
        </p>
        <p>
          Understanding the real science behind running energy expenditure helps you make better decisions
          about your nutrition, and helps you evaluate how much trust to place in any given estimate.
        </p>

        <h2>Why calorie estimates are often wrong</h2>
        <p>
          Consumer fitness devices estimate calorie burn using one of two methods: activity-based
          formulas (METs, Metabolic Equivalents of Task) or heart rate-based estimation. Neither is
          highly accurate at the individual level because both approaches require assumptions about
          your physiology that may not match reality.
        </p>
        <p>
          MET-based formulas apply a fixed energy cost per kg per minute of activity at a given speed.
          These formulas are derived from laboratory studies on average populations and don't account
          for individual differences in running economy, fitness level, or body composition.
        </p>
        <p>
          Heart rate methods are more individualised but require calibration against your personal
          VO2max, a number most devices estimate (often poorly) rather than measure directly.
        </p>
        <p>
          A 2019 Stanford study tested seven popular fitness trackers and found average calorie
          estimation errors ranging from 27% to 93%. Even the most accurate device tested had a
          mean absolute error of 27%. Put differently: if your watch says you burned 600 calories,
          the real number could plausibly be anywhere from 430 to 770 calories.
        </p>

        <h2>The science of energy expenditure during running</h2>
        <p>
          The most reliable equation for estimating calorie burn during running comes from laboratory
          measurements of oxygen consumption. Running at a steady pace consumes approximately
          1 kcal per kg per km, a surprisingly simple and robust approximation.
        </p>
        <p>
          This means a 70kg runner completing 10km burns roughly 700 kcal, regardless of pace.
          A 60kg runner doing the same 10km burns approximately 600 kcal. The pace matters less
          than you might expect for total energy expenditure over a fixed distance, what changes
          with speed is the rate of expenditure (kcal/hour), not the total per km.
        </p>
        <p>
          This is the gross calorie figure. Net calories, the amount above your resting metabolic
          rate, is somewhat lower, because you would have burned some calories sitting still during
          that same time period. For most practical nutrition purposes, gross calories are the
          relevant figure when calculating how much more food to eat on training days.
        </p>

        <h2>Body weight: the biggest variable</h2>
        <p>
          The single biggest determinant of calorie burn during running is body mass. Heavier runners
          burn more calories per kilometre, proportionally so. A 90kg runner burns approximately
          900 kcal per 10km. A 55kg runner burns approximately 550 kcal for the same distance.
        </p>
        <p>
          This has a direct implication for nutrition: as your body weight changes (through training
          or intentional manipulation), your calorie expenditure per session changes too. Nutrition
          apps that don't update your calorie burn estimates when your weight changes are systematically
          miscalculating your energy needs.
        </p>
        <p>
          Jonno re-calculates activity-based calorie expenditure using your current profile weight
          every time a Strava activity syncs, not a cached number from your initial setup.
        </p>

        <h2>The speed paradox: faster is not always more efficient</h2>
        <p>
          While total calorie burn per km is relatively constant across moderate speeds, very slow
          running (below about 6:00/km for most athletes) actually burns more calories per km than
          moderate running. This counterintuitive finding reflects the metabolic cost of the
          walking-to-running gait transition and reduced running economy at low speeds.
        </p>
        <p>
          At very high speeds, above threshold, energy expenditure per km rises again because the
          aerobic system is augmented by anaerobic glycolysis, which is metabolically expensive.
        </p>
        <p>
          The practical takeaway: easy recovery runs still burn meaningful calories, and very hard
          interval sessions burn disproportionately more. The 1 kcal/kg/km rule applies best to
          moderate aerobic running.
        </p>

        <h2>Terrain, temperature, and other modifiers</h2>
        <p>
          Several factors can meaningfully increase calorie burn above the flat-road baseline:
        </p>
        <ul>
          <li><strong>Uphill running:</strong> An additional 3–8 kcal per 10m of vertical gain depending on body weight and gradient</li>
          <li><strong>Trail and sand running:</strong> 20–35% higher energy cost than road running due to proprioceptive demands and unstable surface</li>
          <li><strong>Cold weather:</strong> A modest increase of 7–14% in calorie burn as your body generates heat to maintain core temperature</li>
          <li><strong>Heat and humidity:</strong> Additional cardiovascular load increases HR without proportionally increasing mechanical work, skewing HR-based estimates upward</li>
          <li><strong>Altitude:</strong> At significant elevation, reduced air density lowers aerobic resistance but altitude-induced ventilatory increases raise overall energy cost</li>
        </ul>
        <p>
          Strava captures elevation data and terrain type, which Jonno uses to apply appropriate
          adjustments to baseline calorie estimates.
        </p>

        <h2>Heart rate as a calorie proxy</h2>
        <p>
          Heart rate correlates with oxygen consumption, and therefore calorie burn, when you're
          working aerobically. This makes HR a useful proxy, but with important limitations:
        </p>
        <p>
          The HR-to-calorie relationship is highly individual and requires calibration against your
          personal lactate threshold or VO2max. Using population-average HR formulas for an
          individual athlete can produce errors of 20–30%.
        </p>
        <p>
          Furthermore, cardiac drift, the gradual rise in heart rate during long runs even at
          constant pace, inflates HR-based calorie estimates for extended efforts. On a 3-hour
          marathon training run, cardiac drift may cause HR-based algorithms to overestimate calorie
          burn by 15% or more in the final hour.
        </p>
        <p>
          The most accurate approach combines distance-based estimation (using body weight) with
          HR data to account for intensity variation within a session. This is the methodology
          Jonno applies when processing Strava activities.
        </p>

        <h2>How Jonno uses this data</h2>
        <p>
          When a run syncs from Strava, Jonno ingests distance, duration, average heart rate,
          elevation gain, and activity type. It applies a multi-factor calorie calculation:
        </p>
        <ol>
          <li>Base expenditure from distance and current bodyweight (1 kcal/kg/km)</li>
          <li>Intensity modifier from average heart rate relative to your estimated max HR</li>
          <li>Elevation adjustment from Strava's elevation data</li>
          <li>The result updates your TDEE for the day, adjusting your macro targets accordingly</li>
        </ol>
        <p>
          This approach is more accurate than either pure MET tables or raw HR estimation alone,
          and automatically incorporates the personal variable (your body weight) that most generic
          algorithms ignore.
        </p>

        <h2>Practical implications for your nutrition</h2>
        <p>
          Rather than trusting a single wearable estimate, use a range. After a 10km run, your
          true calorie burn is likely within 15% of the weight-based estimate (1 kcal/kg/km).
          Build your nutrition plan around that figure, not the more variable HR-based number
          your watch produces.
        </p>
        <p>
          On easy days, use the lower end of your calorie estimate. On hard days with significant
          elevation or intensity, use the upper end. Track your body weight and energy levels
          over 2–3 week blocks to calibrate whether your calorie estimates are landing correctly.
        </p>
        <p>
          The goal isn't perfect accuracy, it's consistent, principled estimation that you
          can adjust based on real-world feedback. Your body is the most accurate measuring
          device you have. The data is just a starting point.
        </p>
      </div>
    ),
  },

  "carbohydrate-loading-race-day": {
    slug: "carbohydrate-loading-race-day",
    tag: "Science",
    tagColor: "text-emerald-400 bg-emerald-500/10",
    tagBorder: "border-emerald-500/20",
    title: "Carbohydrate Loading for Race Day: What the Science Actually Says",
    excerpt: "Carb loading is one of the most misunderstood strategies in endurance sport. The protocol most athletes follow is outdated. Here's what the evidence actually supports.",
    date: "Feb 25, 2026",
    readTime: "11 min read",
    emoji: "🍝",
    coverImage: "/carbs.png",
    gradient: "from-amber-900/40 to-[#0F111A]",
    toc: [
      "What carbohydrate loading actually does",
      "The original protocol vs. modern evidence",
      "Who actually benefits from carb loading",
      "The 48-hour carb loading protocol",
      "What to eat and what to avoid",
      "The GI risk and how to manage it",
      "Race morning nutrition",
      "Common mistakes",
    ],
    author: {
      name: "Yuki T.",
      role: "Head of AI",
      initials: "YT",
      gradient: "from-emerald-500 to-teal-600",
      bio: "Triathlete and ex-Anthropic engineer. Digs deep into sports nutrition literature so athletes don't have to.",
    },
    relatedSlugs: ["fueling-strava-rides", "gut-health-athletes"],
    body: (
      <div className="prose-content">
        <p>
          The night before a big race, every amateur endurance athlete does the same thing: they eat
          a massive bowl of pasta. Sometimes two. They've heard about carbohydrate loading. They know
          glycogen is the primary fuel for racing. What they're less clear on is whether what they're
          doing actually works, and the answer, based on current evidence, is: sometimes, and not
          in the way most people think.
        </p>
        <p>
          Carbohydrate loading has solid scientific support for specific race distances and conditions.
          It's also one of the most commonly misapplied nutritional strategies in recreational sport.
          Understanding the actual physiology helps you decide whether to do it, and how to do it correctly.
        </p>

        <h2>What carbohydrate loading actually does</h2>
        <p>
          Your muscles store glycogen, the polymerised form of glucose, at rest. An average trained
          athlete stores approximately 400–500g of glycogen total: roughly 300–400g in muscle tissue
          and 80–110g in the liver. At moderate racing intensity (around marathon pace), glycogen
          provides the majority of fuel and at typical depletion rates, muscle glycogen runs critically
          low around the 90-minute to 2-hour mark of continuous exertion.
        </p>
        <p>
          This is "the wall", glycogen depletion forcing a shift to fat oxidation, which is slower
          and produces noticeably reduced power output. The goal of carbohydrate loading is to expand
          glycogen stores above normal resting levels before a race, pushing the depletion point further
          into the event.
        </p>
        <p>
          Well-executed carbohydrate loading can increase muscle glycogen concentration by 20–40%
          above normal training levels. In practical terms, this can delay glycogen depletion by
          20–30 minutes in a race lasting 2+ hours, a meaningful performance advantage.
        </p>

        <h2>The original protocol vs. modern evidence</h2>
        <p>
          The classic carbohydrate loading protocol, developed in the 1960s, involved a 3-day depletion
          phase (very high training load, low carbohydrate) followed by a 3-day loading phase (rest,
          very high carbohydrate). The theory was that glycogen depletion would "supercompensate",
          causing muscles to store more glycogen than normal when carbohydrates were reintroduced.
        </p>
        <p>
          Modern research has rendered the depletion phase unnecessary. Studies from the 1980s onward
          demonstrated that trained athletes can achieve equivalent glycogen supercompensation with
          2–3 days of high carbohydrate intake plus exercise tapering alone, without the preceding
          depletion phase. The depletion protocol adds fatigue, muscle damage, and immune suppression
          in the days before a race, a significant cost for no additional benefit.
        </p>
        <p>
          Current best-practice involves 36–48 hours of high carbohydrate intake (10–12g/kg/day)
          combined with training taper. The depletion phase is not recommended.
        </p>

        <h2>Who actually benefits from carb loading</h2>
        <p>
          Carbohydrate loading produces measurable performance benefits only for events lasting
          90 minutes or longer at moderate-to-high intensity. The research is clear on this boundary.
        </p>
        <p>
          For events shorter than 90 minutes, normal resting glycogen stores are sufficient to fuel
          the effort completely. Carb loading before a sprint triathlon, a 5km, or a 10km race
          adds calories without performance benefit. The extra glycogen simply isn't needed.
        </p>
        <p>
          Athletes who benefit most:
        </p>
        <ul>
          <li>Marathon runners (particularly at paces where glycogen is the dominant fuel)</li>
          <li>Ironman and Half-Ironman triathletes</li>
          <li>Cyclists doing events of 3+ hours</li>
          <li>Ultra-distance runners (though fat adaptation strategy may apply here instead)</li>
          <li>Team sport athletes doing 90+ minute events (though application is more complex)</li>
        </ul>

        <h2>The 48-hour carb loading protocol</h2>
        <p>
          Based on current evidence, the most practical and effective protocol for non-elite athletes:
        </p>
        <p>
          <strong>2 days before race day (D-2):</strong> Carbohydrate intake of 8–10g/kg. Training should
          be light (30–40 min easy, or complete rest). Focus on familiar, easily digestible carbohydrates.
          Total calorie intake will be significantly above normal, this is expected and necessary.
        </p>
        <p>
          <strong>1 day before race day (D-1):</strong> Carbohydrate intake of 10–12g/kg. Rest completely
          or do only a 15-20 minute shakeout run. Distribute carbohydrates evenly across 4–5 meals.
          Reduce dietary fat and fibre to make room for the higher carbohydrate volume without
          exceeding stomach capacity.
        </p>
        <p>
          For a 70kg athlete, 10–12g/kg means 700–840g of carbohydrates on the day before the race.
          This is a significant volume of food. Planning meals in advance is essential.
        </p>

        <h2>What to eat and what to avoid</h2>
        <p>
          Food choices during carb loading should prioritise digestibility and glycogen storage efficiency.
          The best options are high glycaemic index, low fibre, low fat, and low protein (relative to
          normal training days):
        </p>
        <ul>
          <li><strong>Best choices:</strong> White rice, white pasta, white bread, bagels, potatoes (without skin), banana, sports drinks, rice cakes, pretzels, pancakes, porridge</li>
          <li><strong>Moderate:</strong> Sourdough bread, sweetened yoghurt, fruit juices, sports bars</li>
          <li><strong>Avoid during loading:</strong> High-fibre vegetables (broccoli, beans, lentils), whole grain options, high-fat foods (avocado, nuts, cheese, fried food), large portions of meat or dairy</li>
        </ul>
        <p>
          The reason to avoid fibre is twofold: it slows carbohydrate absorption (reducing loading
          efficiency) and increases bowel content, raising GI distress risk on race morning.
        </p>

        <h2>The GI risk and how to manage it</h2>
        <p>
          Gastrointestinal distress is the most common side effect of carbohydrate loading, and it
          can be race-destroying. High carbohydrate intake increases water retention in muscles
          (glycogen is stored with approximately 3–4g of water per gram), leading to a bloated feeling
          and temporary weight gain of 1–2kg. This is normal and expected.
        </p>
        <p>
          To minimise GI risk:
        </p>
        <ul>
          <li>Eat familiar foods you've used in training, race week is not the time to experiment</li>
          <li>Distribute intake across 4–5 smaller meals rather than 2–3 large ones</li>
          <li>Avoid foods with artificial sweeteners (sorbitol, xylitol), they cause osmotic diarrhoea</li>
          <li>Stay well hydrated, aim for pale yellow urine throughout the loading phase</li>
          <li>Avoid alcohol completely, it impairs glycogen storage and disrupts sleep</li>
        </ul>

        <h2>Race morning nutrition</h2>
        <p>
          The pre-race meal is distinct from carbohydrate loading. Its purpose is to top up liver
          glycogen (which is depleted overnight during sleep) and maintain blood glucose, not to
          add meaningfully to muscle glycogen.
        </p>
        <p>
          Evidence-based pre-race breakfast: 1–4g/kg carbohydrates consumed 2–4 hours before the
          gun. Timing matters, eating too close to race start can cause reactive hypoglycaemia
          in some athletes. Familiar foods, low fat and fibre, moderate protein.
        </p>
        <p>
          Classic options: oats with banana and honey, white toast with jam, bagel with jam,
          rice with fruit. Coffee is fine, and may improve performance directly through
          caffeine's ergogenic effects.
        </p>

        <h2>Common mistakes</h2>
        <p>
          The most frequent carb loading errors among amateur athletes:
        </p>
        <ul>
          <li><strong>Loading for races that don't need it:</strong> Events under 90 minutes don't benefit. You'll race heavier and feel sluggish.</li>
          <li><strong>Relying solely on the pre-race dinner:</strong> One large pasta meal the night before provides only a fraction of the glycogen increase achievable with a 48-hour protocol.</li>
          <li><strong>Eating too much fat with the carbohydrates:</strong> A pasta dish loaded with cream sauce slows gastric emptying and blunts glycogen storage.</li>
          <li><strong>Trying new foods:</strong> Race week is the worst possible time to discover a food intolerance.</li>
          <li><strong>Panicking about weight gain:</strong> The 1–2kg of water weight from glycogen storage is fuel, not fat. It will be used during the race.</li>
        </ul>
        <p>
          Carbohydrate loading, done correctly, is one of the few legal and highly effective
          performance interventions in endurance sport. The science is solid. The execution
          just needs to be deliberate.
        </p>
      </div>
    ),
  },

  "sleep-recovery-nutrition": {
    slug: "sleep-recovery-nutrition",
    tag: "Recovery",
    tagColor: "text-violet-500 bg-violet-500/10",
    tagBorder: "border-violet-500/20",
    title: "Sleep, Recovery Nutrition, and Athletic Performance",
    excerpt: "Most athletes optimise their training and their diet. Almost none optimise the nutritional window that governs how well they recover between sessions: sleep.",
    date: "Feb 20, 2026",
    readTime: "8 min read",
    emoji: "😴",
    coverImage: "/sleep.png",
    gradient: "from-violet-900/40 to-[#0F111A]",
    toc: [
      "What happens physiologically during sleep",
      "The protein synthesis window you're missing",
      "Carbohydrates, serotonin, and sleep quality",
      "Micronutrients that affect recovery and sleep",
      "What to eat in the 2 hours before bed",
      "Timing your last training session",
      "Alcohol and recovery: the evidence",
      "Building a recovery nutrition routine",
    ],
    author: {
      name: "Lena W.",
      role: "Co-founder & CTO",
      initials: "LW",
      gradient: "from-indigo-500 to-violet-600",
      bio: "Marathon runner and engineer. Built Jonno to make intelligent nutrition guidance available at 11pm, not just in scheduled appointments.",
    },
    relatedSlugs: ["protein-targets-athletes", "gut-health-athletes"],
    body: (
      <div className="prose-content">
        <p>
          Athletes obsess over their training splits, their protein timing, their post-workout shakes.
          Most of them pay almost no attention to the 7–9 hours they spend unconscious, the period
          during which the actual adaptation from training occurs. Sleep is the most underrated
          performance variable in endurance sport, and nutrition plays a direct role in how well you
          use it.
        </p>
        <p>
          This isn't about taking melatonin. This is about understanding what your body is doing
          during sleep from a metabolic standpoint, and what you can eat to support that process.
        </p>

        <h2>What happens physiologically during sleep</h2>
        <p>
          During slow-wave (deep) sleep, the anterior pituitary releases the majority of the day's
          growth hormone (GH). GH is anabolic, it drives protein synthesis, fat mobilisation,
          and tissue repair. The GH pulse during deep sleep is the primary anabolic event for
          most athletes, exceeding the post-workout GH response in magnitude and duration.
        </p>
        <p>
          Simultaneously, cortisol (catabolic, stress hormone) reaches its 24-hour nadir in the
          early hours of sleep, creating an optimal anabolic environment. Insulin sensitivity in
          muscle tissue is elevated during sleep, allowing more efficient nutrient partitioning.
        </p>
        <p>
          The net effect: sleep is the window during which your body performs the protein synthesis,
          glycogen resynthesis, and structural repair that your training session stimulated. Without
          adequate sleep, and adequate nutrition to fuel that sleep, the adaptation doesn't occur.
          You've done the training stimulus without capturing the adaptation.
        </p>

        <h2>The protein synthesis window you're missing</h2>
        <p>
          Most athletes know about the post-workout anabolic window (the 30–60 minutes post-training
          when protein and carbohydrates are rapidly absorbed). Fewer know about the overnight protein
          synthesis window.
        </p>
        <p>
          Research from Maastricht University (Res et al., 2012 and multiple replications) demonstrates
          that consuming 40g of casein protein approximately 30 minutes before sleep significantly
          increases overnight muscle protein synthesis rates. The effect is additive to daytime protein
          intake, it's not simply redistributing protein you would have absorbed anyway.
        </p>
        <p>
          Casein is preferred over whey for this purpose because it forms a slow-digesting gel in
          the stomach, providing a sustained release of amino acids across the full 7–8 hours of
          sleep rather than a rapid spike and decline.
        </p>
        <p>
          The best food sources of casein protein:
        </p>
        <ul>
          <li><strong>Cottage cheese:</strong> 25–28g protein per 200g serving, high casein fraction, relatively low calorie</li>
          <li><strong>Greek yoghurt:</strong> 15–20g protein per 200g, good casein content, palatable</li>
          <li><strong>Milk:</strong> 80% casein, 20% whey, the original slow protein</li>
          <li><strong>Casein protein powder:</strong> Convenient, high dose achievable, micellar casein is the most studied form</li>
          <li><strong>Cheese:</strong> High in casein but also high in saturated fat, moderation</li>
        </ul>

        <h2>Carbohydrates, serotonin, and sleep quality</h2>
        <p>
          The relationship between evening carbohydrate intake and sleep is more nuanced than the
          common advice to "avoid carbs at night" suggests. Carbohydrate consumption raises blood
          insulin, which clears competing large neutral amino acids from the bloodstream, increasing
          the brain-blood ratio of tryptophan. Tryptophan is the precursor to serotonin, which
          is converted to melatonin, the sleep hormone.
        </p>
        <p>
          This means a moderate carbohydrate meal 3–4 hours before sleep may actually improve
          sleep onset and quality. A 2007 study in the American Journal of Clinical Nutrition found
          that high-glycaemic index carbohydrate meals consumed 4 hours before bedtime significantly
          reduced time to sleep onset compared to low-GI meals.
        </p>
        <p>
          For athletes, the practical implication is that the common fear of evening carbohydrates
          is largely unfounded. A moderate evening meal including carbohydrates supports both
          glycogen resynthesis (needed for the next training session) and sleep quality. The
          key is portion size and timing, not avoidance.
        </p>

        <h2>Micronutrients that affect recovery and sleep</h2>
        <p>
          Several micronutrients are directly relevant to sleep quality and recovery efficiency:
        </p>
        <ul>
          <li><strong>Magnesium:</strong> Required for over 300 enzymatic reactions including protein synthesis. Deficiency (common in athletes due to sweat losses) is associated with poor sleep quality and reduced slow-wave sleep duration. Best sources: pumpkin seeds, dark leafy greens, almonds, dark chocolate.</li>
          <li><strong>Vitamin D:</strong> Regulates hundreds of genes including those involved in immune function and protein synthesis. Deficiency impairs sleep quality. Best source: sunlight; supplementation is often needed for indoor training periods.</li>
          <li><strong>Zinc:</strong> Essential for GH secretion and immune function. Depleted by intense training. Found in oysters, red meat, pumpkin seeds, legumes.</li>
          <li><strong>Tart cherry juice:</strong> Contains melatonin and anthocyanins with anti-inflammatory properties. Multiple studies show improvements in sleep duration and muscle recovery markers when consumed before bed.</li>
        </ul>

        <h2>What to eat in the 2 hours before bed</h2>
        <p>
          An evidence-based pre-sleep nutrition approach for athletes:
        </p>
        <p>
          <strong>2 hours before sleep:</strong> A moderate carbohydrate and protein meal if dinner
          was early or you trained in the evening. Examples: rice with chicken, pasta with meat sauce,
          potatoes with fish.
        </p>
        <p>
          <strong>30–45 minutes before sleep:</strong> A small casein-rich snack to initiate the
          overnight protein synthesis window. Examples: 200g cottage cheese, 150g Greek yoghurt with
          a small amount of fruit (for insulin response), 250ml warm milk, or a 40g casein protein shake.
        </p>
        <p>
          Avoid large meals within 2 hours of sleep, elevated core temperature from digestion
          disrupts sleep architecture. Avoid high-fat meals close to bed as they significantly
          delay gastric emptying and may cause reflux. Avoid caffeine within 6 hours of sleep.
        </p>

        <h2>Timing your last training session</h2>
        <p>
          The interaction between training timing and sleep quality is an underappreciated variable.
          High-intensity exercise within 2–3 hours of sleep raises core body temperature, heart rate,
          and cortisol, all of which delay sleep onset and reduce slow-wave sleep quality.
        </p>
        <p>
          If you train in the evening (which many athletes with daytime work commitments must),
          prioritise lower intensity sessions in the final 2 hours before sleep. Reserve interval
          sessions and high-intensity work for earlier in the day when possible.
        </p>
        <p>
          Post-evening-training recovery nutrition should prioritise protein and moderate carbohydrate,
          consumed as soon as reasonably possible after the session so the body has time to begin
          the recovery process before sleep.
        </p>

        <h2>Alcohol and recovery: the evidence</h2>
        <p>
          Alcohol directly suppresses GH secretion during sleep. Even moderate alcohol intake
          (1–2 standard drinks) consumed within 3 hours of sleep reduces GH pulse amplitude
          during slow-wave sleep by up to 70%. It also increases sleep-disrupting arousals in
          the second half of the night as the body metabolises the alcohol.
        </p>
        <p>
          The implications for recovery are significant: alcohol consumed the evening after a
          training session substantially blunts the overnight anabolic response. If your training
          matters to you, alcohol the night before a training day carries a measurable performance cost.
        </p>

        <h2>Building a recovery nutrition routine</h2>
        <p>
          The cumulative effect of consistent recovery nutrition is substantial. Athletes who
          systematically eat for recovery, not just for performance, show significantly
          better training adaptations over 8–12 week blocks compared to those who eat ad hoc.
        </p>
        <p>
          A simple framework:
        </p>
        <ol>
          <li>Post-workout: 30–40g protein plus moderate carbohydrates within 60 minutes</li>
          <li>Dinner: balanced macros, moderate size, 3–4 hours before sleep</li>
          <li>Pre-sleep: 30–40g casein protein, 200ml tart cherry juice, magnesium-rich food</li>
          <li>Consistent sleep timing: circadian rhythm consistency amplifies all of the above</li>
        </ol>
        <p>
          Jonno's Agent tracks your daily protein distribution and flags when your pre-sleep
          nutrition window is empty, one of the most commonly missed fueling opportunities
          for athletes who are otherwise careful about their nutrition.
        </p>
      </div>
    ),
  },

  "zone-2-fat-adaptation": {
    slug: "zone-2-fat-adaptation",
    tag: "Performance",
    tagColor: "text-[#20C7B7] bg-[rgba(32,199,183,0.10)]",
    tagBorder: "border-[rgba(32,199,183,0.20)]",
    title: "Zone 2 Training and Fat Adaptation: What It Means for Your Diet",
    excerpt: "Zone 2 training is having a moment. But does training low actually mean eating low? Here's what fat adaptation really means for your daily nutrition strategy.",
    date: "Feb 14, 2026",
    readTime: "10 min read",
    emoji: "❤️",
    coverImage: "/zone2.png",
    gradient: "from-orange-900/40 to-[#0F111A]",
    toc: [
      "What Zone 2 actually means",
      "The physiology of fat oxidation",
      "What fat adaptation does and does not do",
      "Train low, compete high: periodised nutrition",
      "How much fat can you oxidise?",
      "Implications for your daily diet",
      "The case against going fully low-carb",
      "Practical application with Jonno",
    ],
    author: {
      name: "Marco R.",
      role: "Co-founder & CEO",
      initials: "MR",
      gradient: "from-[#20C7B7] to-[#4C7DFF]",
      bio: "Cyclist and ex-consultant. Built Jonno after years of training hard and eating wrong.",
    },
    relatedSlugs: ["fueling-strava-rides", "calories-burned-running"],
    body: (
      <div className="prose-content">
        <p>
          Zone 2 training has gone from a niche concept among exercise physiologists to a mainstream
          talking point, discussed everywhere from endurance running forums to Silicon Valley
          biohacking podcasts. The promise: train at low intensity for enough hours and your body
          will become a fat-burning machine, sparing glycogen, racing faster, and recovering better.
        </p>
        <p>
          Some of this is accurate. Some of it is overstated. And most of the discussion leaves out
          the dietary side entirely, which matters more than the training side for practical application.
        </p>

        <h2>What Zone 2 actually means</h2>
        <p>
          Zone 2 is not a precise universal definition, different coaches and researchers use different
          zone systems. In the most common 5-zone model, Zone 2 is the intensity band where you can hold
          a conversation but are breathing noticeably: roughly 60–70% of maximum heart rate, or just
          below the first lactate threshold (VT1/LT1).
        </p>
        <p>
          The defining physiological feature of Zone 2 is that it is primarily fuelled by fat oxidation
          in the mitochondria, with minimal lactate accumulation. You can sustain it for hours without
          significant metabolic fatigue. The limiting factor is musculoskeletal and time, not
          cardiorespiratory or metabolic.
        </p>
        <p>
          In contrast, Zone 3 and above increasingly relies on glycolytic (carbohydrate) metabolism,
          with rising lactate that eventually impairs performance.
        </p>

        <h2>The physiology of fat oxidation</h2>
        <p>
          Fat oxidation, burning fat for fuel, is not a binary switch. Your body is always burning
          a mixture of fat and carbohydrate, with the proportion shifting based on exercise intensity,
          training status, dietary history, and individual physiology.
        </p>
        <p>
          At rest, most athletes burn approximately 50–70% fat and 30–50% carbohydrate. As intensity
          increases, the proportion shifts toward carbohydrate. By the time you're at lactate threshold
          (around marathon pace for most runners), you're burning predominantly carbohydrate.
        </p>
        <p>
          Fat oxidation peaks, the "fatmax" point, typically occurs between 50–65% of VO2max for
          trained aerobic athletes. This is firmly within Zone 2 territory, which is why Zone 2 training
          is associated with fat adaptation: you are spending maximal time at the intensity where fat
          is the primary fuel.
        </p>
        <p>
          Training consistently in Zone 2 over months causes mitochondrial adaptations: increased
          mitochondrial density, greater fatty acid oxidation enzyme activity, and improved fat
          transport into mitochondria. The practical effect is that your fatmax point shifts upward,
          you oxidise fat at higher intensities than before.
        </p>

        <h2>What fat adaptation does and does not do</h2>
        <p>
          Fat adaptation does:
        </p>
        <ul>
          <li>Increase your peak fat oxidation rate (from roughly 0.5g/min in untrained individuals to 1.0–1.5g/min in highly trained aerobic athletes)</li>
          <li>Shift the crossover point, the intensity at which carbohydrate becomes dominant, upward, sparing glycogen at any given speed</li>
          <li>Improve metabolic flexibility, the ability to switch efficiently between fuel sources</li>
          <li>Reduce reliance on exogenous carbohydrate during low-to-moderate intensity efforts</li>
        </ul>
        <p>
          Fat adaptation does not:
        </p>
        <ul>
          <li>Eliminate the need for carbohydrate at race pace</li>
          <li>Replace glycogen as the preferred fuel above lactate threshold</li>
          <li>Allow you to race a marathon on fat alone</li>
          <li>Mean you should eat a low-carbohydrate diet</li>
        </ul>
        <p>
          This last point is where the popular discussion most often goes wrong. Fat adaptation is
          a physiological adaptation to training, not a dietary prescription.
        </p>

        <h2>Train low, compete high: periodised nutrition</h2>
        <p>
          The most evidence-supported application of fat-focused nutrition for endurance athletes
          is periodised carbohydrate availability, sometimes called "train low, compete high."
        </p>
        <p>
          The approach: perform some training sessions in a low-glycogen state (fasted early morning,
          or after a carbohydrate-restricted evening) to enhance fat oxidation adaptations, while
          performing high-quality sessions (intervals, threshold work, race-pace efforts) with full
          carbohydrate availability to maximise performance and adaptation quality.
        </p>
        <p>
          Research shows this approach produces superior mitochondrial adaptations compared to
          always training with full glycogen stores, without the performance cost of training entirely
          low-carbohydrate.
        </p>
        <p>
          In practice:
        </p>
        <ul>
          <li>Zone 2 sessions of 90 minutes or less can be performed fasted or in a low-carbohydrate state to enhance fat adaptation signals</li>
          <li>High-intensity sessions should always be performed with full glycogen, compromised fuel availability at high intensity means compromised quality and adaptation</li>
          <li>Long endurance sessions (3+ hours) should use full carbohydrate availability to support the volume without excessive fatigue</li>
        </ul>

        <h2>How much fat can you oxidise?</h2>
        <p>
          The absolute ceiling of fat oxidation matters for understanding practical nutrition.
          Even the most fat-adapted athletes oxidise fat at a maximum rate of approximately
          1.0–1.7g per minute. At the upper end, that's 9–15 kcal/minute from fat.
        </p>
        <p>
          A competitive marathon runner requires approximately 16–20 kcal/minute. The gap between
          peak fat oxidation and total energy demand at race pace must be covered by carbohydrate.
          This is an immutable biochemical reality. No amount of Zone 2 training closes this gap
          because the speed of fat oxidation is fundamentally limited by mitochondrial transport
          and enzyme kinetics.
        </p>
        <p>
          For ultradistance athletes racing at low relative intensity, fat oxidation can provide
          a larger fraction of energy, which is why some ultramarathoners do benefit from more
          fat-focused dietary approaches. For marathon runners and faster distances, carbohydrate
          remains essential at race pace.
        </p>

        <h2>Implications for your daily diet</h2>
        <p>
          If you're doing Zone 2 training to improve your aerobic base, what should your diet
          actually look like?
        </p>
        <p>
          The evidence does not support a chronically low-carbohydrate diet for endurance athletes.
          What it supports is strategic carbohydrate periodisation:
        </p>
        <ul>
          <li>High carbohydrate days (8–10g/kg) on hard training days to support quality and glycogen resynthesis</li>
          <li>Moderate carbohydrate days (5–7g/kg) on Zone 2 training days</li>
          <li>Lower carbohydrate days (3–5g/kg) on rest days or recovery-only days</li>
          <li>Fat and protein maintain stable across all days; carbohydrate is the variable macro</li>
        </ul>

        <h2>The case against going fully low-carb</h2>
        <p>
          Prolonged ketogenic or very low-carbohydrate diets in endurance athletes consistently show
          two things in research: improved fat oxidation capacity, and impaired high-intensity
          performance. The impairment at high intensity appears to be largely irreversible even after
          carbohydrate reintroduction, suggesting that chronic carbohydrate restriction downregulates
          glycolytic enzyme activity in ways that persist.
        </p>
        <p>
          For athletes competing at intensities above 70% VO2max, which includes most road running
          events and cycling races, this trade-off is not advantageous. You gain fat oxidation
          capacity you don't need at race pace while losing the glycolytic capacity you do need.
        </p>
        <p>
          The exception: ultradistance athletes competing predominantly below their lactate threshold
          may genuinely benefit from higher fat adaptation. But even here, the research is nuanced.
        </p>

        <h2>Practical application with Jonno</h2>
        <p>
          Jonno reads your Strava activity data and identifies training session types by intensity:
          Zone 2 sessions versus threshold versus intervals. Based on your session type, the agent
          adjusts your carbohydrate targets for the day accordingly:
        </p>
        <ul>
          <li>Zone 2 day: moderate carbohydrates, slight fat increase, normal protein</li>
          <li>Interval or threshold day: high carbohydrates, ensure pre- and post-session fueling</li>
          <li>Rest day: maintenance calories, lower carbohydrates, higher fat proportion</li>
        </ul>
        <p>
          This automated periodisation is something most athletes never do systematically, despite
          it being one of the most well-evidenced nutrition strategies in endurance sport. The training
          data already exists in Strava. The calculation just needs to happen automatically.
        </p>
      </div>
    ),
  },

  "gut-health-athletes": {
    slug: "gut-health-athletes",
    tag: "Science",
    tagColor: "text-emerald-400 bg-emerald-500/10",
    tagBorder: "border-emerald-500/20",
    title: "Gut Health for Athletes: Why Your Digestion Determines Your Performance",
    excerpt: "GI distress is the number one reason athletes abandon race-day nutrition plans. Understanding why your gut fails under stress, and how to fix it, can be the difference between a PR and a DNF.",
    date: "Feb 5, 2026",
    readTime: "9 min read",
    emoji: "🦠",
    coverImage: "/gut.png",
    gradient: "from-green-900/40 to-[#0F111A]",
    toc: [
      "Why runners and cyclists have GI problems",
      "The exercise-gut microbiome connection",
      "Gut training: teaching your intestines to absorb more",
      "Foods that cause problems during exercise",
      "Foods that improve gut health and performance",
      "Probiotics: what the evidence actually shows",
      "Pre-race gut preparation protocol",
      "When to see a sports dietitian",
    ],
    author: {
      name: "Yuki T.",
      role: "Head of AI",
      initials: "YT",
      gradient: "from-emerald-500 to-teal-600",
      bio: "Triathlete and ex-Anthropic engineer. Digs deep into sports nutrition literature so athletes don't have to.",
    },
    relatedSlugs: ["carbohydrate-loading-race-day", "sleep-recovery-nutrition"],
    body: (
      <div className="prose-content">
        <p>
          Thirty to fifty percent of marathon runners experience significant gastrointestinal
          distress during races. In Ironman-distance triathletes, that figure exceeds 60%. GI
          issues, nausea, cramping, bloating, diarrhoea, vomiting, are the leading cause of
          athletes failing to execute their race-day nutrition plan, and one of the most common
          reasons for DNFs in ultra-distance events.
        </p>
        <p>
          The frustrating part is that most athletes treat GI distress as an inevitable feature of
          hard racing rather than a problem to be solved. It is, in most cases, a solvable problem.
          Understanding the mechanisms that cause exercise-induced GI dysfunction opens up
          practical solutions that most athletes never attempt.
        </p>

        <h2>Why runners and cyclists have GI problems</h2>
        <p>
          Exercise creates a fundamentally hostile environment for digestion. Several mechanisms
          combine to impair gut function during intense effort:
        </p>
        <p>
          <strong>Reduced splanchnic blood flow:</strong> During intense exercise, cardiac output
          is redirected from the gut to working muscles. Blood flow to the gastrointestinal tract
          can decrease by 60–70% during maximal effort. Reduced blood flow means reduced
          absorptive capacity, increased intestinal permeability, and compromised gut motility.
        </p>
        <p>
          <strong>Mechanical trauma:</strong> Running specifically creates repetitive vertical
          impact forces that literally jostle intestinal contents. This is why runners experience
          significantly more GI distress than cyclists at comparable intensities, the mechanical
          component is absent in cycling.
        </p>
        <p>
          <strong>Hyperthermia:</strong> As core temperature rises during exercise, intestinal
          barrier integrity decreases. Increased gut permeability ("leaky gut") allows bacterial
          endotoxins to enter the bloodstream, triggering inflammatory responses that compound
          GI symptoms.
        </p>
        <p>
          <strong>Stress hormones:</strong> Cortisol and adrenaline released during intense
          exercise affect gut motility, often accelerating transit time and triggering the
          urgency many runners are familiar with.
        </p>

        <h2>The exercise-gut microbiome connection</h2>
        <p>
          Research over the past decade has established a clear relationship between exercise
          and the gut microbiome, the community of trillions of microorganisms living in the
          gastrointestinal tract.
        </p>
        <p>
          Elite endurance athletes have significantly more diverse gut microbiomes than sedentary
          populations. They show enrichment of specific bacterial species, particularly
          Akkermansia muciniphila, Faecalibacterium prausnitzii, and various Prevotella species
          that are associated with improved metabolic efficiency, reduced inflammation, and better
          gut barrier function.
        </p>
        <p>
          The causality runs both ways: exercise improves the microbiome, and a healthy microbiome
          improves exercise capacity. Athletes with richer, more diverse microbiomes show better
          substrate utilisation during endurance exercise and faster recovery from hard efforts.
        </p>
        <p>
          The practical implication: your dietary choices, not just your training, shape the gut
          ecosystem that determines how well you absorb nutrients during exercise.
        </p>

        <h2>Gut training: teaching your intestines to absorb more</h2>
        <p>
          One of the most underutilised strategies in endurance sport is gut training, systematically
          practising consuming carbohydrates during exercise to train the gastrointestinal system
          to absorb and utilise them more efficiently.
        </p>
        <p>
          The intestinal glucose and fructose transporters (SGLT1 and GLUT5) upregulate in response
          to demand. Athletes who consistently practice consuming 60–90g of carbohydrate per hour
          during training improve their absorptive capacity over 4–8 weeks, reducing GI distress
          at those intake rates.
        </p>
        <p>
          Athletes who never consume carbohydrates during training, then attempt to execute a
          60g/hour race-day fueling plan, are asking a gut that is not adapted to high rates of
          carbohydrate absorption to perform at levels it has never experienced. Distress is predictable.
        </p>
        <p>
          Gut training protocol:
        </p>
        <ul>
          <li>Start with 30g/hour during long sessions and progressively increase over 6–8 weeks</li>
          <li>Use the same products you plan to race with, gut training is product-specific</li>
          <li>Practice on runs of 90+ minutes and rides of 2+ hours</li>
          <li>Train in heat conditions similar to your race to adapt to the temperature-gut interaction</li>
        </ul>

        <h2>Foods that cause problems during exercise</h2>
        <p>
          Certain foods dramatically increase GI distress risk during exercise, particularly in
          the 2–6 hours before training or racing:
        </p>
        <ul>
          <li><strong>High-fibre foods:</strong> Bran, beans, lentils, cruciferous vegetables, whole grains, these slow gastric emptying, increase bowel content, and often cause bloating and urgency during running</li>
          <li><strong>High-fat foods:</strong> Fat slows gastric emptying significantly. A high-fat pre-race meal means partially digested food sitting in the stomach during the event, causing nausea and GI distress</li>
          <li><strong>Spicy foods:</strong> Capsaicin directly increases gut motility and can trigger urgency and cramping during exercise</li>
          <li><strong>Fructose without glucose:</strong> Fructose in isolation (as in many fruit juices, agave) overwhelms the GLUT5 transporter, causing osmotic diarrhoea. Fructose consumed alongside glucose (2:1 ratio) uses a different transporter and is much better tolerated</li>
          <li><strong>Artificial sweeteners:</strong> Sorbitol, xylitol, and other polyols are poorly absorbed and cause osmotic water drawing into the gut, a recipe for mid-race distress</li>
          <li><strong>Dairy (in some athletes):</strong> Lactose intolerance or high-fat dairy can cause significant GI issues during intense exercise</li>
        </ul>

        <h2>Foods that improve gut health and performance</h2>
        <p>
          Long-term dietary patterns that support a healthy, exercise-adapted gut microbiome:
        </p>
        <ul>
          <li><strong>Diverse plant foods:</strong> A variety of vegetables, fruits, and legumes (consumed away from training) feeds diverse beneficial bacteria. Aim for 30+ different plant foods per week.</li>
          <li><strong>Fermented foods:</strong> Yoghurt, kefir, sauerkraut, kimchi, miso, these deliver live bacteria and support microbiome diversity. A 2021 Stanford study showed fermented foods outperformed high-fibre diets for increasing microbiome diversity.</li>
          <li><strong>Prebiotic fibre:</strong> Inulin, FOS (fructooligosaccharides), and resistant starch feed beneficial bacteria. Found in garlic, onion, asparagus, bananas, oats, and cooked-and-cooled potatoes.</li>
          <li><strong>Polyphenol-rich foods:</strong> Blueberries, dark chocolate, green tea, olive oil, polyphenols are selectively metabolised by beneficial bacteria and inhibit pathogens.</li>
        </ul>

        <h2>Probiotics: what the evidence actually shows</h2>
        <p>
          Probiotic supplements are widely used by athletes, and the evidence is more nuanced than
          either enthusiastic proponents or sceptical dismissers suggest.
        </p>
        <p>
          Meta-analyses show that specific probiotic strains reduce upper respiratory tract infection
          duration and severity in athletes, a meaningful benefit given training-induced
          immunosuppression. The strains with the strongest evidence for immune support include
          Lactobacillus rhamnosus GG and Lactobacillus acidophilus NCFM.
        </p>
        <p>
          Evidence for direct GI performance benefits during exercise is weaker and more
          strain-specific. Probiotics are not a substitute for gut training, dietary management,
          or adequate hydration. They're a potentially useful adjunct for athletes with persistent
          GI issues who have addressed the fundamentals.
        </p>
        <p>
          If using probiotics, choose a product with documented, named strains at a dose of at
          least 10 billion CFU, and take consistently for a minimum of 4 weeks before drawing
          any conclusions about efficacy.
        </p>

        <h2>Pre-race gut preparation protocol</h2>
        <p>
          In the 48–72 hours before an important race:
        </p>
        <ul>
          <li>Reduce dietary fibre (shift from whole grains to white grains, reduce raw vegetables)</li>
          <li>Eliminate high-risk foods (spicy, high-fat, artificial sweeteners, new foods)</li>
          <li>Increase hydration to ensure you start the race well-hydrated</li>
          <li>Avoid alcohol, it disrupts gut motility and sleep quality</li>
          <li>Consume familiar, low-fibre carbohydrate sources (white rice, pasta, bread, bananas)</li>
          <li>On race morning: eat at least 2.5–3 hours before start time. Familiar food. Low fat, low fibre.</li>
          <li>Give your body time for a bowel movement before the start, this requires waking early enough</li>
        </ul>

        <h2>When to see a sports dietitian</h2>
        <p>
          If you experience severe GI distress during training despite implementing the above
          strategies, or if symptoms persist outside of training (indicating a possible underlying
          condition such as IBS, SIBO, or coeliac disease), consultation with a sports dietitian
          or gastroenterologist is warranted.
        </p>
        <p>
          Conditions like exercise-induced ischaemic colitis, though rare, require clinical
          investigation. Severe chronic GI symptoms during exercise are not something to simply
          manage through nutrition adjustments alone.
        </p>
        <p>
          For most athletes, however, GI distress during exercise is a solvable training and
          nutrition problem. Gut training, strategic pre-race dietary management, and long-term
          investment in microbiome health will, for the majority, eliminate or significantly
          reduce GI issues that currently limit performance.
        </p>
      </div>
    ),
  },
};

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default async function LearnArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  const relatedPosts = post.relatedSlugs
    ? post.relatedSlugs.map((s) => posts[s]).filter(Boolean)
    : [];

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://jonnoai.com/learn/${slug}`)}`;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <BlogProgress />
      <main className="pt-16">

        {/* Article Hero */}
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
              <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                <span className="text-9xl opacity-40">{post.emoji}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/70 to-[#08090D]/20" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12 w-full">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                <Link href="/learn" className="hover:text-gray-200 transition-colors">Learn</Link>
                <span>/</span>
                <span className={post.tagColor.split(" ")[0]}>{post.tag}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${post.tagColor} ${post.tagBorder}`}>
                  {post.tag}
                </span>
                <span className="text-xs text-gray-400">{post.date}</span>
                <span className="text-gray-500">·</span>
                <span className="text-xs text-gray-400">{post.readTime}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                {post.title}
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed mb-6 max-w-2xl">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${post.author.gradient} flex items-center justify-center text-sm font-black text-white`}>
                  {post.author.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{post.author.name}</p>
                  <p className="text-xs text-gray-400">{post.author.role}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Body + Sidebar */}
        <section className="py-12 pb-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid lg:grid-cols-[1fr_260px] gap-10 items-start">

              {/* Main article */}
              <div className="min-w-0">
                <div className="bg-white rounded-2xl p-8 md:p-12 article-body">
                  {post.body}
                </div>

                {/* Author card */}
                <div className="mt-8 light-card p-6 flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${post.author.gradient} flex items-center justify-center text-lg font-black text-white flex-shrink-0`}>
                    {post.author.initials}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-0.5">{post.author.name}</p>
                    <p className="text-xs font-medium mb-2" style={{ color: "#20C7B7" }}>{post.author.role}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{post.author.bio}</p>
                    <p className="text-xs text-gray-400 mt-3">Written for Jonno · {post.date}</p>
                  </div>
                </div>

                {/* Share row */}
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-medium">Share:</span>
                  <CopyLinkButton />
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600 hover:text-gray-800 hover:border-gray-200 transition-all duration-200"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    Share on X
                  </a>
                </div>

                {/* Related posts */}
                {relatedPosts.length > 0 && (
                  <div className="mt-12">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#20C7B7" }}>
                      Related articles
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/learn/${related.slug}`}
                          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col gap-2 hover:border-[#20C7B7]/40 transition-colors group"
                        >
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start border ${related.tagColor} ${related.tagBorder}`}>
                            {related.tag}
                          </span>
                          <p className="text-sm font-bold text-gray-800 leading-snug group-hover:text-[#20C7B7] transition-colors">
                            {related.title}
                          </p>
                          <span className="text-xs text-gray-500">{related.readTime}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom CTA */}
                <div className="mt-12 rounded-2xl border border-[#E5E7EB] p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6" style={{ backgroundColor: "#F4F5F7" }}>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-bold text-gray-900 mb-1">Let Jonno apply this automatically.</p>
                    <p className="text-sm text-gray-600">
                      Sync Strava. Get evidence-based targets. Order recovery meals in one tap.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <Button variant="glow" size="default" asChild>
                      <Link href="/join">
                        Join Waitlist
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="default" asChild>
                      <Link href="/learn">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        More articles
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="hidden lg:block sticky top-24 space-y-4">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                    In this article
                  </p>
                  <nav className="flex flex-col gap-1">
                    {post.toc.map((heading, i) => (
                      <span
                        key={i}
                        className="text-sm text-gray-500 hover:text-gray-800 leading-snug cursor-pointer transition-colors py-1 border-l-2 border-transparent hover:border-[#20C7B7] pl-3"
                      >
                        {heading}
                      </span>
                    ))}
                  </nav>
                </div>

                <div className="bg-white rounded-2xl border border-[rgba(32,199,183,0.30)] p-5 flex flex-col gap-3">
                  <p className="text-sm font-bold text-gray-900">Let Jonno apply this</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Connect Strava. Get evidence-based targets. Order recovery meals automatically.
                  </p>
                  <Button variant="glow" size="sm" asChild className="w-full">
                    <Link href="/join">Join Waitlist</Link>
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
