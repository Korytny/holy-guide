import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFont } from '@/context/FontContext';
import { ImageCloud, ImageCloudItem } from './ui/image-cloud';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchTitleData } from '@/services/api';

interface MultilingualString {
  en: string; ru: string; hi: string; [key: string]: string;
}

interface HeroTextData {
  name: MultilingualString | string;
  description: MultilingualString | string;
}

interface HeroSectionProps {
  imageCloudItems: ImageCloudItem[];
  isCloudLoading: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ imageCloudItems, isCloudLoading }) => {
  const { language, t } = useLanguage();
  const { fonts } = useFont();
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
         if (data) setTitleData(data);
       } catch (error) {
         setTextError(t('error_loading_failed') || 'Failed to load hero text.');
       } finally { 
         setIsTextLoading(false); 
       }
    };
    loadTitle();
  }, [t, language]);

  const getLocalizedString = (data: MultilingualString | string | undefined | null): string => {
    if (!data) return '';
    if (typeof data === 'object') return data[language] || data['en'] || '';
    return data;
  };

  return (
    <section
      className="overflow-hidden bg-white dark:bg-gray-900 relative"
      style={{ height: `calc(100vh - ${navbarHeight})` }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        onError={(e) => console.error("Video failed to load", e)}
      >
        <source src="/earth2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

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

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 pointer-events-none transform translate-y-[180px]">
        {isTextLoading ? (
           <div className="space-y-2 pointer-events-auto">
             <Skeleton className="h-8 w-64 mx-auto bg-gray-400/50" />
             <Skeleton className="h-4 w-80 mx-auto bg-gray-400/50" />
           </div>
        ) : textError ? (
           <p className="text-red-500 pointer-events-auto">{textError}</p>
        ) : titleData ? (
           <div className="pointer-events-auto backdrop-blur-md bg-white/20 p-5 rounded-2xl shadow-2xl border border-white/30">
             <h1 className={`text-3xl font-bold sm:text-4xl lg:text-5xl mb-3 ${fonts.heading.className}`}
                 style={{
                   color: '#FFF8E7',
                   textShadow: `
                     2px 2px 8px rgba(0, 0, 0, 0.8),
                     -1px -1px 0 rgba(0, 0, 0, 0.6),
                     1px -1px 0 rgba(0, 0, 0, 0.6),
                     -1px 1px 0 rgba(0, 0, 0, 0.6),
                     1px 1px 0 rgba(0, 0, 0, 0.6)
                   `,
                   animation: 'fadeIn 1s ease-out',
                   letterSpacing: '0.05em'
                 }}>
               {getLocalizedString(titleData.name)}
             </h1>
             <p className={`mt-3 text-base text-[#FFE0B2] max-w-2xl mx-auto font-medium ${fonts.subheading.className}`}
                style={{
                  textShadow: '1px 1px 4px rgba(0, 0, 0, 0.7)',
                  letterSpacing: '0.025em'
                }}>
               {getLocalizedString(titleData.description)}
             </p>
           </div>
        ) : null}
      </div>
    </section>
  );
};
export default HeroSection;
