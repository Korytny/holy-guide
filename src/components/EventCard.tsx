
import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Calendar } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { t } = useLanguage();
  
  return (
    <Link to={`/events/${event.id}`} className="block">
      <div className="india-card animate-slide-up">
        <div className="relative">
          <img 
            src={event.imageUrl} 
            alt={event.name} 
            className="india-card-image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {event.date && (
            <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full flex items-center">
              <Calendar size={14} className="mr-1 text-spiritualPurple" />
              <span className="text-xs font-medium">{new Date(event.date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <div className="india-card-content">
          <h3 className="text-lg font-medium mb-1">{event.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description.substring(0, 100)}
            {event.description.length > 100 ? '...' : ''}
          </p>
          <button className="mt-3 text-sm text-indiaBurgundy font-medium hover:underline">
            {t('event_details')} →
          </button>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
