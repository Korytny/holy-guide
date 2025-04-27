import { supabase } from '../../integrations/supabase/client';
import { Comment } from './commentTypes';
import { fetchProfilesByIds } from './commentUtils';
import { fetchLikesByCommentIds } from './commentLikesService';
import { uploadCommentPhoto, deleteCommentPhotosByUrls } from './commentStorageService'; // Import updated storage functions

export const getComments = async (entityType: 'city' | 'place' | 'route' | 'event', entityId: string): Promise<Comment[]> => {
  if (!supabase) {
    console.error('[commentService getComments] Supabase client not available');
    return [];
  }
  try {
    // Fetch comments including the array of photo_urls
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('id, created_at, user_id, entity_type, entity_id, text, photo_url') // Now selects photo_url as TEXT[]
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true }); // Order by oldest first

    if (commentsError) {
      console.error('[commentService getComments] Error fetching comments:', commentsError);
      return [];
    }

    if (!commentsData || commentsData.length === 0) {
        return []; // No comments found
    }

    // Get unique user IDs from comments
    const uniqueUserIds = Array.from(new Set(commentsData.map(comment => comment.user_id)));
     // Get comment IDs
    const commentIds = commentsData.map(comment => comment.id);


    // Fetch profiles and likes in parallel
    const [profilesMap, likesData] = await Promise.all([
        fetchProfilesByIds(uniqueUserIds),
        fetchLikesByCommentIds(commentIds) // Fetch all likes for these comments
    ]);

    // Determine current user's ID
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user.id;

    // Process likes data to count and determine user like status
    const commentLikesCount = new Map<string, number>();
    const userLikedCommentIds = new Set<string>();

    likesData.forEach(like => {
        commentLikesCount.set(like.comment_id, (commentLikesCount.get(like.comment_id) || 0) + 1);
        if (currentUserId && like.user_id === currentUserId) {
            userLikedCommentIds.add(like.comment_id);
        }
    });

    // Map the data to the Comment interface and attach profile and like info
    const comments: Comment[] = commentsData.map((comment: any) => ({
      id: comment.id,
      created_at: comment.created_at,
      user_id: comment.user_id,
      entity_type: comment.entity_type,
      entity_id: comment.entity_id,
      text: comment.text,
      photo_url: comment.photo_url || [], // Ensure photo_url is an array (or null)
      profile: profilesMap.get(comment.user_id), // Attach profile data from the map
      likes_count: commentLikesCount.get(comment.id) || 0, // Attach like count
      is_liked_by_user: userLikedCommentIds.has(comment.id) // Attach user like status
    })) as Comment[]; 

    return comments;

  } catch (error) {
    console.error('[commentService getComments] Exception fetching comments:', error);
    return [];
  }
};

export const getCommentsByUserId = async (userId: string): Promise<Comment[]> => {
    if (!supabase) {
      console.error('[commentService getCommentsByUserId] Supabase client not available');
      return [];
    }
    try {
      // Fetch comments for a specific user including the array of photo_urls
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id, created_at, user_id, entity_type, entity_id, text, photo_url') // Now selects photo_url as TEXT[]
        .eq('user_id', userId)
        .order('created_at', { ascending: false }); // Order by most recent first

      if (commentsError) {
        console.error('[commentService getCommentsByUserId] Error fetching user comments:', commentsError);
        return [];
      }

       if (!commentsData || commentsData.length === 0) {
        return []; // No comments found
      }

       // Get unique user IDs (should only be the one user in this case, but keep structure)
      const uniqueUserIds = Array.from(new Set(commentsData.map(comment => comment.user_id)));

      // Fetch profiles and likes in parallel (fetching likes for all comments by this user)
      const [profilesMap, likesData] = await Promise.all([
          fetchProfilesByIds(uniqueUserIds),
          fetchLikesByCommentIds(commentsData.map(c => c.id)) // Fetch likes for all comments by this user
      ]);

      // Determine current user's ID
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user.id;

      // Process likes data
      const commentLikesCount = new Map<string, number>();
      const userLikedCommentIds = new Set<string>();

      likesData.forEach(like => {
          commentLikesCount.set(like.comment_id, (commentLikesCount.get(like.comment_id) || 0) + 1);
           if (currentUserId && like.user_id === currentUserId) {
              userLikedCommentIds.add(like.comment_id);
          }
      });

       const comments: Comment[] = commentsData.map((comment: any) => ({
        id: comment.id,
        created_at: comment.created_at,
        user_id: comment.user_id,
        entity_type: comment.entity_type,
        entity_id: comment.entity_id,
        text: comment.text,
        photo_url: comment.photo_url || [], // Ensure photo_url is an array (or null)
        profile: profilesMap.get(comment.user_id),
        likes_count: commentLikesCount.get(comment.id) || 0,
        is_liked_by_user: userLikedCommentIds.has(comment.id)
      })) as Comment[];

      return comments;

    } catch (error) {
      console.error('[commentService getCommentsByUserId] Exception fetching user comments:', error);
      return [];
    }
  };

// addComment now accepts an array of files
export const addComment = async (entityType: 'city' | 'place' | 'route' | 'event', entityId: string, text: string, photoFiles?: File[]): Promise<Comment | null> => {
  if (!supabase) {
    console.error('[commentService addComment] Supabase client not available');
    return null;
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('[commentService addComment] User not authenticated');
    return null; // User must be authenticated to comment
  }

  try {
      let insertedCommentData: any = null; // To hold the result of the initial insert
      const photoUrls: string[] = [];

      // 1. Insert the comment initially without any photo URLs
       const { data: initialInsertData, error: insertError } = await supabase
          .from('comments')
          .insert([{
              user_id: session.user.id,
              entity_type: entityType,
              entity_id: entityId,
              text: text,
              photo_url: [], // photo_url is an empty array initially
          }])
          .select('id, created_at, user_id, entity_type, entity_id, text, photo_url')
          .single();

      if (insertError) {
          console.error('[commentService addComment] Error inserting comment:', insertError);
          return null;
      }

       if (!initialInsertData) {
            console.error('[commentService addComment] Insert returned no data');
            return null;
        }

      insertedCommentData = initialInsertData; // Store the initial data

      // 2. If photo files are provided, upload them and collect URLs
      if (photoFiles && photoFiles.length > 0) {
           const uploadPromises = photoFiles.map(file => uploadCommentPhoto(file, session.user.id, insertedCommentData.id));
           const uploadedUrls = await Promise.all(uploadPromises);

           // Collect successful upload URLs
           const successfullyUploadedUrls = uploadedUrls
                .filter(url => url !== null) as string[]; // Filter out failed uploads (null URLs)
                
           photoUrls.push(...successfullyUploadedUrls);

           if (successfullyUploadedUrls.length !== photoFiles.length) {
                console.warn('[commentService addComment] Some photos failed to upload.', { failedCount: photoFiles.length - successfullyUploadedUrls.length });
                // Optionally, handle partial failures (e.g., notify user)
           }

           // 3. Update the comment with the array of photo URLs
           if (photoUrls.length > 0) {
               const { data: updatedCommentData, error: updateError } = await supabase
                  .from('comments')
                  .update({ photo_url: photoUrls })
                  .eq('id', insertedCommentData.id)
                  .select('id, created_at, user_id, entity_type, entity_id, text, photo_url') // Select updated data
                  .single();

               if (updateError) {
                    console.error('[commentService addComment] Error updating comment with photo URLs:', updateError);
                    // The comment is created but without all photo URLs. Decide how to handle.
               } else if (updatedCommentData) {
                     insertedCommentData = updatedCommentData; // Use the data with photo_urls
               }
           }
      }

      // 4. Fetch profile and likes for the final comment data
       const profilesMap = await fetchProfilesByIds([insertedCommentData.user_id]);
       const profile = profilesMap.get(insertedCommentData.user_id);

        // Newly added comment has 0 likes initially, and the user who added it liked it by default
       const commentLikesCount = 0;
       const isLikedByUser = true;


       // 5. Map the final data to the Comment interface
      const newComment: Comment = {
        id: insertedCommentData.id,
        created_at: insertedCommentData.created_at,
        user_id: insertedCommentData.user_id,
        entity_type: insertedCommentData.entity_type,
        entity_id: insertedCommentData.entity_id,
        text: insertedCommentData.text,
        photo_url: insertedCommentData.photo_url, // Will be the array of URLs
        profile: profile,
        likes_count: commentLikesCount,
        is_liked_by_user: isLikedByUser
      } as Comment;

      return newComment;

  } catch (error) {
    console.error('[commentService addComment] Exception adding comment:', error);
    return null;
  }
};

// editComment now handles adding/removing multiple files
export const editComment = async (commentId: string, newText: string, filesToAdd?: File[], existingPhotoUrlsToRemove?: string[]): Promise<Comment | null> => {
    if (!supabase) {
      console.error('[commentService editComment] Supabase client not available');
      return null;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('[commentService editComment] User not authenticated');
      return null; // User must be authenticated to edit
    }

    try { // Main try block for edit

        // 1. Fetch the current comment to get its existing photos
        const { data: currentComment, error: fetchError } = await supabase
             .from('comments')
             .select('id, user_id, photo_url')
             .eq('id', commentId)
             .eq('user_id', session.user.id) // Ensure ownership check
             .single();

        if (fetchError || !currentComment) {
            console.error('[commentService editComment] Error fetching current comment or not found/owned:', fetchError);
            return null;
        }

        let currentPhotoUrls = currentComment.photo_url || [];
        const photoUrlsToUpdate: string[] = [...currentPhotoUrls];

        // 2. Handle photo removal
        if (existingPhotoUrlsToRemove && existingPhotoUrlsToRemove.length > 0) {
             // Delete photos from storage
            const deleteSuccess = await deleteCommentPhotosByUrls(existingPhotoUrlsToRemove);
            if (!deleteSuccess) {
                console.warn('[commentService editComment] Some photos failed to delete from storage.');
                // Decide how to handle partial failure - we will still update the DB to remove URLs
            }
            // Remove URLs from the array for DB update
            existingPhotoUrlsToRemove.forEach(urlToRemove => {
                 const index = photoUrlsToUpdate.indexOf(urlToRemove);
                 if (index !== -1) {
                    photoUrlsToUpdate.splice(index, 1);
                 }
            });
        }

        // 3. Handle new photo uploads
        if (filesToAdd && filesToAdd.length > 0) {
             const uploadPromises = filesToAdd.map(file => uploadCommentPhoto(file, session.user.id, commentId));
             const uploadedUrls = await Promise.all(uploadPromises);

             const successfullyUploadedUrls = uploadedUrls
                  .filter(url => url !== null) as string[]; // Filter out failed uploads (null URLs)

             photoUrlsToUpdate.push(...successfullyUploadedUrls); // Add new URLs to the array

             if (successfullyUploadedUrls.length !== filesToAdd.length) {
                  console.warn('[commentService editComment] Some new photos failed to upload.', { failedCount: filesToAdd.length - successfullyUploadedUrls.length });
                  // Optionally, handle partial failures
             }
        }

        // 4. Update the comment record in the database
         const updateData: any = { text: newText, photo_url: photoUrlsToUpdate, updated_at: new Date().toISOString() };

        const { data: updatedCommentData, error: updateError } = await supabase
            .from('comments')
            .update(updateData) 
            .eq('id', commentId)
            .eq('user_id', session.user.id) // Ensure only the owner can edit
            // Select the updated comment data including photo_url array
            .select('id, created_at, user_id, entity_type, entity_id, text, photo_url') 
            .single();

        if (updateError) {
            console.error('[commentService editComment] Error updating comment data:', updateError);
            return null;
        }

        if (!updatedCommentData) {
             console.warn('[commentService editComment] Update returned no data or comment not found/owned');
             return null;
        }

         // 5. Fetch the profile and likes for the updated comment
        const profilesMap = await fetchProfilesByIds([updatedCommentData.user_id]);
        const profile = profilesMap.get(updatedCommentData.user_id);

         // Fetch likes for the updated comment (need to get current likes count and user like status)
        const likesData = await fetchLikesByCommentIds([updatedCommentData.id]);

        const commentLikesCount = likesData.length; // Count all likes for this comment
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const currentUserId = currentSession?.user.id;
        const isLikedByUser = currentUserId ? likesData.some(like => like.user_id === currentUserId) : false;


        const updatedComment: Comment = {
            id: updatedCommentData.id,
            created_at: updatedCommentData.created_at,
            user_id: updatedCommentData.user_id,
            entity_type: updatedCommentData.entity_type,
            entity_id: updatedCommentData.entity_id,
            text: updatedCommentData.text,
            photo_url: updatedCommentData.photo_url || [], // Ensure it's an array
            profile: profile, 
            likes_count: commentLikesCount, 
            is_liked_by_user: isLikedByUser 
        } as Comment;

        return updatedComment;

    } catch (error) {
        console.error('[commentService editComment] Exception editing comment:', error);
        return null;
    }
};

export const deleteComment = async (commentId: string): Promise<boolean> => {
    if (!supabase) {
      console.error('[commentService deleteComment] Supabase client not available');
      return false;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('[commentService deleteComment] User not authenticated');
      return false; // User must be authenticated to delete
    }

    try {
        // Optional: Fetch comment first to get photo_urls for deletion
        const { data: commentToDelete, error: fetchError } = await supabase
            .from('comments')
            .select('id, user_id, photo_url') // Select user_id for the RLS policy check, and photo_url array
            .eq('id', commentId)
            .eq('user_id', session.user.id) // Ensure only owner can delete
            .single();

        if (fetchError || !commentToDelete) {
            console.error('[commentService deleteComment] Error fetching comment for photo deletion or not found/owned:', fetchError);
             // Continue with comment deletion even if fetching photo_urls fails
        }

        // Delete the comment record from the database
        const { error: deleteError } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', session.user.id); // Ensure only the owner can delete

        if (deleteError) {
            console.error('[commentService deleteComment] Error deleting comment record:', deleteError);
            return false;
        }

         // If there were photos, delete them from storage AFTER deleting the DB record
        if (commentToDelete?.photo_url && commentToDelete.photo_url.length > 0) {
             const deleteSuccess = await deleteCommentPhotosByUrls(commentToDelete.photo_url);
              if (!deleteSuccess) {
                 console.warn('[commentService deleteComment] Some photos failed to delete from storage.');
                 // Log the error but don't fail the comment deletion operation
              }
        }


        // Supabase delete returns null data on success for single row delete
        return true;

    } catch (error) {
        console.error('[commentService deleteComment] Exception deleting comment:', error);
        return false;
    }
};
