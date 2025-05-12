-- STEP 1: Clean everything up
-- Drop the profiles table if it exists
DROP TABLE IF EXISTS public.profiles;

-- Delete all users from public.users
DELETE FROM public.users;

-- STEP 2: Create the profiles table properly
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- STEP 3: Get list of all auth users (run this part separately to see the IDs)
SELECT id, email FROM auth.users;

-- STEP 4: After getting the auth.users ID:
-- Replace AUTH_USER_ID with the actual UUID from step 3
-- INSERT INTO profiles (id, email, role)
-- VALUES ('AUTH_USER_ID', 'admin@framp.xyz', 'admin');

-- INSERT INTO public.users (id, name, email, status, ip_address, user_agent)
-- VALUES ('AUTH_USER_ID', 'Admin User', 'admin@framp.xyz', 'active', '127.0.0.1', 'Admin Script'); 