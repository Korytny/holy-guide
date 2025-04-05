
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { Globe } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  ];
  
  const currentLanguage = languages.find(lang => lang.code === language);
  
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2 text-sm">
            <Globe size={16} className="text-gray-600" />
            <span className="hidden sm:inline">{currentLanguage?.name}</span>
            <span className="sm:hidden">{currentLanguage?.flag}</span>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-2 w-40">
              {languages.map(lang => (
                <Button
                  key={lang.code}
                  variant={lang.code === language ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm mb-1"
                  onClick={() => setLanguage(lang.code as Language)}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </Button>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default LanguageSwitcher;
