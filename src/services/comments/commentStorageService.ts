import { supabase } from '../../integrations/supabase/client';
// Removed unused FileObject type import

// Helper to upload a file to Supabase Storage
// Returns the public URL string upon successful upload
export const uploadCommentPhoto = async (file: File, userId: string, commentId: string): Promise<string | null> => {
    if (!supabase) {
      console.error('[commentStorageService uploadCommentPhoto] Supabase client not available');
      return null;
    }
    // Create a unique file path in the bucket (e.g., comments/userId/commentId/timestamp_filename)
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().getTime();
    const fileName = `${commentId}_${timestamp}.${fileExt}`;
    const filePath = `${userId}/${commentId}/${fileName}`;

    try {
        const { data, error: uploadError } = await supabase.storage
            .from('comments') // Your public bucket name
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
            console.error('[commentStorageService uploadCommentPhoto] Error uploading file:', uploadError);
            return null;
        }

        // Get the public URL of the uploaded file directly after successful upload
        const { data: { publicUrl } } = supabase.storage
            .from('comments')
            .getPublicUrl(filePath);

        return publicUrl; // Return the public URL string

    } catch (error) {
        console.error('[commentStorageService uploadCommentPhoto] Exception uploading file:', error);
        return null;
    }
};

// Helper to get public URL from file path
export const getPublicPhotoUrl = (filePath: string): string => {
    if (!supabase) {
        console.error('[commentStorageService getPublicPhotoUrl] Supabase client not available');
        return ''; // Return empty string or default placeholder
    }
     const { data: { publicUrl } } = supabase.storage
        .from('comments')
        .getPublicUrl(filePath);

    return publicUrl;
};

// Helper to delete photos from storage by their paths
export const deleteCommentPhotosByPaths = async (filePaths: string[]): Promise<boolean> => {
     if (!supabase) {
        console.error('[commentStorageService deleteCommentPhotosByPaths] Supabase client not available');
        return false;
     }
     if (filePaths.length === 0) return true; // Nothing to delete

     try {
         const { error: deleteError } = await supabase.storage
             .from('comments')
             .remove(filePaths);

         if (deleteError) {
             console.error('[commentStorageService deleteCommentPhotosByPaths] Error deleting photos from storage:', deleteError);
             return false;
         }

         return true;

     } catch (error) {
        console.error('[commentStorageService deleteCommentPhotosByPaths] Exception deleting photos from storage:', error);
        return false;
     }
};

// Helper to extract file path from public URL
const extractFilePathFromPublicUrl = (publicUrl: string): string | null => {
    if (!publicUrl) return null;
    const urlParts = publicUrl.split('/storage/v1/object/public/comments/');
    return urlParts.length > 1 ? urlParts[1] : null;
};

// Optional: Add a function to delete photos from storage by their URLs
export const deleteCommentPhotosByUrls = async (photoUrls: string[]): Promise<boolean> => {
    if (!supabase) {
        console.error('[commentStorageService deleteCommentPhotosByUrls] Supabase client not available');
        return false;
     }
     if (photoUrls.length === 0) return true; // Nothing to delete

     const filePathsToDelete = photoUrls.map(url => extractFilePathFromPublicUrl(url)).filter(path => path !== null) as string[];

     if (filePathsToDelete.length === 0) return true;

     return deleteCommentPhotosByPaths(filePathsToDelete);
};
