import React from 'react';
import { Place, Route } from '../../types'; // Adjust path
import { useLanguage } from '../../context/LanguageContext'; // Adjust path
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceCard from '../PlaceCard'; // Adjust path
import RouteCard from '../RouteCard'; // Adjust path
import PlaceCardMob from '../PlaceCardMob'; // Adjust path
import RouteCardMob from '../RouteCardMob'; // Adjust path
import { Badge } from "@/components/ui/badge";
import { MapPin, Route as RouteIcon } from 'lucide-react';
import { useIsSmallScreen } from '../../hooks/use-small-screen'; // Adjust path

interface EventRelatedContentProps {
  relatedPlaces: Place[];
  relatedRoutes: Route[];
}

const EventRelatedContent: React.FC<EventRelatedContentProps> = ({ 
    relatedPlaces, 
    relatedRoutes, 
}) => {
    const { t } = useLanguage();
    const isSmallScreen = useIsSmallScreen();

    const RelatedPlaceCardComponent = isSmallScreen ? PlaceCardMob : PlaceCard;
    const RelatedRouteCardComponent = isSmallScreen ? RouteCardMob : RouteCard;

    return (
        <Tabs defaultValue="places" className="w-full">
             <TabsList className="w-full flex mb-6 flex-wrap h-auto justify-center gap-2 md:gap-4">
                {/* Places Tab */}
                <TabsTrigger value="places" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm">
                    <MapPin size={16} className="flex-shrink-0" />
                    <span>{t('related_places')}</span> 
                    {relatedPlaces.length > 0 && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0.5 text-xs font-medium">{relatedPlaces.length}</Badge>}
                </TabsTrigger>
                {/* Routes Tab */}
                <TabsTrigger value="routes" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm">
                     <RouteIcon size={16} className="flex-shrink-0" />
                     <span>{t('related_routes')}</span>
                     {relatedRoutes.length > 0 && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0.5 text-xs font-medium">{relatedRoutes.length}</Badge>}
                </TabsTrigger>
            </TabsList>

            {/* Places Content */}
            <TabsContent value="places">
                 {relatedPlaces.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">{t('no_places_found')}</div>
                ) : (
                    <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
                        {relatedPlaces.map(place => (
                            <RelatedPlaceCardComponent key={place.id} place={place} />
                        ))}
                    </div>
                )}
            </TabsContent>
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
        </Tabs>
    );
}

export default EventRelatedContent;
