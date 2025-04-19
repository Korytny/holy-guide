import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../types'; // Assume Event might have rating or other relevant small stats
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, CalendarDays } from 'lucide-react'; // Using CalendarDays for consistency
import { getLocalizedText } from '../utils/languageUtils';
import { cn } from "@/lib/utils";

interface EventCardMobProps {
  event: Event;
  className?: string;
}

const EventCardMob: React.FC<EventCardMobProps> = ({ event, className }) => {
  const { language, t } = useLanguage();
  const { auth, isFavorite, toggleFavorite } = useAuth();

  const eventName = getLocalizedText(event.name, language);
  const eventDescription = getLocalizedText(event.description, language);
  const isEventFavorite = auth.isAuthenticated && auth.user ? isFavorite('event', event.id) : false;

  // Format the date for display
  const eventDate = event.date ? new Date(event.date) : null;
  const formattedDate = eventDate ? eventDate.toLocaleDateString(language, { /* month: 'short', */ day: 'numeric' }) : null; // Keep it short

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.id) { // Corrected to use the event prop's id
        toggleFavorite('event', event.id); // Pass 'event' type
    }
  };

  return (
    <div
        className={cn(
            "block group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200",
            className
        )}
    >
      <Link to={`/events/${event.id}`} className="flex p-3 gap-3 items-start">
        {/* Image Section */}
        <div className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
          <img
            src={event.imageUrl || '/placeholder.svg'}
            alt={eventName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {event.id && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-7 w-7 rounded-full bg-white/80 hover:bg-white text-gray-700 z-10 group-hover:opacity-100 opacity-90 transition-opacity shadow-sm"
                onClick={handleFavoriteClick}
                aria-label={isEventFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
              >
                <Heart size={14} className={cn("transition-colors", isEventFavorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
              </Button>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-grow flex flex-col min-w-0">
          {/* Top Row: Title and Date */}
          <div className="flex justify-between items-start gap-2 mb-1">
             {/* Title */}
             <h3 className="text-base font-semibold line-clamp-2 flex-grow mr-1" title={eventName}>
                {eventName}
             </h3>
             {/* Date Container */}
             <div className="flex items-center flex-shrink-0 gap-1.5">
                 {/* Date Badge */}
                 {formattedDate && (
                     <Badge variant="outline" className="text-xs px-1.5 py-0.5 flex items-center gap-1 border-gray-200 text-gray-600 font-normal">
                         <CalendarDays size={12} className="flex-shrink-0" />
                         <span className="text-xs">{formattedDate}</span>
                     </Badge>
                 )}
                 {/* Add other potential badges here if Event type gets more stats */}
             </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-3 overflow-hidden mt-1">
            {eventDescription || t('no_description_available')}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default EventCardMob;
