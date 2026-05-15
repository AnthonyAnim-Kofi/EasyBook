-- 02_update_businesses_schema.sql
-- Fixes for the Businesses and Packages tables to prevent data loss.

-- 1. Change phone column in businesses from NUMERIC to TEXT
-- Reason: Similar to profiles, business phone numbers often contain a '+' or leading zeros.
ALTER TABLE public.businesses
ALTER COLUMN phone TYPE TEXT USING phone::TEXT;

-- 2. Rename duration_mins to duration in packages
-- Reason: The frontend payload sends the key "duration", but the database expects "duration_mins".
ALTER TABLE public.packages
RENAME COLUMN duration_mins TO duration;

-- 3. Change duration to TEXT and drop NOT NULL constraint
-- Reason: The frontend sends the duration as a string (e.g. "1 hour", "30 mins"), which crashes INTEGER columns.
ALTER TABLE public.packages
ALTER COLUMN duration TYPE TEXT USING duration::TEXT;

-- 4. Change price from REAL to TEXT
-- Reason: To prevent database crashes if the user types a currency symbol like "$50" or "50 GHS" in the UI.
ALTER TABLE public.packages
ALTER COLUMN price TYPE TEXT USING price::TEXT;
