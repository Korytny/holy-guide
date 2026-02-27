#!/bin/bash

# Supabase REST API Query Script
# Использование: ./supabase_query.sh "TABLE_NAME"

SUPABASE_URL="https://rxvckkqqunyqtxjyabub.supabase.co"
# Anon key из .env - для чтения публичных данных
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dmNra3FxdW55cXR4anlhYnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE4NzU1MzAsImV4cCI6MjAzNzQ1MTUzMH0.9DiNza2x0UEuGTAgtOz0StXW962pDF6S8b27_Igz6v4"

TABLE_NAME="${1:-spots}"

echo "Fetching data from table: $TABLE_NAME"
echo "URL: $SUPABASE_URL"
echo "---"

# Получаем все записи (по 1000 за раз, Supabase лимит)
OFFSET=0
BATCH_SIZE=1000
TOTAL=0

while true; do
    RESPONSE=$(curl -s "$SUPABASE_URL/rest/v1/$TABLE_NAME?select=*&limit=$BATCH_SIZE&offset=$OFFSET" \
        -H "apikey: $ANON_KEY" \
        -H "Authorization: Bearer $ANON_KEY" \
        -H "Content-Type: application/json")

    # Проверяем, есть ли данные
    COUNT=$(echo "$RESPONSE" | jq '. | length' 2>/dev/null || echo "0")

    if [ "$COUNT" = "0" ] || [ "$RESPONSE" = "[]" ]; then
        break
    fi

    TOTAL=$((TOTAL + COUNT))
    echo "Batch starting at $OFFSET: $COUNT records"

    # Выводим данные
    echo "$RESPONSE" | jq -r '.[] | @json' >> "${TABLE_NAME}_export.jsonl"

    OFFSET=$((OFFSET + BATCH_SIZE))

    # Если получили меньше batch_size - это последняя порция
    if [ "$COUNT" -lt "$BATCH_SIZE" ]; then
        break
    fi
done

echo "---"
echo "Total records exported: $TOTAL"
echo "Saved to: ${TABLE_NAME}_export.jsonl"
