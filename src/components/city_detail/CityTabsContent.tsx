import React from 'react';
import { Place, Route, Event } from '../../types'; // Adjust path
import { useLanguage } from '../../context/LanguageContext'; // Adjust path
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceCard from '../PlaceCard'; // Adjust path
import RouteCard from '../RouteCard'; // Adjust path
import EventCard from '../EventCard'; // Adjust path
import PlaceCardMob from '../PlaceCardMob'; // Adjust path
import EventCardMob from '../EventCardMob'; // Adjust path
import RouteCardMob from '../RouteCardMob'; // Adjust path
import SearchBar from '../SearchBar'; // Adjust path
import { Badge } from "@/components/ui/badge";
import { MapPin, Route as RouteIcon, CalendarDays } from 'lucide-react';
import { useIsSmallScreen } from '../../hooks/use-small-screen'; // Adjust path

interface CityTabsContentProps {
  places: Place[];
  routes: Route[];
  events: Event[];
  activeTab: string;
  onTabChange: (value: string) => void;
  onSearch: (term: string) => void;
}

const CityTabsContent: React.FC<CityTabsContentProps> = ({
    places,
    routes,
    events,
    activeTab,
    onTabChange,
    onSearch
}) => {
    const { t } = useLanguage();
    const isSmallScreen = useIsSmallScreen();

    const PlaceCardComponent = isSmallScreen ? PlaceCardMob : PlaceCard;
    const RouteCardComponent = isSmallScreen ? RouteCardMob : RouteCard;
    const EventCardComponent = isSmallScreen ? EventCardMob : EventCard;

    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="w-full flex mb-6 flex-wrap h-auto justify-center gap-2 md:gap-4">
                {/* Places Tab */}
                <TabsTrigger value="places" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm data-[state=active]:bg-orange-100">
                    <MapPin size={16} className="flex-shrink-0" />
                    <span className="font-bold text-[#09332A] font-[Laudatio]">{t('places_tab_title')}</span>
                    {places.length > 0 && <Badge className="ml-2 px-2 py-1 text-sm font-bold bg-transparent text-[#09332A] border-[#09332A] border-2">{places.length}</Badge>}
                </TabsTrigger>
                {/* Routes Tab */}
                <TabsTrigger value="routes" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm data-[state=active]:bg-orange-100">
                    <RouteIcon size={16} className="flex-shrink-0" />
                    <span className="font-bold text-[#09332A] font-[Laudatio]">{t('routes_tab_title')}</span>
                    {routes.length > 0 && <Badge className="ml-2 px-2 py-1 text-sm font-bold bg-transparent text-[#09332A] border-[#09332A] border-2">{routes.length}</Badge>}
                </TabsTrigger>
                {/* Events Tab */}
                <TabsTrigger value="events" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm data-[state=active]:bg-orange-100">
                    <CalendarDays size={16} className="flex-shrink-0" />
                    <span className="font-bold text-[#09332A] font-[Laudatio]">{t('events_tab_title')}</span>
                    {events.length > 0 && <Badge className="ml-2 px-2 py-1 text-sm font-bold bg-transparent text-[#09332A] border-[#09332A] border-2">{events.length}</Badge>}
                </TabsTrigger>
            </TabsList>

            {/* Places Content */}
            <TabsContent value="places" id="places-content">
                <div className="mb-6">
                    <SearchBar
                        placeholder={t('search_places_placeholder')}
                        onSearch={onSearch}
                    />
                </div>
                {places.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        {t('no_places_found')}
                    </div>
                ) : (
                    <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
                        {places.map(place => (
                            <PlaceCardComponent key={place.id} place={place} />
                        ))}
                    </div>
                )}
            </TabsContent>
            {/* Routes Content */}
            <TabsContent value="routes" id="routes-content">
                {routes.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">{t('no_routes_found')}</div>
                ) : (
                    <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
                        {routes.map(route => (
                            <RouteCardComponent key={route.id} route={route} />
                        ))}
                    </div>
                )}
            </TabsContent>
            {/* Events Content */}
            <TabsContent value="events" id="events-content">
                {events.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">{t('no_events_found')}</div>
                ) : (
                    <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
                        {events.map(event => (
                            <EventCardComponent key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}

export default CityTabsContent;
