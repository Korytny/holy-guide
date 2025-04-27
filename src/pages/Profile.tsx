
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";
import ProfileHeader from "../components/profile/ProfileHeader"; // Import new component
import FavoritesSection from "../components/profile/FavoritesSection"; // Import new component
import UserCommentsSection from "../components/profile/UserCommentsSection"; // Import new component


const Profile = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Redirect if not authenticated and loading is finished
    if (!auth.isLoading && !auth.session) {
      navigate('/auth');
    }
  }, [auth.isLoading, auth.session, navigate]);

  if (auth.isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-center">
            <h1 className="text-2xl font-semibold mb-4">{t('loading')}</h1>
            <p className="text-gray-500">{t('please_wait')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Only render profile content if authenticated
  if (!auth.session || !auth.user) {
    // This should technically not be reached due to the redirect effect
    // but serves as an extra guard.
    return null; 
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          
          <ProfileHeader />
          
          <FavoritesSection />
          
          <UserCommentsSection />
          
          <div className="mt-8 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              {t('back_to_cities')} 
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
