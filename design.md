# Дизайн-система — Лист персонажа Забытой истории

Документация по UI/UX. Актуальна для `index.html`, `vk/index.html`, `shared.js`.

---

## Темы

Двойная тема: светлая (пергамент) по умолчанию, тёмная (`[data-theme="dark"]`).  
Переключение — кнопка ☀/🌙 в шапке (`toggleTheme()`).  
Шрифты: `Cinzel` (заголовки), `Cinzel Decorative` (числа), `EB Garamond` (текст).

---

## Цветовая палитра (CSS-переменные)

| Переменная | Light | Dark |
|-----------|-------|------|
| `--gold` | `#8a6914` | `#c49828` |
| `--bg` | `#f2ece0` | `#0e0b07` |
| `--bg-card` | `#ece5d4` | `#1a1610` |
| `--bg-deep` | `#e4dcc8` | `#130f0a` |
| `--text` | `#1e1810` | `#c8bc98` |
| `--text-dim` | `#6b5c3e` | `#7a6a48` |
| `--green` | `#2d6e3a` | `#3a9a50` |
| `--red` | `#8b2a2a` | `#c05040` |

Дополнительные: `--gold-dim`, `--gold-dark`, `--border`, `--border-hi`, `--orange`, `--blue`, `--btn-hover`, `--bar-track`, `--shadow-card`, `--shadow-hdr`, `--danger-bg`, `--danger-border`, `--danger-hover`, `--green-btn-bg`, `--green-btn-bd`, `--alch-btn-bg`, `--alch-btn-bd`, `--alch-btn-clr`, `--vk-btn-bg`, `--vk-btn-bd`.

---

## Шапка

- Фото персонажа `48×48px`, выровнено по верху имени (`align-items:flex-start`)
- 3 квадратные кнопки `.hdr-btn-sq` `36×36px`: 🔗 VK/TG, 💾 Сохранить, ☀/🌙 Тема
- Имя — `Cinzel Decorative`, подзаголовок с расой/профессиями, слот

---

## Вкладки

**Персонаж · Навыки · Инвентарь · Алхимия · Квесты/НПС**

- Вкладка «Алхимия» появляется только если у персонажа профессия с `knowledgeArea === "Алхимия"`
- Вкладка «Профессии» убрана — профессии перенесены в вкладку «Персонаж»

---

## Вкладка: Персонаж

**Основная карточка** — сетка `1fr 1.6fr`:
- Левая: 6 атрибутов `2×3` (`.ag.ag-compact`)
- Правая (flex-column):
  - `.lvl-badge` — кликабелен → `attrs-modal`
  - `.exp-block` — кликабелен → `exp-modal`
  - Строка `1fr 1fr`: `.hp-block` → `hp-modal`, Броня

**Сворачиваемые секции** (`toggleSection(id)`, state хранится в `charSecState`):
1. Профессии (`.prof-grid`, 2-col, карточки с прогресс-баром)
2. Особые свойства
3. Звания и титулы
4. Достижения
5. Заметки

---

## Вкладка: Навыки

- Группировка по профессии (`.grp-title`)
- Сетка `.skills-grid` (2-col)
- Карточка: название, тег типа, тег уровня, `.skill-prop` (зелёный, всегда виден)
- Клик → `.expanded` → `.skill-hidden` (описание + кнопка Ред.)
- `.grid-add` — добавить навык

---

## Вкладка: Инвентарь

- **Слоты рюкзаков** — клик → inline `.bp-settings` (кнопка экипировки + ± вместимости)
- **Золото** — клик → `gold-modal` (калькулятор)
- **6 секций**: ⚔ Оружие, 🛡 Доспехи, 💍 Аксессуары, ⚗ Алх. ингредиенты, 🧪 Зелья, 🎒 Прочее
- Сетка `.items-grid` (2-col), карточки с `.item-prop` (зелёный, всегда виден), `.item-eq-btn`

---

## Вкладка: Алхимия

State секций в `alchSectOpen`. 6 секций:

| # | Секция | Сетка |
|---|--------|-------|
| 1 | Инвентарь алхимика | `.alch-items-grid` (2-col) |
| 2 | Базовая реакция | `.alch-recipe-grid` (2-col) |
| 3 | Алхимический круг | `.alch-recipe-grid` (2-col) |
| 4 | Рецепты обработки | proc-cards + форма |
| 5 | База предметов | `.alch-base-grid` (2-col) |
| 6 | История | `.log-scroll` |

**Ctrl-bar** (сек. 1 и 5): кнопки ⊞ группировка, ↕ сортировка — `.alch-icon-btn` `36×36px`.  
Фильтр-панели `.alch-filter-panel` — скрыты, открываются по `toggleAlchFilter(id)`.  
State видимости: `alchInvSortVisible`, `alchInvGroupVisible`, `alchBaseSortVisible`, `alchBaseGroupVisible`.

---

## Вкладка: Квесты/НПС

**Квесты**:
- `.quest-grp-lbl` — "Активные · N" / "Выполненные · N" с toggle
- `.quest-item` — левая золотая полоска `box-shadow: inset 2px 0 0 var(--gold-dim)`
- `.quest-task-badge` — пилюля "задачи 2/4"
- `.quest-done` → зелёная полоска + `opacity:.6`
- State задач в `questTasksOpen`

**НПС**: сетка `.npc-grid` (2-col), карточки с именем и превью заметок

---

## CSS-компоненты

| Класс | Назначение |
|-------|-----------|
| `.card` | Карточка с угловыми украшениями `::before/::after` |
| `.card-accent` | Карточка с золотым бордером |
| `.stitle` | Заголовок секции с ромбами и линией |
| `.stitle-clickable` | Кликабельный заголовок (сворачивание) |
| `.card.collapsed .sec-grp-body` | Скрывает тело секции |
| `.ag` / `.ag-compact` | Сетка атрибутов (3-col / уменьшенная) |
| `.prof-grid` / `.skills-grid` | 2-col сетки |
| `.items-grid` / `.npc-grid` | 2-col сетки |
| `.alch-items-grid` / `.alch-recipe-grid` / `.alch-base-grid` | 2-col сетки алхимии |
| `.grid-add` | Dashed карточка-плюс |
| `.item-eq-btn` / `.item-eq-btn.on` | Кнопка экипировки (надет = `.on`) |
| `.item-prop` / `.skill-prop` | Зелёный текст свойства (всегда виден) |
| `.skill-hidden` | Скрытый блок навыка (виден при `.expanded`) |
| `.lvl-badge` / `.exp-block` / `.hp-block` | Кликабельные блоки шапки персонажа |
| `.hdr-btn-sq` | Квадратная кнопка шапки 36×36px |
| `.alch-icon-btn` | Иконка-кнопка алхимии 36×36px |
| `.alch-filter-panel` / `.alch-filter-panel.open` | Фильтр-панель |
| `.alch-recipe-del` | Всегда видимая кнопка удаления рецепта |
| `.alch-reacted` | Визуальный фидбек клика (400ms) |
| `.bp-settings` | Inline-панель рюкзака |
| `.quest-item` / `.quest-done` / `.quest-task-badge` / `.quest-grp-lbl` | Компоненты квестов |
| `.task-add-btn` | Dashed кнопка добавления |
| `.modal-ov` / `.modal-ov.open` | Оверлей модала |
| `.calc-grid` / `.calc-btn` | Numpad-калькулятор |

---

## Модалы

| ID | Назначение |
|----|-----------|
| `hp-modal` | HP-калькулятор (Урон / Лечение) |
| `gold-modal` | Операция с золотом |
| `exp-modal` | Добавить/убрать опыт |
| `item-modal` | Редактирование предмета |
| `attrs-modal` | Уровень, опыт, атрибуты |
| `alch-recipe-modal` | Добавление рецепта (результат + 2–7 ингредиентов) |
| `alch-item-modal` | Добавление предмета в базу |
| `alch-confirm-modal` | Подтверждение удаления |

Закрытие по клику на оверлей — реализовано в JS.

---

## JS-функции UI

```js
switchTab(id, btn)           // переключение вкладок
toggleTheme()                // ☀/🌙
openModal(id)                // показать модал
closeModal(id)               // скрыть модал
openItemModal(name)          // item-modal
toggleSection(id)            // collapse/expand → charSecState
toggleBackpack()             // bp-settings
toggleAlchFilter(id)         // alch-filter-panel
alchReact(card, name)        // визуальный фидбек + лог
confirmAlchDelete(btn, what) // модал подтверждения
execAlchDelete()             // выполнить удаление
addAlchIngRow()              // добавить строку ингредиента (макс 7)
removeAlchIngRow(btn)        // удалить строку ингредиента
openHpModal() / openHpCalc()
openGoldModal() / openGoldCalc()
openExpModal()
```

---

## Мобильный UX

### Типографика
- `html { font-size: 18.4px }` — +15% через rem
- Шапка фиксирована в px: `.cname {19px}`, `.hdr-sub {8.8px}`, `.tbtn {10px}`
- Теги `.tg` — `font-size:.6rem`, `padding:3px 8px`

### Touch-цели
- `.item-qty-btn` — **32×32px**, gap 6px
- `.alch-icon-btn` — **36×36px**
- `.task-check` — **24×24px**
- `.stitle-clickable` — `touch-action:manipulation`
- `.tabs` — `overflow-x:auto; scrollbar-width:none`

### Active-эффекты
```css
.btn:active              { transform:scale(.95); opacity:.85; }
.hdr-btn-sq:active       { transform:scale(.9); }
.item-card:active        { transform:scale(.97); }
.alch-item-card:active   { transform:scale(.97); }
.skill-card:active       { transform:scale(.97); }
.item-qty-btn:active     { transform:scale(.9); }
.alch-icon-btn:active    { transform:scale(.9); }
.task-check:active       { transform:scale(.9); }
.stitle-clickable:active { opacity:.7; }
```

---

## Архив прототипа

Оригинальный прототип дизайна: `.claude/worktrees/peaceful-austin-42825b/design-preview.html`  
Исходный документ прогресса: `.claude/worktrees/peaceful-austin-42825b/design-progress.md`
