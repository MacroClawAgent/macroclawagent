# MacroClawAgent — Design System Spec

> **Rule:** Every page, component, and UI element in this project must follow this spec exactly. This document is the source of truth for the Midnight Athletic aesthetic.

---

## 1. Brand Identity

**Name:** MacroClawAgent
**Mascot:** 🦀 (crab emoji — the "Claw")
**Tagline:** "Built for athletes who eat with intention."
**Voice:** Direct, data-driven, athletic. No weight-loss language. Performance, recovery, fuel, optimize.
**Audience:** Endurance athletes, strength athletes, biohackers, fitness-obsessed professionals.

---

## 2. Color Palette

### Backgrounds (always dark — never use white backgrounds)

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| **Midnight** | `#08090D` | `bg-[#08090D]` | Primary page background |
| **Surface** | `#0F111A` | `bg-[#0F111A]` | Card/panel backgrounds |
| **Elevated** | `#161925` | `bg-[#161925]` | Overlays, dropdowns |

Custom Tailwind tokens available:
```
midnight.DEFAULT = #08090D
midnight.surface = #0F111A
midnight.elevated = #161925
```

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Indigo (Primary)** | `#4F46E5` / `#6366F1` | Brand, AI, buttons, highlights |
| **Orange** | `#F97316` | Strava, calories, activity metrics |
| **Emerald** | `#10B981` | Uber Eats, protein, success states |
| **Amber** | `#F59E0B` | Carbs, warnings, secondary accent |
| **Violet** | Used in gradients | Gradient text animation only |
| **Red** | `#EF4444` | Errors, destructive actions, Apple Health |

### Text

| Level | Tailwind | Hex approx | Usage |
|-------|----------|------------|-------|
| Primary | `text-slate-100` | `#F1F5F9` | Body text, headings |
| Secondary | `text-slate-400` | `#94A3B8` | Subheadings, descriptions |
| Muted | `text-slate-500` | `#64748B` | Captions, footer links |
| Disabled | `text-slate-600` | `#475569` | Placeholders, hints |

---

## 3. Typography

**Font Stack:**
- `font-sans` → Inter (Google Fonts)
- `font-mono` → Geist Mono (Google Fonts)

**Heading Sizes:**

| Level | Classes | Usage |
|-------|---------|-------|
| Hero H1 | `text-5xl md:text-7xl font-black tracking-tight` | Page hero headlines |
| Section H2 | `text-4xl md:text-5xl font-black tracking-tight` | Section titles |
| Card H3 | `text-2xl font-bold` | Card headings |
| Sub-heading | `text-lg font-semibold` | Panel headings |
| Label | `text-xs font-semibold uppercase tracking-widest` | Form labels, section tags |

**Body Text:**
- Large body: `text-lg text-slate-400`
- Standard body: `text-sm text-slate-400`
- Small/caption: `text-xs text-slate-500`

**Special Text Effects:**

```css
/* Animated gradient headline — indigo → violet → blue, 4s loop */
.gradient-text {
  background: linear-gradient(90deg, #6366F1, #8B5CF6, #60A5FA, #6366F1);
  background-size: 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 4s ease infinite;
}
```

**Rules:**
- ALL primary page headlines use `gradient-text` or `text-slate-100`
- NEVER use white (`text-white`) for body copy — use `text-slate-100`
- NEVER use pure black text

---

## 4. Glass Effects (Custom Utility Classes)

These are the core visual signatures of the Midnight Athletic aesthetic:

```css
.glass {
  /* Light overlay for small elements */
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.glass-card {
  /* Primary container for sections and cards */
  backdrop-filter: blur(20px);
  background: rgba(15, 17, 26, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 1rem; /* rounded-2xl */
}

.glass-heavy {
  /* Strong modal/overlay backgrounds */
  backdrop-filter: blur(32px);
  background: rgba(8, 9, 13, 0.9);
  border: 1px solid rgba(99, 102, 241, 0.15); /* indigo tint */
}

.glow-border {
  /* Featured/highlighted elements */
  border: 1px solid rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.15), inset 0 0 20px rgba(99, 102, 241, 0.05);
}
```

**Usage rules:**
- `glass-card` → all section containers, feature cards, pricing cards
- `glass` → small interactive elements (pills, badges, buttons without full bg)
- `glass-heavy` → modals, overlays, sticky headers
- `glow-border` → ONLY the most prominent/featured element on a page (e.g., Pro pricing card, highlighted section)

---

## 5. Components

### Buttons

| Variant | Usage | Class behavior |
|---------|-------|----------------|
| `glow` | Primary CTA on dark bg | Indigo bg + intense indigo glow shadow |
| `default` | Standard primary action | Indigo bg, moderate shadow |
| `outline` | Secondary action | Glass effect, white border |
| `ghost` | Tertiary / nav links | Hover bg only |
| `link` | Inline text links | Text with underline hover |

**Sizes:**
- `sm` (h-9) — nav, inline actions
- `default` (h-10) — standard
- `lg` (h-12) — section CTAs
- `xl` (h-14) — hero CTAs

```tsx
// Primary hero CTA:
<Button variant="glow" size="xl">Get Started Free</Button>

// Secondary CTA:
<Button variant="outline" size="lg">Learn More</Button>

// Nav link:
<Button variant="ghost" size="sm">Sign In</Button>
```

### Cards

```tsx
// Standard section card:
<div className="glass-card p-6">...</div>

// Featured/highlighted card:
<div className="glass-card glow-border p-6">...</div>

// Using the Card UI component:
<Card className="glass-card border-0">
  <CardContent className="p-6">...</CardContent>
</Card>
```

### Badges / Tags

```tsx
// Category tag (indigo):
<Badge>AI Feature</Badge>

// Macro badges:
<Badge variant="protein">87g protein</Badge>
<Badge variant="carbs">220g carbs</Badge>
<Badge variant="calories">2,340 kcal</Badge>
```

### Section Headers

```tsx
// Standard section header pattern:
<div className="text-center mb-16">
  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
    Category Label
  </p>
  <h2 className="text-4xl md:text-5xl font-black gradient-text mb-4">
    Main Headline
  </h2>
  <p className="text-lg text-slate-400 max-w-2xl mx-auto">
    Supporting description text.
  </p>
</div>
```

---

## 6. Layout

### Page Container
```tsx
// Standard content width:
<div className="max-w-6xl mx-auto px-6">

// Wide (dashboard):
<div className="max-w-7xl mx-auto px-6">

// Narrow (legal, blog articles):
<div className="max-w-3xl mx-auto px-6">
```

### Spacing
- Section vertical padding: `py-20 md:py-32`
- Card internal padding: `p-6` or `p-8`
- Grid gaps: `gap-4` (tight) / `gap-6` (standard) / `gap-8` (loose)

### Mesh Gradient Backgrounds

```tsx
// Hero section:
<section className="bg-mesh-hero min-h-screen">

// Alternate sections:
<section className="bg-mesh-section py-20">
```

---

## 7. Decorative Elements

### Background Orbs
Always `pointer-events-none`, `absolute` or `fixed` positioned:

```tsx
// Standard orb pair pattern:
<div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-900/10 blur-3xl pointer-events-none" />
<div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-violet-900/08 blur-3xl pointer-events-none" />
```

### Dividers
```tsx
<div className="h-px bg-white/[0.07]" />      // section divider
<div className="w-px h-4 bg-white/10" />       // inline vertical divider
```

---

## 8. Animations

All powered by Framer Motion. Standard patterns:

```tsx
// Page entrance (above-fold content):
<motion.div
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
>

// Scroll-triggered (below-fold):
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4 }}
>

// Staggered children (add delay per child):
transition={{ duration: 0.4, delay: index * 0.1 }}
```

**Custom animations available:**
- `animate-float` (3s) — floating pill elements
- `animate-glow-pulse` (2s) — pulsing glow on accent elements
- `animate-gradient-shift` (4s) — gradient-text background shift

---

## 9. Domain-Specific Color Coding

Always color-code these integrations/features consistently:

| Domain | Color | Example usage |
|--------|-------|---------------|
| AI / Claw Agent | Indigo | `text-indigo-400`, `bg-indigo-600/20` |
| Strava | Orange | `text-orange-400`, `bg-orange-500/10` |
| Uber Eats | Emerald | `text-emerald-400`, `bg-emerald-500/10` |
| Apple Health | Red | `text-red-400`, `bg-red-500/10` |
| Calories | Orange | `text-orange-400` |
| Protein | Emerald | `text-emerald-400` |
| Carbs | Amber | `text-amber-400` |
| Hydration | Blue | `text-blue-400` |

---

## 10. Page Template

Every marketing page follows this shell:

```tsx
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#08090D]">
      <Navbar />
      <main className="pt-16"> {/* pt-16 to clear fixed navbar */}
        {/* content */}
      </main>
      <Footer />
    </div>
  );
}
```

For animated pages, wrap `<main>` sections in `<motion.section>` with `whileInView`.

---

## 11. Forms

All inputs follow this pattern:

```tsx
<input
  className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-all"
/>
```

Status messages:
```tsx
// Error:   bg-red-500/10 border-red-500/20 text-red-300
// Success: bg-emerald-500/10 border-emerald-500/20 text-emerald-300
// Warning: bg-amber-500/10 border-amber-500/30 text-amber-300
```

---

## 12. What NOT to Do

- ❌ Never use white or light backgrounds
- ❌ Never use green color for UI (legacy from old design — was replaced with indigo)
- ❌ Never use `text-white` for body copy (use `text-slate-100`)
- ❌ Never use `rounded-lg` for cards (use `rounded-xl` or `rounded-2xl`)
- ❌ Never use unshadowed flat indigo buttons (always add `shadow-lg shadow-indigo-500/25`)
- ❌ Never mix color coding (orange = Strava only, emerald = Uber Eats / protein only)
- ❌ Never skip Framer Motion on marketing pages — all sections animate in
- ❌ Never use `glow-border` on more than one element per page
- ❌ Never use light mode CSS variables or non-dark color schemes
