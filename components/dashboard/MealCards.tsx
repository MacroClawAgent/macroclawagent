"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Check, Clock, ChevronRight, Sparkles } from "lucide-react";
import type { MealItem } from "@/types/database";

interface MealCardsProps {
  meals?: MealItem[];
  loading?: boolean;
  planId?: string;
}

const TAG_GRADIENT: Record<string, string> = {
  Breakfast: "from-emerald-950 via-teal-900 to-cyan-950",
  Lunch:     "from-indigo-950 via-violet-900 to-purple-950",
  Snack:     "from-slate-900 via-slate-800 to-slate-900",
  Dinner:    "from-orange-950 via-amber-900 to-yellow-950",
};

type MealCardItem = MealItem & { gradient: string };

function MealCard({ meal, index }: { meal: MealCardItem; index: number }) {
  const [added, setAdded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="glass-card border-0 overflow-hidden group hover:border-white/[0.12] transition-all duration-300">
        {/* Meal image placeholder */}
        <div
          className={`relative h-36 bg-gradient-to-br ${meal.gradient} overflow-hidden`}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute top-4 left-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50 bg-black/30 px-2 py-1 rounded-md">
              {meal.tag}
            </span>
          </div>
          {meal.prep_time && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-white/40 text-xs">
              <Clock className="w-3 h-3" />
              {meal.prep_time}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-15">
            <div className="w-20 h-20 rounded-full border-2 border-white/30" />
            <div className="absolute w-12 h-12 rounded-full border border-white/20" />
          </div>
        </div>

        <CardContent className="p-5 flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-slate-100 text-base">{meal.name}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {meal.description}
            </p>
          </div>

          {/* Macro badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="calories">{meal.calories} kcal</Badge>
            <Badge variant="protein">{meal.protein}g protein</Badge>
            <Badge variant="carbs">{meal.carbs}g carbs</Badge>
          </div>

          {/* Add to cart button */}
          <Button
            variant={added ? "secondary" : "outline"}
            size="sm"
            className="w-full mt-1"
            onClick={() => setAdded(true)}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Uber Eats
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MealCardSkeleton() {
  return (
    <Card className="glass-card border-0 overflow-hidden">
      <Skeleton className="h-36 rounded-none" />
      <div className="p-5 flex flex-col gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </Card>
  );
}

export function MealCards({ meals: mealsProp, loading = false }: MealCardsProps) {
  const meals: MealCardItem[] = (mealsProp ?? []).map((m) => ({
    ...m,
    gradient: TAG_GRADIENT[m.tag] ?? "from-slate-900 via-slate-800 to-slate-900",
  }));

  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Today&apos;s Meal Plan</h2>
        <div className="flex items-center gap-3">
          {totalCalories > 0 && (
            <span className="text-xs text-slate-500 font-mono">
              {totalCalories} kcal total
            </span>
          )}
          <Link href="/meal-plans" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-0.5">
            All plans <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {!loading && meals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center glass-card rounded-2xl border-dashed border border-white/[0.08]">
          <Sparkles className="w-8 h-8 text-indigo-400 mb-3 opacity-60" />
          <p className="text-sm font-semibold text-slate-400">No meal plan for today</p>
          <p className="text-xs text-slate-600 mt-1 mb-4">Generate one with the Claw Agent</p>
          <Link href="/agent" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all">
            Generate Plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading
            ? [0, 1, 2].map((i) => <MealCardSkeleton key={i} />)
            : meals.map((meal, index) => (
                <MealCard key={`${meal.tag}-${index}`} meal={meal} index={index} />
              ))}
        </div>
      )}
    </div>
  );
}
