
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LanguageText } from '../types';
import { getTranslations } from '../services/api';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const defaultLanguage: Language = 'en'; // Set default language to English

// Basic translations
const baseTranslations: Record<Language, Record<string, string>> = {
  en: {
    // General
    "explore": "Explore",
    "back_to_cities": "Back to Cities",
    "error": "Error",
    "loading": "Loading",
    
    // Authentication
    "sign_in": "Sign In",
    "sign_out": "Sign Out",
    "signed_out": "Signed Out",
    "signed_out_successfully": "You have been successfully signed out.",
    "failed_to_sign_out": "Failed to sign out",
    "login_required": "Login Required",
    "login_to_save_favorites": "Please login to save favorites",
    
    // Profile
    "profile": "Profile",
    "my_profile": "My Profile",
    
    // Cities
    "sacred_places": "Sacred Places",
    "spiritual_routes": "Spiritual Routes",
    "holy_events": "Holy Events",
    "about_city": "About the City",
    "city_not_found": "City not found",
    "explore_on_map": "Explore on Map",
    "route_on_map_title": "Route on Map",
    
    // Favorites
    "added_to_favorites": "Added to Favorites",
    "removed_from_favorites": "Removed from Favorites",
    "added_to_favorites_description": "was added to your favorites",
    "removed_from_favorites_description": "was removed from your favorites",
    "error_updating_favorites": "Error updating favorites",
    
    // Places, Routes and Events
    "no_places_found": "No places found",
    "no_routes_found": "No routes found",
    "no_events_found": "No events found",
    "related_places": "Related Places",
    "related_routes": "Related Routes",
    "about_place": "About this Place",
    "about_route": "About this Route",
    "about_event": "About this Event",
    "event_locations": "Event Locations",
    "place_not_found": "Place not found",
    "route_not_found": "Route not found",
    "event_not_found": "Event not found",
    "no_description_available": "No description available",
    "back_to_city": "Back to City",
    "places_on_route": "Places on Route",
    "related_events": "Related Events",
    "cities_title": "Sacred places of India",
    "cities_subtitle": "Discover the spiritual heart of India through its most sacred cities",
    "search_placeholder": "Search cities..."
  },
  ru: {
    // General
    "explore": "Исследовать",
    "back_to_cities": "Назад к городам",
    "error": "Ошибка",
    "loading": "Загрузка",
    
    // Authentication
    "sign_in": "Войти",
    "sign_out": "Выйти",
    "signed_out": "Выход выполнен",
    "signed_out_successfully": "Вы успешно вышли из своего аккаунта.",
    "failed_to_sign_out": "Не удалось выйти из аккаунта",
    "login_required": "Требуется авторизация",
    "login_to_save_favorites": "Пожалуйста, войдите, чтобы сохранять избранное",
    
    // Profile
    "profile": "Профиль",
    "my_profile": "Мой профиль",
    
    // Cities
    "sacred_places": "Священные места",
    "spiritual_routes": "Духовные маршруты",
    "holy_events": "Священные события",
    "about_city": "О городе",
    "city_not_found": "Город не найден",
    "explore_on_map": "Исследовать на карте",
    "location": "Местоположение",
    "route_on_map_title": "Маршрут на карте",
    
    // Favorites
    "added_to_favorites": "Добавлено в избранное",
    "removed_from_favorites": "Удалено из избранного",
    "added_to_favorites_description": "добавлен в избранное",
    "removed_from_favorites_description": "удален из избранного",
    "error_updating_favorites": "Ошибка при обновлении избранного",
    
    // Places, Routes and Events
    "no_places_found": "Места не найдены",
    "no_routes_found": "Маршруты не найдены",
    "no_events_found": "События не найдены",
    "related_places": "Связанные места",
    "related_routes": "Связанные маршруты",
    "about_place": "Об этом месте",
    "about_route": "Об этом маршруте",
    "about_event": "Об этом событии",
    "event_locations": "Места проведения",
    "place_not_found": "Место не найдено",
    "route_not_found": "Маршрут не найден",
    "event_not_found": "Событие не найдено",
    "back_to_city": "Назад к городу",
    "places_on_route": "Места на маршруте",
    "related_events": "Связанные события",
    "cities_title": "Священные места Индии",
    "cities_subtitle": "Откройте для себя духовное сердце Индии через её самые священные города",
    "search_placeholder": "Поиск городов..."
  },
  hi: {
    // General
    "explore": "खोजें",
    "back_to_cities": "शहरों पर वापस जाएं",
    "error": "त्रुटि",
    "loading": "लोड हो रहा है",
    
    // Authentication
    "sign_in": "साइन इन करें",
    "sign_out": "साइन आउट करें",
    "signed_out": "साइन आउट किया गया",
    "signed_out_successfully": "आप सफलतापूर्वक साइन आउट हो गए हैं।",
    "failed_to_sign_out": "साइन आउट करने में विफल",
    "login_required": "लॉगिन आवश्यक है",
    "login_to_save_favorites": "पसंदीदा सहेजने के लिए कृपया लॉगिन करें",
    
    // Profile
    "profile": "प्रोफ़ाइल",
    "my_profile": "मेरी प्रोफ़ाइल",
    
    // Cities
    "sacred_places": "पवित्र स्थान",
    "spiritual_routes": "आध्यात्मिक मार्ग",
    "holy_events": "पवित्र कार्यक्रम",
    "about_city": "शहर के बारे में",
    "city_not_found": "शहर नहीं मिला",
    "explore_on_map": "नक्शे पर खोजें",
    "location": "स्थान",
    
    // Favorites
    "added_to_favorites": "पसंदीदा में जोड़ा गया",
    "removed_from_favorites": "पसंदीदा से हटाया गया",
    "added_to_favorites_description": "आपके पसंदीदा में जोड़ा गया",
    "removed_from_favorites_description": "आपके पसंदीदा से हटाया गया",
    "error_updating_favorites": "पसंदीदा अपडेट करने में त्रुटि",
    
    // Places, Routes and Events
    "no_places_found": "कोई स्थान नहीं मिला",
    "no_routes_found": "कोई मार्ग नहीं मिला",
    "no_events_found": "कोई कार्यक्रम नहीं मिला",
    "related_places": "संबंधित स्थान",
    "related_routes": "संबंधित मार्ग",
    "about_place": "इस स्थान के बारे में",
    "about_route": "इस मार्ग के बारे में",
    "about_event": "इस कार्यक्रम के बारे में",
    "event_locations": "कार्यक्रम स्थान",
    "place_not_found": "स्थान नहीं मिला",
    "route_not_found": "मार्ग नहीं मिला",
    "event_not_found": "कार्यक्रम नहीं मिला",
    "no_description_available": "कोई विवरण उपलब्ध नहीं है",
    "back_to_city": "शहर पर वापस जाएं",
    "places_on_route": "मार्ग पर स्थान",
    "related_events": "संबंधित कार्यक्रम",
    "cities_title": "भारत के पवित्र स्थान",
    "cities_subtitle": "भारत की आध्यात्मिक हृदयस्थली को उसके सबसे पवित्र शहरों के माध्यम से खोजें",
    "search_placeholder": "शहर खोजें..."
  }
};

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
  
  const [translations, setTranslations] = useState<Record<string, string>>(baseTranslations[language] || {});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        // Load base translations immediately
        setTranslations(baseTranslations[language] || baseTranslations.en);
        
        // Try to load additional translations from API
        const apiTranslations = await getTranslations(language);
        setTranslations(prev => ({
          ...prev,
          ...apiTranslations
        }));
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
    return translations[key] || baseTranslations.en[key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};
