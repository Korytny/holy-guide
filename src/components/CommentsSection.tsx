import React, { useEffect, useState, ChangeEvent } from 'react'; // Import ChangeEvent
import { Comment, getComments, addComment, editComment, deleteComment, likeComment, unlikeComment } from '../services/comments'; // Import from the new structure
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Edit, Trash2, Save, X, Heart, Image as ImageIcon, Loader2, MinusCircle, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react'; // Import more icons
import { cn } from '@/lib/utils'; // Assuming cn is available for conditional classnames
import { Input } from './ui/input'; // Import Input for file input
import { Checkbox } from './ui/checkbox'; // Import Checkbox for removing photo
import { Label } from './ui/label'; // Import Label
import { Dialog, DialogContent } from './ui/dialog'; // Import Dialog components

interface CommentsSectionProps {
  entityType: 'city' | 'place' | 'route' | 'event';
  entityId: string;
}

const MAX_PHOTOS = 3; // Define the maximum number of photos allowed

const CommentsSection: React.FC<CommentsSectionProps> = ({ entityType, entityId }) => {
  const { t } = useLanguage();
  const { auth } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for new comment photo upload (now an array)
  const [newCommentPhotos, setNewCommentPhotos] = useState<File[]>([]);
  const [newCommentPhotoPreviews, setNewCommentPhotoPreviews] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false); // State for photo upload loading

  // State for editing
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editingCommentNewPhotos, setEditingCommentNewPhotos] = useState<File[]>([]); // New photos to add during edit
  const [editingCommentExistingPhotos, setEditingCommentExistingPhotos] = useState<string[]>([]); // Existing photos URLs for the comment being edited
  const [editingCommentNewPhotoPreviews, setEditingCommentNewPhotoPreviews] = useState<string[]>([]); // Previews for new photos in edit
  const [editingCommentExistingPhotoPreviews, setEditingCommentExistingPhotoPreviews] = useState<string[]>([]); // Previews for existing photos in edit
  const [photosToRemoveDuringEdit, setPhotosToRemoveDuringEdit] = useState<string[]>([]); // URLs of existing photos to remove

  // State for deleting and liking/unliking (simple, might need per-comment later)
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState<string | null>(null); // Store commentId being liked/unliking

  // State for Photo Viewer Modal
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [viewingCommentPhotos, setViewingCommentPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);


  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    const fetchedComments = await getComments(entityType, entityId);
    if (fetchedComments) {
      setComments(fetchedComments);
    } else {
      setError(t('failed_to_load_comments'));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [entityType, entityId, auth.session?.user?.id]); // Add user ID dependency to refetch comments and like status on auth change

  const handleNewPhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []).slice(0, MAX_PHOTOS - newCommentPhotos.length); // Limit selection

      if (files.length > 0) {
          setNewCommentPhotos(prev => [...prev, ...files]);
          // Create preview URLs for selected files
          const newPreviews: string[] = [];
          files.forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  newPreviews.push(reader.result as string);
                   // Only update state when all previews are ready (or handle progress)
                   if (newPreviews.length === files.length) {
                       setNewCommentPhotoPreviews(prev => [...prev, ...newPreviews]);
                   }
              };
              reader.readAsDataURL(file);
          });
      }
      // Clear the file input value so the same file can be selected again if needed
      event.target.value = '';
  };

   const handleRemoveNewPhoto = (index: number) => {
       setNewCommentPhotos(prev => prev.filter((_, i) => i !== index));
       setNewCommentPhotoPreviews(prev => prev.filter((_, i) => i !== index));
   };


  const handleAddComment = async () => {
    if (!newCommentText.trim() && newCommentPhotos.length === 0) return; // Don't add empty comments or comments without text/photo
    if (!auth.session) {
        console.error('User not authenticated to add comment');
        setError(t('login_required_to_comment'));
        return;
    }

    setIsAddingComment(true);
    setIsUploadingPhoto(newCommentPhotos.length > 0); // Indicate photo upload if applicable
    setError(null);

    // Pass the array of photo files
    const addedComment = await addComment(entityType, entityId, newCommentText, newCommentPhotos);

    if (addedComment) {
       setComments((prevComments) => [...prevComments, addedComment].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
      setNewCommentText(''); // Clear the input
      setNewCommentPhotos([]); // Clear selected photos
      setNewCommentPhotoPreviews([]); // Clear photo previews
    } else {
      setError(t('failed_to_add_comment'));
    }

    setIsAddingComment(false);
    setIsUploadingPhoto(false); // Reset photo upload state
  };

  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
    setEditingCommentNewPhotos([]); // Clear previously selected new photos
    setEditingCommentNewPhotoPreviews([]);
    setEditingCommentExistingPhotos(comment.photo_url || []); // Set existing photos URLs
    setEditingCommentExistingPhotoPreviews(comment.photo_url || []); // Set existing previews
    setPhotosToRemoveDuringEdit([]); // Reset remove flag
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
    setEditingCommentNewPhotos([]);
    setEditingCommentNewPhotoPreviews([]);
    setEditingCommentExistingPhotos([]);
    setEditingCommentExistingPhotoPreviews([]);
    setPhotosToRemoveDuringEdit([]);
    setError(null); // Clear potential errors from previous save attempts
  };

  const handleEditingNewPhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
       const files = Array.from(event.target.files || []).slice(0, MAX_PHOTOS - editingCommentNewPhotos.length - editingCommentExistingPhotos.filter(url => !photosToRemoveDuringEdit.includes(url)).length); // Limit selection considering existing and new photos and photos marked for removal

        if (files.length > 0) {
            setEditingCommentNewPhotos(prev => [...prev, ...files]);
            const newPreviews: string[] = [];
             files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string);
                     if (newPreviews.length === files.length) {
                         setEditingCommentNewPhotoPreviews(prev => [...prev, ...newPreviews]);
                     }
                };
                reader.readAsDataURL(file);
            });
        }
        // Clear the file input value
        event.target.value = '';
  };

    const handleRemoveEditingNewPhoto = (index: number) => {
        setEditingCommentNewPhotos(prev => prev.filter((_, i) => i !== index));
        setEditingCommentNewPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleToggleRemoveExistingPhoto = (photoUrl: string) => {
         setPhotosToRemoveDuringEdit(prev => 
            prev.includes(photoUrl)
             ? prev.filter(url => url !== photoUrl)
             : [...prev, photoUrl]
         );
    };


  const handleSaveEdit = async (commentId: string) => {
       const hasText = editingCommentText.trim().length > 0;
       // Check if there are any photos left AFTER removing those marked for removal
       const photosRemaining = editingCommentExistingPhotos.filter(url => !photosToRemoveDuringEdit.includes(url));
       const hasPhotos = editingCommentNewPhotos.length > 0 || photosRemaining.length > 0;

      if (!hasText && !hasPhotos) {
          setError(t('comment_cannot_be_empty')); // Cannot save empty comment without text or photos
          return;
      }

      setIsSavingEdit(true);
      setError(null);

       // Pass filesToAdd and existingPhotoUrlsToRemove to editComment
      const updatedComment = await editComment(commentId, editingCommentText, editingCommentNewPhotos, photosToRemoveDuringEdit);

      if (updatedComment) {
          // Update comments list with the returned updated comment
          setComments((prevComments) =>
              prevComments.map((comment) =>
                  comment.id === updatedComment.id ? updatedComment : comment
              )
          );
          handleCancelEdit(); // Exit editing mode and clear edit states
      } else {
          setError(t('failed_to_update_comment'));
      }

      setIsSavingEdit(false);
  };

    const handleDeleteClick = async (commentId: string) => {
        if (!confirm(t('confirm_delete_comment'))) {
            return;
        }

        setIsDeleting(true);
        setError(null);

        const success = await deleteComment(commentId);

        if (success) {
            setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
        } else {
            setError(t('failed_to_delete_comment'));
        }

        setIsDeleting(false);
    };

    const handleLikeClick = async (comment: Comment) => {
        if (!auth.session) {
             setError(t('login_required_to_comment'));
             return;
        }

        if (isLiking === comment.id) return;

        setIsLiking(comment.id);
        setError(null);

        const currentlyLiked = comment.is_liked_by_user;
        const action = currentlyLiked ? unlikeComment : likeComment;

        // Optimistic update
        setComments(prevComments =>
            prevComments.map(c =>
                c.id === comment.id
                    ? { ...c, is_liked_by_user: !currentlyLiked, likes_count: currentlyLiked ? c.likes_count - 1 : c.likes_count + 1 }
                    : c
            )
        );

        const success = await action(comment.id);

        if (!success) {
            setError(t(currentlyLiked ? 'failed_to_unlike_comment' : 'failed_to_like_comment'));
            // Revert optimistic update if API call failed
             setComments(prevComments =>
                prevComments.map(c =>
                    c.id === comment.id
                        ? { ...c, is_liked_by_user: currentlyLiked, likes_count: currentlyLiked ? c.likes_count + 1 : c.likes_count - 1 }
                        : c
                )
            );
        }

        setIsLiking(null);
    };

    // Photo Viewer Handlers
    const handleOpenPhotoViewer = (photos: string[], initialIndex: number) => {
        setViewingCommentPhotos(photos);
        setCurrentPhotoIndex(initialIndex);
        setIsPhotoViewerOpen(true);
    };

    const handleClosePhotoViewer = () => {
        setIsPhotoViewerOpen(false);
        setViewingCommentPhotos([]);
        setCurrentPhotoIndex(0);
    };

    const handleNextPhoto = () => {
        setCurrentPhotoIndex(prevIndex => (prevIndex + 1) % viewingCommentPhotos.length);
    };

    const handlePreviousPhoto = () => {
        setCurrentPhotoIndex(prevIndex => (prevIndex - 1 + viewingCommentPhotos.length) % viewingCommentPhotos.length);
    };

    // Get the current photo URL to display in the viewer
    const currentViewerPhotoUrl = viewingCommentPhotos[currentPhotoIndex];
    const canGoPrevious = viewingCommentPhotos.length > 1 && currentPhotoIndex > 0;
    const canGoNext = viewingCommentPhotos.length > 1 && currentPhotoIndex < viewingCommentPhotos.length - 1;


  const isAuthenticated = !!auth.session;
  const currentUserId = auth.session?.user.id;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{t('comments')}</h2>

      {isLoading && <p>{t('loading_comments')}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-4">
        {comments.length === 0 && !isLoading && !error && (
          <p>{t('no_comments_yet')}</p>
        )}

        {comments.map((comment) => {
          const isOwner = currentUserId === comment.user_id;
          const isEditing = editingCommentId === comment.id;
          const isLikingThis = isLiking === comment.id;

          return (
            <div key={comment.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center mb-3">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={comment.profile?.avatar_url || undefined} alt={comment.profile?.full_name || 'User Avatar'} />
                  <AvatarFallback>{comment.profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-gray-800 text-sm">{comment.profile?.full_name || t('anonymous_user')}</p>
                <span className="ml-auto text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              
              {isEditing ? (
                <div className="flex flex-col space-y-3">
                  <Textarea
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    disabled={isSavingEdit}
                    rows={3}
                    className="text-gray-700"
                    placeholder={t('write_your_comment_here')}
                  />

                   {/* Edit Photo Section */}
                   <div className="flex flex-col space-y-2">
                        <Label htmlFor={`edit-photo-${comment.id}`} className="text-gray-700 text-sm">{t('change_photo')}</Label>
                         <Input 
                            id={`edit-photo-${comment.id}`}
                            type="file" 
                            accept="image/*" 
                            onChange={handleEditingNewPhotoSelect}
                            disabled={isSavingEdit || (editingCommentNewPhotos.length + editingCommentExistingPhotos.filter(url => !photosToRemoveDuringEdit.includes(url)).length >= MAX_PHOTOS)}
                            className="text-gray-700"
                            multiple // Allow multiple file selection
                         />
                          {/* Display previews for new photos being added */}
                         {editingCommentNewPhotoPreviews.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                  {editingCommentNewPhotoPreviews.map((previewUrl, index) => (
                                      <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                                          <img 
                                             src={previewUrl}
                                             alt={`New photo preview ${index + 1}`}
                                             className="w-full h-full object-cover"
                                          />
                                           {/* Button to remove newly selected photo */}
                                          <Button 
                                               variant="ghost" 
                                               size="icon"
                                               className="absolute top-0 right-0 h-5 w-5 text-red-500 hover:text-red-700"
                                               onClick={() => handleRemoveEditingNewPhoto(index)}
                                               aria-label={t('remove_photo')}
                                          >
                                               <X size={14} />
                                          </Button>
                                      </div>
                                  ))}
                              </div>
                         )}

                         {/* Display existing photos with remove option */}
                         {editingCommentExistingPhotos.length > 0 && (
                             <div className="flex flex-wrap gap-2 mt-2">
                                  {editingCommentExistingPhotos.map((photoUrl, index) => {
                                      const isMarkedForRemoval = photosToRemoveDuringEdit.includes(photoUrl);
                                      return (
                                          <div 
                                             key={photoUrl} 
                                             className={cn(
                                                 "relative w-20 h-20 rounded-md overflow-hidden border border-gray-200",
                                                 isMarkedForRemoval && "opacity-50"
                                              )}
                                          >
                                              <img 
                                                 src={photoUrl}
                                                 alt="Existing photo"
                                                 className="w-full h-full object-cover"
                                              />
                                              {/* Button/Overlay to mark for removal */}
                                               <button 
                                                    onClick={() => handleToggleRemoveExistingPhoto(photoUrl)}
                                                     className={cn(
                                                         "absolute inset-0 flex items-center justify-center bg-black/50 text-white hover:bg-black/70 transition-colors",
                                                         isMarkedForRemoval ? "visible" : "invisible group-hover:visible"
                                                     )}
                                                    aria-label={isMarkedForRemoval ? t('undo_remove_photo') : t('remove_photo')}
                                               >
                                                    {isMarkedForRemoval ? <PlusCircle size={24} /> : <MinusCircle size={24} />}
                                               </button>
                                          </div>
                                      );
                                  })}
                             </div>
                         )}

                   </div>


                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSavingEdit}>
                      <X size={16} className="mr-1"/> {t('cancel')}
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={() => handleSaveEdit(comment.id)} 
                         disabled={isSavingEdit || (!editingCommentText.trim() && editingCommentNewPhotos.length === 0 && editingCommentExistingPhotos.filter(url => !photosToRemoveDuringEdit.includes(url)).length === 0 )}
                    >
                      {isSavingEdit ? <Loader2 size={16} className="mr-1 animate-spin"/> : <Save size={16} className="mr-1"/>} {isSavingEdit ? t('saving') : t('save')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                   {/* Display Photos if they exist with click handler */}
                   {comment.photo_url && comment.photo_url.length > 0 && (
                       <div className="mb-3 flex flex-wrap gap-2">
                           {comment.photo_url.map((url, index) => (
                               <img 
                                   key={index}
                                   src={url}
                                   alt={`Photo ${index + 1} for comment by ${comment.profile?.full_name || t('anonymous_user')}`}
                                   className="w-24 h-24 object-cover rounded-md border border-gray-200 cursor-pointer" // Added cursor-pointer
                                    onClick={() => handleOpenPhotoViewer(comment.photo_url || [], index)} // Added click handler
                               />
                           ))}
                       </div>
                   )}

                  <p className="text-gray-700 mb-3 break-words">{comment.text}</p>
                  {/* Comment Footer */} 
                  <div className="flex items-center text-gray-500 text-sm mt-2 pt-2 border-t border-gray-100">
                      {/* Like Button and Count */}
                      <button 
                        onClick={() => handleLikeClick(comment)}
                        disabled={!isAuthenticated || isLikingThis}
                        className={cn(
                            "flex items-center mr-4 transition-colors",
                            isAuthenticated ? "hover:text-blue-600" : "cursor-not-allowed opacity-50"
                         )}
                        aria-label={comment.is_liked_by_user ? t('unlike') : t('like')}
                       >
                        {isLikingThis ? (
                             <Loader2 size={16} className="mr-1 animate-spin" /> 
                        ) : (
                             comment.is_liked_by_user ? (
                                 <Heart size={16} className="mr-1 fill-red-500 text-red-500" /> 
                             ) : (
                                 <Heart size={16} className="mr-1" /> 
                             )
                        )}
                        <span>{comment.likes_count}</span>
                      </button>

                      {/* Edit/Delete Buttons for Owner */}
                      {isOwner && isAuthenticated && (
                        <div className="ml-auto flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(comment)} disabled={isDeleting || isLikingThis} aria-label={t('edit')} >
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(comment.id)} disabled={isDeleting || isLikingThis} aria-label={t('delete')}>
                            <Trash2 size={16} className="text-red-500"/>
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">{isAuthenticated ? t('leave_a_comment') : t('login_to_comment')}</h3>

        {isAuthenticated ? (
          <div className="flex flex-col space-y-3">
            <Textarea
              placeholder={t('write_your_comment_here')}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              disabled={isAddingComment || isUploadingPhoto}
              rows={4}
            />

             {/* New Comment Photo Upload */}
             <div className="flex flex-col space-y-2">
                 <Label htmlFor="new-comment-photo" className="cursor-pointer text-gray-700 flex items-center text-sm font-medium">
                      <ImageIcon size={20} className="mr-1"/> {t('add_photo')} ({newCommentPhotos.length}/{MAX_PHOTOS}) {/* Show photo count */}
                   </Label>
                   <Input 
                      id="new-comment-photo"
                      type="file" 
                      accept="image/*" 
                      onChange={handleNewPhotoSelect}
                      disabled={isAddingComment || isUploadingPhoto || newCommentPhotos.length >= MAX_PHOTOS} // Disable if max photos reached
                      className="hidden" // Hide the default file input
                      multiple // Allow multiple file selection
                   />

                    {newCommentPhotoPreviews.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {newCommentPhotoPreviews.map((previewUrl, index) => (
                                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                                     <img 
                                        src={previewUrl}
                                        alt={`Selected photo preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                     />
                                      {/* Button to clear selected photo */}
                                     <Button 
                                          variant="ghost" 
                                          size="icon"
                                          className="absolute top-0 right-0 h-5 w-5 text-red-500 hover:text-red-700"
                                          onClick={() => handleRemoveNewPhoto(index)}
                                          aria-label={t('remove_photo')}
                                     >
                                          <X size={14} />
                                     </Button>
                                </div>
                            ))}
                        </div>
                    )}
             </div>


            <Button
              onClick={handleAddComment}
              disabled={(!newCommentText.trim() && newCommentPhotos.length === 0) || isAddingComment || isUploadingPhoto}
              className="self-end"
            >
              {isAddingComment || isUploadingPhoto ? <Loader2 size={16} className="mr-1 animate-spin"/> : null} 
              {isAddingComment ? t('adding_comment') : isUploadingPhoto ? t('uploading_photo') : t('add_comment')}
            </Button>
          </div>
        ) : (
          <p className="text-gray-600">{t('login_to_post_comments')}</p>
        )}
      </div>

       {/* Photo Viewer Modal */}
       <Dialog open={isPhotoViewerOpen} onOpenChange={setIsPhotoViewerOpen}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-4 bg-transparent border-none shadow-none">
              <div className="flex items-center justify-center w-full h-full">
                   {currentViewerPhotoUrl && (
                        <img 
                           src={currentViewerPhotoUrl}
                           alt="Full size comment photo"
                           className="max-w-full max-h-[80vh] object-contain rounded-md"
                        />
                   )}

                  {/* Navigation Buttons */}
                  {canGoPrevious && (
                      <Button 
                          variant="ghost" 
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white hover:bg-black/30 z-20"
                          onClick={handlePreviousPhoto}
                          aria-label={t('previous_photo')} // Assuming 'previous_photo' key
                      >
                          <ChevronLeft size={32} />
                      </Button>
                  )}
                   {canGoNext && (
                       <Button 
                           variant="ghost" 
                           size="icon"
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white hover:bg-black/30 z-20"
                           onClick={handleNextPhoto}
                           aria-label={t('next_photo')} // Assuming 'next_photo' key
                       >
                           <ChevronRight size={32} />
                       </Button>
                   )}
              </div>
              {/* Close button is typically part of DialogContent from shadcn/ui */}
          </DialogContent>
       </Dialog>

    </div>
  );
};

export default CommentsSection;
