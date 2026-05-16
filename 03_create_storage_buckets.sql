-- 03_create_storage_buckets.sql
-- This script creates the required Supabase Storage buckets and sets up RLS policies.

-- 1. Create the necessary storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('business-profiles', 'business-profiles', true),
  ('business-gallery', 'business-gallery', true),
  ('avatars', 'avatars', true),
  ('specialists', 'specialists', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Storage Policies for these buckets

-- Drop existing policies to prevent conflicts if you run this multiple times
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Allow anyone to view images from these buckets
CREATE POLICY "Allow public read access" 
ON storage.objects FOR SELECT 
USING ( bucket_id IN ('business-profiles', 'business-gallery', 'avatars', 'specialists') );

-- Allow authenticated users to upload files to these buckets
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id IN ('business-profiles', 'business-gallery', 'avatars', 'specialists') );

-- Allow authenticated users to update their files in these buckets
CREATE POLICY "Allow authenticated updates" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING ( bucket_id IN ('business-profiles', 'business-gallery', 'avatars', 'specialists') );

-- Allow authenticated users to delete their files in these buckets
CREATE POLICY "Allow authenticated deletes" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( bucket_id IN ('business-profiles', 'business-gallery', 'avatars', 'specialists') );
