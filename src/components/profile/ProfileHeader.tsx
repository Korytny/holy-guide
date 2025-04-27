import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '../../context/AuthContext'; // Updated path
import { useLanguage } from '../../context/LanguageContext'; // Updated path
import { useToast } from "@/hooks/use-toast";
import { signOut } from '../../services/api'; // Updated path

const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
};

const ProfileHeader = () => {
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
        // Render nothing or a placeholder if user data isn't ready
        // This component should ideally only be rendered when auth.user is guaranteed
        return null; 
    }

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
                <h2 className="text-2xl font-semibold mb-1">
                    {auth.user.fullName || t('welcome')}
                </h2>
                <div className="mt-8 w-full flex justify-center">
                    <Button onClick={handleSignOut} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">
                        {t('sign_out')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ProfileHeader;
