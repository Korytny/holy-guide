// supabase/functions/update-city-stats/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Update City Stats function initializing...')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Создаем клиента Supabase с правами service_role для обхода RLS
    // ПРИМЕЧАНИЕ: Убедитесь, что переменные окружения SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY
    // установлены в настройках вашей функции в Supabase Dashboard.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Fetching cities...')
    // 1. Получаем ID всех городов
    const { data: cities, error: citiesError } = await supabaseAdmin
      .from('cities')
      .select('id')

    if (citiesError) {
      throw new Error(`Error fetching cities: ${citiesError.message}`)
    }

    if (!cities || cities.length === 0) {
      console.log('No cities found to update.')
      return new Response(JSON.stringify({ message: 'No cities found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`Found ${cities.length} cities. Starting updates...`)
    const updatePromises = []

    // 2. Проходим по каждому городу и считаем статистику
    for (const city of cities) {
      const cityId = city.id

      console.log(`Processing city ${cityId}...`)

      // Параллельно запускаем подсчеты для одного города
      const countPromises = [
        // Count spots directly linked to the city
        supabaseAdmin.from('spots').select('id', { count: 'exact', head: true }).eq('city', cityId),
        // Count distinct routes linked via spots in the city
        supabaseAdmin.rpc('count_distinct_routes_for_city', { city_id_param: cityId }),
        // Count distinct events linked via spots in the city
        supabaseAdmin.rpc('count_distinct_events_for_city', { city_id_param: cityId }),
      ]

      const [spotsResult, routesResult, eventsResult] = await Promise.allSettled(countPromises)

      // Обработка результатов подсчета
      let spots_count = 0
      if (spotsResult.status === 'fulfilled' && !spotsResult.value.error) {
        spots_count = spotsResult.value.count ?? 0
        console.log(` City ${cityId} - Spots count: ${spots_count}`)
      } else {
        console.error(` City ${cityId} - Error counting spots:`, spotsResult.status === 'rejected' ? spotsResult.reason : spotsResult.value.error)
      }

      let routes_count = 0
      if (routesResult.status === 'fulfilled' && !routesResult.value.error) {
        routes_count = routesResult.value.data ?? 0
         console.log(` City ${cityId} - Routes count: ${routes_count}`)
      } else {
        console.error(` City ${cityId} - Error counting routes:`, routesResult.status === 'rejected' ? routesResult.reason : routesResult.value.error)
      }

      let events_count = 0
      if (eventsResult.status === 'fulfilled' && !eventsResult.value.error) {
         events_count = eventsResult.value.data ?? 0
         console.log(` City ${cityId} - Events count: ${events_count}`)
      } else {
         console.error(` City ${cityId} - Error counting events:`, eventsResult.status === 'rejected' ? eventsResult.reason : eventsResult.value.error)
      }


      // 3. Добавляем обещание обновления в массив
      updatePromises.push(
        supabaseAdmin
          .from('cities')
          .update({
            spots_count: spots_count,
            routes_count: routes_count,
            events_count: events_count,
            updated_at: new Date().toISOString(), // Обновляем время
          })
          .eq('id', cityId)
      )
    }

    // 4. Выполняем все обновления
    console.log('Executing all update promises...')
    const results = await Promise.allSettled(updatePromises)

    // Проверяем результаты обновлений
    let successCount = 0
    let errorCount = 0
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && !result.value.error) {
        successCount++
      } else {
        errorCount++
        const cityId = cities[index].id
        console.error(`Error updating city ${cityId}:`, result.status === 'rejected' ? result.reason : result.value.error)
      }
    })

    const message = `Stats update finished. ${successCount} cities updated successfully, ${errorCount} failed.`
    console.log(message)

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Critical error in function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

/* ВАЖНО: Для подсчета маршрутов и событий нужны вспомогательные SQL-функции.
   Выполните следующий SQL в вашем Supabase SQL Editor:

-- Функция для подсчета уникальных маршрутов для города
CREATE OR REPLACE FUNCTION count_distinct_routes_for_city(city_id_param uuid)
RETURNS integer AS $$
DECLARE
    route_count integer;
BEGIN
    SELECT count(DISTINCT sr.route_id)
    INTO route_count
    FROM public.spot_route sr
    JOIN public.spots s ON sr.spot_id = s.id
    WHERE s.city = city_id_param;

    RETURN route_count;
END;
$$ LANGUAGE plpgsql;

-- Функция для подсчета уникальных событий для города
CREATE OR REPLACE FUNCTION count_distinct_events_for_city(city_id_param uuid)
RETURNS integer AS $$
DECLARE
    event_count integer;
BEGIN
    SELECT count(DISTINCT se.event_id)
    INTO event_count
    FROM public.spot_event se
    JOIN public.spots s ON se.spot_id = s.id
    WHERE s.city = city_id_param;

    RETURN event_count;
END;
$$ LANGUAGE plpgsql;

-- Не забудьте дать права на выполнение этим функциям
GRANT EXECUTE ON FUNCTION count_distinct_routes_for_city(uuid) TO anon;
GRANT EXECUTE ON FUNCTION count_distinct_routes_for_city(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION count_distinct_events_for_city(uuid) TO anon;
GRANT EXECUTE ON FUNCTION count_distinct_events_for_city(uuid) TO authenticated;

*/
