-- Create the users table
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text not null unique,
  wallet text,
  referral text,
  status text not null default 'active',
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);
