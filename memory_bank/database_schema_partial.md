# Частичная схема базы данных (извлечено из вывода пользователя)

## Таблица `public.cities`

Из `information_schema.columns`:
```json
[
  {
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "column_name": "name",
    "data_type": "jsonb",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "info",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "spots_count",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "routes_count",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "events_count",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "country",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "images",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  }
]
```

## Таблица `public.spots`

Поля из `INSERT` запроса:
- `id` (предположительно `uuid`, PK)
- `name`
- `city` (предположительно `uuid`, FK к `cities.id`)
- `created_at`
- `point`
- `type`
- `id_old`
- `info`
- `cityeng_old`
- `images`
- `raiting`

## Таблица `public.routes`

Поля из `INSERT` запроса:
- `id` (предположительно `uuid`, PK)
- `name`
- `info`
- `images`

## Таблица `public.events`

Поля из `INSERT` запроса:
- `id` (предположительно `uuid`, PK)
- `name`
- `info`
- `type`
- `time`
- `images`
- `city_id` (предположительно `uuid`, FK к `cities.id`) - **Важно: прямая связь с городом**
- `event_category`
- `culture`
- `has_online_stream`
- `end_time`
- `views_count`
- `favorites_count`

## Таблица `public.spot_event`

Структура неизвестна, но используется функцией `count_distinct_events_for_city` и должна содержать как минимум:
- `event_id` (FK к `events.id`)
- `spot_id` (FK к `spots.id`)
