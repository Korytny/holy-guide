// src/types/StoryTypes.ts

export interface Story {
  id: string; // Уникальный ID истории
  entity_type: 'city' | 'place' | 'route' | 'event'; // Тип сущности, к которой относится история
  entity_id: string; // ID сущности (города, места, маршрута, события)
  title?: Record<string, string> | null; // Заголовок истории по языкам { "en": "...", "ru": "..." } (опционально)
  text_content?: Record<string, string>; // Текстовое содержание истории по языкам { "en": "...", "ru": "..." }
  // audio_url теперь может быть динамическим или генерироваться по запросу
  // Оставляем его опциональным, если будем генестрировать на лету
  audio_url?: string; // URL к аудиофайлу истории (опционально, может генерироваться)
  created_at: string; // Дата создания записи
  // Добавьте другие поля, если они есть в вашей таблице Supabase
}

// Возможно, нам потребуется тип для запроса озвучки, если она делается отдельно
export interface TextToSpeechRequest {
  text: string;
  language: string; // Или более специфичный формат вроде 'ru-RU'
  // Дополнительные параметры для AI (например, voice, format)
}

export interface TextToSpeechResponse {
  audioUrl: string; // URL к сгенерированному аудиофайлу
  // Дополнительная информация (например, duration)
}
