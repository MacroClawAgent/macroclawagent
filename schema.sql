-- MacroClawAgent — Supabase Database Schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New Query → Paste & Run

-- ============================================================
-- USERS TABLE
-- Extends Supabase's built-in auth.users with app-specific data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  -- Strava integration
  strava_athlete_id   TEXT UNIQUE,
  strava_access_token  TEXT,  -- Store encrypted in production
  strava_refresh_token TEXT,  -- Store encrypted in production
  strava_token_expires_at TIMESTAMPTZ,
  -- App preferences
  calorie_goal   INTEGER DEFAULT 2000,
  protein_goal   INTEGER DEFAULT 120,  -- grams
  carbs_goal     INTEGER DEFAULT 250,  -- grams
  fat_goal       INTEGER DEFAULT 70,   -- grams
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- MEAL PLANS TABLE
-- Stores AI-generated meal plans linked to Strava activity
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date            DATE NOT NULL,
  -- AI-generated meal data as JSONB for flexibility
  meals           JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Macro totals
  total_calories  INTEGER,
  total_protein   INTEGER,
  total_carbs     INTEGER,
  total_fat       INTEGER,
  -- Source activity that triggered this plan
  strava_activity_id TEXT,
  -- Uber Eats integration
  uber_cart_id    TEXT,
  uber_checkout_url TEXT,
  cart_status     TEXT DEFAULT 'pending' CHECK (cart_status IN ('pending', 'built', 'ordered', 'delivered')),
  -- Metadata
  ai_model        TEXT DEFAULT 'claude-sonnet-4-6',
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- One plan per user per day
  UNIQUE (user_id, date)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own profile
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can only see and modify their own meal plans
CREATE POLICY "meal_plans_all_own"
  ON public.meal_plans FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create a users row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
