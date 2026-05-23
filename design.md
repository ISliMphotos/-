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

- Фото персонажа `48×48px` (`#char-photo`), выровнено по верху имени. Клик → `openCharSelect()`. Показывает аватарку (`S.avatar` base64) если есть, иначе заглушку.
- 3 квадратные кнопки `.hdr-btn-sq` `36×36px`: 🔗 VK/TG, 💾 Сохранить, ☀/🌙 Тема
- Имя — `Cinzel Decorative`. Подзаголовки `#hdrSub` и `#slotD` скрыты (`display:none`).
- Имя редактируется в меню выбора слота (кнопка ✏ на каждой slot-card → `openSlotEdit(idx)`), не в табе «Персонаж».
- Аватарка задаётся там же: `<input type="file">` → Canvas resize 128×128 → base64 → `slots[idx].avatar`.

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

- Группировка по `source` атрибута / профессии (`.grp-title`, кликабельный заголовок)
- Первая группа «★ Избранные» — виртуальная, показывает навыки с `favorite:true` из всех групп
- State collapse каждой группы в `skillGrpOpen[groupName]`, по умолчанию `true` (открыта)
- Сетка `.skills-grid` (2-col)
- Карточка: название, тег типа, тег уровня, `.skill-prop` (зелёный, всегда виден)
- Клик → `.expanded` → `.skill-hidden` (описание + кнопки ★ Избранное, Редактировать)
- Кнопка ★/☆ в expanded-состоянии toggles `s.favorite`; навык добавляется/убирается из Избранных без удаления из своей группы
- `.grid-add` в каждой группе — добавить навык

---

## Вкладка: Инвентарь

- **Слоты рюкзаков**: кнопка `.bp-toggle-btn` `38×38px` с иконкой 🎒 (`.off` — снят: `opacity:.35; grayscale`) рядом со счётчиком `используется / макс`. Клик на счётчик → inline `.bp-settings` (± вместимость).
- **Золото** — клик → `gold-modal` (калькулятор)
- **6 секций**: ⚔ Оружие, 🛡 Доспехи, 💍 Аксессуары, ⚗ Алх. ингредиенты, 🧪 Зелья, 🎒 Прочее
- Сетка `.items-grid` (2-col), карточки с `.item-prop` (зелёный, всегда виден), `.item-eq-btn`
- Кнопки добавления — ячейки `.grid-add` внутри сетки (не отдельные кнопки под секцией)
- **Расходуемые предметы**: поле `consumable:bool` на всех типах. Если `true` — карточка показывает qty-контрол `−/qty/+` (`item-qty-btn`, `item-qty-val`). Если `false` — qty не отображается (количество = 1 подразумевается).

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
| `.bp-settings` | Inline-панель рюкзака (± вместимость) |
| `.bp-toggle-btn` | Кнопка рюкзака 38×38px; `.off` = снят (grayscale + opacity:.35) |
| `.item-qty-btn` / `.item-qty-val` | Qty-контрол расходуемых предметов |
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
switchTab(id, btn)               // переключение вкладок
toggleTheme()                    // ☀/🌙
openModal(id)                    // показать модал
closeModal(id)                   // скрыть модал
openItemModal(name)              // item-modal
toggleSection(id)                // collapse/expand → charSecState
toggleBackpack()                 // bp-settings (± вместимость)
toggleAlchFilter(id)             // alch-filter-panel
alchReact(card, name)            // визуальный фидбек + лог
confirmAlchDelete(btn, what)     // модал подтверждения
execAlchDelete()                 // выполнить удаление
addAlchIngRow()                  // добавить строку ингредиента (макс 7)
removeAlchIngRow(btn)            // удалить строку ингредиента
openHpModal() / openHpCalc()
openGoldModal() / openGoldCalc()
openExpModal()
openCharSelect()                 // меню выбора персонажа (слоты)
openSlotEdit(idx)                // редактор слота: имя + аватарка
handleSlotAvatarPick(input, idx) // file input → Canvas 128×128 → base64
saveSlotEdit(idx)                // сохранить имя/аватар слота
clearSlotAvatar(idx)             // удалить аватарку слота
confirmDeleteProp(id)            // подтверждение удаления особого свойства
confirmDeleteTitle(id)           // подтверждение удаления звания
confirmDeleteAch(id)             // подтверждение удаления достижения
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
