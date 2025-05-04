
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ImageCloud, ImageCloudItem } from './ui/image-cloud';
import { Skeleton } from '@/components/ui/skeleton';

interface HeroTextData {
  title: string;
  description: string;
}

interface FullScreenHeroProps {
  imageCloudItems: ImageCloudItem[];
  isCloudLoading: boolean;
  heroText?: HeroTextData;
}

const FullScreenHero: React.FC<FullScreenHeroProps> = ({
  imageCloudItems,
  isCloudLoading,
  heroText
}) => {
  const { t } = useLanguage();
  const navbarHeight = '4rem';

  return (
    <section
      className="overflow-hidden bg-white dark:bg-gray-900"
      style={{ height: `calc(100vh - ${navbarHeight})` }}
    >
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 p-6 md:p-8 lg:p-12">
        {/* Image Cloud - Left */}
        <div className="flex items-center justify-center">
          {isCloudLoading ? (
            <div className="flex justify-center items-center w-full h-full">
              <Skeleton className="h-24 w-24 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>
          ) : imageCloudItems && imageCloudItems.length > 0 ? (
            <div className="w-full h-full">
              <ImageCloud items={imageCloudItems} />
            </div>
          ) : (
            <div className="flex justify-center items-center w-full h-full bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-500">{t('image_cloud_unavailable') || 'Image cloud preview unavailable.'}</p>
            </div>
          )}
        </div>

        {/* Text Content - Right */}
        {heroText && (
          <div className="flex flex-col justify-center p-6 md:p-8 lg:p-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl mb-4">
              {heroText.title}
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {heroText.description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FullScreenHero;
