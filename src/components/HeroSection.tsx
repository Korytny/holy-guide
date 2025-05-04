import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useLanguage } from '../context/LanguageContext';

// ... (interface HeroData remains the same)
interface HeroData {
  name: Record<string, string> | null;
  description: Record<string, string> | null;
  img: string[] | null;
}


const HeroSection: React.FC = () => {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language, t, isLoading: isLanguageLoading } = useLanguage();

  useEffect(() => {
    const fetchHeroData = async () => {
      setLoading(true);
      setError(null);
      console.log('Fetching hero data for element: hero');

      try {
        // --- Check Auth Status ---
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user auth state:', user ? `Authenticated (ID: ${user.id})` : 'Anonymous');
        // --- End Check Auth Status ---

        // The rest of the query logic (without .single())
        const { data: queryData, error: dbError } = await supabase
          .from('titles')
          .select('name, description, img')
          .eq('element', 'hero');

        console.log('Supabase query result:', { queryData, dbError });

        if (dbError) {
          throw dbError;
        }

        if (queryData && queryData.length === 1) {
          const row = queryData[0];
          const typedData: HeroData = {
             name: row.name as Record<string, string> | null,
             description: row.description as Record<string, string> | null,
             img: row.img as string[] | null,
          };
          if (typedData.name && typeof typedData.name === 'object' &&
               typedData.description && typeof typedData.description === 'object' &&
               Array.isArray(typedData.img)) {
             setHeroData(typedData);
             console.log('Successfully set hero data:', typedData);
          } else {
             console.error('Fetched data structure mismatch:', row);
             setError(t('error_hero_data_structure') || 'Received unexpected data structure.');
          }
        } else if (queryData && queryData.length > 1) {
           console.error('Multiple rows returned for element="hero":', queryData);
           setError(t('error_multiple_hero_rows') || 'Error: Found multiple entries for hero section.');
        } else {
           console.warn('No rows returned for element="hero"');
           setError(t('error_hero_data_not_found_for_element') || 'Hero section data not found.');
        }

      } catch (err: any) {
        console.error('Error fetching hero data:', err);
        setError(err.message || t('error_fetching_hero_data') || 'Failed to fetch hero data.');
      } finally {
        setLoading(false);
      }
    };

    if (!isLanguageLoading) {
       fetchHeroData();
    } else {
        setLoading(true);
    }
  }, [isLanguageLoading, t]);

  // ... (rest of the component: loading, error display, render logic) ...
      const combinedLoading = loading || isLanguageLoading;

  if (combinedLoading) {
    return <div className="animate-pulse flex flex-col md:flex-row space-x-0 md:space-x-4 p-4 md:p-8 lg:p-12">
      <div className="flex-1 space-y-4 py-1 order-2 md:order-1">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
      <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-300 dark:bg-gray-700 rounded order-1 md:order-2 mb-4 md:mb-0 aspect-square"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-600 p-4 md:p-8 lg:p-12">Error: {error}</div>;
  }

  if (!heroData) {
     return <div className="p-4 md:p-8 lg:p-12">{t('hero_data_unavailable') || 'Hero content is currently unavailable.'}</div>;
  }

  // --- Data Extraction ---
  const currentTitle = heroData.name?.[language]
                      ?? heroData.name?.['en']
                      ?? t('hero_default_title', { defaultValue: 'Discover Sacred Sites'});

  const currentDescription = heroData.description?.[language]
                            ?? heroData.description?.['en']
                            ?? t('no_description_available');

  let imageUrl = '/placeholder.svg';
  if (Array.isArray(heroData.img) && heroData.img.length > 0 && typeof heroData.img[0] === 'string') {
      imageUrl = heroData.img[0];
  }
  // --- End Data Extraction ---


  return (
    <section className="overflow-hidden bg-white dark:bg-gray-900">
      <div className="md:grid md:grid-cols-2 md:items-center md:gap-4 lg:gap-8">
        {/* Text Content - Left */}
        <div className="p-6 md:p-8 lg:p-12 order-2 md:order-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl mb-4">
            {currentTitle}
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {currentDescription}
          </p>
        </div>

        {/* Image - Right */}
        <div className="order-1 md:order-2 h-64 md:h-auto">
          <img
            alt={currentTitle}
            src={imageUrl}
            className="h-full w-full object-cover aspect-square"
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.warn(`Failed to load image: ${target.src}. Falling back to placeholder.`);
                target.onerror = null;
                target.src = '/placeholder.svg';
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
