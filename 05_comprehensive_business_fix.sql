-- 1. Ensure the tables exist with the correct structure
CREATE TABLE IF NOT EXISTS public.specialists (
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

CREATE TABLE IF NOT EXISTS public.packages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         REAL NOT NULL,
  currency      TEXT DEFAULT 'GHS',
  duration_mins INTEGER NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS (Row Level Security)
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- 3. Drop any old policies to start fresh
DROP POLICY IF EXISTS "Specialists are viewable by everyone" ON public.specialists;
DROP POLICY IF EXISTS "Owners can manage their specialists" ON public.specialists;
DROP POLICY IF EXISTS "Owners can insert specialists" ON public.specialists;
DROP POLICY IF EXISTS "Owners can update specialists" ON public.specialists;
DROP POLICY IF EXISTS "Owners can delete specialists" ON public.specialists;

DROP POLICY IF EXISTS "Packages are viewable by everyone" ON public.packages;
DROP POLICY IF EXISTS "Owners can manage their packages" ON public.packages;
DROP POLICY IF EXISTS "Owners can insert packages" ON public.packages;
DROP POLICY IF EXISTS "Owners can update packages" ON public.packages;
DROP POLICY IF EXISTS "Owners can delete packages" ON public.packages;

-- 4. Create Public View Policies (Anyone can see them)
CREATE POLICY "Specialists are viewable by everyone" ON public.specialists FOR SELECT USING (true);
CREATE POLICY "Packages are viewable by everyone" ON public.packages FOR SELECT USING (true);

-- 5. Create Owner Management Policies (Only the business owner can edit/add/delete)
-- Specialists
CREATE POLICY "Owners can manage specialists" 
ON public.specialists FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE public.businesses.id = specialists.business_id 
    AND public.businesses.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE public.businesses.id = specialists.business_id 
    AND public.businesses.owner_id = auth.uid()
  )
);

-- Packages
CREATE POLICY "Owners can manage packages" 
ON public.packages FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE public.businesses.id = packages.business_id 
    AND public.businesses.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE public.businesses.id = packages.business_id 
    AND public.businesses.owner_id = auth.uid()
  )
);
