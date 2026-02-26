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
  -- Health profile (collected in onboarding)
  weight_kg        NUMERIC(5,2),
  height_cm        INTEGER,
  date_of_birth    DATE,
  gender           TEXT CHECK (gender IN ('male','female','other','prefer_not_to_say')),
  unit_preference  TEXT DEFAULT 'metric',
  profile_complete BOOLEAN DEFAULT FALSE,
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

-- ============================================================
-- STORAGE
-- ============================================================
-- Run this manually in Supabase Dashboard → Storage → New Bucket:
--   Name: avatars
--   Public bucket: YES
-- Then add a policy so authenticated users can upload to their own folder:
--   Allowed operation: INSERT
--   Policy: (auth.uid()::text = (storage.foldername(name))[1])

-- ============================================================
-- PHASE 2 — DATA-DRIVEN ARCHITECTURE
-- ============================================================

-- Activities (synced from Strava or manually added)
CREATE TABLE IF NOT EXISTS public.activities (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  strava_activity_id    TEXT UNIQUE,
  type                  TEXT NOT NULL CHECK (type IN ('Run','Ride','Swim','Other')),
  name                  TEXT NOT NULL,
  started_at            TIMESTAMPTZ NOT NULL,
  duration_seconds      INTEGER NOT NULL,
  distance_meters       NUMERIC(10,2) NOT NULL,
  calories              INTEGER NOT NULL DEFAULT 0,
  elevation_meters      NUMERIC(8,1),
  avg_heart_rate        INTEGER,
  pace_seconds_per_km   NUMERIC(8,2),
  speed_kmh             NUMERIC(6,2),
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_user_date ON public.activities (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_type ON public.activities (user_id, type);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_all_own" ON public.activities FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Nutrition logs — one row per user per day (pre-aggregated daily totals)
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date                DATE NOT NULL,
  calories_consumed   INTEGER NOT NULL DEFAULT 0,
  protein_g           NUMERIC(7,2) NOT NULL DEFAULT 0,
  carbs_g             NUMERIC(7,2) NOT NULL DEFAULT 0,
  fat_g               NUMERIC(7,2) NOT NULL DEFAULT 0,
  hydration_ml        INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON public.nutrition_logs (user_id, date DESC);

ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_logs_all_own" ON public.nutrition_logs FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER nutrition_logs_updated_at
  BEFORE UPDATE ON public.nutrition_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Chat messages — persists agent conversation history
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON public.chat_messages (user_id, created_at DESC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_messages_all_own" ON public.chat_messages FOR ALL USING (auth.uid() = user_id);

-- Extend meal_plans with label, activity_summary, and status columns
ALTER TABLE public.meal_plans ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE public.meal_plans ADD COLUMN IF NOT EXISTS activity_summary TEXT;
ALTER TABLE public.meal_plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'built', 'ordered', 'delivered'));
