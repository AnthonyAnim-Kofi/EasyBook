-- 1. Ensure reviews table exists (it already does from initial migration, but let's be sure)
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating        INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can write reviews" ON public.reviews;

-- Anyone can see reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);

-- Authenticated users can write reviews
-- Ideally, we'd check if they had a completed booking, but for now, any authenticated user can review.
-- A more advanced policy would check the 'bookings' table.
CREATE POLICY "Authenticated users can write reviews" 
ON public.reviews FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Update the businesses table to have a calculated rating (Optional, usually done with a trigger)
-- For now, we'll just fetch and calculate on the frontend or use a view.
