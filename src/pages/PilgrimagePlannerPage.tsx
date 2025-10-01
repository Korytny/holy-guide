import { useEffect, useState } from 'react';
import { getCities } from '../services/api';
import { City, Language } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { PilgrimagePlanner } from '../components/profile/PilgrimagePlanner';
import { FontProvider } from '../context/FontContext';
import { WordPullUp } from '@/components/ui/word-pull-up';

const PilgrimagePlannerPage = () => {
  const { language, t } = useLanguage();
  const authContext = useAuth();
  const [availableCities, setAvailableCities] = useState<City[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const citiesData = await getCities();
        setAvailableCities(citiesData);
      } catch (error) {
        console.error('[PilgrimagePlannerPage] Error fetching cities:', error);
        setAvailableCities([]);
      }
    };
    fetchCities();
  }, []);

  return (
    <FontProvider>
      <div className="h-screen bg-orange-50 overflow-hidden">
        <div className="w-full h-full">
          <PilgrimagePlanner
            auth={authContext}
            language={language}
            t={t}
          />
        </div>
      </div>
    </FontProvider>
  );
};

export default PilgrimagePlannerPage;