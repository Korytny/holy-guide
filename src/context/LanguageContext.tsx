
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LanguageText } from '../types';
import { getTranslations } from '../services/api';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const defaultLanguage: Language = 'en';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
  isLoading: true,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to load from localStorage first
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || defaultLanguage;
  });
  
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const data = await getTranslations(language);
        setTranslations(data);
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTranslations();
    // Save to localStorage
    localStorage.setItem('language', language);
  }, [language]);
  
  const t = (key: string): string => {
    return translations[key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};
