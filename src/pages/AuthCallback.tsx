
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have a code in the URL
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');
        
        if (!code) {
          throw new Error('No code found in URL');
        }

        // The supabase client should automatically handle the exchange of the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          throw error;
        }

        toast({
          title: 'Welcome!',
          description: 'You have successfully signed in.',
        });

        // Redirect to the profile page after successful auth
        navigate('/profile');
      } catch (error) {
        console.error('Error during auth callback:', error);
        toast({
          title: 'Authentication Error',
          description: error instanceof Error ? error.message : 'Failed to authenticate',
          variant: 'destructive',
        });
        navigate('/auth'); // Redirect back to auth page on error
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <h1 className="text-2xl font-semibold mb-4">Completing Authentication</h1>
        <p className="text-gray-500">Please wait while we log you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
