import React from 'react';
import { Place, Route, Event } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useFont } from '../../context/FontContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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
  onRouteClick?: (route: Route) => void;
}

const CityTabsContent: React.FC<CityTabsContentProps> = ({
    places,
    routes,
    events,
    activeTab,
    onTabChange,
    onSearch,
    onRouteClick
}) => {
    const { t } = useLanguage();
    const { fonts } = useFont();
    const isSmallScreen = useIsSmallScreen();

    const PlaceCardComponent = isSmallScreen ? PlaceCardMob : PlaceCard;
    const RouteCardComponent = isSmallScreen ? RouteCardMob : RouteCard;
    const EventCardComponent = isSmallScreen ? EventCardMob : EventCard;

    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="w-full flex mb-6 flex-wrap h-auto justify-center gap-3 md:gap-4 bg-transparent">
                {/* Places Tab */}
                <TabsTrigger
                    value="places"
                    className={cn(
                        "flex items-center justify-center gap-2 min-w-[140px] py-3 px-5 rounded-xl border-2 transition-all data-[state=active]:border-[#FF9800] data-[state=active]:bg-[#FFF3E0]",
                        "border-gray-200 bg-white hover:border-[#FFB74D] hover:bg-[#FFF8E1]",
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
                        )}>
                            {places.length}
                        </Badge>
                    )}
                </TabsTrigger>
                {/* Routes Tab */}
                <TabsTrigger
                    value="routes"
                    className={cn(
                        "flex items-center justify-center gap-2 min-w-[140px] py-3 px-5 rounded-xl border-2 transition-all data-[state=active]:border-[#FF9800] data-[state=active]:bg-[#FFF3E0]",
                        "border-gray-200 bg-white hover:border-[#FFB74D] hover:bg-[#FFF8E1]",
                        fonts.subheading.className
                    )}
                >
                    <RouteIcon size={20} className={cn("flex-shrink-0", activeTab === 'routes' ? "text-[#FF9800]" : "text-gray-500")} />
                    <span className={cn(
                      "font-semibold text-base",
                      activeTab === 'routes' ? "text-[#FF9800]" : "text-gray-600"
                    )}>{t('routes_tab_title')}</span>
                    {routes.length > 0 && (
                        <Badge className={cn(
                            "ml-2 px-2 py-0.5 text-sm font-bold rounded-full",
                            activeTab === 'routes'
                                ? "bg-[#FF9800] text-white"
                                : "bg-gray-200 text-gray-600"
                        )}>
                            {routes.length}
                        </Badge>
                    )}
                </TabsTrigger>
                {/* Events Tab */}
                <TabsTrigger
                    value="events"
                    className={cn(
                        "flex items-center justify-center gap-2 min-w-[140px] py-3 px-5 rounded-xl border-2 transition-all data-[state=active]:border-[#FF9800] data-[state=active]:bg-[#FFF3E0]",
                        "border-gray-200 bg-white hover:border-[#FFB74D] hover:bg-[#FFF8E1]",
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
                        )}>
                            {events.length}
                        </Badge>
                    )}
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
                            <RouteCardComponent 
                                key={route.id} 
                                route={route} 
                                onRouteClick={onRouteClick}
                            />
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
