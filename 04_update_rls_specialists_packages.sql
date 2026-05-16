-- 1. Enable RLS on Specialists and Packages (should already be enabled, but just in case)
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if any (SELECT policies are usually fine to keep)
-- DROP POLICY IF EXISTS "Specialists are viewable by everyone" ON public.specialists;
-- DROP POLICY IF EXISTS "Packages are viewable by everyone" ON public.packages;

-- 3. Create policies for Specialists
-- Allow owners to insert specialists for their own business
CREATE POLICY "Owners can insert specialists" 
ON public.specialists FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = specialists.business_id 
    AND owner_id = auth.uid()
  )
);

-- Allow owners to update specialists for their own business
CREATE POLICY "Owners can update specialists" 
ON public.specialists FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = specialists.business_id 
    AND owner_id = auth.uid()
  )
);

-- Allow owners to delete specialists for their own business
CREATE POLICY "Owners can delete specialists" 
ON public.specialists FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = specialists.business_id 
    AND owner_id = auth.uid()
  )
);

-- 4. Create policies for Packages
-- Allow owners to insert packages for their own business
CREATE POLICY "Owners can insert packages" 
ON public.packages FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = packages.business_id 
    AND owner_id = auth.uid()
  )
);

-- Allow owners to update packages for their own business
CREATE POLICY "Owners can update packages" 
ON public.packages FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = packages.business_id 
    AND owner_id = auth.uid()
  )
);

-- Allow owners to delete packages for their own business
CREATE POLICY "Owners can delete packages" 
ON public.packages FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = packages.business_id 
    AND owner_id = auth.uid()
  )
);
