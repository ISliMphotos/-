# Лист персонажа Забытой истории — CLAUDE.md

## Что это

Мини-приложение для ведения листа персонажа в настольной RPG «Забытая история». Работает внутри Telegram и VK как Mini App. Позволяет игрокам вести характеристики, инвентарь, алхимию, квесты и НПС прямо в мессенджере.

---

## Стек

| Слой | Технологии |
|------|-----------|
| Frontend | Vanilla JS, HTML5, CSS3 — без фреймворков и сборщиков |
| Backend | Node.js + Express.js |
| База данных | Supabase (PostgreSQL, JSONB-колонка) |
| Telegram SDK | `telegram-web-app.js` |
| VK SDK | `@vkontakte/vk-bridge` |
| Хостинг frontend | GitHub Pages |
| Хостинг backend | Render.com |

---

## Структура папок

```
├── index.html          # Telegram Mini App (точка входа TG)
├── shared.js           # Весь игровой JS (~2400 строк) — подключается и TG, и VK
├── vk/
│   └── index.html      # VK Mini App (точка входа VK, подключает ../shared.js)
├── frontend/
│   └── index.html      # Копия для локального тестирования (npx serve -p 5500 .)
├── view/
│   └── index.html      # Read-only просмотр персонажа для мастера
├── master/
│   └── index.html      # Комната мастера — видит всех игроков в реальном времени
├── backend/
│   ├── server.js       # Express API (~400 строк)
│   ├── package.json
│   └── .env.example    # Шаблон переменных окружения
├── database/
│   └── schema.sql      # PostgreSQL схема для Supabase
├── design.md           # Дизайн-система: палитра, CSS-классы, модалы, мобильный UX
└── CLAUDE.md
```

---

## Архитектура frontend

### Разделение TG / VK

`index.html` и `vk/index.html` — тонкие обёртки (~210 строк каждый): CSS + HTML-каркас + платформенный JS. Весь игровой код — в `shared.js`.

Платформенная абстракция реализована через объект `PLAT`, который определяется в каждой обёртке до загрузки `shared.js`:

```js
var PLAT = {
  name: 'telegram',            // или 'vk'
  hasUser: function() { ... }, // есть ли авторизованный пользователь
  userId: function() { ... }   // ID пользователя
};
```

Порядок загрузки в HTML:
1. Инлайн-скрипт: объявляет `PLAT`, `initApp`, `loadCharacter`, `saveCharacter`, UI-функции
2. `<script src="shared.js">` — подключает весь общий код
3. `<script>initApp();</script>` — запускает приложение

### Глобальное состояние

Весь текущий персонаж хранится в объекте `S`. Структура `S` зеркалит `defaultChar()` — при загрузке с сервера данные мержатся с дефолтами для совместимости.

```js
let S = {
  name, level, exp, expNext,
  attributes: { strength, agility, vitality, intellect, trade, talent },
  currentHP, gold,
  professions[], skills[], weapons[], armors[], accessories[],
  alchDB[], alchInventory[], procRecipes[], alchRecipes[], alchCircleRecipes[],
  quests[], npcs[], achievements[],
  hpLog[], goldLog[],
  notes, alchSuccessChance, ...
}
```

### Мультислоты

До 5 персонажей на аккаунт. Хранятся в массиве `slots[]`, активный — в `S`. При переключении: `saveCurrentSlot()` → `applySlot(idx)` → `render()`.

### Сохранение

Автосохранение с дебаунсом 2 секунды через `scheduleSave()`. Ручное сохранение — кнопка «Сохранить» (показывает уведомление). На сервер данные уходят как JSON всего объекта `S`.

### Рендеринг

Один `render()` перерисовывает текущую вкладку. Вкладки: `char`, `skills`, `inventory`, `alchemy`, `qnpc`.  
Вкладка `alchemy` появляется только если у персонажа есть профессия с `knowledgeArea === "Алхимия"`.  
Вкладка «Профессии» убрана — профессии отображаются внутри вкладки «Персонаж».

### UI STATE

Переменные состояния UI — глобальные `let` в `shared.js`:

```js
let tab = 'char';
let invOpen = { weapons:true, armors:true, ... };
let alchSectOpen = { inv:true, proc:true, recipes:true, circle:true, base:true, hist:true };
let alchInvSortVisible=false, alchBaseSortVisible=false;
let alchInvGroupVisible=false, alchBaseGroupVisible=false;
let charSecState = { prof:false, props:false, titles:false, ach:false, notes:false };
let questTasksOpen = {};   // { [questId]: bool }
```

`charSecState` и `alchSectOpen` сохраняют collapse-состояние секций между вызовами `render()`, т.к. DOM перерисовывается полностью.

### Двойная система модалов

- **Динамические** (`openMod(html)/closeMod()`): старые модалы генерируются в JS
- **Статические** (`openModal(id)/closeModal(id)`): новые модалы заранее в HTML, показываются классом `.open`

---

## Backend API

Базовый URL хардкодится в `index.html`: `const BACKEND_URL = 'https://dnd-sheet-backend-bejb.onrender.com'`

| Метод | Маршрут | Назначение |
|-------|---------|-----------|
| GET | `/health` | Пинг для предотвращения засыпания Render |
| POST | `/api/auth/verify` | Верификация Telegram `initData` (HMAC-SHA256) |
| GET | `/api/character/:tg_id` | Загрузка персонажа по Telegram ID |
| POST | `/api/character/save` | Сохранение персонажа (TG) |
| GET | `/api/character/vk/:vk_id` | Загрузка персонажа по VK ID |
| POST | `/api/character/vk/save` | Сохранение персонажа (VK) |
| POST | `/api/link/generate` | Генерация кода привязки TG↔VK (TTL 10 мин) |
| POST | `/api/link/connect` | Привязка аккаунтов с мержем данных |
| POST | `/api/room/create` | Создание комнаты мастера |
| POST | `/api/room/join` | Вход игрока в комнату |
| GET | `/api/room/:code` | Получение данных комнаты (мастер) |

Комнаты и коды привязки хранятся **в памяти** (Map), TTL — 12 часов. При рестарте сервера сбрасываются.

---

## База данных

Одна таблица `characters`:

```sql
CREATE TABLE characters (
  id          SERIAL PRIMARY KEY,
  telegram_id TEXT UNIQUE,
  vk_id       TEXT UNIQUE,
  character_data JSONB NOT NULL,   -- весь объект S сериализован как JSON
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

Индексы на `telegram_id` и `vk_id`. Весь персонаж — один JSONB-блоб; схема не фиксирована, что позволяет добавлять поля без миграций.

---

## Ключевые решения

- **Нет фреймворка и сборщика** — приложение загружается мгновенно, работает без npm build, деплой = git push.
- **shared.js** — единственный источник правды для логики; TG и VK обёртки минимальны (~210 строк), правки достаточно сделать в одном файле.
- **JSONB-хранение всего персонажа** — простое добавление новых полей без миграций; `Object.assign({}, defaultChar(), savedData)` обеспечивает обратную совместимость.
- **Дебаунс-сохранение** — `scheduleSave()` запускает сохранение через 2 секунды после любого изменения, но не чаще. Избегает лишних запросов при быстрых правках.
- **PLAT-абстракция** — вся платформенная специфика вынесена в 5 строк в HTML-обёртке; `shared.js` не знает о Telegram или VK напрямую.
- **In-memory комнаты** — мастерские комнаты не нужно персистировать между сессиями, достаточно оперативной памяти с TTL.
- **Render cold start** — фронтенд пингует `/health` при старте, чтобы разбудить бэкенд заранее.

---

## Переменные окружения (backend/.env)

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
BOT_TOKEN=123456:ABC...   # Telegram Bot Token для верификации initData
ALLOWED_ORIGIN=*
```

---

## Деплой

1. **БД**: выполнить `database/schema.sql` в Supabase SQL Editor
2. **Backend**: подключить папку `backend/` к Render.com, выставить env-переменные, start command: `node server.js`
3. **Frontend**: `git push` → GitHub Pages автоматически публикует
4. **BACKEND_URL** в `index.html` и `vk/index.html` должен указывать на актуальный URL Render

Локальное тестирование: `cd frontend && npx serve -p 5500 .`

---

## UI Дизайн

CSS-компоненты, палитра, типографика, модалы, мобильный UX:  
👉 [design.md](design.md)
