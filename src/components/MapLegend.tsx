import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { cn } from "@/lib/utils";

interface MapLegendProps {
  className?: string;
  showGpsTrack?: boolean;
  showRoute?: boolean;
}

const MapLegend: React.FC<MapLegendProps> = ({
  className,
  showGpsTrack = false,
  showRoute = false
}) => {
  const { t } = useLanguage();

  if (!showGpsTrack && !showRoute) {
    return null;
  }

  return (
    <div className={cn(
      "absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-2 min-w-[140px]",
      className
    )}>
      <div className="text-xs font-semibold text-gray-700 mb-2">
        {t('legend') || 'Легенда'}
      </div>

      {showGpsTrack && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-gray-600">
            {t('gps_track') || 'GPS трек'}
          </span>
        </div>
      )}

      {showRoute && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-0 border-t-2 border-dashed border-red-500"></div>
          <span className="text-xs text-gray-600">
            {t('planned_route') || 'Плановый маршрут'}
          </span>
        </div>
      )}
    </div>
  );
};

export default MapLegend;