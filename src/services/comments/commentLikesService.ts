import { supabase } from '../../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { CommentLike } from './commentTypes';

// Helper to fetch likes for a list of comment IDs
export const fetchLikesByCommentIds = async (commentIds: string[]): Promise<CommentLike[]> => {
    if (!supabase) return [];
    if (commentIds.length === 0) return [];

    try {
        const { data, error } = await supabase
            .from('comment_likes')
            .select('user_id, comment_id, created_at')
            .in('comment_id', commentIds);

        if (error) {
            console.error('[commentLikesService fetchLikesByCommentIds] Error fetching likes:', error);
            return [];
        }

        return data || [];

    } catch (error) {
        console.error('[commentLikesService fetchLikesByCommentIds] Exception fetching likes:', error);
        return [];
    }
};

export const likeComment = async (commentId: string): Promise<boolean> => {
  if (!supabase) {
    console.error('[commentLikesService likeComment] Supabase client not available');
    return false;
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('[commentLikesService likeComment] User not authenticated');
    return false;
  }

  try {
    // Insert the like (Supabase RLS should prevent duplicates if policy is set correctly)
    const { error: insertError } = await supabase
      .from('comment_likes')
      .insert([{
        user_id: session.user.id,
        comment_id: commentId,
      }]);

    if (insertError) {
        // Check if the error is a duplicate key violation (already liked)
        if (insertError.code === '23505') { // PostgreSQL unique_violation error code
             console.log('Comment already liked by user (caught unique constraint violation).');
             return true; // Consider it a success if it was already liked
        } else {
             console.error('[commentLikesService likeComment] Error inserting like:', insertError);
             return false;
        }
    }

    return true;

  } catch (error) {
    console.error('[commentLikesService likeComment] Exception liking comment:', error);
    return false;
  }
};

export const unlikeComment = async (commentId: string): Promise<boolean> => {
  if (!supabase) {
    console.error('[commentLikesService unlikeComment] Supabase client not available');
    return false;
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('[commentLikesService unlikeComment] User not authenticated');
    return false;
  }

  try {
    // Delete the like
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', session.user.id)
      .eq('comment_id', commentId);

    if (error) {
      console.error('[commentLikesService unlikeComment] Error deleting like:', error);
      return false;
    }

    return true;

  } catch (error) {
    console.error('[commentLikesService unlikeComment] Exception unliking comment:', error);
    return false;
  }
};
