-- ============================================================
-- SARA Gallery — Supabase schema
-- شغّل الكود ده كامل في: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- جدول اللايكات
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, photo_id)
);

-- جدول الصور المحفوظة (Save / Bookmark)
create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, photo_id)
);

-- جدول التعليقات
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  photo_id text not null,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

-- فهارس لتسريع القراءة حسب الصورة
create index if not exists likes_photo_id_idx on public.likes (photo_id);
create index if not exists saves_photo_id_idx on public.saves (photo_id);
create index if not exists comments_photo_id_idx on public.comments (photo_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.likes enable row level security;
alter table public.saves enable row level security;
alter table public.comments enable row level security;

-- اللايكات: أي حد يقدر يقرأ (عشان نعرض العدد)، بس بس صاحب الحساب يقدر يضيف/يمسح بتاعه هو
create policy "likes_select_all" on public.likes
  for select using (true);

create policy "likes_insert_own" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "likes_delete_own" on public.likes
  for delete using (auth.uid() = user_id);

-- المحفوظات: كل مستخدم يشوف ويتحكم في بتاعته بس (خاصة)
create policy "saves_select_own" on public.saves
  for select using (auth.uid() = user_id);

create policy "saves_insert_own" on public.saves
  for insert with check (auth.uid() = user_id);

create policy "saves_delete_own" on public.saves
  for delete using (auth.uid() = user_id);

-- التعليقات: أي حد يقدر يقرأ، بس بس صاحب الحساب يضيف باسمه
create policy "comments_select_all" on public.comments
  for select using (true);

create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = user_id);
