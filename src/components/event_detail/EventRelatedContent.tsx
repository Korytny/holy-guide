import React from 'react';
import { Place, Route } from '../../types'; // Adjust path
import { useLanguage } from '../../context/LanguageContext'; // Adjust path
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";
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
    const { fonts } = useFont();
    const isSmallScreen = useIsSmallScreen();

    const RelatedPlaceCardComponent = isSmallScreen ? PlaceCardMob : PlaceCard;
    const RelatedRouteCardComponent = isSmallScreen ? RouteCardMob : RouteCard;

    const [activeTab, setActiveTab] = React.useState('places');

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    )}>{t('places')}</span>
                    {relatedPlaces.length > 0 && (
                        <Badge className={cn(
                            "ml-2 px-2 py-0.5 text-sm font-bold rounded-full",
                            activeTab === 'places'
                                ? "bg-[#FF9800] text-white"
                                : "bg-gray-200 text-gray-600"
                        )}>{relatedPlaces.length}</Badge>
                    )}
                </TabsTrigger>
                {/* Routes Tab */}
                <TabsTrigger
                    value="routes"
                    className={cn(
                        "flex items-center justify-center gap-2 min-w-[160px] py-3 px-6 rounded-xl border-2 transition-all data-[state=active]:border-[#FF9800] data-[state=active]:bg-white",
                        "border-gray-200 bg-[#FFF3E0] hover:border-[#FFB74D] hover:bg-white",
                        fonts.subheading.className
                    )}
                >
                     <RouteIcon size={20} className={cn("flex-shrink-0", activeTab === 'routes' ? "text-[#FF9800]" : "text-gray-500")} />
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
