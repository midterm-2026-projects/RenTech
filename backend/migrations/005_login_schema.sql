CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'Customer' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    COALESCE(new.raw_user_meta_data->>'role', 'Customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;