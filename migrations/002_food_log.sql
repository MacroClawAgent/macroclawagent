-- ============================================================
-- Food Log Items — Migration 002
-- Stores individual food items logged by users each day.
-- Totals are recomputed into nutrition_logs on each insert/delete.
-- ============================================================

create table if not exists public.food_log_items (
  id          uuid          primary key default gen_random_uuid(),
  user_id     uuid          not null references public.users(id) on delete cascade,
  log_date    date          not null,
  meal_tag    text          not null check (meal_tag in ('Breakfast','Lunch','Dinner','Snack')),
  name        text          not null,
  calories    int           not null default 0 check (calories >= 0),
  protein_g   numeric(6,2)  not null default 0 check (protein_g >= 0),
  carbs_g     numeric(6,2)  not null default 0 check (carbs_g >= 0),
  fat_g       numeric(6,2)  not null default 0 check (fat_g >= 0),
  created_at  timestamptz   not null default now()
);

alter table public.food_log_items enable row level security;

create policy "owner_all_food_log_items"
  on public.food_log_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_food_log_items_user_date
  on public.food_log_items(user_id, log_date desc);
