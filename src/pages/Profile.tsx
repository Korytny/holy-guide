import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";
import ProfileHeader from "../components/profile/ProfileHeader";
import FavoritesSection from "../components/profile/FavoritesSection";
import UserCommentsSection from "../components/profile/UserCommentsSection";

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
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // State for counts
  const [favoriteCounts, setFavoriteCounts] = useState<FavoriteCounts | null>(null);
  const [commentPhotoCounts, setCommentPhotoCounts] = useState<CommentPhotoCounts | null>(null);

  useEffect(() => {
    // Redirect if not authenticated and loading is finished
    if (!auth.isLoading && !auth.session) {
      navigate('/auth');
    }
  }, [auth.isLoading, auth.session, navigate]);

  // Callbacks to receive counts from child components
  const handleFavoriteCountsLoaded = useCallback((counts: FavoriteCounts) => {
    setFavoriteCounts(counts);
  }, []);

  const handleCommentsAndPhotosCountLoaded = useCallback((counts: CommentPhotoCounts) => {
    setCommentPhotoCounts(counts);
  }, []);

  if (auth.isLoading) {
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
  if (!auth.session || !auth.user) {
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

  // REMOVED Layout wrapper from the main return statement
  return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Pass counts to ProfileHeader */}
          <ProfileHeader 
            favoriteCounts={allCounts}
            // Add other props if needed in the future
          />
          
          {/* Pass callbacks to FavoritesSection and UserCommentsSection */}
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
