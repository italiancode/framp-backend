-- First create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Then add the admin user to the profiles table
-- Add user to profiles table with admin role
INSERT INTO profiles (id, email, role)
VALUES ('AUTH_USER_ID', 'admin@framp.xyz', 'admin');

-- Add user to the public.users table
INSERT INTO public.users (id, name, email, status, ip_address, user_agent)
VALUES ('AUTH_USER_ID', 'Admin User', 'admin@framp.xyz', 'active', '127.0.0.1', 'Admin Script');