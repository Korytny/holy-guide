
// No longer importing Database type if createClient infers it or it's not strictly needed here
import { createClient } from '@supabase/supabase-js'; 

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('Error: VITE_SUPABASE_URL is not defined. Please check your .env file.');
}
if (!SUPABASE_PUBLISHABLE_KEY) {
  console.error('Error: VITE_SUPABASE_ANON_KEY is not defined. Please check your .env file.');
}

// Initialize the client only if URL and Key are available
// The Database type can often be inferred by Supabase client if setup correctly, 
// or passed if strict typing is required across the app.
// Removing explicit type here to potentially resolve unused import error.
export const supabase = (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null; 

if (!supabase) {
  // This error is important if initialization fails
  console.error('Supabase client could not be initialized. Check environment variables.');
}
