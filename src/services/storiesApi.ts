// src/services/storiesApi.ts
import { supabase } from '../integrations/supabase/client';
import { Story, TextToSpeechResponse } from '../types/StoryTypes';

// Читаем URL функций и ANON ключ из переменных окружения
const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Fetches stories for a specific entity (place, city, route, event) from Supabase.
 * @param entityType The type of the entity ('city', 'place', 'route', 'event').
 * @param entityId The ID of the entity.
 * @returns A promise that resolves to an array of Story objects or an empty array if no stories are found or an error occurs.
 */
export const getStoriesByEntity = async (entityType: Story['entity_type'], entityId: string): Promise<Story[]> => {
  if (!supabase) {
    console.error('Supabase client is not initialized.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (error) {
      console.error(`Error fetching stories for ${entityType} ${entityId}:`, error);
      return [];
    }
    return (data as Story[]) || [];

  } catch (error) {
    console.error(`An unexpected error occurred while fetching stories for ${entityType} ${entityId}:`, error);
    return [];
  }
};

/**
 * Calls the backend Supabase Edge Function to generate audio from text and update the story record.
 * @param storyId The ID of the story record in the database.
 * @param text The text content to convert to speech.
 * @param languageCode The language code for the TTS service (e.g., 'ru', 'en').
 * @param entityType The type of the entity to associate the audio with.
 * @param entityId The ID of the entity to associate the audio with.
 * @returns A promise that resolves to the audio URL string or null if generation fails.
 */
export const generateAudioFromText = async (
    storyId: string,
    text: string,
    languageCode: string,
    entityType: Story['entity_type'],
    entityId: string
): Promise<string | null> => {
    // Проверяем наличие необходимых переменных окружения
    if (!SUPABASE_FUNCTIONS_URL) {
        console.error('VITE_SUPABASE_FUNCTIONS_URL is not defined or accessible.');
        return null;
    }
    if (!SUPABASE_ANON_KEY) {
        console.error('VITE_SUPABASE_ANON_KEY is not defined or accessible.');
        return null;
    }

    // Используем подтвержденное рабочее имя эндпоинта
    const ttsEndpoint = `${SUPABASE_FUNCTIONS_URL}/generateAudioFromText`;

    try {
        const headersToSend = {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
        };
        const bodyToSend = {
            storyId,
            text,
            languageCode,
            entityType,
            entityId
        };

        const response = await fetch(ttsEndpoint, {
            method: 'POST',
            headers: headersToSend,
            body: JSON.stringify(bodyToSend)
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData: { error?: string; details?: string } = { details: errorText };
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                 // Оставляем текст ошибки в details, если это не JSON
            }
            console.error('TTS Edge Function error:', response.status, errorData);
            return null;
        }

        const data: TextToSpeechResponse = await response.json();

        if (data.audioUrl) {
            return data.audioUrl;
        } else {
            console.error('TTS Edge Function response missing audioUrl.', data);
            return null;
        }

    } catch (error) {
        console.error('Error calling TTS Edge Function (fetch failed?):', error);
        return null;
    }
};