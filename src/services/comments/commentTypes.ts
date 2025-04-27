import { Session } from '@supabase/supabase-js';

export interface Comment {
  id: string;
  created_at: string;
  user_id: string;
  entity_type: 'city' | 'place' | 'route' | 'event';
  entity_id: string;
  text: string;
  photo_url: string[] | null; // Changed to string[] | null
  // Add user profile info if needed, e.g., avatarUrl, fullName
  profile?: { avatar_url: string | null; full_name: string | null };
  // Added for likes functionality
  likes_count: number; // Total count of likes for this comment
  is_liked_by_user?: boolean; // Whether the current user has liked this comment
}

export interface CommentLike {
  user_id: string;
  comment_id: string;
  created_at: string;
}
