import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type AuthContextType } from "../context/AuthContext"; // Import AuthContextType
import { Button } from "@/components/ui/button";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";
import ProfileHeader from "../components/profile/ProfileHeader";
import FavoritesSection from "../components/profile/FavoritesSection";
import UserCommentsSection from "../components/profile/UserCommentsSection";
import { PilgrimagePlanner } from "../components/profile/PilgrimagePlanner"; // Import the new planner component

interface FavoriteCounts {
  citiesCount: number;
  placesCount: number;
  routesCount: number;
  eventsCount: number;
}

interface CommentPhotoCounts {
  commentsCount: number;
  photosCount: number;
}

const Profile = () => {
  const authContextValue = useAuth(); // authContextValue is of type AuthContextType
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  // State for counts (remains in Profile, as it's for ProfileHeader)
  const [favoriteCounts, setFavoriteCounts] = useState<FavoriteCounts | null>(null);
  const [commentPhotoCounts, setCommentPhotoCounts] = useState<CommentPhotoCounts | null>(null);

  useEffect(() => {
    // Redirect if not authenticated and loading is finished
    // Access auth state via authContextValue.auth
    if (!authContextValue.auth.isLoading && !authContextValue.auth.session) {
      navigate('/auth');
    }
  }, [authContextValue.auth.isLoading, authContextValue.auth.session, navigate]);

  // Callbacks to receive counts from child components
  const handleFavoriteCountsLoaded = useCallback((counts: FavoriteCounts) => {
    setFavoriteCounts(counts);
  }, []);

  const handleCommentsAndPhotosCountLoaded = useCallback((counts: CommentPhotoCounts) => {
    setCommentPhotoCounts(counts);
  }, []);


  if (authContextValue.auth.isLoading) {
    // Layout is kept here for loading state
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
  if (!authContextValue.auth.session || !authContextValue.auth.user) {
    // This should technically not be reached due to the redirect effect
    // but serves as an extra guard.
    return null;
  }

  // Combine all counts for ProfileHeader
  const allCounts = {
    favoriteCitiesCount: favoriteCounts?.citiesCount || 0,
    favoritePlacesCount: favoriteCounts?.placesCount || 0,
    favoriteRoutesCount: favoriteCounts?.routesCount || 0,
    favoriteEventsCount: favoriteCounts?.eventsCount || 0,
    commentsCount: commentPhotoCounts?.commentsCount || 0,
    photosCount: commentPhotoCounts?.photosCount || 0,
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          
          <ProfileHeader favoriteCounts={allCounts} />
          
          {/* Personal Pilgrimage Planner Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{t('personal_pilgrimage_planner')}</h2>
            {/* Pass the whole authContextValue which is of type AuthContextType */}
            <PilgrimagePlanner auth={authContextValue} language={language} t={t} />
          </div>

          {/* Favorites and Comments Sections */}
          <FavoritesSection onFavoriteCountsLoaded={handleFavoriteCountsLoaded} />
          <UserCommentsSection onCommentsAndPhotosCountLoaded={handleCommentsAndPhotosCountLoaded} />
          
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
  );
};

export default Profile;
