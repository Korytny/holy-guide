import React from 'react';
import { Route, Event } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RouteCard from '../RouteCard'; // Adjust path as needed
import EventCard from '../EventCard'; // Adjust path as needed
import RouteCardMob from '../RouteCardMob'; // Adjust path as needed
import EventCardMob from '../EventCardMob'; // Adjust path as needed
import { Badge } from "@/components/ui/badge";
import { Route as RouteIconUi, CalendarDays } from 'lucide-react'; // Renamed Route from react-router
import { useIsSmallScreen } from '../../hooks/use-small-screen'; // Adjust path as needed

interface PlaceRelatedContentProps {
  relatedRoutes: Route[];
  relatedEvents: Event[];
}

const PlaceRelatedContent: React.FC<PlaceRelatedContentProps> = ({
    relatedRoutes,
    relatedEvents,
}) => {
    const { t } = useLanguage();
    const { fonts } = useFont();
    const isSmallScreen = useIsSmallScreen();

    const RelatedRouteCardComponent = isSmallScreen ? RouteCardMob : RouteCard;
    const RelatedEventCardComponent = isSmallScreen ? EventCardMob : EventCard;

    const [activeTab, setActiveTab] = React.useState('routes');

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
             <TabsList className="w-full flex mb-6 flex-wrap h-auto justify-center gap-3 md:gap-4 bg-transparent">
                {/* Routes Tab */}
                <TabsTrigger
                    value="routes"
                    className={cn(
                        "flex items-center justify-center gap-2 min-w-[160px] py-3 px-6 rounded-xl border-2 transition-all data-[state=active]:border-[#FF9800] data-[state=active]:bg-[#FFF3E0]",
                        "border-gray-200 bg-white hover:border-[#FFB74D] hover:bg-[#FFF8E1]",
                        fonts.subheading.className
                    )}
                >
                    <RouteIconUi size={20} className={cn("flex-shrink-0", activeTab === 'routes' ? "text-[#FF9800]" : "text-gray-500")} />
                    <span className={cn(
                      "font-semibold text-base",
                      activeTab === 'routes' ? "text-[#FF9800]" : "text-gray-600"
                    )}>{t('routes')}</span>
                    {relatedRoutes.length > 0 && (
                        <Badge className={cn(
                            "ml-2 px-2 py-0.5 text-sm font-bold rounded-full",
                            activeTab === 'routes'
                                ? "bg-[#FF9800] text-white"
                                : "bg-gray-200 text-gray-600"
                        )}>{relatedRoutes.length}</Badge>
                    )}
                </TabsTrigger>
                {/* Events Tab */}
                <TabsTrigger
                    value="events"
                    className={cn(
                        "flex items-center justify-center gap-2 min-w-[160px] py-3 px-6 rounded-xl border-2 transition-all data-[state=active]:border-[#FF9800] data-[state=active]:bg-[#FFF3E0]",
                        "border-gray-200 bg-white hover:border-[#FFB74D] hover:bg-[#FFF8E1]",
                        fonts.subheading.className
                    )}
                >
                     <CalendarDays size={20} className={cn("flex-shrink-0", activeTab === 'events' ? "text-[#FF9800]" : "text-gray-500")} />
                     <span className={cn(
                       "font-semibold text-base",
                       activeTab === 'events' ? "text-[#FF9800]" : "text-gray-600"
                     )}>{t('events')}</span>
                     {relatedEvents.length > 0 && (
                         <Badge className={cn(
                             "ml-2 px-2 py-0.5 text-sm font-bold rounded-full",
                             activeTab === 'events'
                                 ? "bg-[#FF9800] text-white"
                                 : "bg-gray-200 text-gray-600"
                         )}>{relatedEvents.length}</Badge>
                     )}
                </TabsTrigger>
            </TabsList>

            {/* Routes Content */}
            <TabsContent value="routes">
                   {relatedRoutes.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">{t('no_routes_found')}</div>
                ) : (
                    <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                        {relatedRoutes.map(route => (
                            <RelatedRouteCardComponent key={route.id} route={route} />
                        ))}
                    </div>
                )}
            </TabsContent>
            {/* Events Content */}
            <TabsContent value="events">
                  {relatedEvents.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">{t('no_events_found')}</div>
                ) : (
                    <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                        {relatedEvents.map(event => (
                            <RelatedEventCardComponent key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}

export default PlaceRelatedContent;
