import { supabase } from '../../integrations/supabase/client';

// Helper to fetch profiles for a list of user IDs
export const fetchProfilesByIds = async (userIds: string[]): Promise<Map<string, { avatar_url: string | null; full_name: string | null }>> => {
    if (!supabase) return new Map();
    if (userIds.length === 0) return new Map();

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

        if (error) {
            console.error('[commentUtils fetchProfilesByIds] Error fetching profiles:', error);
            return new Map();
        }

        const profilesMap = new Map<string, { avatar_url: string | null; full_name: string | null }>();
        if (data) {
            data.forEach(profile => {
                profilesMap.set(profile.id, { full_name: profile.full_name, avatar_url: profile.avatar_url });
            });
        }
        return profilesMap;

    } catch (error) {
        console.error('[commentUtils fetchProfilesByIds] Exception fetching profiles:', error);
        return new Map();
    }
};
