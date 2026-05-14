# DnD Character Sheet — Telegram Mini App

Лист персонажа для игры по кастомным правилам, работающий прямо в Telegram.

---

## Структура проекта

```
├── frontend/       — HTML/CSS/JS лист персонажа (хостинг: GitHub Pages)
├── backend/        — Node.js + Express API (хостинг: Render.com)
├── database/       — SQL-схема для Supabase
└── README.md
```

---

## Шаг 1 — Создать базу данных в Supabase

1. Зайдите на [supabase.com](https://supabase.com) и зарегистрируйтесь (бесплатно).
2. Нажмите **New project**, придумайте название и пароль базы данных.
3. Дождитесь создания проекта (примерно 1–2 минуты).
4. В левом меню откройте **SQL Editor** → **New query**.
5. Скопируйте содержимое файла `database/schema.sql` и нажмите **Run**.
6. Перейдите в **Project Settings → API** и скопируйте:
   - **Project URL** → это ваш `SUPABASE_URL`
   - **anon / public** ключ → это ваш `SUPABASE_KEY`

---

## Шаг 2 — Создать Telegram-бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather).
2. Отправьте команду `/newbot` и следуйте инструкциям.
3. Скопируйте полученный **токен** (выглядит как `1234567890:ABCdef...`) → это ваш `BOT_TOKEN`.
4. Позже, после деплоя фронтенда, вернитесь к BotFather:
   - `/newapp` → выберите бота → вставьте URL фронтенда как Web App URL.

---

## Шаг 3 — Задеплоить бэкенд на Render.com

1. Загрузите папку `backend/` на GitHub (создайте репозиторий, если нет).
2. Зайдите на [render.com](https://render.com) → **New → Web Service**.
3. Подключите GitHub-репозиторий с папкой `backend/`.
4. Настройки:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Откройте вкладку **Environment** и добавьте переменные окружения:

   | Переменная       | Значение                              |
   |------------------|---------------------------------------|
   | `SUPABASE_URL`   | URL из шага 1                         |
   | `SUPABASE_KEY`   | anon-ключ из шага 1                   |
   | `BOT_TOKEN`      | токен из шага 2                       |
   | `ALLOWED_ORIGIN` | URL фронтенда (заполните после шага 4)|

6. Нажмите **Deploy**. Render покажет URL вида `https://your-app.onrender.com` — сохраните его.

> ⚠️ На бесплатном плане Render засыпает после 15 минут простоя.
> Первый запрос после сна занимает ~30 секунд — это нормально.

---

## Шаг 4 — Задеплоить фронтенд на GitHub Pages

1. Создайте новый репозиторий на GitHub (или используйте существующий).
2. Загрузите файл `frontend/index.html` в корень репозитория.
3. В репозитории откройте **Settings → Pages**.
4. В разделе **Source** выберите ветку `main` и папку `/ (root)`.
5. Нажмите **Save**. Через 1–2 минуты появится URL вида `https://username.github.io/repo-name`.
6. Откройте `frontend/index.html` и замените строку:
   ```js
   const API_URL = 'https://YOUR_BACKEND.onrender.com';
   ```
   на URL вашего бэкенда из шага 3.
7. Вернитесь на Render → Environment → обновите `ALLOWED_ORIGIN` на URL вашего GitHub Pages.

---

## Шаг 5 — Подключить Mini App к боту

1. Вернитесь к [@BotFather](https://t.me/BotFather).
2. Отправьте `/mybots` → выберите вашего бота → **Bot Settings → Menu Button**.
3. Вставьте URL GitHub Pages и название кнопки (например, «Лист персонажа»).
4. Теперь при открытии бота в Telegram внизу появится кнопка-меню, которая открывает лист персонажа.

---

## Локальная разработка

```bash
# Установить зависимости
cd backend
npm install

# Создать .env из примера
cp .env.example .env
# Заполните .env своими значениями

# Запустить сервер с авто-перезагрузкой
npm run dev
```

Фронтенд — просто откройте `frontend/index.html` в браузере.
В браузере `Telegram.WebApp` будет недоступен, поэтому `telegram_id` автоматически подставится как `dev_user` для локального тестирования.

---

## Эндпоинты API

| Метод | URL                            | Описание                        |
|-------|--------------------------------|---------------------------------|
| GET   | `/health`                      | Проверка работы сервера         |
| GET   | `/api/character/:telegram_id`  | Загрузить персонажа             |
| POST  | `/api/character/save`          | Сохранить персонажа             |
| POST  | `/api/auth/verify`             | Проверить подпись Telegram      |

### POST /api/character/save — тело запроса
```json
{
  "telegram_id": "123456789",
  "character_data": { ...весь объект S из лист персонажа... }
}
```
