import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const signInWithGoogle = async () => {
  // console.log('[Auth API] Attempting to sign in with Google...');
  if (!supabase) {
      console.error('[Auth API] Supabase client not available during signInWithGoogle');
      throw new Error('Supabase client not initialized');
  }
  try {
    const redirectTo = window.location.origin + '/auth/callback';
    // console.log(`[Auth API] Redirect URL set to: ${redirectTo}`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo
      }
    });

    if (error) {
      console.error('[Auth API] Supabase signInWithOAuth error:', error);
      throw error;
    }

    // console.log('[Auth API] signInWithOAuth call successful (no immediate data expected here, redirection should happen):', data);
    return data;
  } catch (error) {
    console.error('[Auth API] Error in signInWithGoogle catch block:', error);
    throw error;
  }
};

export const signOut = async () => {
  // console.log('[Auth API] Attempting sign out...');
   if (!supabase) {
      console.error('[Auth API] Supabase client not available during signOut');
      throw new Error('Supabase client not initialized');
  }
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth API] Supabase signOut error:', error);
      throw error;
    }
    // console.log('[Auth API] Sign out successful.');
  } catch (error) {
    console.error('[Auth API] Error in signOut catch block:', error);
    throw error;
  }
};