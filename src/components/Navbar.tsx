
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
// Removed DropdownMenu imports
import { User } from 'lucide-react'; // Removed LogOut as sign out is in profile page
// import { signOut } from '../services/api'; // No longer needed here
// import { useToast } from '@/hooks/use-toast'; // No longer needed here
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  // Removed refreshProfile and toast as handleSignOut is removed
  const { auth } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Removed handleSignOut function

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>
              Wander guide
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            {auth.isAuthenticated ? (
              // Replaced DropdownMenu with a direct Button link to profile
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => navigate('/profile')} // Navigate directly
              >
                <User size={18} />
                <span className="hidden sm:inline">{t("profile")}</span>
              </Button>
            ) : (
              // Simple Sign In button remains the same
              <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate('/auth')}>
                <User size={18} />
                {t("sign_in")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
