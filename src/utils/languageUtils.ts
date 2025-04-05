
import { Language } from '../types';

/**
 * Helper function to extract localized text from a string or object based on the current language
 */
export const getLocalizedText = (
  textObj: string | { [key in Language]?: string } | undefined,
  currentLanguage: Language = 'en',
  defaultText: string = ''
): string => {
  if (!textObj) return defaultText;
  
  if (typeof textObj === 'string') return textObj;
  
  // Try to get text in current language
  if (textObj[currentLanguage]) return textObj[currentLanguage] as string;
  
  // Fall back to English
  if (textObj.en) return textObj.en;
  
  // If no match, return first available translation or default
  const firstKey = Object.keys(textObj)[0] as Language;
  return firstKey && textObj[firstKey] ? textObj[firstKey] as string : defaultText;
};
