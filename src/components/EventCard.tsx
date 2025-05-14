
import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext'; 
import { Calendar, Heart } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';
import { cn } from "@/lib/utils"; 
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
  className?: string; 
}

const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const { language, t } = useLanguage();
  const { auth, isFavorite, toggleFavorite } = useAuth(); 
  
  const eventName = getLocalizedText(event.name, language);
  const eventDescription = getLocalizedText(event.description, language);
  const isEventFavorite = auth.isAuthenticated && auth.user ? isFavorite('event', event.id) : false;

   const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    // toggleFavorite handles the auth check
    if (event.id) {
      toggleFavorite('event', event.id);
    }
  };
  
  return (
     <div 
        className={cn(
            "block group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col", 
            className
        )}
    >
      {/* Image Section */}
      <div className="relative">
         <Link to={`/events/${event.id}`} className="absolute inset-0 z-0"></Link> 
        <img 
          src={event.imageUrl || '/placeholder.svg'} 
          alt={eventName} 
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Favorite Button - Always visible */} 
        {event.id && (
            <Button 
                variant="ghost" 
                size="icon"
                className="absolute top-2 right-2 rounded-full bg-black/40 hover:bg-black/60 text-white z-10 h-8 w-8"
                onClick={handleFavoriteClick}
                aria-label={isEventFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
            >
                <Heart 
                    size={16} 
                    className={cn("transition-colors", isEventFavorite ? "fill-red-500 text-red-500" : "text-white")}
                />
            </Button>
        )}
        {/* Removed date badge from top */}
      </div>
      {/* Content Section */} 
      <Link to={`/events/${event.id}`} className="p-3 flex-grow flex flex-col justify-between">
           <div> 
             <h3 className="text-base font-bold mb-1 truncate font-[Laudatio] text-[#09332A]" title={eventName}>{eventName}</h3>
             <p className="text-sm text-black line-clamp-3 mb-3 font-['Monaco']">
                 {eventDescription || t('no_description_available')}
             </p>
           </div>
          {/* Footer with date info */} 
          {event.date && (
              <div className="flex items-center mt-1">
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 flex items-center gap-1 border-[#09332A] text-[#09332A] font-['Monaco']">
                      <Calendar size={12} className="flex-shrink-0" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                  </Badge>
              </div>
          )}
      </Link>
    </div>
  );
};

export default EventCard;
