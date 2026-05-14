-- EasyBook Supabase Migration & Schema
-- WARNING: This script will DELETE ALL DATA and recreate the tables.
-- Run this in your Supabase SQL Editor

-- ─── DROP EXISTING TABLES (CLEAN SLATE) ──────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.favourites CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.packages CASCADE;
DROP TABLE IF EXISTS public.specialists CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ─── 1. EXTEND AUTH WITH PROFILES ───────────────────────────────────────────
CREATE TABLE public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email             TEXT,
  username          TEXT,
  full_name         TEXT,
  phone             NUMERIC,
  avatar_url        TEXT,
  location          TEXT,
  business_name     TEXT,
  business_location TEXT,
  business_category TEXT,
  role              TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'business_owner', 'admin')),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. CATEGORIES ─────────────────────────────────────────────────────────
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  icon        TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

-- ─── 3. BUSINESSES ─────────────────────────────────────────────────────────
CREATE TABLE public.businesses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  address       TEXT,
  city          TEXT DEFAULT 'Takoradi',
  region        TEXT DEFAULT 'Western Region',
  country       TEXT DEFAULT 'Ghana',
  category      TEXT,
  phone         NUMERIC,
  website       TEXT,
  image_url     TEXT,
  gallery       JSONB DEFAULT '[]'::jsonb,
  rating        REAL DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  latitude      REAL,
  longitude     REAL,
  is_open       BOOLEAN DEFAULT true,
  working_hours JSONB DEFAULT '[]'::jsonb,
  services_tags JSONB DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. SPECIALISTS ────────────────────────────────────────────────────────
CREATE TABLE public.specialists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  service       TEXT NOT NULL,
  bio           TEXT,
  rating        REAL DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  image_url     TEXT,
  is_available  BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── 5. SERVICE PACKAGES ────────────────────────────────────────────────────
CREATE TABLE public.packages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         REAL NOT NULL,
  currency      TEXT DEFAULT 'GHS',
  duration_mins INTEGER NOT NULL,
  category_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── 6. BOOKINGS ────────────────────────────────────────────────────────────
CREATE TABLE public.bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  specialist_id   UUID REFERENCES public.specialists(id) ON DELETE SET NULL,
  package_id      UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  date            DATE NOT NULL,
  time            TIME NOT NULL,
  duration_mins   INTEGER DEFAULT 60,
  status          TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','in_progress','completed','cancelled')),
  notes           TEXT,
  total_price     REAL DEFAULT 0,
  currency        TEXT DEFAULT 'GHS',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── 7. PAYMENTS ────────────────────────────────────────────────────────────
CREATE TABLE public.payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount          REAL NOT NULL,
  currency        TEXT DEFAULT 'GHS',
  method          TEXT DEFAULT 'mobile_money' CHECK(method IN ('mobile_money','card','cash')),
  provider        TEXT,
  phone_number    TEXT,
  reference       TEXT UNIQUE,
  status          TEXT DEFAULT 'pending' CHECK(status IN ('pending','processing','completed','failed','refunded')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── 8. REVIEWS ─────────────────────────────────────────────────────────────
CREATE TABLE public.reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id   UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  booking_id    UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating        INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── 9. FAVOURITES ──────────────────────────────────────────────────────────
CREATE TABLE public.favourites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id   UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- ─── 10. NOTIFICATIONS ──────────────────────────────────────────────────────
CREATE TABLE public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  type          TEXT DEFAULT 'info', -- 'confirmation', 'promo', 'reminder', 'info'
  is_read       BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── 11. MESSAGES (Chat) ────────────────────────────────────────────────────
CREATE TABLE public.messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text          TEXT,
  media_url     TEXT,
  media_type    TEXT CHECK(media_type IN ('image', 'audio', 'video')),
  is_read       BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── SECURITY SETTINGS (RLS) ──────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ─── POLICIES ─────────────────────────────────────────────────────────────────

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Businesses
CREATE POLICY "Businesses are viewable by everyone" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Owners can manage their businesses" ON public.businesses FOR ALL USING (auth.uid() = owner_id);

-- Specialists & Packages
CREATE POLICY "Specialists are viewable by everyone" ON public.specialists FOR SELECT USING (true);
CREATE POLICY "Packages are viewable by everyone" ON public.packages FOR SELECT USING (true);

-- Bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Business owners can view bookings for their business" ON public.bookings FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = bookings.business_id AND owner_id = auth.uid()));

-- Reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can write reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Favourites
CREATE POLICY "Users can manage their own favourites" ON public.favourites FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Messages
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- ─── STORAGE CONFIGURATION ──────────────────────────────────────────────────

-- Create bucket for chat media (images, voice notes)
-- Note: Buckets can't be easily dropped via SQL, so we just use ON CONFLICT
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Chat media is publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload chat media" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own chat media" ON storage.objects;
END $$;

CREATE POLICY "Chat media is publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'chat-media');
CREATE POLICY "Authenticated users can upload chat media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own chat media" ON storage.objects FOR DELETE USING (bucket_id = 'chat-media' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- ─── FUNCTIONS & TRIGGERS ──────────────────────────────────────────────────

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    username, 
    phone, 
    role, 
    avatar_url,
    business_name,
    business_location,
    business_category
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'username',
    (REGEXP_REPLACE(COALESCE(new.raw_user_meta_data->>'phone', '0'), '[^0-9]', '', 'g'))::NUMERIC,
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'business_location',
    new.raw_user_meta_data->>'business_category'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    phone = EXCLUDED.phone,
    business_name = EXCLUDED.business_name,
    business_location = EXCLUDED.business_location,
    business_category = EXCLUDED.business_category,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── SEED DATA ───────────────────────────────────────────────────────────────

-- Insert Categories
INSERT INTO public.categories (name, icon, sort_order) VALUES
('Haircut', 'Scissors', 1),
('Make up', 'Sparkles', 2),
('Manicure', 'Hand', 3),
('Spa', 'Leaf', 4),
('Facial', 'Sparkles', 5),
('Massage', 'Heart', 6),
('Barber', 'Scissors', 7),
('Pedicure', 'Footprints', 8);
