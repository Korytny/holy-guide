# Архитектура системы записи реальных маршрутов

## Обзор
Система для записи и отображения реальных пешеходных маршрутов, которые показывают, как люди реально ходят, а не прямые линии между объектами.

## Текущая структура маршрутов
- Маршруты (`routes`) содержат список мест (`places`)
- Отображаются как прямые линии между точками
- Не учитывают реальные дороги и тропинки

## Новая архитектура

### 1. Таблицы базы данных

#### Таблица `route_tracks`
```sql
CREATE TABLE route_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  description TEXT,
  total_distance DECIMAL(10,2), -- в метрах
  total_duration INTEGER, -- в секундах
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Таблица `route_track_points`
```sql
CREATE TABLE route_track_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES route_tracks(id) ON DELETE CASCADE,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(10,8) NOT NULL,
  altitude DECIMAL(6,2), -- высота над уровнем моря
  accuracy DECIMAL(5,2), -- точность GPS в метрах
  speed DECIMAL(5,2), -- скорость в м/с
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sequence_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Типы данных TypeScript

```typescript
export interface RouteTrack {
  id: string;
  routeId: string;
  userId: string;
  name: string;
  description?: string;
  totalDistance: number; // meters
  totalDuration: number; // seconds
  recordedAt: Date;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  points?: RouteTrackPoint[];
}

export interface RouteTrackPoint {
  id: string;
  trackId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  timestamp: Date;
  sequenceNumber: number;
  createdAt: Date;
}
```

### 3. Процесс записи маршрута

#### Шаг 1: Начало записи
- Пользователь открывает админку на телефоне
- Нажимает "Записать маршрут"
- Выбирает существующий маршрут или создает новый
- Приложение запрашивает разрешение на доступ к геолокации

#### Шаг 2: Запись координат
- Приложение запускает `watchPosition` API
- Координаты записываются каждые 3-5 секунд
- Сохраняются: широта, долгота, точность, скорость, время
- Отображается прогресс на карте в реальном времени

#### Шаг 3: Остановка записи
- Пользователь нажимает "Остановить запись"
- Рассчитывается общее расстояние и время
- Данные сохраняются в базу
- Маршрут становится доступен для просмотра

### 4. Отображение маршрутов

#### На странице маршрута:
- Показывать все доступные треки для этого маршрута
- Возможность выбора между "Прямой маршрут" и "Реальный маршрут"
- Отображать статистику: расстояние, время, средняя скорость

#### В админке:
- Управление треками: публикация, удаление, редактирование
- Просмотр всех записанных маршрутов
- Статистика по популярным маршрутам

### 5. Технические детали

#### Геолокация API:
```javascript
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    const { latitude, longitude, accuracy, altitude, speed } = position.coords;
    // Сохранить точку
  },
  (error) => {
    console.error('GPS error:', error);
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 3000
  }
);
```

#### Оптимизация хранения:
- Одна запись трека ~100-500 точек (5-30 минут маршрута)
- Сжатие данных при необходимости
- Индексы для быстрого поиска

### 6. Преимущества подхода

1. **Точность**: Реальные пути, по которым ходят люди
2. **Гибкость**: Можно записывать разные варианты одного маршрута
3. **Сообщество**: Пользователи могут делиться своими маршрутами
4. **Автономность**: Не зависит от внешних API маршрутизации

### 7. Возможные улучшения

1. **Краудсорсинг**: Рейтинги и отзывы на маршруты
2. **Офлайн-режим**: Запись без интернета с последующей синхронизацией
3. **Аналитика**: Популярные отрезки, сезонные изменения
4. **Интеграция**: С фото и заметками по пути

## Следующие шаги

1. Создать миграции для новых таблиц
2. Реализовать API для работы с треками
3. Создать компоненты для записи и отображения
4. Протестировать на реальных маршрутах