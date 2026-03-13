-- ===== Supabase テーブル定義 =====
-- Supabase Dashboard の SQL Editor で実行してください

-- 1. ユーザープロフィール
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text default '',
  points integer default 0,
  post_count integer default 0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- 2. 価格投稿（みんなで共有）
create table if not exists price_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  product_name text not null,
  store_name text not null,
  price integer not null,
  location text default '',
  lat double precision,
  lng double precision,
  category text default 'other',
  posted_at timestamptz default now()
);

alter table price_posts enable row level security;

create policy "Anyone can read price posts" on price_posts
  for select using (true);
create policy "Authenticated users can insert" on price_posts
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own posts" on price_posts
  for delete using (auth.uid() = user_id);

-- 3. 家計簿データ（個人）
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  product_name text not null,
  store_name text default '',
  price integer not null,
  category text default 'other',
  posted_at timestamptz default now()
);

alter table expenses enable row level security;

create policy "Users can CRUD own expenses" on expenses
  for all using (auth.uid() = user_id);

-- 4. お気に入り（個人）
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  product_name text not null,
  target_price integer,
  added_at timestamptz default now()
);

alter table favorites enable row level security;

create policy "Users can CRUD own favorites" on favorites
  for all using (auth.uid() = user_id);

-- 5. 買い物リスト（個人）
create table if not exists shopping_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

alter table shopping_groups enable row level security;

create policy "Users can CRUD own shopping groups" on shopping_groups
  for all using (auth.uid() = user_id);

create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references shopping_groups on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  product_name text not null,
  completed boolean default false,
  added_at timestamptz default now(),
  completed_at timestamptz
);

alter table shopping_items enable row level security;

create policy "Users can CRUD own shopping items" on shopping_items
  for all using (auth.uid() = user_id);

-- 6. ポイント履歴（個人）
create table if not exists point_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  amount integer not null,
  consumed integer default 0,
  earned_at timestamptz default now(),
  expires_at timestamptz not null
);

alter table point_entries enable row level security;

create policy "Users can CRUD own point entries" on point_entries
  for all using (auth.uid() = user_id);

-- プロフィール自動作成トリガー
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
