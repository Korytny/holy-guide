import React, { useState, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext'; // Import Language type
import { ImageCloud, ImageCloudItem } from './ui/image-cloud';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchTitleData } from '@/services/api'; // Import actual API function
import { cn } from "@/lib/utils"; // Import cn utility

// Interface for multilingual data (adjust languages as needed)
interface MultilingualString {
  en: string; ru: string; hi: string; [key: string]: string;
}
// Adjust the interface to expect multilingual objects or strings
interface HeroTextData {
  name: MultilingualString | string;
  description: MultilingualString | string;
}

interface FullScreenHeroProps {
  imageCloudItems: ImageCloudItem[];
  isCloudLoading: boolean;
}

const FullScreenHero: React.FC<FullScreenHeroProps> = ({ imageCloudItems, isCloudLoading }) => {
  const { language, t } = useLanguage();
  const navbarHeight = '4rem';
  const [titleData, setTitleData] = useState<HeroTextData | null>(null);
  const [isTextLoading, setIsTextLoading] = useState<boolean>(true);
  const [textError, setTextError] = useState<string | null>(null);

  useEffect(() => {
    const loadTitle = async () => {
       setIsTextLoading(true);
       setTextError(null);
       try {
         const data = await fetchTitleData('hero') as HeroTextData | null;
         if (data) {
           setTitleData(data);
         } else {
           // Don't set an error if data is simply not found (null)
           // setTextError(t('error_loading_data') || 'Hero text not found.');
           console.warn("Hero title data not found for element 'hero'");
         }
       } catch (error) {
         console.error("Error fetching hero title:", error);
         setTextError(t('error_loading_failed') || 'Failed to load hero text.');
       } finally {
         setIsTextLoading(false);
       }
    };
    loadTitle();
  }, [t, language]);

  const getLocalizedString = (data: MultilingualString | string | undefined | null): string => {
    if (!data) return '';
    if (typeof data === 'object') { return data[language] || data['en'] || ''; }
    return data;
  };

  return (
    <section
      className="overflow-hidden bg-white dark:bg-gray-900 relative"
      style={{ height: `calc(100vh - ${navbarHeight})` }}
    >
      {/* Image Cloud Container */}
      <div className="w-full h-full">
        {isCloudLoading ? (
          <div className="flex justify-center items-center w-full h-full">
            <Skeleton className="h-32 w-32 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>
        ) : imageCloudItems && imageCloudItems.length > 0 ? (
          <div className="w-full h-full"> <ImageCloud items={imageCloudItems} /> </div>
        ) : (
           <div className="flex justify-center items-center w-full h-full bg-gray-100 dark:bg-gray-800 rounded">
            <p className="text-gray-500">{t('image_cloud_unavailable') || 'Image cloud preview unavailable.'}</p>
          </div>
        )}
      </div>

      {/* Text Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
        {isTextLoading ? (
           <div className="space-y-2 pointer-events-auto">
             <Skeleton className="h-8 w-64 mx-auto bg-gray-400/50" />
             <Skeleton className="h-4 w-80 mx-auto bg-gray-400/50" />
           </div>
        ) : textError ? (
           <p className="text-red-500 pointer-events-auto">{textError}</p>
        ) : titleData ? (
           <div className="pointer-events-auto">
             <h1 className={cn( // Use cn for combining classes
                "font-heading", // Apply heading font class explicitly
                "text-4xl font-bold text-black dark:text-white sm:text-5xl lg:text-6xl mb-4"
             )}>
               {getLocalizedString(titleData.name)}
             </h1>
             <p className="mt-4 text-lg text-gray-800 dark:text-gray-300 max-w-xl mx-auto">
               {getLocalizedString(titleData.description)}
             </p>
           </div>
        ) : null /* Don't show anything if no error and no data */}
      </div>
    </section>
  );
};
export default FullScreenHero;
