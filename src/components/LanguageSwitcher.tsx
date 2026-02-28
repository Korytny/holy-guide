
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFont } from '../context/FontContext';
import { Language } from '../types';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Use DropdownMenu
import { Button } from '@/components/ui/button';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { fonts } = useFont();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Use a Button as the trigger */}
        <Button variant="ghost" className={`flex items-center gap-2 text-sm ${fonts.subheading.className}`}>
          <Globe size={16} className="text-gray-600 hidden sm:inline" />
          <span className="hidden sm:inline">{currentLanguage?.name}</span>
          <span className="sm:hidden text-lg">{currentLanguage?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40"> {/* Align to end */}
        {languages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            // Indicate selection without using 'variant' directly in item
            className={lang.code === language ? "bg-accent" : ""}
            onClick={() => setLanguage(lang.code as Language)}
            // Prevent closing on click if needed (though default is usually fine)
            // onSelect={(e) => e.preventDefault()}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
