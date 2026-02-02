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
            <TabsList className="w-full flex mb-6 flex-wrap h-auto justify-center gap-3 md:gap-4 bg-transparent">
                {/* Places Tab */}
                <TabsTrigger
                    value="places"
                    className={cn(
                        "flex items-center justify-center gap-2 min-w-[160px] py-3 px-6 rounded-xl border-2 transition-all data-[state=active]:border-[#FF9800] data-[state=active]:bg-white",
                        "border-gray-200 bg-[#FFF3E0] hover:border-[#FFB74D] hover:bg-white",
                        fonts.subheading.className
                    )}
                >
                    <MapPin size={20} className={cn("flex-shrink-0", activeTab === 'places' ? "text-[#FF9800]" : "text-gray-500")} />
                    <span className={cn(
                      "font-semibold text-base",
                      activeTab === 'places' ? "text-[#FF9800]" : "text-gray-600"
                    )}>{t('places_tab_title')}</span>
                    {places.length > 0 && (
                        <Badge className={cn(
                            "ml-2 px-2 py-0.5 text-sm font-bold rounded-full",
                            activeTab === 'places'
                                ? "bg-[#FF9800] text-white"
                                : "bg-gray-200 text-gray-600"
                        )}>{places.length}</Badge>
                    )}
                </TabsTrigger>
                {/* Events Tab */}
                <TabsTrigger
                    value="events"
                    className={cn(
                        "flex items-center justify-center gap-2 min-w-[160px] py-3 px-6 rounded-xl border-2 transition-all data-[state=active]:border-[#FF9800] data-[state=active]:bg-white",
                        "border-gray-200 bg-[#FFF3E0] hover:border-[#FFB74D] hover:bg-white",
                        fonts.subheading.className
                    )}
                >
                    <CalendarDays size={20} className={cn("flex-shrink-0", activeTab === 'events' ? "text-[#FF9800]" : "text-gray-500")} />
                    <span className={cn(
                      "font-semibold text-base",
                      activeTab === 'events' ? "text-[#FF9800]" : "text-gray-600"
                    )}>{t('events_tab_title')}</span>
                    {events.length > 0 && (
                        <Badge className={cn(
                            "ml-2 px-2 py-0.5 text-sm font-bold rounded-full",
                            activeTab === 'events'
                                ? "bg-[#FF9800] text-white"
                                : "bg-gray-200 text-gray-600"
                        )}>{events.length}</Badge>
                    )}
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
