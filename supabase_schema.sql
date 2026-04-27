-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'admin'::text check (role in ('admin', 'user')),
  created_at timestamptz default now()
);

-- Trigger to automatically create a profile for new users
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'admin');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create categories table
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  type text not null, -- course, tool, blog, content, product
  description text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Create courses table
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  short_description text,
  thumbnail_url text,
  cover_url text,
  price numeric default 0,
  is_free boolean default false,
  level text,
  duration text,
  youtube_url text,
  external_url text,
  category_id uuid references public.categories(id) on delete set null,
  status text default 'draft', -- draft, published, archived
  featured boolean default false,
  is_special boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Create tools table
create table public.tools (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  tool_url text,
  category_id uuid references public.categories(id) on delete set null,
  status text default 'draft',
  featured boolean default false,
  is_special boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Create blog_posts table
create table public.blog_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  thumbnail_url text,
  cover_url text,
  author text default 'CoolCom',
  category_id uuid references public.categories(id) on delete set null,
  status text default 'draft',
  featured boolean default false,
  is_special boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Create content_videos table
create table public.content_videos (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  youtube_url text not null,
  youtube_id text,
  thumbnail_url text,
  category_id uuid references public.categories(id) on delete set null,
  status text default 'draft',
  featured boolean default false,
  is_special boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. Create products table
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  short_description text,
  thumbnail_url text,
  gallery_urls text[],
  price numeric default 0,
  sale_price numeric,
  product_type text, -- ebook, course, template, physical, service
  payment_url text,
  external_url text,
  category_id uuid references public.categories(id) on delete set null,
  status text default 'draft',
  featured boolean default false,
  is_special boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. Create announcements table
create table public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  image_url text,
  link_url text,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. Create site_settings table
create table public.site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- Security: Row Level Security (RLS) setup
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.courses enable row level security;
alter table public.tools enable row level security;
alter table public.blog_posts enable row level security;
alter table public.content_videos enable row level security;
alter table public.products enable row level security;
alter table public.announcements enable row level security;
alter table public.site_settings enable row level security;

-- Function to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Create Policies

-- 1. Admin Full Access Policy
create policy "Admins have full access to profiles" on public.profiles for all using (public.is_admin());
create policy "Admins have full access to categories" on public.categories for all using (public.is_admin());
create policy "Admins have full access to courses" on public.courses for all using (public.is_admin());
create policy "Admins have full access to tools" on public.tools for all using (public.is_admin());
create policy "Admins have full access to blog_posts" on public.blog_posts for all using (public.is_admin());
create policy "Admins have full access to content_videos" on public.content_videos for all using (public.is_admin());
create policy "Admins have full access to products" on public.products for all using (public.is_admin());
create policy "Admins have full access to announcements" on public.announcements for all using (public.is_admin());
create policy "Admins have full access to site_settings" on public.site_settings for all using (public.is_admin());

-- 2. Public Read Policy (Read-Only for Published Content)
create policy "Public can read categories" on public.categories for select using (true);
create policy "Public can read published courses" on public.courses for select using (status = 'published');
create policy "Public can read published tools" on public.tools for select using (status = 'published');
create policy "Public can read published blog_posts" on public.blog_posts for select using (status = 'published');
create policy "Public can read published content_videos" on public.content_videos for select using (status = 'published');
create policy "Public can read published products" on public.products for select using (status = 'published');
create policy "Public can read active announcements" on public.announcements for select using (is_active = true);
create policy "Public can read site_settings" on public.site_settings for select using (true);

-- Create Storage Bucket for Media
insert into storage.buckets (id, name, public) values ('coolcom-media', 'coolcom-media', true);

-- Storage Policies
create policy "Admins can manage media" on storage.objects for all using (bucket_id = 'coolcom-media' and public.is_admin());
create policy "Public can view media" on storage.objects for select using (bucket_id = 'coolcom-media');
-- SQL Migration: Visitor Tracking System
-- Run this in your Supabase SQL Editor

-- 1. Create the site_visitors table
CREATE TABLE IF NOT EXISTS public.site_visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id UUID NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    page_path TEXT NOT NULL,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Indexing for performance
CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON public.site_visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON public.site_visitors(created_at);
CREATE INDEX IF NOT EXISTS idx_visitors_page_path ON public.site_visitors(page_path);

-- 3. Enable Row Level Security
ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

-- 4. Admin helper + RLS Policies

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Admin can select" ON public.site_visitors;
CREATE POLICY "Admin can select" ON public.site_visitors
  FOR SELECT
  USING (public.is_admin());

-- No direct public access (use RPC functions below)
DROP POLICY IF EXISTS "Allow public insert" ON public.site_visitors;

-- 5. RPC: track visitor (dedupe rapid refresh)
CREATE OR REPLACE FUNCTION public.track_visitor(
  p_visitor_id uuid,
  p_page_path text,
  p_referrer text,
  p_user_agent text,
  p_ip_address text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent_count int;
BEGIN
  -- Prevent noisy re-counting for the same visitor + same page within 10 minutes
  SELECT COUNT(*) INTO v_recent_count
  FROM public.site_visitors
  WHERE visitor_id = p_visitor_id
    AND page_path = p_page_path
    AND created_at > now() - interval '10 minutes';

  IF v_recent_count > 0 THEN
    RETURN false;
  END IF;

  INSERT INTO public.site_visitors(visitor_id, ip_address, user_agent, page_path, referrer)
  VALUES (p_visitor_id, p_ip_address, p_user_agent, p_page_path, p_referrer);

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.track_visitor(uuid, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_visitor(uuid, text, text, text, text) TO anon, authenticated;

-- 6. RPC: Public stats for footer
CREATE OR REPLACE FUNCTION public.get_public_visitor_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_visits bigint;
  v_today_visits bigint;
  v_today_unique bigint;
  v_total_unique bigint;
BEGIN
  SELECT COUNT(*) INTO v_total_visits FROM public.site_visitors;
  SELECT COUNT(DISTINCT visitor_id) INTO v_total_unique FROM public.site_visitors;

  SELECT COUNT(*) INTO v_today_visits
  FROM public.site_visitors
  WHERE created_at >= date_trunc('day', now());

  SELECT COUNT(DISTINCT visitor_id) INTO v_today_unique
  FROM public.site_visitors
  WHERE created_at >= date_trunc('day', now());

  RETURN json_build_object(
    'total_visits', COALESCE(v_total_visits, 0),
    'today_visits', COALESCE(v_today_visits, 0),
    'today_unique_visitors', COALESCE(v_today_unique, 0),
    'total_unique_visitors', COALESCE(v_total_unique, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_visitor_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_visitor_stats() TO anon, authenticated;

-- 7. RPC: Admin dashboard data (admin only)
CREATE OR REPLACE FUNCTION public.get_admin_visitor_dashboard()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_visits bigint;
  v_total_unique bigint;
  v_today_unique bigint;
  v_week_unique bigint;
  v_top_pages json;
  v_latest json;
  v_daily json;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT COUNT(*) INTO v_total_visits FROM public.site_visitors;
  SELECT COUNT(DISTINCT visitor_id) INTO v_total_unique FROM public.site_visitors;

  SELECT COUNT(DISTINCT visitor_id) INTO v_today_unique
  FROM public.site_visitors
  WHERE created_at >= date_trunc('day', now());

  SELECT COUNT(DISTINCT visitor_id) INTO v_week_unique
  FROM public.site_visitors
  WHERE created_at >= now() - interval '7 days';

  SELECT COALESCE(json_agg(t ORDER BY t.visit_count DESC), '[]'::json) INTO v_top_pages
  FROM (
    SELECT page_path,
           COUNT(*)::bigint AS visit_count
    FROM public.site_visitors
    GROUP BY page_path
    ORDER BY visit_count DESC
    LIMIT 5
  ) t;

  SELECT COALESCE(json_agg(l ORDER BY l.created_at DESC), '[]'::json) INTO v_latest
  FROM (
    SELECT created_at, page_path, referrer, user_agent
    FROM public.site_visitors
    ORDER BY created_at DESC
    LIMIT 10
  ) l;

  SELECT COALESCE(json_agg(d ORDER BY d.visit_date ASC), '[]'::json) INTO v_daily
  FROM (
    SELECT
      (date_trunc('day', created_at))::date AS visit_date,
      COUNT(*)::bigint AS total_visits,
      COUNT(DISTINCT visitor_id)::bigint AS unique_visitors
    FROM public.site_visitors
    WHERE created_at >= now() - interval '7 days'
    GROUP BY 1
  ) d;

  RETURN json_build_object(
    'total_visits', COALESCE(v_total_visits, 0),
    'total_unique_visitors', COALESCE(v_total_unique, 0),
    'today_unique_visitors', COALESCE(v_today_unique, 0),
    'week_unique_visitors', COALESCE(v_week_unique, 0),
    'top_pages', v_top_pages,
    'latest_visits', v_latest,
    'daily_last_7_days', v_daily
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_visitor_dashboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_visitor_dashboard() TO authenticated;

-- 5. Useful Views for Analytics

-- View for Daily Visitors
CREATE OR REPLACE VIEW visitor_stats_daily AS
SELECT 
    created_at::date as visit_date,
    COUNT(*) as total_visits,
    COUNT(DISTINCT visitor_id) as unique_visitors
FROM site_visitors
GROUP BY created_at::date
ORDER BY visit_date DESC;

-- View for Top Pages
CREATE OR REPLACE VIEW top_pages AS
SELECT 
    page_path,
    COUNT(*) as visit_count,
    COUNT(DISTINCT visitor_id) as unique_visitor_count
FROM site_visitors
GROUP BY page_path
ORDER BY visit_count DESC;
