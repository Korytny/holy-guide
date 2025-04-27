import React from 'react';
import { Place } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
import { getLocalizedText } from '../../utils/languageUtils'; // Adjust path as needed

interface PlaceAboutProps {
  place: Place;
}

const PlaceAbout: React.FC<PlaceAboutProps> = ({ place }) => {
    const { language, t } = useLanguage();
    const descriptionParts = [
        getLocalizedText(place.description, language),
        getLocalizedText(place.info, language)
    ].filter(text => text && text.trim());

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
             <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('about_place')}</h2>
            {descriptionParts.length > 0 ? (
                <div className="prose max-w-none text-gray-700">
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

export default PlaceAbout;
