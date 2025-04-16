
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { useLanguage } from "../context/LanguageContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshProfile } = useAuth(); // Keep refreshProfile
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // console.log('[AuthCallback] Component Mounted');
    const handleAuthCallback = async () => {
       if (!supabase) {
        console.error('[AuthCallback] Supabase client not available.');
        setErrorMessage('Initialization error.');
        setIsProcessing(false);
        return;
      }
      
      // We rely on the onAuthStateChange listener in AuthContext to handle session
      // and call refreshProfile. This component just needs to wait briefly and redirect.
      // console.log('[AuthCallback] Waiting for AuthContext listener to process session...');

      // Redirect to home after a short delay, assuming the listener has done its job.
      // The AuthContext should handle showing loading state until auth is resolved.
      const redirectTimeout = setTimeout(() => {
        // console.log('[AuthCallback] Redirecting to home page.');
        navigate('/');
      }, 1000); // Short delay (1 second)

      // No need to manually check session or call refreshProfile here, 
      // as AuthContext listener handles it globally.
      
      // Cleanup timeout if component unmounts
      return () => clearTimeout(redirectTimeout);

    };

    handleAuthCallback();
    // Dependencies: only need navigate and t for error messages/redirect
  }, [navigate, t]); 

  // Simplified view: just show a generic loading state
  // Error handling is implicitly done by AuthContext and redirection
  return (
    <Layout hideNavbar>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-purple-50">
        <div className="text-center max-w-md w-full p-6 bg-white rounded-2xl shadow-xl">
            <div className={'animate-pulse mb-4'}>
              <div className="h-12 w-12 bg-blue-200 rounded-full mx-auto mb-4"></div>
            </div>
            <h1 className="text-2xl font-semibold mb-4">{t('completing_auth')}</h1>
            <p className="text-gray-500">{t('please_wait_signing_in')}</p>
        </div>
      </div>
    </Layout>
  );
};

export default AuthCallback;
