import React from 'react';
import { Place } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
import { getLocalizedText } from '../../utils/languageUtils'; // Adjust path as needed
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";

interface PlaceAboutProps {
  place: Place;
}

const PlaceAbout: React.FC<PlaceAboutProps> = ({ place }) => {
    const { language, t } = useLanguage();
    const { fonts } = useFont();
    const descriptionParts = [
        getLocalizedText(place.description, language),
        getLocalizedText(place.info, language)
    ].filter(text => text && text.trim());

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
             <h2 className={cn(
               "text-xl md:text-2xl font-bold mb-4 text-[#09332A]",
               fonts.heading.className
             )}>{t('about_place')}</h2>
             <div className={cn(
               "space-y-3 prose max-w-none text-black",
               fonts.body.className
             )}>
                {descriptionParts.length > 0 ? (
                    descriptionParts.map((part, index) => (
                        <p key={index}>{part}</p>
                    ))
                ) : (
                    <p className="text-gray-500 italic">{t('no_description_available')}</p>
                )}
             </div>
        </div>
    );
}

export default PlaceAbout;
