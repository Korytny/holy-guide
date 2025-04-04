
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { Globe } from 'lucide-react';

const LanguageSelection = () => {
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  ];
  
  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    navigate('/cities');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-purple-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-full bg-saffron/10 mb-4">
            <Globe size={40} className="text-saffron" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Holy India Wanderer</h1>
          <p className="text-gray-600">Discover sacred places across India</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-center">Select Your Language</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {languages.map(language => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code as Language)}
                  className="w-full flex items-center p-4 rounded-lg border border-gray-200 hover:border-saffron hover:bg-orange-50 transition-colors"
                >
                  <span className="text-2xl mr-3">{language.flag}</span>
                  <span className="font-medium">{language.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
