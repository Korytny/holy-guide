import React from 'react';
import { Place, Event } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceCard from '../PlaceCard'; // Adjust path as needed
import EventCard from '../EventCard'; // Adjust path as needed
import PlaceCardMob from '../PlaceCardMob'; // Adjust path as needed
import EventCardMob from '../EventCardMob'; // Adjust path as needed
import { Badge } from "@/components/ui/badge";
import { MapPin, CalendarDays } from 'lucide-react';
import { useIsSmallScreen } from '../../hooks/use-small-screen'; // Adjust path as needed

interface RelatedContentTabsProps {
  places: Place[];
  events: Event[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

const RelatedContentTabs: React.FC<RelatedContentTabsProps> = ({ 
    places, 
    events, 
    activeTab, 
    onTabChange 
}) => {
    const { t } = useLanguage();
    const isSmallScreen = useIsSmallScreen();

    const RelatedPlaceCardComponent = isSmallScreen ? PlaceCardMob : PlaceCard;
    const RelatedEventCardComponent = isSmallScreen ? EventCardMob : EventCard;

    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="w-full flex mb-6 flex-wrap h-auto justify-center gap-2 md:gap-4">
                {/* Places Tab */}
                <TabsTrigger value="places" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm">
                    <MapPin size={16} className="flex-shrink-0" />
                    <span>{t('places_tab_title')}</span> 
                    {places.length > 0 && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0.5 text-xs font-medium">{places.length}</Badge>}
                </TabsTrigger>
                {/* Events Tab */}
                <TabsTrigger value="events" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm">
                    <CalendarDays size={16} className="flex-shrink-0" />
                    <span>{t('events_tab_title')}</span> 
                    {events.length > 0 && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0.5 text-xs font-medium">{events.length}</Badge>}
                </TabsTrigger>
            </TabsList>

            {/* Places Content */}
            <TabsContent value="places" id="places-content">
               {places.length === 0 ? (
              <div className="text-center py-10 text-gray-500">{t('no_places_found')}</div>
            ) : (
              <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
                {places.map(place =>
                    <RelatedPlaceCardComponent key={place.id} place={place} />
                )}
              </div>
            )}
          </TabsContent>
          {/* Events Content */}
          <TabsContent value="events" id="events-content">
                {events.length === 0 ? (
              <div className="text-center py-10 text-gray-500">{t('no_events_found')}</div>
            ) : (
               <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                {events.map(event =>
                    <RelatedEventCardComponent key={event.id} event={event} />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
    );
}

export default RelatedContentTabs;
