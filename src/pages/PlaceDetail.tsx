import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlaceById, getRoutesByPlaceId, getEventsByPlaceId } from '../services/api'; // Path from src/pages
import { Place, Route, Event } from '../types'; // Path from src/pages
import { useLanguage } from '../context/LanguageContext'; // Path from src/pages
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout'; // Path from src/pages
import PlaceHeader from '../components/place_detail/PlaceHeader'; // Import new component
import PlaceAbout from '../components/place_detail/PlaceAbout'; // Import new component
import PlaceMap from '../components/place_detail/PlaceMap'; // Import new component
import PlaceRelatedContent from '../components/place_detail/PlaceRelatedContent'; // Import new component
import CommentsSection from '../components/CommentsSection'; // Import CommentsSection

const PlaceDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [place, setPlace] = useState<Place | null>(null);
    const [relatedRoutes, setRelatedRoutes] = useState<Route[]>([]);
    const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        const loadPlaceData = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const placeData = await getPlaceById(id);
                setPlace(placeData);

                if (placeData) {
                    const [routesData, eventsData] = await Promise.all([
                        getRoutesByPlaceId(id),
                        getEventsByPlaceId(id)
                    ]);
                    setRelatedRoutes(routesData);
                    setRelatedEvents(eventsData);
                }
            } catch (error) {
                console.error('Failed to load place data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPlaceData();
    }, [id]);


    if (loading) {
        // Loading skeleton remains the same
         return (
            <Layout>
                <div className="app-container py-10">
                    <div className="animate-pulse">
                        <div className="h-8 w-48 bg-gray-300 rounded mb-6"></div>
                        <div className="grid md:grid-cols-2 gap-8 mb-10">
                            <div className="relative w-full h-64 md:h-96 bg-gray-200 rounded-xl"></div>
                            <div className="bg-gray-100 rounded-xl p-6 md:p-8 space-y-4">
                                <div className="h-6 w-32 bg-gray-300 rounded"></div>
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                        <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg mb-4"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[1, 2].map(i => (
                                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!place) {
        // Not found remains the same
         return (
            <Layout>
                <div className="app-container py-10 text-center">
                    <h2 className="text-xl font-semibold mb-4">{t('place_not_found')}</h2>
                    <Link to="/" className="btn-primary">
                        {t('back_to_home')}
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="app-container py-6">
                 {/* Back Button */}
                 <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate(place.cityId ? `/cities/${place.cityId}` : '/')}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        {t('back_to_city')}
                    </button>
                </div>

                 {/* Grid for Header and About */}
                 <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <PlaceHeader place={place} id={id!} />
                    <PlaceAbout place={place} />
                </div>

                 {/* Map Section */}
                 <PlaceMap place={place} />

                {/* Related Content Tabs */}
                <PlaceRelatedContent relatedRoutes={relatedRoutes} relatedEvents={relatedEvents} />

                {/* Comments Section */}
                {id && (
                    <CommentsSection entityType="place" entityId={id} />
                )}
            </div>
        </Layout>
    );
};

export default PlaceDetail;
