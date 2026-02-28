import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Square, Trash2, MapPin, Clock, Navigation } from 'lucide-react';
import { routeTrackApi } from '@/lib/api/routeTrack';

interface RouteTrackerProps {
  routeId: string;
  onTrackUpdate?: (points: any[]) => void;
}

interface TrackStats {
  totalPoints: number;
  startTime: string | null;
  endTime: string | null;
  points: any[];
}

export function RouteTracker({ routeId, onTrackUpdate }: RouteTrackerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [trackStats, setTrackStats] = useState<TrackStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [pointCount, setPointCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadTrackStats();
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [routeId]);

  const loadTrackStats = async () => {
    try {
      const stats = await routeTrackApi.getTrackStats(routeId);
      setTrackStats(stats);
      setPointCount(stats.totalPoints);
      onTrackUpdate?.(stats.points);
    } catch (err) {
      console.error('Error loading track stats:', err);
    }
  };

  const startRecording = async () => {
    setError(null);

    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        setError('Геолокация недоступна на этом устройстве');
        return;
      }

      // Request permission
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        setError('Доступ к геолокации запрещен. Пожалуйста, разрешите доступ в настройках браузера.');
        return;
      }

      setIsRecording(true);
      setCurrentPosition(null);

      // Start watching position
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentPosition(coords);

          // Save point to database
          try {
            await routeTrackApi.addTrackPoint(routeId, coords, pointCount);
            setPointCount(prev => prev + 1);
            await loadTrackStats(); // Refresh stats
          } catch (err) {
            console.error('Error saving track point:', err);
            setError('Ошибка сохранения точки трека');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Ошибка геолокации: ';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Доступ запрещен';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Позиция недоступна';
              break;
            case error.TIMEOUT:
              errorMessage += 'Таймаут получения позиции';
              break;
            default:
              errorMessage += 'Неизвестная ошибка';
          }

          setError(errorMessage);
          stopRecording();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        }
      );

      setWatchId(id);

      // Start recording points every second
      intervalRef.current = setInterval(async () => {
        if (currentPosition) {
          try {
            await routeTrackApi.addTrackPoint(routeId, currentPosition, pointCount);
            setPointCount(prev => prev + 1);
            await loadTrackStats();
          } catch (err) {
            console.error('Error recording point:', err);
          }
        }
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Ошибка начала записи трека');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Load final stats
    loadTrackStats();
  };

  const deleteTrack = async () => {
    try {
      await routeTrackApi.deleteRouteTrack(routeId);
      setTrackStats(null);
      setPointCount(0);
      setCurrentPosition(null);
      onTrackUpdate?.([]);
      setError(null);
    } catch (err) {
      console.error('Error deleting track:', err);
      setError('Ошибка удаления трека');
    }
  };

  const formatDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    if (hours > 0) {
      return `${hours}ч ${minutes}м ${seconds}с`;
    } else if (minutes > 0) {
      return `${minutes}м ${seconds}с`;
    } else {
      return `${seconds}с`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          GPS Трекинг маршрута
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={startRecording}
            disabled={isRecording}
            variant={isRecording ? "secondary" : "default"}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Запись
          </Button>

          <Button
            onClick={stopRecording}
            disabled={!isRecording}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            Остановить
          </Button>

          <Button
            onClick={deleteTrack}
            disabled={isRecording || (!trackStats?.totalPoints)}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Удалить
          </Button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <Badge variant={isRecording ? "destructive" : "secondary"}>
            {isRecording ? "Запись идет" : "Нет записи"}
          </Badge>

          {currentPosition && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              GPS активен
            </Badge>
          )}
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Track Information */}
        {trackStats && trackStats.totalPoints > 0 && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Информация о треке
            </h4>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Точек записано:</span>
                <div className="text-lg font-bold">{trackStats.totalPoints}</div>
              </div>

              {trackStats.startTime && (
                <div>
                  <span className="font-medium">Время начала:</span>
                  <div>{new Date(trackStats.startTime).toLocaleString()}</div>
                </div>
              )}

              {trackStats.endTime && trackStats.startTime && (
                <div>
                  <span className="font-medium">Длительность:</span>
                  <div>{formatDuration(trackStats.startTime, trackStats.endTime)}</div>
                </div>
              )}

              {currentPosition && isRecording && (
                <div>
                  <span className="font-medium">Текущая позиция:</span>
                  <div className="text-xs">
                    {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isRecording && (!trackStats || trackStats.totalPoints === 0) && (
          <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
            <p><strong>Инструкция:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Нажмите "Запись" чтобы начать трекинг маршрута</li>
              <li>Разрешите доступ к геолокации в браузере</li>
              <li>Пройдите по маршруту - приложение будет записывать координаты каждую секунду</li>
              <li>Нажмите "Остановить" когда закончите</li>
              <li>Записанный трек будет отображаться на карте</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}