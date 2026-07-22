CREATE TABLE IF NOT EXISTS public.local_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Customer' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.local_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for anon key" ON public.local_users
  FOR ALL USING (true) WITH CHECK (true);
