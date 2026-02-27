
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useFont } from '../context/FontContext';
import LanguageSwitcher from './LanguageSwitcher';
import { FontSwitcher } from '@/components/ui/FontSwitcher';

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className = '' }: NavbarProps) => {
  // Removed refreshProfile and toast as handleSignOut is removed
  const { auth } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { fonts } = useFont();

  // Removed handleSignOut function

  return (
    <div className={`bg-[#FFF8E7] shadow-md ${className}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-full relative">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            <FontSwitcher />
          </div>

          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <h1 className={`text-xl font-bold ${fonts.heading.className} cursor-pointer text-gray-900 hover:text-gray-700 transition-colors`} onClick={() => navigate('/')}>
              {t('app_title')}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {auth.isAuthenticated ? (
              <Button
                variant="ghost"
                className={`flex items-center gap-2 text-gray-900 hover:text-gray-700 hover:bg-white/50 transition-colors ${fonts.subheading.className}`}
                onClick={() => navigate('/profile')}
              >
                <User size={18} />
                <span className="hidden sm:inline font-medium">{t("profile")}</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                className={`flex items-center gap-2 text-gray-900 hover:text-gray-700 hover:bg-white/50 transition-colors ${fonts.subheading.className}`}
                onClick={() => navigate('/auth')}
              >
                <User size={18} />
                <span className="font-medium">{t("sign_in")}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
