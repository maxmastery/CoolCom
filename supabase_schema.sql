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
