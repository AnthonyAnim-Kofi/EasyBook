-- 01_update_users_schema.sql
-- Fixes for the Profiles table to prevent data loss.

-- 1. Change phone column from NUMERIC to TEXT
-- Reason: NUMERIC cannot handle the '+' character or leading zeros effectively, 
-- causing user signups or profile updates to silently fail.
ALTER TABLE public.profiles
ALTER COLUMN phone TYPE TEXT USING phone::TEXT;
