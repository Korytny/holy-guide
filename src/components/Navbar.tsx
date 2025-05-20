
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
    <div className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSwitcher />
              <FontSwitcher />
            </div>
          </div>

          <div className="flex-[2] sm:flex-1 flex justify-center">
            <h1 className={`text-xl ${fonts.heading.className} cursor-pointer text-[#09332A]`} onClick={() => navigate('/')}>
              {t('app_title')}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {auth.isAuthenticated ? (
              <Button
                variant="ghost"
                className={`flex items-center gap-2 ${fonts.subheading.className}`}
                onClick={() => navigate('/profile')}
              >
                <User size={18} />
                <span className="hidden sm:inline">{t("profile")}</span>
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                className={`flex items-center gap-2 ${fonts.subheading.className}`}
                onClick={() => navigate('/auth')}
              >
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
