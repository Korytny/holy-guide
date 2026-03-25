# 🔐 Supabase доступ для разработчиков

## 📋 Обзор

Этот документ описывает процесс подключения к общему Supabase проекту для разработчиков приложения **Бхагават-гита**.

### 📌 Важная информация

- **Общая база пользователей** с проектом HolySpots
- **Таблица `auth.users`** — системная таблица Supabase (единая для всех проектов)
- **Таблица `profiles`** — профили пользователей с избранным (cities, routes, events, places)
- **RLS политики** защищают данные — пользователи могут редактировать только свои профили

---

## 👤 Создание новых пользователей (Регистрация)

### Способ 1: Email + Пароль (рекомендуемый)

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123',
  options: {
    data: {
      full_name: 'Имя Пользователя',
    },
    emailRedirectTo: 'https://bhagavad-gita.app/auth/callback'
  }
})

if (error) {
  console.error('Ошибка регистрации:', error.message)
} else {
  console.log('✅ Пользователь создан:', data.user)
  // Профиль в profiles создаётся автоматически через триггер
}
```

**Что происходит:**
1. Пользователь вводит email/password в форму регистрации
2. Вызывается `supabase.auth.signUp()`
3. Пользователь создаётся в таблице `auth.users` (системная таблица Supabase)
4. **Автоматически** создаётся запись в `profiles` (триггер `handle_new_user`)

---

### Способ 2: Magic Link (без пароля)

```typescript
// Отправить magic link на email
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com'
})

if (error) {
  console.error('Ошибка:', error.message)
} else {
  console.log('✅ Magic Link отправлен на email')
}
```

Пользователь получает ссылку на email и входит без пароля.

---

### Способ 3: OAuth провайдеры (Google, GitHub и т.д.)

```typescript
// Вход через Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://bhagavad-gita.app/auth/callback'
  }
})
```

**Настройка в Dashboard:**
- Authentication → Providers
- Включите Google/GitHub/Facebook
- Укажите Site URL и Redirect URLs

---

### Пример компонента регистрации (React)

```tsx
// components/RegisterForm.tsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    setLoading(false)

    if (error) {
      alert('❌ Ошибка регистрации: ' + error.message)
    } else {
      alert('✅ Пользователь создан! Проверьте email для подтверждения.')
      // Перенаправить на страницу входа или dashboard
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <div>
        <label>Имя</label>
        <input
          type="text"
          placeholder="Введите имя"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Email</label>
        <input
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Пароль</label>
        <input
          type="password"
          placeholder="Минимум 6 символов"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>
    </form>
  )
}
```

---

### ⚙️ Настройки Email подтверждений

**Dashboard → Authentication → Settings → Email Auth**

| Опция | Рекомендуемое значение |
|-------|------------------------|
| **Enable Email Signups** | ✅ Включено |
| **Enable Email Confirmations** | ⚠️ На ваше усмотрение |
| **Site URL** | `https://bhagavad-gita.app` |
| **Redirect URLs** | `https://bhagavad-gita.app/auth/callback` |

**Если Email Confirmations включено:**
- Пользователь получает письмо со ссылкой подтверждения
- До подтверждения не может войти в систему
- Нужно настроить redirect URL для обработки подтверждения

**Если выключено:**
- Пользователь входит сразу после регистрации
- Проще для тестирования и разработки

---

### 🗄️ Автоматическое создание профиля

После регистрации пользователя в `auth.users`, триггер автоматически создаёт запись в `profiles`:

```sql
-- Триггер создаётся один раз в Dashboard → SQL Editor
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Проверка наличия триггера:**

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

---

## 🔑 Подключение к Supabase

### Переменные окружения

Добавьте эти значения в ваш `.env` или `.env.local` файл:

```bash
# Supabase Project URL
VITE_SUPABASE_URL=https://rxvckkqqunyqtxjyabub.supabase.co

# Supabase Anon Key (публичный ключ для фронтенда)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dmNra3FxdW55cXR4anlhYnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE4NzU1MzAsImV4cCI6MjAzNzQ1MTUzMH0.9DiNza2x0UEuGTAgtOz0StXW962pDF6S8b27_Igz6v4

# Supabase Functions URL (опционально, для Edge Functions)
VITE_SUPABASE_FUNCTIONS_URL=https://rxvckkqqunyqtxjyabub.supabase.co/functions/v1
```

### Установка клиента

```bash
npm install @supabase/supabase-js
# или
bun add @supabase/supabase-js
```

### Инициализация

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

## 🚀 Аутентификация

### Регистрация нового пользователя

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123',
  options: {
    data: {
      full_name: 'Имя Пользователя',
    }
  }
})

if (error) {
  console.error('Registration error:', error)
} else {
  console.log('User registered:', data.user)
}
```

### Вход

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securePassword123'
})

if (error) {
  console.error('Login error:', error)
} else {
  console.log('Logged in:', data.user)
}
```

### Выход

```typescript
await supabase.auth.signOut()
```

### Получение текущего пользователя

```typescript
const { data: { user }, error } = await supabase.auth.getUser()

if (user) {
  console.log('Current user:', user)
  console.log('User ID:', user.id)
  console.log('Email:', user.email)
}
```

### Подписка на изменения аутентификации

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in')
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out')
  }
})
```

---

## 📊 Работа с таблицей `profiles`

### Структура таблицы

```sql
profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name       TEXT,
  avatar_url      TEXT,
  cities_like     UUID[],
  routes_like     UUID[],
  events_like     UUID[],
  places_like     UUID[],
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ
)
```

### Получить профиль пользователя

```typescript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

### Обновить профиль

```typescript
const { error } = await supabase
  .from('profiles')
  .update({
    full_name: 'Новое Имя',
    avatar_url: 'https://example.com/avatar.jpg'
  })
  .eq('id', userId)
```

### Добавить в избранное

```typescript
// Получить текущий профиль
const { data: profile } = await supabase
  .from('profiles')
  .select('cities_like')
  .eq('id', userId)
  .single()

// Добавить city_id в массив
const updatedCities = [...(profile.cities_like || []), cityId]

// Обновить профиль
await supabase
  .from('profiles')
  .update({ cities_like: updatedCities })
  .eq('id', userId)
```

---

## 🔒 Безопасность и RLS

### Row Level Security (RLS)

Таблица `profiles` защищена RLS политиками:

```sql
-- Профили видны всем
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Пользователь может обновлять только свой профиль
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Пользователь может вставлять только свой профиль
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

### Проверка доступа

Перед запросом убедитесь что пользователь авторизован:

```typescript
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  console.error('User not authenticated')
  return
}

// Теперь можно делать запросы
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

---

## ⚠️ Важные предупреждения

### 🚫 НЕ передавайте никому:

| Данные | Причина |
|--------|---------|
| **service_role key** | Полный доступ ко всем данным, обходит RLS |
| **Database password** | Прямой доступ к PostgreSQL |
| **JWT secret** | Позволяет подделывать токены пользователей |
| **Email подтверждения** | Доступ к аккаунтам пользователей |

### ✅ МОЖНО передавать:

| Данные | Кому |
|--------|------|
| **anon key** | Фронтенд-разработчикам |
| **project URL** | Всем разработчикам |
| **функции URL** | Разработчикам Edge Functions |

---

## 🛠️ Отладка и мониторинг

### Проверка подключения

```typescript
// Простой запрос для проверки
const { data, error } = await supabase
  .from('profiles')
  .select('id')
  .limit(1)

if (error) {
  console.error('Connection error:', error)
} else {
  console.log('Connected successfully!')
}
```

### Логи Supabase

- **Dashboard**: https://rxvckkqqunyqtxjyabub.supabase.co
- **Logs**: Database → Logs
- **Auth Logs**: Authentication → Audit Log

---

## 📚 Дополнительные ресурсы

### Документация

- [Supabase Docs](https://supabase.com/docs)
- [Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgREST API](https://supabase.com/docs/guides/api)

### Примеры кода

- [Supabase JS Client Examples](https://github.com/supabase/supabase-js#examples)

---

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте что `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` правильные
2. Убедитесь что пользователь авторизован (`auth.getUser()`)
3. Проверьте RLS политики в Dashboard
4. Посмотрите логи в Supabase Dashboard

---

*Последнее обновление: 2026-03-08*
*Проект: HolySpots + Бхагават-гита*
