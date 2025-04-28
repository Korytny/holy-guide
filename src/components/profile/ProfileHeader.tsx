import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from "@/hooks/use-toast";
import { signOut } from '../../services/api';

const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
};

interface ProfileHeaderProps {
  favoriteCounts?: {
    favoriteCitiesCount: number;
    favoritePlacesCount: number;
    favoriteRoutesCount: number;
    favoriteEventsCount: number;
    commentsCount: number;
    photosCount: number;
  } | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ favoriteCounts }) => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useLanguage();

    const handleSignOut = async () => {
        try {
          await signOut();
          toast({ title: t("signed_out_title"), description: t("signed_out_success_desc") });
          navigate('/auth');
        } catch (error) {
          console.error("Error signing out:", error);
          toast({ title: t("error_title"), description: t("signout_failed_desc"), variant: "destructive" });
        }
    };

    if (!auth.user) {
        return null; 
    }

    // Helper to render count item
    const renderCountItem = (count: number | undefined, labelKey: string) => (
      <div className="flex flex-col items-center p-3">
        <span className="text-xl font-bold text-gray-900">{count ?? 0}</span>
        <span className="text-sm text-gray-500">{t(labelKey)}</span>
      </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
            <div className="p-8 text-center border-b border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900">{t('your_profile')}</h1>
            </div>
            <div className="p-8 flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={auth.user.avatarUrl || undefined} alt={auth.user.fullName || "User"} />
                    <AvatarFallback className="text-3xl">{getInitials(auth.user.fullName)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-semibold mb-4">
                    {auth.user.fullName || t('welcome')}
                </h2>

                {/* Display Counts */}
                <div className="w-full flex justify-around text-center py-4 border-y border-gray-100 mb-8">
                    {renderCountItem(favoriteCounts?.favoriteCitiesCount, 'favorite_cities_count')}
                    {renderCountItem(favoriteCounts?.favoritePlacesCount, 'favorite_places_count')}
                    {renderCountItem(favoriteCounts?.favoriteRoutesCount, 'favorite_routes_count')}
                    {renderCountItem(favoriteCounts?.favoriteEventsCount, 'favorite_events_count')}
                    {renderCountItem(favoriteCounts?.commentsCount, 'comments_count')}
                    {renderCountItem(favoriteCounts?.photosCount, 'photos_count')}
                </div>

                <div className="mt-auto w-full flex justify-center">
                    <Button onClick={handleSignOut} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">
                        {t('sign_out')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ProfileHeader;
