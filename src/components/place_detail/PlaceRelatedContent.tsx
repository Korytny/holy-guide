import React from 'react';
import { Route, Event } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
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
    const isSmallScreen = useIsSmallScreen();

    const RelatedRouteCardComponent = isSmallScreen ? RouteCardMob : RouteCard;
    const RelatedEventCardComponent = isSmallScreen ? EventCardMob : EventCard;

    return (
        <Tabs defaultValue="routes" className="w-full">
             <TabsList className="w-full flex mb-6 flex-wrap h-auto justify-center gap-2 md:gap-4">
                {/* Routes Tab */}
                <TabsTrigger value="routes" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm data-[state=active]:bg-orange-100">
                    <RouteIconUi size={16} className="flex-shrink-0" />
                    <span className="font-bold text-[#09332A] font-[LaudatioC] text-lg">{t('routes')}</span>
                    {relatedRoutes.length > 0 && <Badge className="ml-2 px-2 py-1 text-sm font-bold bg-transparent text-[#09332A] border-[#09332A] border-2">{relatedRoutes.length}</Badge>}
                </TabsTrigger>
                {/* Events Tab */}
                <TabsTrigger value="events" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm data-[state=active]:bg-orange-100">
                     <CalendarDays size={16} className="flex-shrink-0" />
                     <span className="font-bold text-[#09332A] font-[LaudatioC] text-lg">{t('events')}</span>
                     {relatedEvents.length > 0 && <Badge className="ml-2 px-2 py-1 text-sm font-bold bg-transparent text-[#09332A] border-[#09332A] border-2">{relatedEvents.length}</Badge>}
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
