import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type AuthContextType } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import Layout from "../components/Layout"; // Layout is applied at a higher level or here if specific
import { useLanguage } from "../context/LanguageContext";
import ProfileHeader from "../components/profile/ProfileHeader";
import FavoritesSection from "../components/profile/FavoritesSection";
import UserCommentsSection from "../components/profile/UserCommentsSection";
import { PilgrimagePlanner } from "../components/profile/PilgrimagePlanner";
import { GuruPlanner } from "../components/profile/GuruPlanner";
// PilgrimageRouteMap and PlannedItem imports are no longer needed here

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
  const authContextValue = useAuth();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const [favoriteCounts, setFavoriteCounts] = useState<FavoriteCounts | null>(null);
  const [commentPhotoCounts, setCommentPhotoCounts] = useState<CommentPhotoCounts | null>(null);
  // plannedItems state and handlePlannedItemsChange are no longer needed here

  useEffect(() => {
    if (!authContextValue.auth.isLoading && !authContextValue.auth.session) {
      navigate('/auth');
    }
  }, [authContextValue.auth.isLoading, authContextValue.auth.session, navigate]);

  const handleFavoriteCountsLoaded = useCallback((counts: FavoriteCounts) => {
    setFavoriteCounts(counts);
  }, []);

  const handleCommentsAndPhotosCountLoaded = useCallback((counts: CommentPhotoCounts) => {
    setCommentPhotoCounts(counts);
  }, []);

  if (authContextValue.auth.isLoading) {
    return (
      // Assuming Layout wraps the entire app, or specific pages need it like this
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

  if (!authContextValue.auth.session || !authContextValue.auth.user) {
    return null;
  }

  const allCounts = {
    favoriteCitiesCount: favoriteCounts?.citiesCount || 0,
    favoritePlacesCount: favoriteCounts?.placesCount || 0,
    favoriteRoutesCount: favoriteCounts?.routesCount || 0,
    favoriteEventsCount: favoriteCounts?.eventsCount || 0,
    commentsCount: commentPhotoCounts?.commentsCount || 0,
    photosCount: commentPhotoCounts?.photosCount || 0,
  };

  return (
    // Layout might be here or at App.tsx level
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50">
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <ProfileHeader favoriteCounts={allCounts} />
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{t('guru_planner_main_title')}</h2>
            <GuruPlanner
              auth={authContextValue}
              language={language}
              t={t}
            />
          </div>
          <div className="mt-10"> {/* Added wrapper with margin-top */}
            <FavoritesSection onFavoriteCountsLoaded={handleFavoriteCountsLoaded} />
          </div>
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
      
      {/* PilgrimagePlanner Section - Full Width at bottom, outside container */}
      <div className="w-full bg-gradient-to-b from-orange-50 to-purple-50">
        <div className="text-center mb-20 pt-20">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Запланируй свое поломничество
          </h2>
        </div>
        
        <PilgrimagePlanner
          auth={authContextValue}
          language={language}
          t={t}
          // onItemsChange is no longer needed
        />
      </div>
    </div>
  );
};

export default Profile;
