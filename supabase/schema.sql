-- 今天请吃什么 · Supabase 数据库初始化脚本
-- 在 Supabase 控制台 → SQL Editor → New Query，把整段贴进去点 Run。

create extension if not exists pgcrypto;

-- 房间表：以 code 为主键（房间码即口令）
create table if not exists rooms (
  code text primary key,
  created_at timestamptz not null default now()
);

-- 想吃清单
create table if not exists treat_options (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references rooms(code) on delete cascade,
  category text not null check (category in ('meal', 'milkTea', 'dessert', 'snack')),
  name text not null,
  created_at timestamptz not null default now(),
  unique(room_code, category, name)
);

-- 抽签记录
create table if not exists draw_results (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references rooms(code) on delete cascade,
  category text not null check (category in ('meal', 'milkTea', 'dessert', 'snack')),
  result text not null,
  drawer_name text,
  drawer_color text,
  created_at timestamptz not null default now()
);

-- 启用 Row Level Security
alter table rooms enable row level security;
alter table treat_options enable row level security;
alter table draw_results enable row level security;

-- 匿名（anon）权限：所有人可读写（房间码即口令）
drop policy if exists "anon can read rooms" on rooms;
drop policy if exists "anon can insert rooms" on rooms;
drop policy if exists "anon can update rooms" on rooms;
create policy "anon can read rooms" on rooms for select to anon using (true);
create policy "anon can insert rooms" on rooms for insert to anon with check (true);
create policy "anon can update rooms" on rooms for update to anon using (true) with check (true);

drop policy if exists "anon can read treat options" on treat_options;
drop policy if exists "anon can insert treat options" on treat_options;
drop policy if exists "anon can delete treat options" on treat_options;
create policy "anon can read treat options" on treat_options for select to anon using (true);
create policy "anon can insert treat options" on treat_options for insert to anon with check (true);
create policy "anon can delete treat options" on treat_options for delete to anon using (true);

drop policy if exists "anon can read draw results" on draw_results;
drop policy if exists "anon can insert draw results" on draw_results;
create policy "anon can read draw results" on draw_results for select to anon using (true);
create policy "anon can insert draw results" on draw_results for insert to anon with check (true);

-- 实时订阅（让前端能听到别人对清单 / 抽签 / 在线状态的变更）
-- 用 DO 块做幂等保护：已加进 publication 的表不重复添加，整份脚本可安全重跑。
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'treat_options'
  ) then
    alter publication supabase_realtime add table treat_options;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'draw_results'
  ) then
    alter publication supabase_realtime add table draw_results;
  end if;
end $$;
