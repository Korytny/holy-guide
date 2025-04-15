
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "../services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext"; // Added import

const Auth = () => {
  const { toast } = useToast();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage(); // Added hook

  useEffect(() => {
    // Redirect to profile if already authenticated
    if (auth.isAuthenticated) {
      navigate('/'); // Changed redirect to home page
    }
  }, [auth.isAuthenticated, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log("Google sign-in button clicked");
      await signInWithGoogle();
      console.log("Sign-in with Google initiated successfully");
      
      // No need to redirect here - the OAuth flow will handle the redirect
    } catch (error) {
      setIsLoading(false);
      console.error('Error signing in with Google:', error);
      toast({
        title: t("auth_error_title"),
        description: error instanceof Error ? error.message : t("google_signin_failed_desc"),
        variant: "destructive"
      });
    }
  };

  if (auth.isLoading) {
    return (
      <Layout hideNavbar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-center">
            <h1 className="text-2xl font-semibold mb-4">{t('loading')}</h1>
            <p className="text-gray-500">{t('please_wait')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNavbar>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-purple-50 p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">{t('welcome_title')}</h1>
            <p className="text-gray-600 mb-8">{t('signin_prompt')}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-center">{t('signin')}</h2>
            </div>
            
            <div className="p-6">
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 py-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                )}
                {isLoading ? t('connecting') : t('continue_with_google')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
