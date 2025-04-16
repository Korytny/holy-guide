
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LanguageText } from '../types';
import { getTranslations } from '../services/api';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  isLoading: boolean;
}

const defaultLanguage: Language = 'en';

// Base translations - ensure no duplicate keys within each language block
const baseTranslations: Record<Language, Record<string, string>> = {
  en: {
    // General
    "explore": "Explore",
    "back_to_cities": "Back to Cities",
    "back_to_home": "Back to Home",
    "error": "Error",
    "error_title": "Error",
    "loading": "Loading...",
    "please_wait": "Please wait...",
    "no_description_available": "No description available",
    "back_to_city": "Back to City",
    "sacred_place": "Sacred Place",
    "no_image_available": "No image available", 
    "cities": "Cities",
    "places": "Places",
    "routes": "Routes",
    "events": "Events",
    
    // Place Types
    "place_type_temple": "Temple",
    "place_type_samadhi": "Samadhi",
    "place_type_kunda": "Kunda",
    "place_type_sacred_site": "Sacred Site",

    // Authentication
    "sign_in": "Sign In",
    "signin": "Sign In", 
    "sign_out": "Sign Out",
    "signed_out": "Signed Out",
    "signed_out_successfully": "You have been successfully signed out.",
    "signed_out_title": "Signed Out",
    "signed_out_success_desc": "You have successfully signed out of your account.",
    "failed_to_sign_out": "Failed to sign out",
    "signout_failed_desc": "Failed to sign out. Please try again.",
    "login_required": "Login Required",
    "login_to_save_favorites": "Please login to save favorites",
    "auth_error_title": "Authentication Error",
    "google_signin_failed_desc": "Failed to sign in via Google",
    "welcome_title": "Welcome to Holy India Wanderer",
    "welcome_back_title": "Welcome back!",
    "signin_prompt": "Sign in to access your profile",
    "connecting": "Connecting...",
    "continue_with_google": "Continue with Google",
    "no_auth_code_found": "No authentication code found in URL",
    "signed_in_successfully_desc": "You have successfully signed in.",
    "profile_load_failed_desc": "Failed to load user profile",
    // "signin_failed_desc": "Failed to sign in", // Duplicate removed
    "redirecting_to_signin": "Redirecting to sign in page...",
    "completing_auth": "Completing Authentication",
    "please_wait_signing_in": "Please wait while we sign you in...",
    "auth_timeout_desc": "Authentication process timed out. Please try again.",
    "session_not_established_desc": "Could not establish session. Please try again.",
    "login_to_view_cities": "Please sign in to view cities.",

    // Profile
    "profile": "Profile",
    "my_profile": "My Profile",
    "your_profile": "Your Profile",
    "welcome": "Welcome!",
    "my_favorites": "My Favorites",
    "favorite_cities": "Favorite Cities",
    "favorite_places": "Favorite Places",
    "favorite_routes": "Favorite Routes",
    "favorite_events": "Favorite Events",
    "no_favorites_yet": "You haven't added any favorite {{type}} yet.",
    
    // Cities
    "sacred_places": "Sacred Places",
    "spiritual_routes": "Spiritual Routes",
    "holy_events": "Holy Events",
    "about_city": "About the City",
    "city_not_found": "City not found",
    "explore_on_map": "Explore on Map",
    "route_on_map_title": "Route on Map",
    "cities_title": "Sacred places of India",
    "cities_subtitle": "Discover the spiritual heart of India through its most sacred cities",
    "search_placeholder": "Search cities...",
    "search_places_placeholder": "Search places in this city...",
    // "no_cities_found": "No cities found", // Duplicate removed
    "try_adjusting_search": "Try adjusting your search or explore all available options.",
    "no_cities_available": "There are currently no cities available.",
    
    // Favorites
    "add_to_favorites": "Add to Favorites",
    "remove_from_favorites": "Remove from Favorites",
    "added_to_favorites_description": "was added to your favorites",
    "removed_from_favorites_description": "was removed from your favorites",
    "error_updating_favorites": "Error updating favorites",
    
    // Places, Routes and Events
    "location": "Location",
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
    "places_on_route": "Places on Route",
    // "related_events": "Related Events", // Duplicate removed
    "spiritual_route": "Spiritual Route", 
  },
  ru: {
    // General
    "explore": "Исследовать",
    "back_to_cities": "Назад к городам",
    "back_to_home": "На главную",
    "error": "Ошибка",
    "error_title": "Ошибка",
    "loading": "Загрузка...",
    "please_wait": "Пожалуйста, подождите...",
    "no_description_available": "Описание недоступно",
    "back_to_city": "Назад к городу",
    "sacred_place": "Священное место",
    "no_image_available": "Нет изображения",
    "cities": "Города",
    "places": "Места",
    "routes": "Маршруты",
    "events": "События",
    
    // Place Types
    "place_type_temple": "Храм",
    "place_type_samadhi": "Самадхи",
    "place_type_kunda": "Кунда",
    "place_type_sacred_site": "Святое место",

    // Authentication
    "sign_in": "Войти",
    "signin": "Вход", 
    "sign_out": "Выйти",
    "signed_out": "Выход выполнен",
    "signed_out_successfully": "Вы успешно вышли из своего аккаунта.",
    "signed_out_title": "Выход выполнен",
    "signed_out_success_desc": "Вы успешно вышли из вашего аккаунта.",
    "failed_to_sign_out": "Не удалось выйти из аккаунта",
    "signout_failed_desc": "Не удалось выйти из аккаунта. Пожалуйста, попробуйте снова.",
    "login_required": "Требуется вход",
    "login_to_save_favorites": "Пожалуйста, войдите, чтобы сохранять избранное",
    "auth_error_title": "Ошибка аутентификации",
    "google_signin_failed_desc": "Не удалось войти через Google",
    "welcome_title": "Добро пожаловать в Holy India Wanderer",
    "welcome_back_title": "С возвращением!",
    "signin_prompt": "Войдите, чтобы получить доступ к своему профилю",
    "connecting": "Подключение...",
    "continue_with_google": "Продолжить с Google",
    "no_auth_code_found": "Код аутентификации не найден в URL",
    "signed_in_successfully_desc": "Вы успешно вошли в систему.",
    "profile_load_failed_desc": "Не удалось загрузить профиль пользователя",
    // "signin_failed_desc": "Не удалось войти в систему", // Duplicate removed
    "redirecting_to_signin": "Перенаправление на страницу входа...",
    "completing_auth": "Завершение аутентификации",
    "please_wait_signing_in": "Пожалуйста, подождите, пока мы входим в систему...",
    "auth_timeout_desc": "Время ожидания процесса аутентификации истекло. Пожалуйста, попробуйте снова.",
    "session_not_established_desc": "Не удалось установить сессию. Пожалуйста, попробуйте снова.",
     "login_to_view_cities": "Пожалуйста, войдите, чтобы просматривать города.",

    // Profile
    "profile": "Профиль",
    "my_profile": "Мой профиль",
    "your_profile": "Ваш профиль",
    "welcome": "Добро пожаловать!",
    "my_favorites": "Моё избранное",
    "favorite_cities": "Избранные города",
    "favorite_places": "Избранные места",
    "favorite_routes": "Избранные маршруты",
    "favorite_events": "Избранные события",
    "no_favorites_yet": "Вы пока не добавили избранные {{type}}.",
    
    // Cities
    "sacred_places": "Священные места",
    "spiritual_routes": "Духовные маршруты",
    "holy_events": "Священные события",
    "about_city": "О городе",
    "city_not_found": "Город не найден",
    "explore_on_map": "Исследовать на карте",
    "route_on_map_title": "Маршрут на карте",
    "cities_title": "Священные места Индии",
    "cities_subtitle": "Откройте для себя духовное сердце Индии через её самые священные города",
    "search_placeholder": "Поиск городов...",
    "search_places_placeholder": "Искать места в этом городе...",
    // "no_cities_found": "Города не найдены", // Duplicate removed
    "try_adjusting_search": "Попробуйте изменить условия поиска или изучите все доступные варианты.",
    "no_cities_available": "В настоящее время нет доступных городов.",

    // Favorites
    "add_to_favorites": "Добавить в избранное",
    "remove_from_favorites": "Удалить из избранного",
    "added_to_favorites_description": "добавлен в избранное",
    "removed_from_favorites_description": "удален из избранного",
    "error_updating_favorites": "Ошибка при обновлении избранного",
    
    // Places, Routes and Events
    "location": "Местоположение",
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
    "places_on_route": "Места на маршруте",
    // "related_events": "Связанные события", // Duplicate removed
    "spiritual_route": "Духовный маршрут",
  },
  hi: {
    // General
    "explore": "खोजें",
    "back_to_cities": "शहरों पर वापस जाएं",
    "back_to_home": "होम पर वापस जाएं",
    "error": "त्रुटि",
    "error_title": "त्रुटि",
    "loading": "लोड हो रहा है...",
    "please_wait": "कृपया प्रतीक्षा करें...",
    "no_description_available": "कोई विवरण उपलब्ध नहीं है",
    "back_to_city": "शहर पर वापस जाएं",
    "sacred_place": "पवित्र स्थान",
    "no_image_available": "कोई छवि उपलब्ध नहीं है",
    "cities": "शहर",
    "places": "स्थान",
    "routes": "मार्ग",
    "events": "कार्यक्रम",
    
    // Place Types
    "place_type_temple": "मंदिर",
    "place_type_samadhi": "समाधि",
    "place_type_kunda": "कुंड",
    "place_type_sacred_site": "पवित्र स्थल",
    
    // Authentication
    "sign_in": "साइन इन करें",
    "signin": "साइन इन",
    "sign_out": "साइन आउट करें",
    "signed_out": "साइन आउट किया गया",
    "signed_out_successfully": "आप सफलतापूर्वक साइन आउट हो गए हैं।",
    "signed_out_title": "साइन आउट किया गया",
    "signed_out_success_desc": "आप सफलतापूर्वक अपने खाते से बाहर निकल गए हैं।",
    "failed_to_sign_out": "साइन आउट करने में विफल",
    "signout_failed_desc": "साइन आउट करने में विफल। कृपया पुन: प्रयास करें।",
    "login_required": "लॉगिन आवश्यक है",
    "login_to_save_favorites": "पसंदीदा सहेजने के लिए कृपया लॉगिन करें",
    "auth_error_title": "प्रमाणीकरण त्रुटि",
    "google_signin_failed_desc": "Google के माध्यम से साइन इन करने में विफल",
    "welcome_title": "होली इंडिया वांडरर में आपका स्वागत है",
    "welcome_back_title": "वापसी पर स्वागत है!",
    "signin_prompt": "अपनी प्रोफ़ाइल तक पहुँचने के लिए साइन इन करें",
    "connecting": "कनेक्ट हो रहा है...",
    "continue_with_google": "Google के साथ जारी रखें",
    "no_auth_code_found": "URL में कोई प्रमाणीकरण कोड नहीं मिला",
    "signed_in_successfully_desc": "आपने सफलतापूर्वक साइन इन कर लिया है।",
    "profile_load_failed_desc": "उपयोगकर्ता प्रोफ़ाइल लोड करने में विफल",
    // "signin_failed_desc": "साइन इन करने में विफल", // Duplicate removed
    "redirecting_to_signin": "साइन इन पेज पर रीडायरेक्ट किया जा रहा है...",
    "completing_auth": "प्रमाणीकरण पूरा किया जा रहा है",
    "please_wait_signing_in": "कृपया प्रतीक्षा करें जब तक हम आपको साइन इन करते हैं...",
    "auth_timeout_desc": "प्रमाणीकरण प्रक्रिया में समय समाप्त हो गया। कृपया पुनः प्रयास करें।",
    "session_not_established_desc": "सत्र स्थापित नहीं किया जा सका। कृपया पुनः प्रयास करें।",
    "login_to_view_cities": "शहरों को देखने के लिए कृपया साइन इन करें।",

    // Profile
    "profile": "प्रोफ़ाइल",
    "my_profile": "मेरी प्रोफ़ाइल",
    "your_profile": "आपकी प्रोफ़ाइल",
    "welcome": "स्वागत है!",
    "my_favorites": "मेरे पसंदीदा",
    "favorite_cities": "पसंदीदा शहर",
    "favorite_places": "पसंदीदा स्थान",
    "favorite_routes": "पसंदीदा मार्ग",
    "favorite_events": "पसंदीदा कार्यक्रम",
    "no_favorites_yet": "आपने अभी तक कोई पसंदीदा {{type}} नहीं जोड़ा है।",
    
    // Cities
    "sacred_places": "पवित्र स्थान",
    "spiritual_routes": "आध्यात्मिक मार्ग",
    "holy_events": "पवित्र कार्यक्रम",
    "about_city": "शहर के बारे में",
    "city_not_found": "शहर नहीं मिला",
    "explore_on_map": "नक्शे पर खोजें",
    "route_on_map_title": "नक्शे पर मार्ग",
    "cities_title": "भारत के पवित्र स्थान",
    "cities_subtitle": "भारत की आध्यात्मिक हृदयस्थली को उसके सबसे पवित्र शहरों के माध्यम से खोजें",
    "search_placeholder": "शहर खोजें...",
    "search_places_placeholder": "इस शहर में स्थान खोजें...",
    // "no_cities_found": "कोई शहर नहीं मिला", // Duplicate removed
    "try_adjusting_search": "अपनी खोज को समायोजित करने का प्रयास करें या सभी उपलब्ध विकल्पों का अन्वेषण करें।",
    "no_cities_available": "वर्तमान में कोई शहर उपलब्ध नहीं हैं।",
    
    // Favorites
    "add_to_favorites": "पसंदीदा में जोड़ें",
    "remove_from_favorites": "पसंदीदा से हटाएं",
    "added_to_favorites_description": "आपके पसंदीदा में जोड़ा गया",
    "removed_from_favorites_description": "आपके पसंदीदा से हटाया गया",
    "error_updating_favorites": "पसंदीदा अपडेट करने में त्रुटि",
    
    // Places, Routes and Events
    "location": "स्थान",
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
    "places_on_route": "मार्ग पर स्थान",
    // "related_events": "संबंधित कार्यक्रम", // Duplicate removed
    "spiritual_route": "आध्यात्मिक मार्ग",
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
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage && baseTranslations[savedLanguage] ? savedLanguage : defaultLanguage;
  });
  
  const [translations, setTranslations] = useState<Record<string, string>>(baseTranslations[language] || baseTranslations.en);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        setTranslations(baseTranslations[language] || baseTranslations.en);
      } catch (error) {
        console.error('Failed to load translations:', error);
        if (language !== 'en') {
          setTranslations(baseTranslations.en);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTranslations();
    localStorage.setItem('language', language);
  }, [language]);
  
  const t = (key: string, options?: { [key: string]: string | number }): string => {
    let translation = translations[key] || baseTranslations.en[key] || key;
    if (options) {
        Object.entries(options).forEach(([placeholder, value]) => {
            translation = translation.replace(`{{${placeholder}}}`, String(value));
        });
    }
    return translation;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {!isLoading ? children : null} 
    </LanguageContext.Provider>
  );
};
