import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useLanguage } from '../../context/LanguageContext'; // Updated import path

interface FavoritesCarouselProps<T> {
  title: string;
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  isLoading: boolean;
  itemType: string;
}

// Changed from arrow function to function declaration for better TSX compatibility
function FavoritesCarousel<T extends { id: string }>({ 
    title, items, renderCard, isLoading, itemType
}: FavoritesCarouselProps<T>) {
  const { t } = useLanguage();
  
  if (isLoading) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
       <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
        <p className="text-gray-500 italic">{t('no_favorites_yet', { type: itemType })}</p>
      </div>
    );
  }

  const shouldLoop = items.length > (typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1) : 1);
  const showNav = items.length > (typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1) : 1);

  return (
    <div className="mb-10">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <Carousel
        opts={{
          align: "start",
          loop: shouldLoop, // Use the calculated value
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {items.map((item) => (
            <CarouselItem key={item.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="p-1 h-full">
                {renderCard(item)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showNav && <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10" />} 
        {showNav && <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10" />}
      </Carousel>
    </div>
  );
}

export default FavoritesCarousel;
