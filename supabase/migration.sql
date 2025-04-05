
-- Create a function to create user profiles safely
-- This function will be called from our client code
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_full_name TEXT,
  user_avatar_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the creator
AS $$
BEGIN
  -- Insert the profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (user_id, user_full_name, user_avatar_url)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission to the function for authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
