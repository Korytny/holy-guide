import React from 'react';
import { Place, Event } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";
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
    const { fonts } = useFont();
    const isSmallScreen = useIsSmallScreen();

    const RelatedPlaceCardComponent = isSmallScreen ? PlaceCardMob : PlaceCard;
    const RelatedEventCardComponent = isSmallScreen ? EventCardMob : EventCard;

    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="w-full flex mb-6 flex-wrap h-auto justify-center gap-2 md:gap-4">
                {/* Places Tab */}
                <TabsTrigger value="places" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm data-[state=active]:bg-orange-100">
                    <MapPin size={16} className="flex-shrink-0" />
                    <span className={cn(
                      "font-bold text-[#09332A] text-lg",
                      fonts.heading.className
                    )}>{t('places_tab_title')}</span>
                    {places.length > 0 && <Badge className="ml-2 px-2 py-1 text-sm font-bold bg-transparent text-[#09332A] border-[#09332A] border-2">{places.length}</Badge>}
                </TabsTrigger>
                {/* Events Tab */}
                <TabsTrigger value="events" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm data-[state=active]:bg-orange-100">
                    <CalendarDays size={16} className="flex-shrink-0" />
                    <span className={cn(
                      "font-bold text-[#09332A] text-lg",
                      fonts.heading.className
                    )}>{t('events_tab_title')}</span>
                    {events.length > 0 && <Badge className="ml-2 px-2 py-1 text-sm font-bold bg-transparent text-[#09332A] border-[#09332A] border-2">{events.length}</Badge>}
                </TabsTrigger>
            </TabsList>

            {/* Places Content */}
            <TabsContent value="places" id="places-content">
               {places.length === 0 ? (
              <div className={cn(
                "text-center py-10 text-gray-500",
                fonts.body.className
              )}>{t('no_places_found')}</div>
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
              <div className={cn(
                "text-center py-10 text-gray-500",
                fonts.body.className
              )}>{t('no_events_found')}</div>
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
