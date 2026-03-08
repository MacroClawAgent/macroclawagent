-- ============================================================
-- Jonno Optimizer — Migration 001
-- Tables: training_day_features, nutrition_preferences,
--         plan_outputs, adherence_feedback
-- ============================================================

-- ── training_day_features ────────────────────────────────────
-- Written by server/edge functions only. Client may read own rows.
-- Stores only the 7 allowed derived fields from Strava signals.
-- Raw GPS, HR streams, segments, and splits are NEVER stored here.

create table if not exists public.training_day_features (
  user_id          uuid        not null references public.users(id) on delete cascade,
  day_date         date        not null,
  total_minutes    int         not null default 0,
  run_minutes      int         not null default 0,
  total_distance_km numeric(8,3) not null default 0,
  intensity_score  smallint    not null default 0 check (intensity_score between 0 and 10),
  long_run_flag    boolean     not null default false,
  load_trend       smallint    not null default 0 check (load_trend in (-1, 0, 1)),
  created_at       timestamptz not null default now(),
  primary key (user_id, day_date)
);

alter table public.training_day_features enable row level security;

-- Users can read their own training features
create policy "owner_select_training_day_features"
  on public.training_day_features for select
  using (auth.uid() = user_id);

-- Only service role can insert/update (server-side sync only)
-- No client INSERT/UPDATE policy → blocked by RLS for anon/authed clients

create index if not exists idx_training_features_user_date
  on public.training_day_features(user_id, day_date desc);


-- ── nutrition_preferences ────────────────────────────────────
-- One row per user. Created on signup, updated by user via app.

create table if not exists public.nutrition_preferences (
  user_id              uuid        primary key references public.users(id) on delete cascade,
  goal                 text        not null default 'performance'
                                   check (goal in ('performance','cut','lean_bulk')),
  diet                 text        not null default 'omnivore'
                                   check (diet in ('omnivore','veg','vegan','pesc')),
  allergies            text[]      not null default '{}',
  dislikes             text[]      not null default '{}',
  budget_level         text        not null default 'med'
                                   check (budget_level in ('low','med','high')),
  cooking_time_level   text        not null default 'med'
                                   check (cooking_time_level in ('low','med','high')),
  meals_per_day        int         not null default 3 check (meals_per_day between 2 and 6),
  timezone             text        not null default 'UTC',
  updated_at           timestamptz not null default now()
);

alter table public.nutrition_preferences enable row level security;

create policy "owner_all_nutrition_preferences"
  on public.nutrition_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create default preferences row when a new user signs up
create or replace function public.handle_new_nutrition_preferences()
returns trigger language plpgsql security definer as $$
begin
  insert into public.nutrition_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Attach to existing handle_new_user trigger target (users table)
create trigger on_new_user_create_preferences
  after insert on public.users
  for each row execute function public.handle_new_nutrition_preferences();

-- updated_at trigger
create trigger set_nutrition_preferences_updated_at
  before update on public.nutrition_preferences
  for each row execute function public.handle_updated_at();


-- ── plan_outputs ─────────────────────────────────────────────
-- AI + optimizer generated 7-day plans. Immutable after creation.

create table if not exists public.plan_outputs (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.users(id) on delete cascade,
  start_date   date        not null,
  end_date     date        not null,
  targets      jsonb       not null default '[]',  -- DailyTargets[]
  meal_plan    jsonb       not null default '{}',  -- { "2025-01-01": MealOptimized[] }
  grocery_list jsonb       not null default '[]',  -- GroceryItem[]
  rationale    jsonb       not null default '[]',  -- string[]
  created_at   timestamptz not null default now()
);

alter table public.plan_outputs enable row level security;

create policy "owner_select_plan_outputs"
  on public.plan_outputs for select
  using (auth.uid() = user_id);

create policy "owner_insert_plan_outputs"
  on public.plan_outputs for insert
  with check (auth.uid() = user_id);

create index if not exists idx_plan_outputs_user_created
  on public.plan_outputs(user_id, created_at desc);

create index if not exists idx_plan_outputs_user_start
  on public.plan_outputs(user_id, start_date desc);


-- ── adherence_feedback ───────────────────────────────────────
-- User-reported daily adherence. Sole source for personalization.
-- This table is the ONLY feedback signal used to improve plans.
-- No Strava-derived data is stored in this table.

create table if not exists public.adherence_feedback (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references public.users(id) on delete cascade,
  plan_id          uuid        references public.plan_outputs(id) on delete set null,
  day_date         date        not null,
  completion_score numeric(3,2) not null default 0
                               check (completion_score between 0 and 1),
  hunger_score     int         not null default 3 check (hunger_score between 1 and 5),
  energy_score     int         not null default 3 check (energy_score between 1 and 5),
  meals_skipped    int         not null default 0 check (meals_skipped >= 0),
  notes            text,
  created_at       timestamptz not null default now(),
  unique (user_id, plan_id, day_date)
);

alter table public.adherence_feedback enable row level security;

create policy "owner_all_adherence_feedback"
  on public.adherence_feedback for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_adherence_feedback_user_date
  on public.adherence_feedback(user_id, day_date desc);

create index if not exists idx_adherence_feedback_plan
  on public.adherence_feedback(plan_id);
