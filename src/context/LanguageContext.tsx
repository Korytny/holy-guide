import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language } from '../types'; // Assuming Language type is defined here

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  isLoading: boolean;
}

const defaultLanguage: Language = 'en';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key, // Simple fallback
  isLoading: true,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguageInternal] = useState<Language>(() => {
    const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') as Language : null;
    // Basic validation (add more languages if needed)
    return savedLanguage && ['en', 'ru', 'hi'].includes(savedLanguage) ? savedLanguage : defaultLanguage;
  });

  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTranslations = useCallback(async (lang: Language) => {
    setIsLoading(true);
    setError(null);
    try {
      // Dynamically import the JSON file for the selected language
      const module = await import(`../locales/${lang}.json`);
      setTranslations(module.default || {});
      if (typeof window !== 'undefined') {
           localStorage.setItem('language', lang);
      }
    } catch (err) {
      console.error(`Failed to load translations for ${lang}:`, err);
      setError(`Failed to load translations for ${lang}.`);
      // Optionally load fallback language (e.g., English) on error
      if (lang !== 'en') {
          try {
               const fallbackModule = await import(`../locales/en.json`);
               setTranslations(fallbackModule.default || {});
          } catch (fallbackErr) {
               console.error('Failed to load fallback English translations:', fallbackErr);
               setTranslations({}); // Set empty if fallback also fails
          }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTranslations(language);
  }, [language, loadTranslations]);

  const setLanguage = useCallback((lang: Language) => {
      setLanguageInternal(lang);
      // No need to call loadTranslations here, useEffect handles it
  }, []);

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    let translation = translations[key] || key; // Fallback to key if translation not found
    if (options) {
        Object.entries(options).forEach(([placeholder, value]) => {
            // Basic replace, consider more robust library for complex cases
            translation = translation.replace(`{{${placeholder}}}`, String(value));
        });
    }
    return translation;
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {!isLoading && children} 
       {/* Optionally display loading state or error state here */}
       {isLoading && <div>Loading translations...</div>} 
       {error && <div style={{ color: 'red' }}>Error loading translations: {error}</div>}
    </LanguageContext.Provider>
  );
};
