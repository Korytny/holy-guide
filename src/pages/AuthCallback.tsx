
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Layout from '../components/Layout';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback page loaded");
        
        // Check if we have a code in the URL
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');
        
        if (!code) {
          console.error("No code found in URL");
          setErrorMessage('No authentication code found in URL');
          throw new Error('No code found in URL');
        }

        console.log("Found auth code, exchanging for session...");
        
        // The supabase client should automatically handle the exchange of the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error("Error exchanging code for session:", error);
          setErrorMessage(error.message);
          throw error;
        }

        console.log("Session established successfully:", !!data.session);

        toast({
          title: 'Добро пожаловать!',
          description: 'Вы успешно вошли в систему.',
        });

        // Redirect to the profile page after successful auth
        navigate('/profile');
      } catch (error) {
        console.error('Error during auth callback:', error);
        toast({
          title: 'Ошибка аутентификации',
          description: error instanceof Error ? error.message : 'Не удалось войти в систему',
          variant: 'destructive',
        });
        
        // Wait a moment before redirecting to auth page on error
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <Layout hideNavbar>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-purple-50">
        <div className="text-center max-w-md w-full p-6 bg-white rounded-2xl shadow-xl">
          {errorMessage ? (
            <>
              <h1 className="text-2xl font-semibold mb-4 text-red-600">Ошибка аутентификации</h1>
              <p className="text-gray-700 mb-4">{errorMessage}</p>
              <p className="text-gray-500">Перенаправление на страницу входа...</p>
            </>
          ) : (
            <>
              <div className="animate-pulse mb-4">
                <div className="h-12 w-12 bg-blue-200 rounded-full mx-auto mb-4"></div>
              </div>
              <h1 className="text-2xl font-semibold mb-4">Завершение аутентификации</h1>
              <p className="text-gray-500">Пожалуйста, подождите, пока мы входим в систему...</p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AuthCallback;
