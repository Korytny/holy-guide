import React from 'react';
import { Event } from '../../types'; // Adjust path
import { useLanguage } from '../../context/LanguageContext'; // Adjust path
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";
import { getLocalizedText } from '../../utils/languageUtils'; // Adjust path

interface EventAboutProps {
  event: Event;
}

const EventAbout: React.FC<EventAboutProps> = ({ event }) => {
    const { language, t } = useLanguage();
    const { fonts } = useFont();
    const descriptionParts = [
        getLocalizedText(event.description, language),
        getLocalizedText(event.info, language)
    ].filter(text => text && text.trim());

    return (
         <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
               <h2 className={cn(
                 "text-xl md:text-2xl font-bold mb-4 text-[#09332A]",
                 fonts.heading.className
               )}>{t('about_event')}</h2>
             {descriptionParts.length > 0 ? (
                <div className={cn(
                  "space-y-3 prose max-w-none text-black",
                  fonts.body.className
                )}>
                   {descriptionParts.map((part, index) => (
                        <p key={index} className="mb-4 last:mb-0">{part}</p>
                   ))}
                </div>
             ) : (
                 <p className="text-gray-500 italic">{t('no_description_available')}</p>
             )}
           </div>
    );
}

export default EventAbout;
