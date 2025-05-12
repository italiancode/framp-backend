-- Check if the auth.users table contains our admin user
SELECT * FROM auth.users WHERE email = 'admin@framp.xyz';

-- If the above query returns no results, you'll need to create the user through the Supabase dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Enter email: admin@framp.xyz and password: 12345678
-- 4. Click "Create"

-- After creating the user, note the user's ID, then run:

-- First create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Replace NEW_USER_UUID with the actual UUID you got from the dashboard
-- INSERT INTO profiles (id, email, role)
-- VALUES ('NEW_USER_UUID', 'admin@framp.xyz', 'admin');

-- Also make sure the user exists in your application's users table:
-- INSERT INTO public.users (id, name, email, status, ip_address, user_agent, created_at, updated_at)
-- VALUES ('NEW_USER_UUID', 'Admin User', 'admin@framp.xyz', 'active', '127.0.0.1', 'Admin Script', now(), now())
-- ON CONFLICT (id) DO UPDATE SET name = 'Admin User', status = 'active'; 