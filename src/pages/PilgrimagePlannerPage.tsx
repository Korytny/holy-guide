import { useEffect, useState } from 'react';
import { getCities } from '../services/api';
import { City, Language } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { PilgrimagePlanner } from '../components/profile/PilgrimagePlanner';
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
    <div className="min-h-screen bg-orange-50">
      <div className="py-8">
        <section aria-labelledby="pilgrimage-planner-heading" className="mb-8">
          <WordPullUp
            id="pilgrimage-planner-heading"
            className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white text-center mt-20 mb-20"
            words={t('pilgrimage_plan', { defaultValue: 'Pilgrimage Plan' })}
          />
        </section>
        
        <div className="w-full">
          <PilgrimagePlanner
            auth={authContext}
            language={language}
            t={t}
          />
        </div>
      </div>
    </div>
  );
};

export default PilgrimagePlannerPage;