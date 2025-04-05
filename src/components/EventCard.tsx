
import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Heart } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { language, t } = useLanguage();
  
  const eventName = getLocalizedText(event.name, language);
  const eventDescription = getLocalizedText(event.description, language);
  
  return (
    <Link to={`/events/${event.id}`} className="block">
      <div className="india-card animate-slide-up">
        <div className="relative">
          <img 
            src={event.imageUrl} 
            alt={eventName} 
            className="india-card-image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            {event.date && (
              <div className="bg-white/80 p-1.5 rounded-full flex items-center">
                <Calendar size={16} className="text-spiritualPurple mr-1" />
                <span className="text-xs font-medium">{new Date(event.date).toLocaleDateString()}</span>
              </div>
            )}
            <div className="bg-white/80 p-1.5 rounded-full">
              <Heart size={16} className="text-gray-600" />
            </div>
          </div>
        </div>
        <div className="india-card-content">
          <h3 className="text-lg font-medium mb-1">{eventName}</h3>
          <div className="text-sm text-gray-600 h-[4.5rem] overflow-hidden space-y-1">
            {event.info ? (
              Object.entries(event.info)
                .filter(([key]) => key === language || !['en', 'ru', 'hi'].includes(key))
                .slice(0, 3)
                .map(([key, value], i) => (
                  <div key={i} className="line-clamp-3">
                    {['en', 'ru', 'hi'].includes(key) ? '' : `${key} `}
                    {typeof value === 'object' ? getLocalizedText(value, language) : String(value)}
                  </div>
                ))
            ) : (
              <p className="line-clamp-3">{eventDescription}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
