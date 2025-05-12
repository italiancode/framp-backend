-- Enable UUID generation if not already
create extension if not exists "uuid-ossp";

-- Create the waitlist table
create table public.waitlist (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text not null,
  wallet text,
  referral text,
  status text not null default 'pending',
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Ensure no duplicate emails
create unique index on public.waitlist (email);
