import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Comment, getCommentsByUserId } from '../../services/comments';

interface UserCommentsSectionProps {
  onCommentsAndPhotosCountLoaded?: (counts: { commentsCount: number; photosCount: number }) => void;
}

const UserCommentsSection: React.FC<UserCommentsSectionProps> = ({ onCommentsAndPhotosCountLoaded }) => {
    const { auth } = useAuth();
    const { t } = useLanguage();
    const [userComments, setUserComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [isLoadingAny, setIsLoadingAny] = useState(true); // To track if initial loading is in progress

    useEffect(() => {
        if (auth.user) {
            const fetchUserComments = async () => {
                setLoadingComments(true);
                let comments: Comment[] = [];
                try {
                    comments = await getCommentsByUserId(auth.user!.id); // Use non-null assertion as auth.user is checked
                    setUserComments(comments);
                } catch (e) {
                    console.error("Failed to load user comments", e);
                } finally {
                    setLoadingComments(false);
                     setIsLoadingAny(false); // Loading is done
                }
                
                 // Calculate photo count
                const totalPhotos = comments.reduce((count, comment) => {
                    // Check if photo_url exists and is an array before counting
                    if (comment.photo_url && Array.isArray(comment.photo_url)) {
                        return count + comment.photo_url.length;
                    }
                    return count;
                }, 0);

                // Call the callback with counts
                if (onCommentsAndPhotosCountLoaded) {
                    onCommentsAndPhotosCountLoaded({
                        commentsCount: comments.length,
                        photosCount: totalPhotos,
                    });
                }
            };
            fetchUserComments();
        } else {
             // If user is not available, reset counts to 0
             if (onCommentsAndPhotosCountLoaded) {
                onCommentsAndPhotosCountLoaded({
                    commentsCount: 0,
                    photosCount: 0,
                });
             }
             setIsLoadingAny(false);
        }
    }, [auth.user, onCommentsAndPhotosCountLoaded]); // Add dependencies

     // Optional: effect to update counts if comments state changes later
     useEffect(() => {
        if (!isLoadingAny && onCommentsAndPhotosCountLoaded) { // Only update if initial loading is done
             const totalPhotos = userComments.reduce((count, comment) => {
                    if (comment.photo_url && Array.isArray(comment.photo_url)) {
                        return count + comment.photo_url.length;
                    }
                    return count;
                }, 0);
            onCommentsAndPhotosCountLoaded({
                commentsCount: userComments.length,
                photosCount: totalPhotos,
            });
        }
     }, [userComments, isLoadingAny, onCommentsAndPhotosCountLoaded]);

    // Helper to get link based on entity type
    const getEntityLink = (comment: Comment) => {
        switch (comment.entity_type) {
            // Corrected path to match the route definition in App.tsx
            case 'city': return `/cities/${comment.entity_id}`;
            case 'place': return `/places/${comment.entity_id}`;
            case 'route': return `/routes/${comment.entity_id}`;
            case 'event': return `/events/${comment.entity_id}`;
            default: return '#'; // Fallback
        }
    };

    // Helper to get localized entity type name
    const getLocalizedEntityType = (type: Comment['entity_type']) => {
        switch (type) {
            case 'city': return t('city');
            case 'place': return t('place');
            case 'route': return t('route');
            case 'event': return t('event');
            default: return type;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6 pb-4 border-b text-center text-gray-900">{t('my_comments')}</h2>
            
            {loadingComments ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 rounded"></div>)}
                </div>
            ) : userComments.length === 0 ? (
                <p className="text-gray-500 italic text-center">{t('no_comments_posted_yet')}</p>
            ) : (
                <div className="space-y-6">
                    {userComments.map(comment => (
                        <div key={comment.id} className="border-b pb-6 last:border-b-0">
                            <div className="flex items-center mb-2 text-gray-600 text-sm">
                                {t('comment_on')}{' '}
                                <Link 
                                    to={getEntityLink(comment)}
                                    className="font-semibold text-blue-600 hover:underline ml-1"
                                >
                                    {getLocalizedEntityType(comment.entity_type)}
                                </Link>
                                <span className="ml-auto text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                            </div>
                            {/* Display Photos if they exist */}
                            {comment.photo_url && comment.photo_url.length > 0 && (
                                <div className="my-2 flex flex-wrap gap-2">
                                    {comment.photo_url.map((url, index) => (
                                        <img 
                                            key={index}
                                            src={url}
                                            alt={`Comment photo ${index + 1}`}
                                            className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                        />
                                    ))}
                                </div>
                            )}
                            <p className="text-gray-800">{comment.text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserCommentsSection;
