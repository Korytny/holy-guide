
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { useLanguage } from "../context/LanguageContext"; // Added import

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const { t } = useLanguage(); // Added hook

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback page loaded");
        setIsProcessing(true);
        
        // Check if we have a code in the URL
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');
        
        if (!code) {
          console.error("No code found in URL");
          setErrorMessage(t('no_auth_code_found'));
          setIsProcessing(false);
          return;
        }

        console.log("Found auth code, exchanging for session...");
        
        // The supabase client should automatically handle the exchange of the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error("Error exchanging code for session:", error);
          setErrorMessage(error.message);
          setIsProcessing(false);
          return;
        }

        console.log("Session established successfully:", !!data.session);

        // Wait a moment to ensure the session is properly established
        setTimeout(async () => {
          try {
            // After successful authentication, refresh the user profile
            await refreshProfile();
            
            toast({
              title: t('welcome_back_title'),
              description: t('signed_in_successfully_desc'),
            });
            
            // Redirect to the home page after successful auth
            navigate('/');
          } catch (profileError) {
            console.error("Error refreshing profile:", profileError);
            setErrorMessage(t("profile_load_failed_desc"));
            setIsProcessing(false);
          }
        }, 1000);
      } catch (error) {
        console.error('Error during auth callback:', error);
        setIsProcessing(false);
        toast({
          title: t('auth_error_title'),
          description: error instanceof Error ? error.message : t('signin_failed_desc'),
          variant: 'destructive',
        });
        
        // Wait a moment before redirecting to auth page on error
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast, refreshProfile, t]); // Added t to dependency array

  return (
    <Layout hideNavbar>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-purple-50">
        <div className="text-center max-w-md w-full p-6 bg-white rounded-2xl shadow-xl">
          {errorMessage ? (
            <>
              <h1 className="text-2xl font-semibold mb-4 text-red-600">{t('auth_error_title')}</h1>
              <p className="text-gray-700 mb-4">{errorMessage}</p>
              <p className="text-gray-500">{t('redirecting_to_signin')}</p>
            </>
          ) : (
            <>
              <div className={`${isProcessing ? 'animate-pulse' : ''} mb-4`}>
                <div className="h-12 w-12 bg-blue-200 rounded-full mx-auto mb-4"></div>
              </div>
              <h1 className="text-2xl font-semibold mb-4">{t('completing_auth')}</h1>
              <p className="text-gray-500">{t('please_wait_signing_in')}</p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AuthCallback;
