-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  session_id text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create test_data table
create table if not exists test_data (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  data_type text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, data_type)
);

-- Enable Row Level Security (RLS)
alter table users enable row level security;
alter table test_data enable row level security;

-- Create policies for users table
-- Allow anyone to create a user (for session-based auth)
create policy "Allow public insert to users"
  on users for insert
  with check (true);

-- Allow users to read their own data based on session_id
create policy "Allow public read users"
  on users for select
  using (true); -- You might want to restrict this further if possible, but for session_id lookup it's needed.
  -- Ideally: using (session_id = current_setting('request.headers')::json->>'x-session-id') or similar if you passed it.
  -- Since we just have a client-side session_id and using anon key, we rely on the logic. 
  -- Note: With anon key, 'true' means anyone can read anyone's user record if they guess the ID. 
  -- For better security, you might want to implement RLS checking the session_id in the query, but Supabase simple policies usually work on auth.uid() which we don't have here (custom session).
  -- A common pattern for "anonymous" session-based data is hard with just RLS unless we trust the client or use a function.
  -- For now, allowing Insert/Select for public is the simplest way to get "Error creating user" fixed, assumming it's a dev/test app.

create policy "Allow public update users"
  on users for update
  using (true);

-- Create policies for test_data table
create policy "Allow public all access to test_data"
  on test_data for all
  using (true)
  with check (true);
