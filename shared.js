// ── CONSTANTS ──────────────────────────────────────────────────────────────────

const AT={strength:"Сила",agility:"Ловкость",vitality:"Живучесть",intellect:"Интеллект",trade:"Торговля",talent:"Талант"};
const AI={strength:"⚔",agility:"◎",vitality:"♥",intellect:"◆",trade:"◉",talent:"★"};
const BT=["Броня","Максимум HP","Урон","Бонусный урон","Сила","Ловкость","Живучесть","Интеллект","Торговля","Талант","Мана"];

// ── STATE ──────────────────────────────────────────────────────────────────────

let S={
  name:"",level:1,exp:0,expNext:30,
  attributes:{strength:0,agility:0,vitality:0,intellect:0,trade:0,talent:0},
  currentHP:0,gold:0,
  backpackOn:false,backpackSlots:10,
  professionLimit:6,
  titles:[],
  specialProps:[],
  professions:[],
  skills:[],
  weapons:[],
  armors:[],
  accessories:[],
  alchItems:[],
  potions:[],
  misc:[],
  achievements:[],
  quests:[],
  npcs:[],
  globalItemDB:[],
  alchDB:[],
  alchInventory:[],
  procRecipes:[],
  alchRecipes:[],
  alchCircleRecipes:[],
  alchHistory:[],
  alchSuccessChance:100,
  notes:"",
  hpLog:[],
  goldLog:[]
};

// ── MULTI-CHAR SLOTS ───────────────────────────────────────────────────────────

var slots = [];
var activeSlot = 0;
var MAX_SLOTS = 5;

function defaultChar() {
  return {
    name:"",level:1,exp:0,expNext:30,
    attributes:{strength:0,agility:0,vitality:0,intellect:0,trade:0,talent:0},
    currentHP:0,gold:0,backpackOn:false,backpackSlots:10,professionLimit:6,
    titles:[],specialProps:[],professions:[],skills:[],weapons:[],armors:[],
    accessories:[],alchItems:[],potions:[],misc:[],achievements:[],quests:[],
    npcs:[],globalItemDB:[],alchDB:[],alchInventory:[],procRecipes:[],
    alchRecipes:[],alchCircleRecipes:[],alchHistory:[],alchSuccessChance:100,
    notes:"",hpLog:[],goldLog:[]
  };
}

function saveCurrentSlot() {
  if (slots.length === 0) slots.push({});
  slots[activeSlot] = JSON.parse(JSON.stringify(S));
}

function applySlot(idx) {
  var src = slots[idx] || defaultChar();
  var merged = Object.assign({}, defaultChar(), JSON.parse(JSON.stringify(src)));
  Object.keys(S).forEach(function(k){ delete S[k]; });
  Object.assign(S, merged);
}

function switchSlot(idx) {
  saveCurrentSlot();
  activeSlot = idx;
  applySlot(idx);
  closeMod();
  render();
  ntf('Персонаж ' + (idx + 1) + ': ' + (S.name || 'Без имени'), '#c9a84c');
}

function addNewChar() {
  if (slots.length >= MAX_SLOTS) { ntf('Максимум ' + MAX_SLOTS + ' персонажей', '#e05050'); return; }
  saveCurrentSlot();
  slots.push(defaultChar());
  activeSlot = slots.length - 1;
  applySlot(activeSlot);
  closeMod();
  render();
  ntf('Создан персонаж ' + slots.length, '#27ae60');
}

function confirmDeleteChar(idx) {
  if (slots.length <= 1) { ntf('Нельзя удалить единственного персонажа', '#e05050'); return; }
  var name = (slots[idx] && slots[idx].name) || 'Без имени';
  openMod('<div class="mtitle">Удалить персонажа?</div>'
    + '<div style="font-size:.8rem;color:#e8dcc8;margin-bottom:16px">«' + name + '» будет удалён без возможности восстановления.</div>'
    + '<div class="row"><button class="bdng" style="flex:1;padding:8px" onclick="deleteChar(' + idx + ')">Удалить</button>'
    + '<button class="btn" style="flex:1;padding:8px;text-align:center" onclick="openCharSelect()">Отмена</button></div>');
}

function deleteChar(idx) {
  slots.splice(idx, 1);
  if (activeSlot >= slots.length) activeSlot = slots.length - 1;
  applySlot(activeSlot);
  closeMod();
  render();
  ntf('Персонаж удалён', '#e05050');
}

// ── COPY / CHAR SELECT ─────────────────────────────────────────────────────────

function copyViewLink(idx) {
  if (!PLAT.hasUser()) { ntf('Открой через ' + (PLAT.name === 'telegram' ? 'Telegram' : 'VK') + '!', '#e05050'); return; }
  var url = 'https://islimphotos.github.io/-/view/?' + (PLAT.name === 'telegram' ? 'tg' : 'vk') + '=' + PLAT.userId() + '&slot=' + idx;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function(){ ntf('Ссылка скопирована!', '#c9a84c'); }).catch(function(){ _copyFallback(url); });
  } else { _copyFallback(url); }
}

function _copyFallback(url) {
  var el = document.createElement('input'); el.value = url;
  document.body.appendChild(el); el.select(); document.execCommand('copy');
  document.body.removeChild(el); ntf('Ссылка скопирована!', '#c9a84c');
}

function openCharSelect() {
  var html = '<div class="mtitle">👤 Персонажи</div>';
  slots.forEach(function(sl, i) {
    var nm = sl.name || 'Без имени';
    var lvl = sl.level || 1;
    var isActive = (i === activeSlot);
    html += '<div class="slot-card' + (isActive ? ' active' : '') + '" onclick="switchSlot(' + i + ')">'
      + '<div class="slot-num">' + (i + 1) + '</div>'
      + '<div class="slot-info">'
      + '<div class="slot-name">' + nm + (isActive ? ' ✦' : '') + '</div>'
      + '<div class="slot-lvl">УР. ' + lvl + (isActive ? ' · активный' : '') + '</div>'
      + '</div>'
      + '<div class="row" style="flex-shrink:0;gap:4px">'
      + '<button class="btn" onclick="event.stopPropagation();copyViewLink(' + i + ')" style="padding:3px 7px;font-size:.65rem" title="Ссылка для мастера">📎</button>'
      + (slots.length > 1 ? '<button class="bdng" onclick="event.stopPropagation();confirmDeleteChar(' + i + ')" style="font-size:.65rem;padding:3px 7px">✕</button>' : '')
      + '</div>'
      + '</div>';
  });
  if (slots.length < MAX_SLOTS) {
    html += '<button class="btn" onclick="addNewChar()" style="width:100%;text-align:center;margin-top:4px">+ Новый персонаж (' + slots.length + '/' + MAX_SLOTS + ')</button>';
  } else {
    html += '<div style="font-size:.7rem;color:#7a6a52;text-align:center;margin-top:6px">Достигнут максимум (' + MAX_SLOTS + ' персонажей)</div>';
  }
  html += '<button class="btn" onclick="openRoomModal()" style="width:100%;text-align:center;margin-top:8px;border-color:#7a5c1e;color:#c9a84c">🏰 Комната мастера</button>';
  html += '<button class="btn" onclick="openBackupModal()" style="width:100%;text-align:center;margin-top:6px;border-color:#2a4a2a;color:#27ae60">💾 Резервные копии</button>';
  html += '<button class="btn" style="width:100%;text-align:center;margin-top:6px" onclick="closeMod()">Закрыть</button>';
  openMod(html);
}

// ── КОМНАТА МАСТЕРА ───────────────────────────────────────────────────────────

function openRoomModal() {
  if (!PLAT.hasUser()) { ntf('Открой через ' + (PLAT.name === 'telegram' ? 'Telegram' : 'VK') + '!', '#e05050'); return; }
  var myCode = localStorage.getItem('myRoomCode');
  var joinedCode = localStorage.getItem('joinedRoomCode');
  var html = '<div class="mtitle">🏰 Комната мастера</div>';

  html += '<div class="stitle" style="margin-bottom:8px">Я мастер<div class="sline"></div></div>';
  if (myCode) {
    html += '<div style="text-align:center;background:#0a0908;border:1px solid #c9a84c;border-radius:8px;padding:12px;margin-bottom:8px">'
      + '<div style="font-size:1.8rem;font-weight:bold;color:#c9a84c;letter-spacing:.3em">' + myCode + '</div>'
      + '<div style="font-size:.65rem;color:#7a6a52;margin-top:4px">Код для игроков</div></div>';
    html += '<button class="btn" onclick="copyMasterLink(\'' + myCode + '\')" style="width:100%;text-align:center;margin-bottom:6px">📎 Ссылка на страницу мастера</button>';
    html += '<button class="bdng" onclick="deleteMasterRoom()" style="width:100%;text-align:center;margin-bottom:12px;padding:6px">Удалить комнату</button>';
  } else {
    html += '<div style="font-size:.72rem;color:#7a6a52;margin-bottom:8px">Создай комнату — игроки войдут по коду, ты видишь всех на странице мастера.</div>';
    html += '<button class="bpri" onclick="createMasterRoom()" style="width:100%;margin-bottom:6px">Создать комнату</button>';
    html += '<div id="room_create_result" style="margin-bottom:8px"></div>';
  }

  html += '<div class="stitle" style="margin-bottom:8px">Я игрок<div class="sline"></div></div>';
  if (joinedCode) {
    html += '<div style="font-size:.78rem;color:#e8dcc8;margin-bottom:8px">Вы в комнате <span style="color:#c9a84c;font-weight:bold">' + joinedCode + '</span></div>';
    html += '<button class="bdng" onclick="leaveRoom()" style="width:100%;text-align:center;padding:6px">Выйти из комнаты</button>';
  } else {
    html += '<div class="row"><input class="inp" id="room_join_inp" placeholder="ABC123" style="text-transform:uppercase;letter-spacing:.15em;font-size:1rem;text-align:center;flex:1">'
      + '<button class="bpri" onclick="joinRoom()">Войти</button></div>';
    html += '<div id="room_join_result" style="margin-top:8px"></div>';
  }

  html += '<button class="btn" style="width:100%;text-align:center;margin-top:14px" onclick="closeMod()">Закрыть</button>';
  openMod(html);
}

async function createMasterRoom() {
  var el = document.getElementById('room_create_result');
  if (el) el.innerHTML = '<div style="color:#7a6a52;font-size:.75rem">Создаю…</div>';
  try {
    var res = await fetch(BACKEND_URL + '/api/room/create', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ platform: PLAT.name, master_id: PLAT.userId() })
    });
    var data = await res.json();
    if (data.code) { localStorage.setItem('myRoomCode', data.code); openRoomModal(); }
    else if (el) el.innerHTML = '<div style="color:#e05050;font-size:.75rem">' + (data.error || 'Ошибка') + '</div>';
  } catch(e) { if (el) el.innerHTML = '<div style="color:#e05050;font-size:.75rem">Нет связи с сервером</div>'; }
}

async function joinRoom() {
  var code = (document.getElementById('room_join_inp')?.value || '').trim().toUpperCase();
  var el = document.getElementById('room_join_result');
  if (!code) return;
  if (el) el.innerHTML = '<div style="color:#7a6a52;font-size:.75rem">Подключаюсь…</div>';
  try {
    var res = await fetch(BACKEND_URL + '/api/room/join', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code, platform: PLAT.name, player_id: PLAT.userId() })
    });
    var data = await res.json();
    if (data.success) { localStorage.setItem('joinedRoomCode', code); ntf('Вошёл в комнату ' + code, '#27ae60'); openRoomModal(); }
    else if (el) el.innerHTML = '<div style="color:#e05050;font-size:.75rem">' + (data.error || 'Ошибка') + '</div>';
  } catch(e) { if (el) el.innerHTML = '<div style="color:#e05050;font-size:.75rem">Нет связи с сервером</div>'; }
}

async function leaveRoom() {
  var code = localStorage.getItem('joinedRoomCode');
  if (!code) return;
  try {
    await fetch(BACKEND_URL + '/api/room/leave', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code, platform: PLAT.name, player_id: PLAT.userId() })
    });
  } catch(e) {}
  localStorage.removeItem('joinedRoomCode');
  ntf('Вышел из комнаты', '#e05050');
  openRoomModal();
}

function deleteMasterRoom() { localStorage.removeItem('myRoomCode'); openRoomModal(); }

function copyMasterLink(code) {
  var url = 'https://islimphotos.github.io/-/master/?code=' + code;
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(function(){ ntf('Ссылка скопирована!', '#c9a84c'); }).catch(function(){ _copyFallback(url); });
  else _copyFallback(url);
}

async function autoRejoinRoom() {
  var code = localStorage.getItem('joinedRoomCode');
  if (!code || !PLAT.hasUser()) return;
  try {
    var res = await fetch(BACKEND_URL + '/api/room/join', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code, platform: PLAT.name, player_id: PLAT.userId() })
    });
    var data = await res.json();
    if (!data.success) localStorage.removeItem('joinedRoomCode');
  } catch(e) {}
}

// ── BACKUP SYSTEM ─────────────────────────────────────────────────────────────

var MAX_BACKUPS = 10;
var BACKUP_KEY = 'charBackups';

function getBackups() {
  try { return JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]'); } catch(e) { return []; }
}
function saveBackups(arr) {
  localStorage.setItem(BACKUP_KEY, JSON.stringify(arr));
}

function openBackupModal() {
  var backups = getBackups();
  var html = '<div class="stitle">💾 Резервные копии<div class="sline"></div></div>';
  html += '<div style="font-size:.72rem;color:#7a6a52;margin-bottom:10px">Копии хранятся локально на устройстве. До 10 копий.</div>';

  if (backups.length === 0) {
    html += '<div style="text-align:center;padding:20px;color:#5a4a35;font-size:.78rem">Нет сохранённых копий</div>';
  } else {
    backups.forEach(function(b, i) {
      var d = new Date(b.ts);
      var ds = d.toLocaleDateString('ru') + ' ' + d.toLocaleTimeString('ru', {hour:'2-digit',minute:'2-digit'});
      html += '<div style="background:#0a0908;border:1px solid #242018;border-radius:6px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:8px">'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:.82rem;color:#c9a84c;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (b.name || 'Без имени') + '</div>'
        + '<div style="font-size:.65rem;color:#7a6a52">УР. ' + (b.level || 1) + ' · ' + ds + '</div>'
        + '</div>'
        + '<button class="btn" style="font-size:.65rem;padding:4px 8px;white-space:nowrap" onclick="confirmRestoreBackup(' + i + ')">↩ Восст.</button>'
        + '<button class="bdng" style="font-size:.65rem;padding:4px 8px" onclick="deleteBackup(' + i + ')">✕</button>'
        + '</div>';
    });
  }

  html += '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">'
    + '<button class="bpri" style="flex:1" onclick="saveBackupNow()">💾 Сохранить копию</button>'
    + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">'
    + '<button class="btn" style="flex:1" onclick="exportChar()">📤 Экспорт (JSON)</button>'
    + '<button class="btn" style="flex:1" onclick="openImportModal()">📥 Импорт (JSON)</button>'
    + '</div>'
    + '<button class="btn" style="width:100%;margin-top:8px" onclick="closeMod()">Закрыть</button>';
  openMod(html);
}

function saveBackupNow() {
  saveCurrentSlot();
  var backups = getBackups();
  var entry = {
    ts: Date.now(),
    name: S.name || 'Без имени',
    level: S.level || 1,
    slots: JSON.parse(JSON.stringify(slots)),
    activeSlot: activeSlot
  };
  backups.unshift(entry);
  if (backups.length > MAX_BACKUPS) backups = backups.slice(0, MAX_BACKUPS);
  saveBackups(backups);
  ntf('Копия сохранена!', '#27ae60');
  openBackupModal();
}

function deleteBackup(idx) {
  var backups = getBackups();
  backups.splice(idx, 1);
  saveBackups(backups);
  openBackupModal();
}

function confirmRestoreBackup(idx) {
  var backups = getBackups();
  var b = backups[idx];
  if (!b) return;
  var d = new Date(b.ts);
  var ds = d.toLocaleDateString('ru') + ' ' + d.toLocaleTimeString('ru', {hour:'2-digit',minute:'2-digit'});
  var html = '<div class="stitle">↩ Восстановить<div class="sline"></div></div>'
    + '<div style="font-size:.82rem;margin-bottom:16px;color:#e8dcc8">Восстановить персонажа <b style="color:#c9a84c">' + (b.name || 'Без имени') + '</b> (от ' + ds + ')? Текущие данные будут перезаписаны.</div>'
    + '<div style="display:flex;gap:8px">'
    + '<button class="bdng" style="flex:1" onclick="restoreBackup(' + idx + ')">Да, восстановить</button>'
    + '<button class="btn" style="flex:1" onclick="openBackupModal()">Отмена</button>'
    + '</div>';
  openMod(html);
}

function restoreBackup(idx) {
  var backups = getBackups();
  var b = backups[idx];
  if (!b) return;
  slots = JSON.parse(JSON.stringify(b.slots));
  activeSlot = b.activeSlot || 0;
  S = slots[activeSlot] || defaultChar();
  saveCharacter();
  closeMod();
  ntf('Персонаж восстановлен!', '#27ae60');
  render();
}

function exportChar() {
  saveCurrentSlot();
  var json = JSON.stringify({ slots: slots, activeSlot: activeSlot }, null, 2);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(json).then(function(){ ntf('JSON скопирован в буфер!', '#c9a84c'); }).catch(function(){ _exportFallback(json); });
  } else { _exportFallback(json); }
}

function _exportFallback(text) {
  var html = '<div class="stitle">📤 Экспорт JSON<div class="sline"></div></div>'
    + '<div style="font-size:.72rem;color:#7a6a52;margin-bottom:8px">Скопируй текст ниже:</div>'
    + '<textarea class="inp" style="min-height:180px;font-size:.65rem;font-family:monospace" readonly>' + text.replace(/</g, '&lt;') + '</textarea>'
    + '<button class="btn" style="width:100%;margin-top:8px" onclick="openBackupModal()">Назад</button>';
  openMod(html);
}

function openImportModal() {
  var html = '<div class="stitle">📥 Импорт JSON<div class="sline"></div></div>'
    + '<div style="font-size:.72rem;color:#7a6a52;margin-bottom:8px">Вставь JSON экспорта:</div>'
    + '<textarea class="inp" id="importTA" style="min-height:180px;font-size:.65rem;font-family:monospace" placeholder=\'{"slots":[...],"activeSlot":0}\'></textarea>'
    + '<div id="importErr" style="color:#e05050;font-size:.72rem;min-height:18px;margin-top:4px"></div>'
    + '<div style="display:flex;gap:8px;margin-top:8px">'
    + '<button class="bpri" style="flex:1" onclick="doImport()">Импортировать</button>'
    + '<button class="btn" style="flex:1" onclick="openBackupModal()">Отмена</button>'
    + '</div>';
  openMod(html);
}

function doImport() {
  var ta = document.getElementById('importTA');
  var errEl = document.getElementById('importErr');
  if (!ta) return;
  try {
    var parsed = JSON.parse(ta.value.trim());
    var newSlots, newActive;
    if (parsed.slots && Array.isArray(parsed.slots) && parsed.slots.length > 0) {
      newSlots = parsed.slots; newActive = parsed.activeSlot || 0;
    } else if (parsed.name !== undefined || parsed.level !== undefined) {
      newSlots = [Object.assign({}, defaultChar(), parsed)]; newActive = 0;
    } else {
      if (errEl) errEl.textContent = 'Неверный формат JSON'; return;
    }
    slots = newSlots; activeSlot = Math.min(newActive, slots.length - 1);
    S = slots[activeSlot] || defaultChar();
    saveCharacter();
    closeMod();
    ntf('Импорт выполнен!', '#27ae60');
    render();
  } catch(e) {
    if (errEl) errEl.textContent = 'Ошибка разбора JSON: ' + e.message;
  }
}

// ── СИНХРОНИЗАЦИЯ ПЛАТФОРМ ────────────────────────────────────────────────────

function openLinkModal() {
  if (!PLAT.hasUser()) { ntf('Открой через ' + (PLAT.name === 'telegram' ? 'Telegram' : 'VK') + '!', '#e05050'); return; }
  var other = PLAT.name === 'telegram' ? 'VK' : 'Telegram';
  var otherApp = PLAT.name === 'telegram' ? 'VK-приложении' : 'Telegram-боте';
  openMod('<div class="mtitle">🔗 Связать с ' + other + '</div>'
    + '<div style="font-size:.75rem;color:#7a6a52;margin-bottom:14px">Привяжи VK и Telegram — персонаж станет общим на обеих платформах.</div>'
    + '<div class="stitle" style="margin-bottom:8px">Шаг 1 — создай код здесь<div class="sline"></div></div>'
    + '<div style="font-size:.72rem;color:#7a6a52;margin-bottom:8px">Нажми кнопку, получи код и введи его в ' + otherApp + '. Код действует 10 минут.</div>'
    + '<button class="bpri" onclick="generateLinkCode()" style="width:100%">Создать код</button>'
    + '<div id="link_code_display" style="margin-top:8px"></div>'
    + '<div class="stitle" style="margin-top:16px;margin-bottom:8px">— или — введи код из ' + other + '<div class="sline"></div></div>'
    + '<div class="row"><input class="inp" id="link_code_input" placeholder="ABC123" style="text-transform:uppercase;letter-spacing:.15em;font-size:1rem;text-align:center;flex:1">'
    + '<button class="bpri" onclick="connectWithCode()">Связать</button></div>'
    + '<div id="link_connect_result" style="margin-top:8px"></div>'
    + '<button class="btn" style="width:100%;margin-top:16px;text-align:center" onclick="closeMod()">Закрыть</button>');
}

async function generateLinkCode() {
  var display = document.getElementById('link_code_display');
  if (!display) return;
  var otherApp = PLAT.name === 'telegram' ? 'VK-приложении' : 'Telegram-боте';
  display.innerHTML = '<div style="color:#7a6a52;font-size:.75rem">Подключаюсь к серверу… (до 30 сек если сервер спал)</div>';
  try {
    var controller = new AbortController();
    var timer = setTimeout(function(){ controller.abort(); }, 35000);
    var res = await fetch(BACKEND_URL + '/api/link/generate', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ platform: PLAT.name, user_id: PLAT.userId() }),
      signal: controller.signal
    });
    clearTimeout(timer);
    var data = await res.json();
    if (data.code) {
      display.innerHTML = '<div style="text-align:center;background:#0a0908;border:1px solid #c9a84c;border-radius:8px;padding:14px">'
        + '<div style="font-size:2rem;font-weight:bold;color:#c9a84c;letter-spacing:.3em">' + data.code + '</div>'
        + '<div style="font-size:.68rem;color:#7a6a52;margin-top:4px">Введи этот код в ' + otherApp + '</div>'
        + '<div style="font-size:.62rem;color:#5a4a35;margin-top:2px">Действует 10 минут</div></div>';
    } else { display.innerHTML = '<div style="color:#e05050;font-size:.75rem">' + (data.error || 'Ошибка') + '</div>'; }
  } catch(e) { display.innerHTML = '<div style="color:#e05050;font-size:.75rem">Нет связи с сервером</div>'; }
}

async function connectWithCode() {
  var code = (document.getElementById('link_code_input')?.value || '').trim().toUpperCase();
  var result = document.getElementById('link_connect_result');
  if (!code) { if (result) result.innerHTML = '<div style="color:#e05050;font-size:.75rem">Введи код</div>'; return; }
  if (result) result.innerHTML = '<div style="color:#7a6a52;font-size:.75rem">Связываю...</div>';
  try {
    var res = await fetch(BACKEND_URL + '/api/link/connect', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code, platform: PLAT.name, user_id: PLAT.userId() })
    });
    var data = await res.json();
    if (data.success) {
      if (result) result.innerHTML = '<div style="color:#27ae60;font-size:.82rem;text-align:center">✅ Аккаунты связаны! Перезапусти приложение.</div>';
      ntf('Аккаунты связаны!', '#27ae60');
    } else { if (result) result.innerHTML = '<div style="color:#e05050;font-size:.75rem">' + (data.error || 'Ошибка') + '</div>'; }
  } catch(e) { if (result) result.innerHTML = '<div style="color:#e05050;font-size:.75rem">Нет связи с сервером</div>'; }
}

// ── DEBOUNCE SAVE ─────────────────────────────────────────────────────────────

let _saveTimer = null;
function scheduleSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function(){ if (PLAT.hasUser()) saveCharacter(true); }, 2000);
}

// ── UI STATE ──────────────────────────────────────────────────────────────────

let tab="char";
let invOpen={weapons:true,armors:true,accessories:true,alch:true,potions:true,misc:true};
let questsOpenDone=false,questsOpenActive=true;
let questTasksOpen={};
let alchSectOpen={proc:true,recipes:true,circle:true,base:true,hist:true};
let alchReagentCount=2,alchCircleReagentCount=2;
let alchBaseSortCol="name",alchBaseSortDir=1,alchBaseSearch="";
let alchBaseGroupBy="",alchInvGroupBy="",alchInvSortBy="name",alchInvSortDir=1;
let alchInvGroupVisible=false,alchBaseGroupVisible=false;
let hcv="",gcv="";
let notesOpen=false;

// ── DERIVED ───────────────────────────────────────────────────────────────────

const skBonus=n=>S.skills.filter(s=>s.bonusTarget===n).reduce((a,s)=>a+(+s.bonusValue||0),0);
const acBonus=n=>S.accessories.filter(a=>a.equipped&&a.bonusTarget===n).reduce((a,s)=>a+(+s.bonusValue||0),0);
const mhp=()=>S.attributes.vitality*5+S.attributes.strength*2+skBonus("Максимум HP")+acBonus("Максимум HP");
const arm=()=>(S.armors.find(a=>a.equipped)?.armorValue||0)+skBonus("Броня")+acBonus("Броня");
const invUsed=()=>S.weapons.length+S.armors.length+S.accessories.length+S.alchItems.length+S.potions.length+S.misc.length;
const imax=()=>15+(S.backpackOn?S.backpackSlots:0);

// ── UTILS ─────────────────────────────────────────────────────────────────────

function ntf(m,c){c=c||"#c9a84c";const e=document.getElementById("notifEl");e.textContent=m;e.style.color=c;e.style.borderColor=c;e.style.display="block";clearTimeout(window._nt);window._nt=setTimeout(()=>e.style.display="none",2200);}
const closeMod=()=>document.getElementById("movl").style.display="none";
const openMod=h=>{document.getElementById("mbox").innerHTML=h;document.getElementById("movl").style.display="flex";};
const tg=(t,c)=>`<span class="tg" style="color:${c};border-color:${c};background:${c}18">${t}</span>`;
const eqBtn=(eq,fn)=>{const c=eq?"#27ae60":"#c9a84c",bg=eq?"#0d1f0d":"#1e1a12",bc=eq?"#27ae60":"#4a3a22";return`<button class="beq" style="color:${c};border-color:${bc};background:${bg}" onclick="${fn}">${eq?"Снять":"Надеть"}</button>`;};
const setTab=t=>{tab=t;render();};

// ── CALCULATORS ───────────────────────────────────────────────────────────────

function renderHpLog(){
  const wrap=document.getElementById("hpLogWrap");
  if(!wrap)return;
  const log=S.hpLog||[];
  if(log.length===0){wrap.innerHTML='';return;}
  const rows=log.slice(0,30).map(e=>{
    const td=new Date(e.t);
    const ts=[td.getHours(),td.getMinutes(),td.getSeconds()].map(x=>String(x).padStart(2,"0")).join(":");
    const col=e.delta>=0?"#27ae60":"#e05050";
    const sign=e.delta>0?"+":"";
    return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid #1a1510;font-size:.68rem">
      <span style="color:#5a4a35;font-family:monospace;flex-shrink:0">${ts}</span>
      <span style="color:${col};font-weight:bold;min-width:28px;flex-shrink:0">${sign}${e.delta}</span>
      <span style="color:#7a6a52;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.desc}</span>
      <span style="color:#e8dcc8;flex-shrink:0">→${e.hp}</span>
    </div>`;
  }).join("");
  wrap.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
    <span style="font-size:.6rem;letter-spacing:.12em;color:#7a6a52;text-transform:uppercase">Лог изменений</span>
    <button class="bdng" style="font-size:.6rem;padding:2px 7px" onclick="S.hpLog=[];renderHpLog();render()">Очистить</button>
  </div>${rows}`;
}
const openHpCalc=()=>{hcv="";document.getElementById("hpcnum").textContent="0";document.getElementById("hpcalc").style.display="flex";renderHpLog();};
const closeHpCalc=()=>document.getElementById("hpcalc").style.display="none";
function hcp(d){if(hcv.length>=6)return;hcv+=d;document.getElementById("hpcnum").textContent=parseInt(hcv)||"0";}
function hccl(){hcv="";document.getElementById("hpcnum").textContent="0";}
function hcdl(){hcv=hcv.slice(0,-1);document.getElementById("hpcnum").textContent=hcv?parseInt(hcv):"0";}
function hcApply(t){
  const v=parseInt(hcv)||0;if(v<=0)return;
  let delta=0,desc="";
  if(t==="d"){
    const r=Math.max(0,v-arm()),prev=S.currentHP;
    S.currentHP=Math.max(0,S.currentHP-r);
    delta=S.currentHP-prev; desc="Урон "+v+(arm()>0?" (−"+arm()+" броня)":"");
    ntf("Урон: "+v+" → после брони: "+r,"#e05050");
  } else if(t==="p"){
    const sk=skBonus("Броня")+acBonus("Броня"),r=Math.max(0,v-sk),prev=S.currentHP;
    S.currentHP=Math.max(0,S.currentHP-r);
    delta=S.currentHP-prev; desc="Сквозной "+v+(sk>0?" (−"+sk+" навыки)":"");
    ntf("Сквозной: "+v+(sk>0?" → -"+sk+" навыки: "+r:""),"#e05050");
  } else {
    const prev=S.currentHP;
    S.currentHP=Math.min(mhp(),S.currentHP+v);
    delta=S.currentHP-prev; desc="Лечение +"+v;
    ntf("Исцеление: +"+v+" HP","#27ae60");
  }
  if(!S.hpLog)S.hpLog=[];
  S.hpLog.unshift({t:Date.now(),delta,desc,hp:S.currentHP});
  if(S.hpLog.length>50)S.hpLog=S.hpLog.slice(0,50);
  hcv="";document.getElementById("hpcnum").textContent="0";
  renderHpLog();
  render();
}
function renderGoldLog(){
  const wrap=document.getElementById("goldLogWrap");
  if(!wrap)return;
  const log=S.goldLog||[];
  if(log.length===0){wrap.innerHTML='';return;}
  const rows=log.slice(0,30).map(e=>{
    const td=new Date(e.t);
    const ts=[td.getHours(),td.getMinutes(),td.getSeconds()].map(x=>String(x).padStart(2,"0")).join(":");
    const col=e.delta>=0?"#c9a84c":"#e67e22";
    const sign=e.delta>0?"+":"";
    return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid #1a1510;font-size:.68rem">
      <span style="color:#5a4a35;font-family:monospace;flex-shrink:0">${ts}</span>
      <span style="color:${col};font-weight:bold;min-width:28px;flex-shrink:0">${sign}${e.delta}</span>
      <span style="color:#7a6a52;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.desc}</span>
      <span style="color:#e8dcc8;flex-shrink:0">→${e.gold}</span>
    </div>`;
  }).join("");
  wrap.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
    <span style="font-size:.6rem;letter-spacing:.12em;color:#7a6a52;text-transform:uppercase">Лог изменений</span>
    <button class="bdng" style="font-size:.6rem;padding:2px 7px" onclick="S.goldLog=[];renderGoldLog();render()">Очистить</button>
  </div>${rows}`;
}
const openGoldCalc=()=>{gcv="";document.getElementById("gcnum").textContent="0";document.getElementById("goldcalc").style.display="flex";renderGoldLog();};
const closeGoldCalc=()=>document.getElementById("goldcalc").style.display="none";
function gcp(d){if(gcv.length>=8)return;gcv+=d;document.getElementById("gcnum").textContent=parseInt(gcv)||"0";}
function gccl(){gcv="";document.getElementById("gcnum").textContent="0";}
function gcdl(){gcv=gcv.slice(0,-1);document.getElementById("gcnum").textContent=gcv?parseInt(gcv):"0";}
function gcApply(t){
  const v=parseInt(gcv)||0;if(v<=0)return;
  let delta=0,desc="";
  if(t==="add"){
    S.gold+=v; delta=v; desc="Получено +"+v;
    ntf("+"+v+" золота","#c9a84c");
  } else {
    const prev=S.gold;
    S.gold=Math.max(0,S.gold-v);
    delta=S.gold-prev; desc="Потрачено −"+v;
    ntf("−"+v+" золота","#e67e22");
  }
  if(!S.goldLog)S.goldLog=[];
  S.goldLog.unshift({t:Date.now(),delta,desc,gold:S.gold});
  if(S.goldLog.length>50)S.goldLog=S.goldLog.slice(0,50);
  gcv="";document.getElementById("gcnum").textContent="0";
  renderGoldLog();
  render();
}

// ── GLOBAL ITEM DB ────────────────────────────────────────────────────────────

function addToGlobalDB(item){
  if(!S.globalItemDB.find(x=>x.name===item.name&&x.type===item.type))
    S.globalItemDB.push({id:"g"+Date.now(),...item});
}
function globalDBSearch(q,type){
  if(!q)return[];
  const ql=q.toLowerCase();
  return S.globalItemDB.filter(x=>x.name.toLowerCase().includes(ql)&&x.type===type).slice(0,8);
}
function renderSearchResults(q,type,elId,onClickFn){
  const el=document.getElementById(elId);
  if(!el)return;
  if(!q){el.innerHTML="";return;}
  const res=globalDBSearch(q,type);
  if(res.length===0){el.innerHTML='<div style="color:#7a6a52;font-size:.75rem;padding:4px">Не найдено — заполните форму ниже</div>';return;}
  el.innerHTML=res.map(r=>{
    const sub=(r.damage?'Урон: '+r.damage+(r.bonusDamage?' · '+r.bonusDamage:''):'')+
      (r.armorValue?'Броня: '+r.armorValue:'')+
      (r.bonusTarget?r.bonusTarget+': +'+r.bonusValue:'')+
      (r.property?' — '+r.property:'');
    return '<div class="srch-result">'
      +'<div><div style="font-size:.8rem;font-weight:bold">'+r.name+'</div>'
      +(sub?'<div style="font-size:.68rem;color:#7a6a52">'+sub+'</div>':'')
      +'</div>'
      +'<button class="btn" style="padding:3px 8px;font-size:.68rem;flex-shrink:0" onclick="'+onClickFn+'(\''+r.id+'\')">+ Добавить</button>'
      +'</div>';
  }).join("");
}

// ── ARMOR BREAKDOWN ───────────────────────────────────────────────────────────

function armorBreakdown(){
  const eq=S.armors.find(x=>x.equipped);
  const fa=eq?eq.armorValue:0,fs=skBonus("Броня"),fc=acBonus("Броня");
  if(!eq&&fs===0&&fc===0)return '<div style="font-size:.62rem;color:#5a4a35;margin-top:2px">нет доспеха</div>';
  let s='<div style="margin-top:3px">';
  if(fa>0)s+='<div style="font-size:.62rem;color:#7a6a52">'+eq.name+': <span style="color:#7ec8e3">'+fa+'</span></div>';
  if(fs>0)s+='<div style="font-size:.62rem;color:#7a6a52">Навыки: <span style="color:#27ae60">+'+fs+'</span></div>';
  if(fc>0)s+='<div style="font-size:.62rem;color:#7a6a52">Аксессуары: <span style="color:#9b59b6">+'+fc+'</span></div>';
  return s+'</div>';
}

// ── CHAR TAB ──────────────────────────────────────────────────────────────────

function rChar(){
  const h=mhp(),a=arm(),hp=S.currentHP;
  const pp=Math.min(100,Math.max(0,hp/h*100)),ep=Math.min(100,S.exp/S.expNext*100);
  const hc=pp>50?"#27ae60":pp>25?"#e67e22":"#e74c3c";
  return `
<div class="card">
  <div class="stitle">Основное<div class="sline"></div></div>
  <div class="g2">
    <div>
      <div style="font-size:.62rem;color:#7a6a52;letter-spacing:.1em;margin-bottom:4px">ИМЯ</div>
      <input class="inp" value="${S.name}" onchange="S.name=this.value;document.getElementById('charNameDisp').textContent=this.value">
      <div style="margin-top:10px;font-size:.62rem;color:#7a6a52;letter-spacing:.1em;margin-bottom:4px">УРОВЕНЬ</div>
      <input class="inp" type="number" value="${S.level}" style="width:70px" onchange="S.level=+this.value;document.getElementById('lvlD').textContent='УР. '+S.level">
      <div style="margin-top:10px;font-size:.62rem;color:#7a6a52;letter-spacing:.1em;margin-bottom:2px">ОПЫТ</div>
      <div class="bwrap"><div class="bfill" style="width:${ep}%;background:linear-gradient(90deg,#7a5c1e,#c9a84c)"></div></div>
      <div class="row" style="margin-top:6px;gap:4px">
        <input class="inp" type="number" value="${S.exp}" style="width:62px" onchange="S.exp=+this.value;render()">
        <span style="color:#7a6a52">/</span>
        <input class="inp" type="number" value="${S.expNext}" style="width:62px" onchange="S.expNext=+this.value;render()">
      </div>
    </div>
    <div>
      <div style="font-size:.62rem;color:#7a6a52;letter-spacing:.1em;margin-bottom:2px">ЗДОРОВЬЕ</div>
      <div style="display:flex;align-items:baseline;gap:5px">
        <span class="hpnum" style="color:${hc}">${hp}</span>
        <span style="color:#7a6a52;font-size:.85rem">/ ${h}</span>
      </div>
      <div class="bwrap"><div class="bfill" style="width:${pp}%;background:${hc}"></div></div>
      <button class="btn" style="margin-top:8px;width:100%" onclick="openHpCalc()">⚔ Урон / Лечение</button>
      <div style="margin-top:12px;font-size:.62rem;color:#7a6a52;letter-spacing:.1em">БРОНЯ</div>
      <div class="snum">${a}</div>
      ${armorBreakdown()}
    </div>
  </div>
</div>
<div class="card">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
    <div class="stitle" style="margin-bottom:0">Атрибуты<div class="sline"></div></div>
    <button class="btn" onclick="oAttr()">Изменить</button>
  </div>
  <div class="ag">
    ${Object.entries(AT).map(([k,l])=>{
      const base=S.attributes[k],fs=skBonus(l),fc=acBonus(l),total=base+fs+fc;
      const hasB=fs>0||fc>0;
      return `<div class="ac">
        <div style="font-size:1rem">${AI[k]}</div>
        <div class="av-total">${total}</div>
        <div class="al">${l}</div>
        ${hasB?`<div style="font-size:.62rem;color:#7a6a52;margin-top:4px;line-height:1.5">
          <div>база: ${base}</div>
          ${fs>0?`<div style="color:#27ae60">+${fs} навыки</div>`:""}
          ${fc>0?`<div style="color:#27ae60">+${fc} аксессуары</div>`:""}
        </div>`:""}
      </div>`;
    }).join("")}
  </div>
</div>
<div class="card">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
    <div class="stitle" style="margin-bottom:0">Звания и титулы<div class="sline"></div></div>
    <button class="btn" onclick="addTitle()">+</button>
  </div>
  ${S.titles.length===0?'<div style="color:#7a6a52;font-size:.8rem">Нет записей</div>':""}
  ${S.titles.map(t=>`<div class="text-row">
    <input class="editable" style="flex:1" value="${t.text}" onchange="S.titles=S.titles.map(x=>x.id===${t.id}?{...x,text:this.value}:x)">
    <button class="bdng" onclick="S.titles=S.titles.filter(x=>x.id!==${t.id});render()">✕</button>
  </div>`).join("")}
</div>
<div class="card">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
    <div class="stitle" style="margin-bottom:0">Особые свойства<div class="sline"></div></div>
    <button class="btn" onclick="addSpecial()">+</button>
  </div>
  ${S.specialProps.length===0?'<div style="color:#7a6a52;font-size:.8rem">Нет записей</div>':""}
  ${S.specialProps.map(t=>`<div class="text-row">
    <input class="editable" style="flex:1" value="${t.text}" onchange="S.specialProps=S.specialProps.map(x=>x.id===${t.id}?{...x,text:this.value}:x)">
    <button class="bdng" onclick="S.specialProps=S.specialProps.filter(x=>x.id!==${t.id});render()">✕</button>
  </div>`).join("")}
</div>
<div class="card">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
    <div class="stitle" style="margin-bottom:0">Ачивки<div class="sline"></div></div>
    <button class="btn" onclick="oAddAch()">+</button>
  </div>
  ${S.achievements.length===0?'<div style="color:#7a6a52;font-size:.8rem">Нет ачивок</div>':""}
  ${S.achievements.map(a=>`<div class="ach-item">
    <div style="font-size:1rem;margin-top:1px">🏆</div>
    <div style="flex:1">
      <div style="font-weight:bold;font-size:.82rem">${a.name}</div>
      ${a.property?`<div style="font-size:.72rem;color:#7a6a52;margin-top:2px">${a.property}</div>`:""}
    </div>
    <button class="bdng" onclick="S.achievements=S.achievements.filter(x=>x.id!==${a.id});render()">✕</button>
  </div>`).join("")}
</div>
<div class="card">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${notesOpen?10:0}px;cursor:pointer" onclick="notesOpen=!notesOpen;render()">
    <div class="stitle" style="margin-bottom:0">Заметки<div class="sline"></div></div>
    <span style="color:#c9a84c;font-size:.8rem">${notesOpen?"▲":"▼"}</span>
  </div>
  ${notesOpen?`<textarea class="inp" style="min-height:120px;resize:vertical" oninput="S.notes=this.value">${S.notes||""}</textarea>`:""}
</div>`;
}
function addTitle(){S.titles.push({id:Date.now(),text:""});render();setTimeout(()=>{const els=document.querySelectorAll(".text-row .editable");if(els.length)els[els.length-1].focus();},50);}
function addSpecial(){S.specialProps.push({id:Date.now(),text:""});render();setTimeout(()=>{const els=document.querySelectorAll(".text-row .editable");if(els.length)els[els.length-1].focus();},50);}

// ── PROFESSIONS TAB ───────────────────────────────────────────────────────────

function rProf(){
  const KCOLORS={Лечение:"#27ae60",Алхимия:"#9b59b6",Магия:"#7ec8e3",Бой:"#e05050"};
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div class="stitle" style="margin-bottom:0">Профессии<div class="sline"></div></div>
      <div class="row">
        <span style="font-size:.7rem;color:#7a6a52">${S.professions.length} / ${S.professionLimit}</span>
        ${S.professions.length<S.professionLimit?`<button class="btn" onclick="oAddPr()">+ Профессия</button>`:""}
      </div>
    </div>
    ${S.professions.map(p=>{
      const pp=Math.min(100,p.exp/(p.expNext||1)*100);
      const cnt=S.skills.filter(s=>s.source===p.name).length;
      const kc=KCOLORS[p.knowledgeArea]||"#7a6a52";
      const displayName=p.uniqueName||p.name;
      return `<div class="pc">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div style="min-width:0">
            <div style="font-weight:bold;font-size:1rem;color:#c9a84c">${displayName}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:2px;flex-wrap:wrap">
              ${p.uniqueName?`<span style="font-size:.7rem;color:#7a6a52">${p.name}</span>`:""}
              <span class="lbadge">УР. ${p.level}</span>
            </div>
          </div>
          <button class="btn" style="flex-shrink:0;font-size:.68rem" onclick="oEditProf(${p.id})">Изменить</button>
        </div>
        <div style="margin-top:6px">
          ${p.knowledgeArea
            ?`<span style="font-size:.65rem;border:1px solid ${kc};color:${kc};border-radius:3px;padding:1px 7px">${p.knowledgeArea}</span>`
            :`<button class="btn" style="font-size:.65rem;padding:2px 8px" onclick="oSetKnowledge(${p.id})">+ Область знаний</button>`
          }
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:8px">
          <span style="font-size:.65rem;color:#7a6a52;flex-shrink:0">Опыт:</span>
          <input class="inp" type="number" value="${p.exp}" min="0" style="width:62px;padding:4px 6px" onchange="S.professions=S.professions.map(x=>x.id===${p.id}?{...x,exp:Math.max(0,+this.value)}:x);render()">
          <span style="font-size:.65rem;color:#7a6a52">/</span>
          <input class="inp" type="number" value="${p.expNext}" min="1" style="width:62px;padding:4px 6px" onchange="S.professions=S.professions.map(x=>x.id===${p.id}?{...x,expNext:Math.max(1,+this.value)}:x);render()">
        </div>
        <div class="bwrap" style="margin-top:6px"><div class="bfill" style="width:${pp}%;background:linear-gradient(90deg,#7a5c1e,#c9a84c)"></div></div>
        ${cnt>0?`<div style="margin-top:6px;font-size:.65rem;color:#7a6a52">${cnt} навык(ов) — см. раздел Навыки</div>`:""}
      </div>`;
    }).join("")}
  </div>`;
}

// ── SKILLS TAB ────────────────────────────────────────────────────────────────

function rSkills(){
  const sources=[...Object.values(AT),...S.professions.map(p=>p.name),"Другое"];
  const used=sources.filter(s=>S.skills.some(x=>x.source===s));
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div class="stitle" style="margin-bottom:0">Навыки персонажа<div class="sline"></div></div>
      <button class="btn" onclick="oAddSk()">+ Навык</button>
    </div>
    ${S.skills.length===0?'<div style="color:#7a6a52;font-size:.8rem">Нет навыков</div>':""}
    ${used.map(src=>`<div class="skill-group">
      <div class="sg-title">${src} <span style="color:#4a3a22">(${S.skills.filter(s=>s.source===src).length})</span></div>
      ${S.skills.filter(s=>s.source===src).map(s=>`<div class="ir irc">
        <div style="display:flex;width:100%;justify-content:space-between;align-items:center">
          <div class="row" style="flex-wrap:wrap;gap:4px">
            <span style="font-weight:bold;font-size:.82rem">${s.name}</span>
            ${tg(s.type==="passive"?"Пассивный":"Активный",s.type==="passive"?"#7a6a52":"#c9a84c")}
            ${s.level?tg("УР."+s.level,"#7ec8e3"):""}
          </div>
          <button class="btn" style="padding:3px 8px;font-size:.66rem;flex-shrink:0" onclick="oEditSk(${s.id})">✏</button>
        </div>
        ${s.description?`<div style="font-size:.72rem;color:#7a6a52">${s.description}</div>`:""}
        ${s.property?`<div style="font-size:.7rem;color:#27ae60">${s.property}</div>`:""}
        ${s.comment?`<div style="font-size:.68rem;color:#5a4a35;font-style:italic">${s.comment}</div>`:""}
      </div>`).join("")}
    </div>`).join("")}
  </div>`;
}

// ── INVENTORY TAB ─────────────────────────────────────────────────────────────

function invSec(key,title,items,innerFn){
  const open=invOpen[key];
  return `<div style="margin-bottom:4px">
    <div class="inv-sec-hdr" onclick="invOpen['${key}']=!invOpen['${key}'];render()">
      <span class="inv-sec-title">${title}</span>
      <div class="row" style="gap:6px">
        <span style="font-size:.68rem;color:#7a6a52">${items.length} пред.</span>
        <span style="color:#c9a84c;font-size:.8rem">${open?"▲":"▼"}</span>
      </div>
    </div>
    ${open?`<div style="margin-bottom:8px">${innerFn()}</div>`:""}
  </div>`;
}
function itemQtyRow(arr,id,field){
  const it=arr.find(x=>x.id===id);
  return `<button class="bdng" onclick="${field}=${field}.map(x=>x.id===${id}?{...x,qty:Math.max(0,x.qty-1)}:x);render()">−</button>
    <span style="color:#c9a84c;font-size:.75rem;min-width:14px;text-align:center">${it?it.qty:0}</span>
    <button class="bdng" style="color:#27ae60;border-color:#27ae60" onclick="${field}=${field}.map(x=>x.id===${id}?{...x,qty:x.qty+1}:x);render()">+</button>`;
}

function rInv(){
  const u=invUsed(),mx=imax(),p=Math.min(100,u/mx*100);
  return `
<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
    <div class="stitle" style="margin-bottom:0">Слоты<div class="sline"></div></div>
    <span style="font-size:.75rem;color:${u>=mx?"#e05050":"#c9a84c"}">${u} / ${mx}</span>
  </div>
  <div class="bwrap"><div class="bfill" style="width:${p}%;background:${u>=mx?"#c0392b":"linear-gradient(90deg,#7a5c1e,#c9a84c)"}"></div></div>
  <div style="margin-top:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
    <label class="tgl"><input type="checkbox" ${S.backpackOn?"checked":""} onchange="S.backpackOn=this.checked;render()"><span class="tsl"></span></label>
    <span style="font-size:.75rem;color:${S.backpackOn?"#27ae60":"#7a6a52"}">Рюкзак ${S.backpackOn?"надет":"снят"}</span>
    ${S.backpackOn?`<button class="btn" style="padding:2px 7px" onclick="S.backpackSlots=Math.max(1,S.backpackSlots-1);render()">−</button>
    <span style="color:#c9a84c;font-size:.8rem;min-width:18px;text-align:center">${S.backpackSlots}</span>
    <button class="btn" style="padding:2px 7px" onclick="S.backpackSlots++;render()">+</button>`:""}
  </div>
</div>
<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
    <div class="stitle" style="margin-bottom:0">Золото<div class="sline"></div></div>
    <button class="btn" onclick="openGoldCalc()">Калькулятор</button>
  </div>
  <div class="gold-num">${S.gold} <span style="font-size:1rem;color:#7a5c1e">зол.</span></div>
</div>
<div class="card">
  ${invSec("weapons","Оружие",S.weapons,()=>
    S.weapons.map(w=>`<div class="ir irc">
      <div style="display:flex;width:100%;justify-content:space-between;align-items:flex-start;gap:6px">
        <div style="flex:1">
          <div class="row" style="flex-wrap:wrap;gap:4px">
            <input class="editable" style="font-weight:bold;font-size:.84rem" value="${w.name}" onchange="S.weapons=S.weapons.map(x=>x.id===${w.id}?{...x,name:this.value}:x)">
            ${w.equipped?tg("Снаряжено","#27ae60"):""}
          </div>
        </div>
        <div class="row" style="flex-shrink:0">
          ${eqBtn(w.equipped,`S.weapons=S.weapons.map(x=>x.id===${w.id}?{...x,equipped:!x.equipped}:x);render()`)}
          ${itemQtyRow(S.weapons,w.id,"S.weapons")}
          <button class="bdng" onclick="S.weapons=S.weapons.filter(x=>x.id!==${w.id});render()">✕</button>
        </div>
      </div>
      <div style="font-size:.72rem;color:#7a6a52">Урон: <input class="editable" style="color:#c9a84c;width:70px" value="${w.damage}" onchange="S.weapons=S.weapons.map(x=>x.id===${w.id}?{...x,damage:this.value}:x)"> &nbsp;Бонус: <input class="editable" style="color:#e67e22;width:70px" value="${w.bonusDamage}" onchange="S.weapons=S.weapons.map(x=>x.id===${w.id}?{...x,bonusDamage:this.value}:x)"></div>
      <div style="font-size:.7rem;color:#7a6a52">Свойство: <input class="editable" style="width:150px" value="${w.property}" onchange="S.weapons=S.weapons.map(x=>x.id===${w.id}?{...x,property:this.value}:x)"></div>
      <div style="font-size:.68rem;color:#5a4a35">Заметка: <input class="editable" style="width:150px;color:#5a4a35" value="${w.comment}" onchange="S.weapons=S.weapons.map(x=>x.id===${w.id}?{...x,comment:this.value}:x)"></div>
    </div>`).join("")+`<button class="btn" style="width:100%;margin-top:4px" onclick="oAddWpSmart()">+ Оружие</button>`
  )}
  ${invSec("armors","Доспехи",S.armors,()=>
    S.armors.map(a=>`<div class="ir irc">
      <div style="display:flex;width:100%;justify-content:space-between;align-items:flex-start;gap:6px">
        <div style="flex:1">
          <div class="row" style="flex-wrap:wrap;gap:4px">
            <input class="editable" style="font-weight:bold;font-size:.84rem" value="${a.name}" onchange="S.armors=S.armors.map(x=>x.id===${a.id}?{...x,name:this.value}:x)">
            ${a.equipped?tg("Надето","#7ec8e3"):""}
          </div>
        </div>
        <div class="row" style="flex-shrink:0">
          ${eqBtn(a.equipped,`S.armors=S.armors.map(x=>x.id===${a.id}?{...x,equipped:!x.equipped}:{...x,equipped:false});render()`)}
          <button class="bdng" onclick="S.armors=S.armors.filter(x=>x.id!==${a.id});render()">✕</button>
        </div>
      </div>
      <div style="font-size:.72rem;color:#7a6a52">Броня: <input class="editable" type="number" style="color:#7ec8e3;width:45px" value="${a.armorValue}" onchange="S.armors=S.armors.map(x=>x.id===${a.id}?{...x,armorValue:+this.value}:x);render()"></div>
      <div style="font-size:.7rem;color:#7a6a52">Свойство: <input class="editable" style="width:150px" value="${a.property}" onchange="S.armors=S.armors.map(x=>x.id===${a.id}?{...x,property:this.value}:x)"></div>
      <div style="font-size:.68rem;color:#5a4a35">Заметка: <input class="editable" style="width:150px;color:#5a4a35" value="${a.comment}" onchange="S.armors=S.armors.map(x=>x.id===${a.id}?{...x,comment:this.value}:x)"></div>
    </div>`).join("")+`<button class="btn" style="width:100%;margin-top:4px" onclick="oAddArSmart()">+ Доспех</button>`
  )}
  ${invSec("accessories","Аксессуары",S.accessories,()=>
    S.accessories.map(a=>`<div class="ir irc">
      <div style="display:flex;width:100%;justify-content:space-between;align-items:flex-start;gap:6px">
        <div style="flex:1">
          <div class="row" style="flex-wrap:wrap;gap:4px">
            <input class="editable" style="font-weight:bold;font-size:.84rem" value="${a.name}" onchange="S.accessories=S.accessories.map(x=>x.id===${a.id}?{...x,name:this.value}:x)">
            ${a.equipped?tg("Надето","#9b59b6"):""}
          </div>
        </div>
        <div class="row" style="flex-shrink:0">
          ${eqBtn(a.equipped,`S.accessories=S.accessories.map(x=>x.id===${a.id}?{...x,equipped:!x.equipped}:x);render()`)}
          <button class="bdng" onclick="S.accessories=S.accessories.filter(x=>x.id!==${a.id});render()">✕</button>
        </div>
      </div>
      <div style="font-size:.7rem;color:#7a6a52">Свойство: <input class="editable" style="width:150px" value="${a.property||""}" onchange="S.accessories=S.accessories.map(x=>x.id===${a.id}?{...x,property:this.value}:x)"></div>
      <div style="font-size:.68rem;color:#5a4a35">Заметка: <input class="editable" style="width:150px;color:#5a4a35" value="${a.comment||""}" onchange="S.accessories=S.accessories.map(x=>x.id===${a.id}?{...x,comment:this.value}:x)"></div>
    </div>`).join("")+`<button class="btn" style="width:100%;margin-top:4px" onclick="oAddAcSmart()">+ Аксессуар</button>`
  )}
  ${invSec("alch","Алхимические предметы",S.alchItems,()=>
    S.alchItems.map(it=>`<div class="ir irc">
      <div style="display:flex;width:100%;justify-content:space-between;align-items:flex-start;gap:6px">
        <input class="editable" style="font-weight:bold;font-size:.84rem;flex:1" value="${it.name}" onchange="S.alchItems=S.alchItems.map(x=>x.id===${it.id}?{...x,name:this.value}:x)">
        <div class="row" style="flex-shrink:0">
          ${itemQtyRow(S.alchItems,it.id,"S.alchItems")}
          <button class="bdng" onclick="S.alchItems=S.alchItems.filter(x=>x.id!==${it.id});render()">✕</button>
        </div>
      </div>
      <div style="font-size:.72rem;color:#7a6a52">Ур: <input class="editable" type="number" style="color:#c9a84c;width:38px" value="${it.level}" onchange="S.alchItems=S.alchItems.map(x=>x.id===${it.id}?{...x,level:+this.value}:x)"> &nbsp;Атрибут: <input class="editable" style="width:80px" value="${it.attribute}" onchange="S.alchItems=S.alchItems.map(x=>x.id===${it.id}?{...x,attribute:this.value}:x)"></div>
      <div style="font-size:.7rem;color:#7a6a52">Свойство: <input class="editable" style="width:150px" value="${it.property||""}" onchange="S.alchItems=S.alchItems.map(x=>x.id===${it.id}?{...x,property:this.value}:x)"></div>
      <div style="font-size:.68rem;color:#5a4a35">Заметка: <input class="editable" style="width:150px;color:#5a4a35" value="${it.comment||""}" onchange="S.alchItems=S.alchItems.map(x=>x.id===${it.id}?{...x,comment:this.value}:x)"></div>
    </div>`).join("")+`<button class="btn" style="width:100%;margin-top:4px" onclick="oAddAlch()">+ Алх. предмет</button>`
  )}
  ${invSec("potions","Зелья и аптечки",S.potions,()=>
    S.potions.map(it=>`<div class="ir irc">
      <div style="display:flex;width:100%;justify-content:space-between;align-items:flex-start;gap:6px">
        <input class="editable" style="font-weight:bold;font-size:.84rem;flex:1" value="${it.name}" onchange="S.potions=S.potions.map(x=>x.id===${it.id}?{...x,name:this.value}:x)">
        <div class="row" style="flex-shrink:0">
          ${itemQtyRow(S.potions,it.id,"S.potions")}
          <button class="bdng" onclick="S.potions=S.potions.filter(x=>x.id!==${it.id});render()">✕</button>
        </div>
      </div>
      <div style="font-size:.7rem;color:#7a6a52">Свойство: <input class="editable" style="width:150px" value="${it.property||""}" onchange="S.potions=S.potions.map(x=>x.id===${it.id}?{...x,property:this.value}:x)"></div>
      <div style="font-size:.68rem;color:#5a4a35">Заметка: <input class="editable" style="width:150px;color:#5a4a35" value="${it.comment||""}" onchange="S.potions=S.potions.map(x=>x.id===${it.id}?{...x,comment:this.value}:x)"></div>
    </div>`).join("")+`<button class="btn" style="width:100%;margin-top:4px" onclick="oAddPotSmart()">+ Зелье</button>`
  )}
  ${invSec("misc","Остальное",S.misc,()=>
    S.misc.map(it=>`<div class="ir irc">
      <div style="display:flex;width:100%;justify-content:space-between;align-items:flex-start;gap:6px">
        <input class="editable" style="font-weight:bold;font-size:.84rem;flex:1" value="${it.name}" onchange="S.misc=S.misc.map(x=>x.id===${it.id}?{...x,name:this.value}:x)">
        <div class="row" style="flex-shrink:0">
          ${itemQtyRow(S.misc,it.id,"S.misc")}
          <button class="bdng" onclick="S.misc=S.misc.filter(x=>x.id!==${it.id});render()">✕</button>
        </div>
      </div>
      <div style="font-size:.7rem;color:#7a6a52">Свойство: <input class="editable" style="width:150px" value="${it.property||""}" onchange="S.misc=S.misc.map(x=>x.id===${it.id}?{...x,property:this.value}:x)"></div>
      <div style="font-size:.68rem;color:#5a4a35">Заметка: <input class="editable" style="width:150px;color:#5a4a35" value="${it.comment||""}" onchange="S.misc=S.misc.map(x=>x.id===${it.id}?{...x,comment:this.value}:x)"></div>
    </div>`).join("")+`<button class="btn" style="width:100%;margin-top:4px" onclick="oAddMiscSmart()">+ Предмет</button>`
  )}
</div>`;
}

// ── ALCHEMY TAB ───────────────────────────────────────────────────────────────

function alchLabel(it){return it?it.name+" [ур."+it.level+", "+it.attribute+"]":"?";}
function alchFind(id){return S.alchDB.find(x=>x.id===id);}
function alchTimePretty(ts){const d=new Date(ts);return [d.getHours(),d.getMinutes(),d.getSeconds()].map(x=>String(x).padStart(2,"0")).join(":");}
function alchLog(type,txt,extra){S.alchHistory.unshift({t:Date.now(),type,txt,extra:extra||""});if(S.alchHistory.length>200)S.alchHistory=S.alchHistory.slice(0,200);}

function alchQtyChange(dbId,delta){
  const it=alchFind(dbId);
  const entry=S.alchInventory.find(x=>x.dbId===dbId);
  if(!entry){if(delta>0){S.alchInventory.push({id:"ai"+Date.now(),dbId,qty:delta});alchLog("add","Добавлено",alchLabel(it));}}
  else{entry.qty=Math.max(0,entry.qty+delta);if(entry.qty===0){S.alchInventory=S.alchInventory.filter(x=>x.dbId!==dbId);alchLog("del","Убрано",alchLabel(it));}else alchLog("update","Изменено",alchLabel(it)+" → "+entry.qty);}
  if(it){
    const mi=S.alchItems.findIndex(x=>x.name===it.name);
    const newQty=S.alchInventory.find(x=>x.dbId===dbId)?.qty||0;
    if(mi>=0){if(newQty===0)S.alchItems.splice(mi,1);else S.alchItems[mi].qty=newQty;}
    else if(newQty>0)S.alchItems.push({id:Date.now(),name:it.name,level:it.level,attribute:it.attribute,property:"",comment:"",qty:newQty});
  }
  render();
}

function alchProcessOne(dbId){
  const entry=S.alchInventory.find(x=>x.dbId===dbId),it=alchFind(dbId);
  if(!entry||entry.qty<=0||!it){ntf("Нет предмета","#e05050");return;}
  const recipe=S.procRecipes.find(r=>r.srcId===dbId);
  if(!recipe){ntf("Нет рецепта обработки","#e67e22");return;}
  const roll=Math.random()*100;
  entry.qty=Math.max(0,entry.qty-1);
  if(entry.qty===0)S.alchInventory=S.alchInventory.filter(x=>x.dbId!==dbId);
  if(roll<S.alchSuccessChance){
    const re=S.alchInventory.find(x=>x.dbId===recipe.resId);
    if(re)re.qty++;else S.alchInventory.push({id:"ai"+Date.now(),dbId:recipe.resId,qty:1});
    const res=alchFind(recipe.resId);
    alchLog("success","Успех",alchLabel(it)+" → "+alchLabel(res));
    ntf("Успех! "+alchLabel(it)+" → "+alchLabel(res),"#27ae60");
  }else{alchLog("error","Провал",alchLabel(it));ntf("Провал! Предмет потерян","#e05050");}
  render();
}

function alchCreate(idx,arr){
  const r=arr[idx],prod=alchFind(r.resultId);
  if(!prod){ntf("Предмет рецепта удалён","#e05050");return;}
  for(const rid of r.reagentIds){const e=S.alchInventory.find(x=>x.dbId===rid);if(!e||e.qty<=0){const it=alchFind(rid);ntf("Не хватает: "+alchLabel(it),"#e05050");return;}}
  const roll=Math.random()*100;
  for(const rid of r.reagentIds){const e=S.alchInventory.find(x=>x.dbId===rid);if(e){e.qty--;if(e.qty<=0)S.alchInventory=S.alchInventory.filter(x=>x.dbId!==rid);}}
  if(roll<S.alchSuccessChance){
    const re=S.alchInventory.find(x=>x.dbId===r.resultId);
    if(re)re.qty++;else S.alchInventory.push({id:"ai"+Date.now(),dbId:r.resultId,qty:1});
    alchLog("synth","Синтез успешен",alchLabel(prod));ntf("Синтез успешен: "+alchLabel(prod),"#27ae60");
  }else{alchLog("error","Синтез провалился",alchLabel(prod));ntf("Синтез провалился!","#e05050");}
  render();
}

function alchSortedFiltered(){
  let items=[...S.alchDB];
  if(alchBaseSearch)items=items.filter(x=>x.name.toLowerCase().includes(alchBaseSearch.toLowerCase())||x.attribute.toLowerCase().includes(alchBaseSearch.toLowerCase()));
  items.sort((a,b)=>alchBaseSortCol==="level"?alchBaseSortDir*(a.level-b.level):alchBaseSortCol==="attribute"?alchBaseSortDir*a.attribute.localeCompare(b.attribute,"ru"):alchBaseSortDir*a.name.localeCompare(b.name,"ru"));
  if(!alchBaseGroupBy)return [{groupKey:"",items}];
  const map={};items.forEach(i=>{const k=alchBaseGroupBy==="level"?String(i.level):i.attribute;map[k]=map[k]||[];map[k].push(i);});
  return Object.entries(map).map(([groupKey,items])=>({groupKey,items})).sort((a,b)=>alchBaseGroupBy==="level"?Number(a.groupKey)-Number(b.groupKey):a.groupKey.localeCompare(b.groupKey,"ru"));
}

function setAlchInvSort(col){
  if(alchInvSortBy===col)alchInvSortDir=-alchInvSortDir;
  else{alchInvSortBy=col;alchInvSortDir=1;}
  render();
}
function setAlchBaseSort(col){
  if(alchBaseSortCol===col)alchBaseSortDir=-alchBaseSortDir;
  else{alchBaseSortCol=col;alchBaseSortDir=1;}
  render();
}
function sa(col,cur,dir){return cur===col?(dir>0?' ▲':' ▼'):'';}

function oSetAlchChance(){
  openMod('<div class="mtitle">Шанс обработки</div>'
    +'<div style="font-size:.75rem;color:#7a6a52;margin-bottom:12px">Вероятность успешной обработки и синтеза (1–100%)</div>'
    +'<label class="fl">Шанс (%)</label>'
    +'<input class="inp" type="number" id="alch_chance_inp" min="1" max="100" value="'+S.alchSuccessChance+'">'
    +'<div class="row" style="margin-top:16px">'
    +'<button class="bpri" style="flex:1" onclick="S.alchSuccessChance=Math.min(100,Math.max(1,+document.getElementById(\'alch_chance_inp\').value));closeMod();render()">Сохранить</button>'
    +'<button class="btn" onclick="closeMod()">Отмена</button>'
    +'</div>');
}
function oAddAlchDB(){
  openMod('<div class="mtitle">Добавить предмет в базу</div>'
    +'<label class="fl">Название</label><input class="inp" id="alchDbName" placeholder="Название">'
    +'<label class="fl">Уровень</label><input class="inp" type="number" id="alchDbLevel" value="1" min="1">'
    +'<label class="fl">Атрибут</label><input class="inp" id="alchDbAttr" placeholder="напр. Огонь">'
    +'<div class="row" style="margin-top:16px">'
    +'<button class="bpri" style="flex:1" onclick="alchAddToDB()">Добавить</button>'
    +'<button class="btn" onclick="closeMod()">Отмена</button>'
    +'</div>');
}

function alchSect(key,title,inner,extraHdr){
  const open=alchSectOpen[key];
  return '<div style="margin-bottom:4px">'
    +'<div class="inv-sec-hdr" onclick="alchSectOpen.'+key+'=!alchSectOpen.'+key+';render()" style="cursor:pointer">'
    +'<span class="inv-sec-title">'+title+'</span>'
    +'<div class="row" style="gap:6px" onclick="event.stopPropagation()">'
    +(extraHdr||'')
    +'<span style="color:#c9a84c;font-size:.8rem;cursor:pointer" onclick="alchSectOpen.'+key+'=!alchSectOpen.'+key+';render()">'+(open?"▲":"▼")+'</span>'
    +'</div></div>'
    +(open?'<div style="margin-bottom:8px">'+inner+'</div>':"")
    +'</div>';
}

function rAlch(){
  let invSorted=[...S.alchInventory];
  invSorted.sort((a,b)=>{
    const ia=alchFind(a.dbId),ib=alchFind(b.dbId);if(!ia||!ib)return 0;
    if(alchInvSortBy==="level")return alchInvSortDir*(ia.level-ib.level);
    if(alchInvSortBy==="attribute")return alchInvSortDir*ia.attribute.localeCompare(ib.attribute,"ru");
    if(alchInvSortBy==="qty")return alchInvSortDir*(a.qty-b.qty);
    return alchInvSortDir*ia.name.localeCompare(ib.name,"ru");
  });
  let invGroups;
  if(!alchInvGroupBy){invGroups=[{groupKey:"",items:invSorted}];}
  else{const m={};invSorted.forEach(e=>{const it=alchFind(e.dbId);const k=!it?"?":(alchInvGroupBy==="level"?String(it.level):it.attribute);m[k]=m[k]||[];m[k].push(e);});invGroups=Object.entries(m).map(([g,items])=>({groupKey:g,items})).sort((a,b)=>alchInvGroupBy==="level"?Number(a.groupKey)-Number(b.groupKey):a.groupKey.localeCompare(b.groupKey,"ru"));}

  let invRows="";
  for(const g of invGroups){
    if(alchInvGroupBy)invRows+='<tr style="background:#1a1510"><td colspan="5" style="font-size:.65rem;color:#c9a84c;letter-spacing:.12em;padding:5px 8px">'+(alchInvGroupBy==="level"?"УР. ":"")+g.groupKey+'</td></tr>';
    for(const entry of g.items){
      const it=alchFind(entry.dbId);if(!it)continue;
      invRows+='<tr>'
        +'<td style="text-align:left;padding:6px 8px">'+it.name+'</td>'
        +'<td style="text-align:center">'+it.level+'</td>'
        +'<td style="text-align:center">'+it.attribute+'</td>'
        +'<td style="white-space:nowrap;text-align:center">'
        +'<button class="btn" style="padding:2px 7px" onclick="alchQtyChange(\''+entry.dbId+'\',-1)">−</button>'
        +' <span style="color:#c9a84c;min-width:20px;display:inline-block;text-align:center">'+entry.qty+'</span> '
        +'<button class="btn" style="padding:2px 7px" onclick="alchQtyChange(\''+entry.dbId+'\',1)">+</button>'
        +'</td>'
        +'<td style="text-align:center"><button class="btn" style="padding:3px 8px;font-size:.68rem" onclick="alchProcessOne(\''+entry.dbId+'\')">Обработать</button></td>'
        +'</tr>';
    }
  }

  const groups=alchSortedFiltered();
  let baseRows="";
  for(const g of groups){
    if(alchBaseGroupBy)baseRows+='<tr style="background:#1a1510"><td colspan="5" style="font-size:.65rem;color:#c9a84c;letter-spacing:.12em;padding:5px 8px">'+g.groupKey+'</td></tr>';
    for(const it of g.items){
      const inInv=S.alchInventory.find(x=>x.dbId===it.id);
      baseRows+='<tr>'
        +'<td style="text-align:left;padding:6px 8px">'+it.name+'</td>'
        +'<td style="text-align:center">'+it.level+'</td>'
        +'<td style="text-align:center">'+it.attribute+'</td>'
        +'<td style="text-align:center">'+(inInv?inInv.qty:0)+'</td>'
        +'<td style="text-align:center;white-space:nowrap">'
        +'<button class="btn" style="padding:3px 7px;font-size:.68rem" onclick="alchQtyChange(\''+it.id+'\',1)">+ Инв.</button> '
        +'<button class="bdng" onclick="alchDelFromDB(\''+it.id+'\')">✕</button>'
        +'</td></tr>';
    }
  }
  if(!baseRows)baseRows='<tr><td colspan="5" style="color:#7a6a52;font-style:italic;padding:10px">База пуста</td></tr>';

  let procRows=S.procRecipes.map((r,i)=>{
    const src=alchFind(r.srcId),res=alchFind(r.resId);
    return '<tr><td style="text-align:left;padding:5px 8px">'+(src?alchLabel(src):"(удалён)")+'</td>'
      +'<td style="text-align:left;padding:5px 8px">'+(res?alchLabel(res):"(удалён)")+'</td>'
      +'<td><button class="bdng" onclick="S.procRecipes.splice('+i+',1);render()">✕</button></td></tr>';
  }).join("")||'<tr><td colspan="3" style="color:#7a6a52;font-style:italic;padding:8px">Нет рецептов</td></tr>';

  function recipeRows(arr,arrName){
    return arr.map((r,i)=>{
      const prod=alchFind(r.resultId),inInv=prod?S.alchInventory.find(x=>x.dbId===r.resultId):null;
      const reagText=r.reagentIds.map(id=>{const it=alchFind(id);return it?it.name:"?";}).join(" + ");
      return '<tr><td style="text-align:left;padding:5px 8px">'+(prod?alchLabel(prod):"(удалён)")+'</td>'
        +'<td style="text-align:left;padding:5px 8px;color:#7a6a52;font-size:.78rem">'+reagText+'</td>'
        +'<td style="text-align:center">'+(inInv?inInv.qty:0)+'</td>'
        +'<td style="white-space:nowrap">'
        +'<button class="btn" style="padding:3px 7px;font-size:.68rem" onclick="alchCreate('+i+','+arrName+')">Создать</button> '
        +'<button class="bdng" onclick="'+arrName+'.splice('+i+',1);render()">✕</button>'
        +'</td></tr>';
    }).join("")||'<tr><td colspan="4" style="color:#7a6a52;font-style:italic;padding:8px">Нет рецептов</td></tr>';
  }

  const dbOpts=S.alchDB.map(it=>'<option value="'+it.id+'">'+alchLabel(it)+'</option>').join("");
  let reagSelects="",circleSelects="";
  for(let i=0;i<alchReagentCount;i++)reagSelects+='<select class="inp" style="width:auto;margin-bottom:4px" id="alchReag_'+i+'">'+dbOpts+'</select> ';
  for(let i=0;i<alchCircleReagentCount;i++)circleSelects+='<select class="inp" style="width:auto;margin-bottom:4px" id="alchCircReag_'+i+'">'+dbOpts+'</select> ';

  const histColors={add:"#27ae60",update:"#7ec8e3",del:"#e67e22",success:"#27ae60",error:"#e05050",synth:"#9b59b6",recipe:"#c9a84c"};
  const histHtml=S.alchHistory.length===0
    ?'<div style="color:#7a6a52;font-size:.78rem;padding:6px">Нет событий</div>'
    :S.alchHistory.slice(0,80).map(e=>'<div style="font-size:.72rem;padding:3px 0;border-bottom:1px solid #1a1510;color:'+(histColors[e.type]||"#7a6a52")+'">'
      +'<span style="color:#5a4a35;font-family:monospace">'+alchTimePretty(e.t)+'</span>'
      +' <span style="font-weight:bold">'+e.txt+'</span>'
      +(e.extra?' <span style="color:#7a6a52">'+e.extra+'</span>':"")
      +'</div>').join("");

  const thS='style="cursor:pointer;user-select:none"';
  const thSC='style="cursor:pointer;user-select:none;text-align:center"';

  const invCard='<div class="card">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
    +'<span class="inv-sec-title">Инвентарь алхимика</span>'
    +'<div class="row" style="gap:6px">'
    +'<button class="bpri" style="font-size:.72rem;padding:4px 10px;border-radius:20px" onclick="oSetAlchChance()">🎲 '+S.alchSuccessChance+'%</button>'
    +'<button class="btn" style="padding:4px 8px;font-size:.8rem" title="Группировка" onclick="alchInvGroupVisible=!alchInvGroupVisible;render()">⚙</button>'
    +'</div></div>'
    +(alchInvGroupVisible
      ?'<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;padding:6px 8px;background:#0d0b09;border-radius:6px;border:1px solid #242018">'
        +'<span style="font-size:.68rem;color:#7a6a52;flex-shrink:0">Группировка:</span>'
        +'<select class="inp" style="width:auto" onchange="alchInvGroupBy=this.value;render()">'
        +'<option value=""'+(alchInvGroupBy===""?" selected":"")+'>Нет</option>'
        +'<option value="level"'+(alchInvGroupBy==="level"?" selected":"")+'>Уровень</option>'
        +'<option value="attribute"'+(alchInvGroupBy==="attribute"?" selected":"")+'>Атрибут</option>'
        +'</select></div>'
      :"")
    +'<div style="overflow-x:auto"><table class="alch-tbl">'
    +'<tr>'
    +'<th '+thS+' onclick="setAlchInvSort(\'name\')" style="cursor:pointer;user-select:none;text-align:left">НАЗВАНИЕ'+sa("name",alchInvSortBy,alchInvSortDir)+'</th>'
    +'<th '+thSC+' onclick="setAlchInvSort(\'level\')">УР.'+sa("level",alchInvSortBy,alchInvSortDir)+'</th>'
    +'<th '+thSC+' onclick="setAlchInvSort(\'attribute\')">АТРИБУТ'+sa("attribute",alchInvSortBy,alchInvSortDir)+'</th>'
    +'<th '+thSC+' onclick="setAlchInvSort(\'qty\')">КОЛ-ВО'+sa("qty",alchInvSortBy,alchInvSortDir)+'</th>'
    +'<th style="text-align:center">ДЕЙСТВИЕ</th>'
    +'</tr>'
    +(invRows||'<tr><td colspan="5" style="color:#7a6a52;font-style:italic;padding:10px">Инвентарь пуст</td></tr>')
    +'</table></div></div>';

  const procInner='<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end;margin-bottom:10px;padding:8px;background:#0d0b09;border-radius:6px;border:1px solid #1a1510">'
    +'<div><div class="fl">Исходник</div><select class="inp" id="procSrc" style="width:auto">'+(dbOpts||'<option>База пуста</option>')+'</select></div>'
    +'<div><div class="fl">Результат</div><select class="inp" id="procRes" style="width:auto">'+(dbOpts||'<option>База пуста</option>')+'</select></div>'
    +'<button class="btn" onclick="saveProcRecipe()">Сохранить</button></div>'
    +'<div style="overflow-x:auto"><table class="alch-tbl">'
    +'<tr><th style="text-align:left">ИСХОДНИК</th><th style="text-align:left">РЕЗУЛЬТАТ</th><th></th></tr>'
    +procRows+'</table></div>';

  const alchInner='<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end;margin-bottom:10px;padding:8px;background:#0d0b09;border-radius:6px;border:1px solid #1a1510">'
    +'<div><div class="fl">Результат</div><select class="inp" id="alchResId" style="width:auto">'+(dbOpts||'<option>База пуста</option>')+'</select></div>'
    +'<div><div class="fl">Реагенты ('+alchReagentCount+')</div><div style="display:flex;flex-wrap:wrap;gap:4px">'+reagSelects+'</div></div>'
    +'<div class="row"><button class="btn" style="padding:3px 8px" onclick="if(alchReagentCount&lt;6)alchReagentCount++;render()">+</button>'
    +'<button class="btn" style="padding:3px 8px" onclick="if(alchReagentCount&gt;2)alchReagentCount--;render()">−</button>'
    +'<button class="btn" onclick="saveAlchRecipe(\'normal\')">Сохранить</button></div></div>'
    +'<div style="overflow-x:auto"><table class="alch-tbl">'
    +'<tr><th style="text-align:left">РЕЗУЛЬТАТ</th><th style="text-align:left">РЕАГЕНТЫ</th><th>В ИНВ.</th><th></th></tr>'
    +recipeRows(S.alchRecipes,"S.alchRecipes")+'</table></div>';

  const circleInner='<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end;margin-bottom:10px;padding:8px;background:#0d0b09;border-radius:6px;border:1px solid #1a1510">'
    +'<div><div class="fl">Результат</div><select class="inp" id="alchCircResId" style="width:auto">'+(dbOpts||'<option>База пуста</option>')+'</select></div>'
    +'<div><div class="fl">Реагенты ('+alchCircleReagentCount+')</div><div style="display:flex;flex-wrap:wrap;gap:4px">'+circleSelects+'</div></div>'
    +'<div class="row"><button class="btn" style="padding:3px 8px" onclick="if(alchCircleReagentCount&lt;6)alchCircleReagentCount++;render()">+</button>'
    +'<button class="btn" style="padding:3px 8px" onclick="if(alchCircleReagentCount&gt;2)alchCircleReagentCount--;render()">−</button>'
    +'<button class="btn" onclick="saveAlchRecipe(\'circle\')">Сохранить</button></div></div>'
    +'<div style="overflow-x:auto"><table class="alch-tbl">'
    +'<tr><th style="text-align:left">РЕЗУЛЬТАТ</th><th style="text-align:left">РЕАГЕНТЫ</th><th>В ИНВ.</th><th></th></tr>'
    +recipeRows(S.alchCircleRecipes,"S.alchCircleRecipes")+'</table></div>';

  const baseSearch='<input class="inp" placeholder="Поиск..." style="width:110px" oninput="alchBaseSearch=this.value;render()" value="'+alchBaseSearch+'">';
  const baseExtraHdr=baseSearch
    +'<button class="btn" style="padding:3px 8px;font-size:.72rem" onclick="oAddAlchDB()">+ Добавить</button>'
    +'<button class="btn" style="padding:4px 8px;font-size:.8rem" title="Группировка" onclick="alchBaseGroupVisible=!alchBaseGroupVisible;render()">⚙</button>';

  const baseGroupRow=alchBaseGroupVisible
    ?'<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;padding:6px 8px;background:#0d0b09;border-radius:6px;border:1px solid #1a1510">'
      +'<span style="font-size:.68rem;color:#7a6a52;flex-shrink:0">Группировка:</span>'
      +'<select class="inp" style="width:auto" onchange="alchBaseGroupBy=this.value;render()">'
      +'<option value=""'+(alchBaseGroupBy===""?" selected":"")+'>Нет</option>'
      +'<option value="level"'+(alchBaseGroupBy==="level"?" selected":"")+'>Уровень</option>'
      +'<option value="attribute"'+(alchBaseGroupBy==="attribute"?" selected":"")+'>Атрибут</option>'
      +'</select></div>'
    :"";

  const baseInner=baseGroupRow
    +'<div style="overflow-x:auto"><table class="alch-tbl">'
    +'<tr>'
    +'<th '+thS+' onclick="setAlchBaseSort(\'name\')" style="cursor:pointer;user-select:none;text-align:left">НАЗВАНИЕ'+sa("name",alchBaseSortCol,alchBaseSortDir)+'</th>'
    +'<th '+thSC+' onclick="setAlchBaseSort(\'level\')">УР.'+sa("level",alchBaseSortCol,alchBaseSortDir)+'</th>'
    +'<th '+thSC+' onclick="setAlchBaseSort(\'attribute\')">АТРИБУТ'+sa("attribute",alchBaseSortCol,alchBaseSortDir)+'</th>'
    +'<th style="text-align:center">В ИНВ.</th>'
    +'<th></th>'
    +'</tr>'
    +baseRows+'</table></div>';

  const histInner='<div style="max-height:200px;overflow-y:auto;background:#0a0908;border:1px solid #242018;border-radius:6px;padding:8px">'+histHtml+'</div>';
  const histCard='<div style="margin-bottom:4px">'
    +'<div class="inv-sec-hdr" onclick="alchSectOpen.hist=!alchSectOpen.hist;render()" style="cursor:pointer">'
    +'<span class="inv-sec-title">История</span>'
    +'<div class="row" style="gap:6px" onclick="event.stopPropagation()">'
    +'<button class="bdng" style="padding:2px 7px;font-size:.68rem" onclick="S.alchHistory=[];render()">Очистить</button>'
    +'<span style="color:#c9a84c;font-size:.8rem;cursor:pointer" onclick="alchSectOpen.hist=!alchSectOpen.hist;render()">'+(alchSectOpen.hist?"▲":"▼")+'</span>'
    +'</div></div>'
    +(alchSectOpen.hist?'<div style="margin-bottom:8px">'+histInner+'</div>':"")
    +'</div>';

  const hasProcessing=S.skills.some(s=>s.name==="Обработка алхимических ингредиентов");
  const hasBaseReaction=S.skills.some(s=>s.name==="Базовая алхимическая реакция");
  const hasCircle=S.skills.some(s=>s.name==="Алхимический круг");
  const lockedMsg=(skill)=>'<div style="color:#7a6a52;font-size:.78rem;padding:8px">🔒 Доступно при наличии навыка «'+skill+'»</div>';

  return invCard
    +alchSect("proc","Рецепты обработки",hasProcessing?procInner:lockedMsg("Обработка алхимических ингредиентов"))
    +alchSect("recipes","Базовая алхимическая реакция",hasBaseReaction?alchInner:lockedMsg("Базовая алхимическая реакция"))
    +alchSect("circle","Алхимический круг",hasCircle?circleInner:lockedMsg("Алхимический круг"))
    +alchSect("base","База предметов",baseInner,baseExtraHdr)
    +histCard;
}

function alchAddToDB(){
  const name=(document.getElementById("alchDbName")||{}).value?.trim();
  const level=parseInt((document.getElementById("alchDbLevel")||{}).value)||1;
  const attribute=(document.getElementById("alchDbAttr")||{}).value?.trim();
  if(!name||!attribute){ntf("Заполните все поля","#e05050");return;}
  if(S.alchDB.find(x=>x.name===name&&x.level===level&&x.attribute===attribute)){ntf("Уже есть в базе","#e67e22");return;}
  S.alchDB.push({id:"a"+Date.now(),name,level,attribute});
  alchLog("add","Добавлено в базу",name+" [ур."+level+", "+attribute+"]");
  closeMod();ntf("Добавлено: "+name);render();
}
function alchDelFromDB(id){
  const it=alchFind(id);if(!it)return;
  S.alchDB=S.alchDB.filter(x=>x.id!==id);
  S.alchInventory=S.alchInventory.filter(x=>x.dbId!==id);
  S.procRecipes=S.procRecipes.filter(r=>r.srcId!==id&&r.resId!==id);
  S.alchRecipes=S.alchRecipes.filter(r=>r.resultId!==id&&!r.reagentIds.includes(id));
  S.alchCircleRecipes=S.alchCircleRecipes.filter(r=>r.resultId!==id&&!r.reagentIds.includes(id));
  alchLog("del","Удалён из базы",alchLabel(it));ntf("Удалено: "+it.name,"#e05050");render();
}
function saveProcRecipe(){
  const s=document.getElementById("procSrc"),r=document.getElementById("procRes");
  if(!s||!r)return;
  if(S.procRecipes.find(x=>x.srcId===s.value)){ntf("Рецепт уже есть","#e67e22");return;}
  S.procRecipes.push({srcId:s.value,resId:r.value});
  alchLog("recipe","Рецепт обработки сохранён","");ntf("Рецепт сохранён");render();
}
function saveAlchRecipe(type){
  const resId=(type==="circle"?document.getElementById("alchCircResId"):document.getElementById("alchResId"))?.value;
  const count=type==="circle"?alchCircleReagentCount:alchReagentCount;
  const prefix=type==="circle"?"alchCircReag_":"alchReag_";
  const reagentIds=[];
  for(let i=0;i<count;i++){const el=document.getElementById(prefix+i);if(el)reagentIds.push(el.value);}
  if(!resId||reagentIds.length<2){ntf("Выберите результат и реагенты","#e05050");return;}
  (type==="circle"?S.alchCircleRecipes:S.alchRecipes).push({resultId:resId,reagentIds});
  alchLog("recipe","Рецепт сохранён"+(type==="circle"?" (круг)":""),"");ntf("Рецепт сохранён");render();
}

// ── QUESTS & NPC ──────────────────────────────────────────────────────────────

function rQNPC(){
  var active=S.quests.filter(function(q){return !q.done;}),done=S.quests.filter(function(q){return q.done;});
  function taskListHtml(q){
    var tasks=q.tasks||[];
    if(!tasks.length) return '';
    return tasks.map(function(t){
      return '<div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0 5px 12px;border-top:1px solid #1a1510">'
        +'<div style="flex:1;min-width:0">'
        +'<span style="font-size:.78rem;'+(t.done?'text-decoration:line-through;color:#5a4a35':'color:#e8dcc8')+'">'+(t.done?'✓ ':'')+t.name+'</span>'
        +(t.description?'<div style="font-size:.68rem;color:#7a6a52;margin-top:1px">'+t.description+'</div>':"")
        +'</div>'
        +'<div class="row" style="flex-shrink:0">'
        +(t.done
          ?'<button class="btn" style="padding:2px 7px;font-size:.62rem" onclick="toggleTask('+q.id+','+t.id+')">↩</button>'
          :'<button class="btn" style="padding:2px 7px;font-size:.62rem;color:#27ae60;border-color:#27ae60" onclick="toggleTask('+q.id+','+t.id+')">✓</button>'
        )
        +'<button class="btn" style="padding:2px 7px;font-size:.62rem" onclick="oEditTask('+q.id+','+t.id+')">✏</button>'
        +'</div></div>';
    }).join("");
  }
  var activeHtml=active.map(function(q){
    var tasks=q.tasks||[];
    var doneCount=tasks.filter(function(t){return t.done;}).length;
    var tasksOpen=questTasksOpen[q.id]!==false;
    var toggle='questTasksOpen['+q.id+']='+(!tasksOpen)+';render()';
    return '<div class="quest-item">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'
      +'<div style="flex:1;min-width:0;cursor:pointer" onclick="'+toggle+'">'
      +'<div style="display:flex;align-items:center;gap:6px">'
      +'<span style="font-weight:bold;font-size:.88rem;color:#c9a84c">'+q.name+'</span>'
      +(tasks.length?'<span style="font-size:.65rem;color:#5a4a35">'+doneCount+'/'+tasks.length+'</span>'
        +'<span style="color:#c9a84c;font-size:.7rem">'+(tasksOpen?"▲":"▼")+'</span>':"")
      +'</div>'
      +(q.description?'<div style="font-size:.72rem;color:#7a6a52;margin-top:3px">'+q.description+'</div>':"")
      +'</div>'
      +'<div class="row" style="flex-shrink:0">'
      +'<button class="btn" style="padding:3px 8px;font-size:.66rem" onclick="event.stopPropagation();oEditQuest('+q.id+')">✏</button>'
      +'<button class="btn" style="padding:3px 8px;font-size:.66rem;color:#27ae60;border-color:#27ae60" onclick="event.stopPropagation();S.quests=S.quests.map(function(x){return x.id==='+q.id+'?Object.assign({},x,{done:true}):x;});render()">✓</button>'
      +'</div></div>'
      +(tasksOpen
        ?(tasks.length?'<div style="margin-top:4px">'+taskListHtml(q)+'</div>':"")
        +'<button class="btn" style="width:100%;margin-top:6px;font-size:.68rem" onclick="oAddTask('+q.id+')">+ Пункт</button>'
        :"")
      +'</div>';
  }).join("");
  var doneHtml=done.map(function(q){
    return '<div class="quest-item quest-done">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'
      +'<div style="flex:1"><div style="font-weight:bold;font-size:.82rem;text-decoration:line-through;color:#5a4a35">'+q.name+'</div></div>'
      +'<div class="row">'
      +'<button class="btn" style="padding:3px 8px;font-size:.66rem" onclick="S.quests=S.quests.map(function(x){return x.id==='+q.id+'?Object.assign({},x,{done:false}):x;});render()">↩</button>'
      +'<button class="bdng" onclick="S.quests=S.quests.filter(function(x){return x.id!=='+q.id+';});render()">✕</button>'
      +'</div></div></div>';
  }).join("");
  var npcHtml=S.npcs.map(function(n){
    return '<div class="npc-item">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start">'
      +'<div style="flex:1"><div style="font-weight:bold;font-size:.84rem;color:#c9a84c">'+n.name+'</div>'
      +(n.notes?'<div style="font-size:.72rem;color:#7a6a52;margin-top:4px">'+n.notes+'</div>':"")
      +'</div><div class="row">'
      +'<button class="btn" style="padding:3px 8px;font-size:.66rem" onclick="oEditNPC('+n.id+')">Изм.</button>'
      +'<button class="bdng" onclick="S.npcs=S.npcs.filter(function(x){return x.id!=='+n.id+';});render()">✕</button>'
      +'</div></div></div>';
  }).join("");
  return '<div class="card">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
    +'<div class="stitle" style="margin-bottom:0">Квесты и задачи<div class="sline"></div></div>'
    +'<button class="btn" onclick="oAddQuest()">+ Квест</button></div>'
    +'<div style="font-size:.65rem;color:#7a6a52;letter-spacing:.1em;margin-bottom:8px;cursor:pointer" onclick="questsOpenActive=!questsOpenActive;render()">АКТИВНЫЕ ('+active.length+') '+(questsOpenActive?"▲":"▼")+'</div>'
    +(questsOpenActive?activeHtml:'')
    +'<div style="font-size:.65rem;color:#7a6a52;letter-spacing:.1em;margin-top:10px;margin-bottom:8px;cursor:pointer" onclick="questsOpenDone=!questsOpenDone;render()">ВЫПОЛНЕНЫ ('+done.length+') '+(questsOpenDone?"▲":"▼")+'</div>'
    +(questsOpenDone?doneHtml:'')
    +'</div>'
    +'<div class="card">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
    +'<div class="stitle" style="margin-bottom:0">Персонажи (НПС)<div class="sline"></div></div>'
    +'<button class="btn" onclick="oAddNPC()">+ НПС</button></div>'
    +(S.npcs.length===0?'<div style="color:#7a6a52;font-size:.8rem">Нет записей</div>':npcHtml)
    +'</div>';
}

function rPh(i,t){return '<div class="card"><div style="text-align:center;padding:36px 16px"><div style="font-size:2.2rem;margin-bottom:10px">'+i+'</div><div style="color:#c9a84c;font-size:.95rem;letter-spacing:.1em">'+t+'</div><div style="color:#7a6a52;font-size:.78rem;margin-top:6px">В разработке</div></div></div>';}

// ── MAIN RENDER ───────────────────────────────────────────────────────────────

function render(){
  scheduleSave();
  document.getElementById("charNameDisp").textContent = S.name || "Персонаж";
  document.getElementById("lvlD").textContent = "УР. " + S.level;
  var slotEl = document.getElementById("slotD");
  if (slotEl) {
    slotEl.textContent = (activeSlot + 1) + "/" + (slots.length || 1);
    slotEl.style.display = (slots.length > 1) ? "" : "none";
  }

  var hasAlch=S.professions.some(function(p){return p.knowledgeArea==="Алхимия";});
  var hasMagic=S.professions.some(function(p){return p.knowledgeArea==="Магия";});
  var tbs=[["char","Персонаж"],["professions","Профессии"],["skills","Навыки"],["inventory","Инвентарь"]];
  if(hasAlch) tbs.push(["alchemy","Алхимия"]);
  if(hasMagic) tbs.push(["magic","Магия"]);
  tbs.push(["qnpc","Квесты / НПС"]);
  if(!tbs.find(function(tb){return tb[0]===tab;})) tab="char";
  var map={char:rChar,professions:rProf,skills:rSkills,inventory:rInv,alchemy:rAlch,magic:function(){return rPh("🔮","СИСТЕМА МАГИИ");},qnpc:rQNPC};
  document.getElementById("cnt").innerHTML=(map[tab]||rChar)();
  var tabButtons=[];
  tbs.forEach(function(tb){var k=tb[0],l=tb[1];tabButtons.push('<button class="tbtn'+(tab===k?' on':'')+'" onclick="setTab(\x27'+k+'\x27)">'+l+'</button>');});
  document.getElementById("tabs").innerHTML=tabButtons.join("");
}

// ── ATTRIBUTE MODAL ───────────────────────────────────────────────────────────

function oAttr(){
  var html='<div class="mtitle">Изменить атрибуты</div>';
  Object.keys(AT).forEach(function(k){html+='<label class="fl">'+AT[k]+'</label><input class="inp" type="number" id="ae_'+k+'" value="'+S.attributes[k]+'">';});
  html+='<div class="row" style="margin-top:16px"><button class="bpri" onclick="sAttr()">Сохранить</button><button class="btn" onclick="closeMod()">Отмена</button></div>';
  openMod(html);
}
function sAttr(){Object.keys(AT).forEach(function(k){S.attributes[k]=parseInt(document.getElementById("ae_"+k).value)||0;});closeMod();ntf("Атрибуты обновлены");render();}

// ── SKILL MODALS ──────────────────────────────────────────────────────────────

function oAddSk(){
  var srcOpts=Object.values(AT).concat(S.professions.map(function(p){return p.name;})).concat(["Другое"]);
  openMod('<div class="mtitle">Новый навык</div>'
    +'<label class="fl">Название</label><input class="inp" id="sk_n">'
    +'<label class="fl">Уровень навыка</label><input class="inp" type="number" id="sk_lv" value="1" min="1">'
    +'<label class="fl">Источник</label><select class="inp" id="sk_src">'+srcOpts.map(function(o){return '<option>'+o+'</option>';}).join("")+'</select>'
    +'<label class="fl">Тип</label><select class="inp" id="sk_t"><option value="passive">Пассивный</option><option value="active">Активный</option></select>'
    +'<label class="fl">Описание</label><textarea class="inp" id="sk_d"></textarea>'
    +'<label class="fl">Свойство</label><input class="inp" id="sk_prop">'
    +'<label class="fl">Комментарий</label><input class="inp" id="sk_com">'
    +'<label class="fl">Бонус к (необязательно)</label>'
    +'<select class="inp" id="sk_bt" onchange="document.getElementById(\'sk_bvw\').style.display=this.value?\'block\':\'none\'"><option value="">— нет —</option>'+BT.map(function(x){return '<option>'+x+'</option>';}).join("")+'</select>'
    +'<div id="sk_bvw" style="display:none"><label class="fl">Значение бонуса</label><input class="inp" type="number" id="sk_bv" value="0"></div>'
    +'<div class="row" style="margin-top:16px"><button class="bpri" onclick="sSk()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');
}
function sSk(){
  var n=document.getElementById("sk_n").value.trim();if(!n)return;
  var bt=document.getElementById("sk_bt").value;
  S.skills.push({id:Date.now(),name:n,level:+document.getElementById("sk_lv").value||1,source:document.getElementById("sk_src").value,type:document.getElementById("sk_t").value,
    description:document.getElementById("sk_d").value,property:document.getElementById("sk_prop").value,
    comment:document.getElementById("sk_com").value,bonusTarget:bt,bonusValue:bt?+document.getElementById("sk_bv").value:0});
  closeMod();ntf("Навык добавлен");render();
}
function oEditSk(id){
  var s=S.skills.find(function(x){return x.id===id;});if(!s)return;
  var srcOpts=Object.values(AT).concat(S.professions.map(function(p){return p.name;})).concat(["Другое"]);
  openMod('<div class="mtitle">Редактировать навык</div>'
    +'<label class="fl">Название</label><input class="inp" id="esk_n" value="'+s.name+'">'
    +'<label class="fl">Уровень навыка</label><input class="inp" type="number" id="esk_lv" value="'+(s.level||1)+'" min="1">'
    +'<label class="fl">Источник</label><select class="inp" id="esk_src">'+srcOpts.map(function(o){return '<option'+(o===s.source?' selected':'')+'>'+o+'</option>';}).join("")+'</select>'
    +'<label class="fl">Тип</label><select class="inp" id="esk_t"><option value="passive"'+(s.type==="passive"?' selected':'')+'>Пассивный</option><option value="active"'+(s.type==="active"?' selected':'')+'>Активный</option></select>'
    +'<label class="fl">Описание</label><textarea class="inp" id="esk_d">'+(s.description||'')+'</textarea>'
    +'<label class="fl">Свойство</label><input class="inp" id="esk_prop" value="'+(s.property||'')+'">'
    +'<label class="fl">Комментарий</label><input class="inp" id="esk_com" value="'+(s.comment||'')+'">'
    +'<label class="fl">Бонус к</label>'
    +'<select class="inp" id="esk_bt" onchange="document.getElementById(\'esk_bvw\').style.display=this.value?\'block\':\'none\'"><option value="">— нет —</option>'+BT.map(function(x){return '<option'+(x===s.bonusTarget?' selected':'')+'>'+x+'</option>';}).join("")+'</select>'
    +'<div id="esk_bvw" style="display:'+(s.bonusTarget?'block':'none')+'"><label class="fl">Значение бонуса</label><input class="inp" type="number" id="esk_bv" value="'+(s.bonusValue||0)+'"></div>'
    +'<div style="border-top:1px solid #242018;margin-top:14px;padding-top:12px">'
    +'<button class="bdng" style="width:100%" onclick="oConfirmDeleteSk('+id+')">🗑 Удалить навык</button>'
    +'</div>'
    +'<div class="row" style="margin-top:12px"><button class="bpri" onclick="sEditSk('+id+')">Сохранить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');
}
function sEditSk(id){
  var bt=document.getElementById("esk_bt").value;
  S.skills=S.skills.map(function(s){return s.id===id?Object.assign({},s,{name:document.getElementById("esk_n").value.trim()||s.name,level:+document.getElementById("esk_lv").value||1,source:document.getElementById("esk_src").value,type:document.getElementById("esk_t").value,description:document.getElementById("esk_d").value,property:document.getElementById("esk_prop").value,comment:document.getElementById("esk_com").value,bonusTarget:bt,bonusValue:bt?+document.getElementById("esk_bv").value:0}):s;});
  closeMod();ntf("Навык обновлён");render();
}
function oConfirmDeleteSk(id){
  var s=S.skills.find(function(x){return x.id===id;});if(!s)return;
  openMod('<div class="mtitle">Удалить навык?</div>'
    +'<div style="font-size:.82rem;color:#e8dcc8;margin-bottom:16px">«'+s.name+'» будет удалён безвозвратно.</div>'
    +'<div class="row"><button class="bdng" style="flex:1" onclick="S.skills=S.skills.filter(x=>x.id!=='+id+');closeMod();ntf(\'Навык удалён\');render()">Удалить</button><button class="btn" style="flex:1" onclick="oEditSk('+id+')">Отмена</button></div>');
}

// ── PROFESSION MODALS ─────────────────────────────────────────────────────────

function oAddPr(){
  var KAREAS=["","Лечение","Алхимия","Магия","Бой"];
  openMod('<div class="mtitle">Новая профессия</div>'
    +'<label class="fl">Системное название <span style="color:#e05050">*</span></label><input class="inp" id="pr_n" placeholder="напр. Алхимик">'
    +'<div style="font-size:.68rem;color:#7a6a52;margin:-6px 0 8px">По этому названию строятся связи с навыками</div>'
    +'<label class="fl">Уникальное название (для игрока)</label><input class="inp" id="pr_un" placeholder="необязательно">'
    +'<label class="fl">Уровень</label><input class="inp" type="number" id="pr_l" value="1">'
    +'<label class="fl">Область знаний</label>'
    +'<select class="inp" id="pr_ka">'+KAREAS.map(function(k){return '<option value="'+k+'">'+(k||'— нет —')+'</option>';}).join("")+'</select>'
    +'<div class="row" style="margin-top:16px"><button class="bpri" onclick="sPr()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');
}
function sPr(){
  var n=document.getElementById("pr_n").value.trim();if(!n)return;
  S.professions.push({id:Date.now(),name:n,uniqueName:document.getElementById("pr_un").value.trim(),level:+document.getElementById("pr_l").value||1,exp:0,expNext:30,knowledgeArea:document.getElementById("pr_ka").value});
  closeMod();ntf("Профессия добавлена");render();
}
function oEditProf(id){
  var p=S.professions.find(function(x){return x.id===id;});if(!p)return;
  var KAREAS=["","Лечение","Алхимия","Магия","Бой"];
  openMod('<div class="mtitle">Редактировать профессию</div>'
    +'<label class="fl">Системное название</label><input class="inp" id="ep_n" value="'+p.name+'">'
    +'<label class="fl">Уникальное название</label><input class="inp" id="ep_un" value="'+(p.uniqueName||'')+'">'
    +'<label class="fl">Уровень</label><input class="inp" type="number" id="ep_l" value="'+p.level+'">'
    +'<label class="fl">Область знаний</label>'
    +'<select class="inp" id="ep_ka">'+KAREAS.map(function(k){return '<option value="'+k+'"'+(p.knowledgeArea===k?' selected':'')+'>'+(k||'— нет —')+'</option>';}).join("")+'</select>'
    +'<div style="border-top:1px solid #242018;margin-top:16px;padding-top:12px">'
    +'<button class="bdng" style="width:100%" onclick="oConfirmDeleteProf('+id+')">🗑 Удалить профессию</button>'
    +'</div>'
    +'<div class="row" style="margin-top:12px"><button class="bpri" onclick="sEditProf('+id+')">Сохранить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');
}
function sEditProf(id){
  var oldName=(S.professions.find(function(p){return p.id===id;})||{}).name||"";
  var newName=document.getElementById("ep_n").value.trim()||oldName;
  S.professions=S.professions.map(function(p){return p.id===id?Object.assign({},p,{name:newName,uniqueName:document.getElementById("ep_un").value.trim(),level:+document.getElementById("ep_l").value||1,knowledgeArea:document.getElementById("ep_ka").value}):p;});
  if(newName!==oldName) S.skills=S.skills.map(function(s){return s.source===oldName?Object.assign({},s,{source:newName}):s;});
  closeMod();ntf("Профессия обновлена");render();
}
function oConfirmDeleteProf(id){
  var p=S.professions.find(function(x){return x.id===id;});if(!p)return;
  var cnt=S.skills.filter(function(s){return s.source===p.name;}).length;
  openMod('<div class="mtitle">Удалить профессию?</div>'
    +'<div style="font-size:.82rem;color:#e8dcc8;margin-bottom:12px">«'+(p.uniqueName||p.name)+'» будет удалена.'+(cnt>0?' Также '+cnt+' навык(ов) переедут в раздел «Другое».':'')+'</div>'
    +'<div class="row"><button class="bdng" style="flex:1" onclick="deleteProf('+id+')">Удалить</button><button class="btn" style="flex:1" onclick="oEditProf('+id+')">Отмена</button></div>');
}
function deleteProf(id){
  var p=S.professions.find(function(x){return x.id===id;});
  if(p) S.skills=S.skills.map(function(s){return s.source===p.name?Object.assign({},s,{source:"Другое"}):s;});
  S.professions=S.professions.filter(function(x){return x.id!==id;});
  closeMod();ntf("Профессия удалена");render();
}
function oSetKnowledge(id){
  var KAREAS=["Лечение","Алхимия","Магия","Бой"];
  openMod('<div class="mtitle">Область знаний</div>'
    +'<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">'
    +KAREAS.map(function(k){return '<button class="btn" style="text-align:left;padding:10px 14px;font-size:.85rem" onclick="S.professions=S.professions.map(x=>x.id==='+id+'?{...x,knowledgeArea:\''+k+'\'}:x);closeMod();render()">'+k+'</button>';}).join("")
    +'</div>'
    +'<button class="btn" style="width:100%" onclick="closeMod()">Отмена</button>');
}

// ── ACHIEVEMENT MODALS ────────────────────────────────────────────────────────

function oAddAch(){openMod('<div class="mtitle">Новая ачивка</div><label class="fl">Название</label><input class="inp" id="ach_n"><label class="fl">Свойство</label><input class="inp" id="ach_p"><div class="row" style="margin-top:16px"><button class="bpri" onclick="sAch()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
function sAch(){var n=document.getElementById("ach_n").value.trim();if(!n)return;S.achievements.push({id:Date.now(),name:n,property:document.getElementById("ach_p").value});closeMod();ntf("Ачивка добавлена");render();}

// ── INVENTORY MODALS ──────────────────────────────────────────────────────────

function smartModal(title,type,formHtml){
  var addFn="addFromDB_"+type;
  var html='<div class="mtitle">'+title+'</div>'
    +'<label class="fl">Поиск в базе</label>'
    +'<input class="inp" id="srch_inp" placeholder="Введите название..." oninput="renderSearchResults(this.value,&quot;'+type+'&quot;,&quot;srch_res&quot;,&quot;'+addFn+'&quot;)">'
    +'<div id="srch_res" style="margin-top:6px;max-height:160px;overflow-y:auto"></div>'
    +'<div style="border-top:1px solid #242018;margin-top:10px;padding-top:10px">'
    +'<div style="font-size:.65rem;color:#7a6a52;letter-spacing:.1em;margin-bottom:8px">ИЛИ ДОБАВИТЬ НОВЫЙ</div>'
    +formHtml+'</div>';
  openMod(html);
}
function addFromDB_weapon(gid){var r=S.globalItemDB.find(function(x){return x.id===gid;});if(!r)return;S.weapons.push({id:Date.now(),name:r.name,damage:r.damage||"",bonusDamage:r.bonusDamage||"",property:r.property||"",comment:"",qty:1,equipped:false});closeMod();ntf("Добавлено: "+r.name);render();}
function addFromDB_armor(gid){var r=S.globalItemDB.find(function(x){return x.id===gid;});if(!r)return;S.armors.push({id:Date.now(),name:r.name,armorValue:r.armorValue||0,property:r.property||"",comment:"",qty:1,equipped:false});closeMod();ntf("Добавлено: "+r.name);render();}
function addFromDB_accessory(gid){var r=S.globalItemDB.find(function(x){return x.id===gid;});if(!r)return;S.accessories.push({id:Date.now(),name:r.name,property:r.property||"",comment:"",bonusTarget:r.bonusTarget||"",bonusValue:r.bonusValue||0,qty:1,equipped:false});closeMod();ntf("Добавлено: "+r.name);render();}
function addFromDB_potion(gid){var r=S.globalItemDB.find(function(x){return x.id===gid;});if(!r)return;S.potions.push({id:Date.now(),name:r.name,property:r.property||"",comment:"",qty:1});closeMod();ntf("Добавлено: "+r.name);render();}
function addFromDB_misc(gid){var r=S.globalItemDB.find(function(x){return x.id===gid;});if(!r)return;S.misc.push({id:Date.now(),name:r.name,property:r.property||"",comment:"",qty:1});closeMod();ntf("Добавлено: "+r.name);render();}

function oAddWpSmart(){smartModal("Оружие","weapon",'<label class="fl">Название</label><input class="inp" id="wp_n"><label class="fl">Урон</label><input class="inp" id="wp_d" placeholder="напр. 1d8+3"><label class="fl">Бонусный урон</label><input class="inp" id="wp_b" placeholder="напр. +2 огня"><label class="fl">Свойство</label><input class="inp" id="wp_p"><label class="fl">Комментарий</label><input class="inp" id="wp_c"><div class="row" style="margin-top:16px"><button class="bpri" onclick="sWp()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
function sWp(){var n=document.getElementById("wp_n").value.trim();if(!n)return;var item={id:Date.now(),name:n,damage:document.getElementById("wp_d").value,bonusDamage:document.getElementById("wp_b").value,property:document.getElementById("wp_p").value,comment:document.getElementById("wp_c").value,qty:1,equipped:false};S.weapons.push(item);addToGlobalDB({name:n,type:"weapon",damage:item.damage,bonusDamage:item.bonusDamage,property:item.property});closeMod();ntf("Оружие добавлено");render();}
function oAddArSmart(){smartModal("Доспех","armor",'<label class="fl">Название</label><input class="inp" id="ar_n"><label class="fl">Значение брони</label><input class="inp" type="number" id="ar_v" value="0"><label class="fl">Свойство</label><input class="inp" id="ar_p"><label class="fl">Комментарий</label><input class="inp" id="ar_c"><div class="row" style="margin-top:16px"><button class="bpri" onclick="sAr()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
function sAr(){var n=document.getElementById("ar_n").value.trim();if(!n)return;var item={id:Date.now(),name:n,armorValue:+document.getElementById("ar_v").value||0,property:document.getElementById("ar_p").value,comment:document.getElementById("ar_c").value,qty:1,equipped:false};S.armors.push(item);addToGlobalDB({name:n,type:"armor",armorValue:item.armorValue,property:item.property});closeMod();ntf("Доспех добавлен");render();}
function oAddAcSmart(){
  var btOpts=BT.map(function(x){return '<option>'+x+'</option>';}).join("");
  var form='<label class="fl">Название</label><input class="inp" id="ac_n">'
    +'<label class="fl">Свойство</label><input class="inp" id="ac_p">'
    +'<label class="fl">Комментарий</label><input class="inp" id="ac_c">'
    +'<label class="fl">Бонус к (необязательно)</label>'
    +'<select class="inp" id="ac_bt" onchange="document.getElementById(&quot;ac_bvw&quot;).style.display=this.value?&quot;block&quot;:&quot;none&quot;">'
    +'<option value="">— нет —</option>'+btOpts+'</select>'
    +'<div id="ac_bvw" style="display:none"><label class="fl">Значение бонуса</label><input class="inp" type="number" id="ac_bv" value="0"></div>'
    +'<div class="row" style="margin-top:16px"><button class="bpri" onclick="sAc()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>';
  smartModal("Аксессуар","accessory",form);
}
function sAc(){var n=document.getElementById("ac_n").value.trim();if(!n)return;var bt=document.getElementById("ac_bt").value;var item={id:Date.now(),name:n,property:document.getElementById("ac_p").value,comment:document.getElementById("ac_c").value,bonusTarget:bt,bonusValue:bt?+document.getElementById("ac_bv").value:0,qty:1,equipped:false};S.accessories.push(item);addToGlobalDB({name:n,type:"accessory",property:item.property,bonusTarget:bt,bonusValue:item.bonusValue});closeMod();ntf("Аксессуар добавлен");render();}
function oAddPotSmart(){smartModal("Зелье / аптечка","potion",'<label class="fl">Название</label><input class="inp" id="pot_n"><label class="fl">Свойство</label><input class="inp" id="pot_p"><label class="fl">Комментарий</label><input class="inp" id="pot_c"><div class="row" style="margin-top:16px"><button class="bpri" onclick="sPotion()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
function sPotion(){var n=document.getElementById("pot_n").value.trim();if(!n)return;var item={id:Date.now(),name:n,property:document.getElementById("pot_p").value,comment:document.getElementById("pot_c").value,qty:1};S.potions.push(item);addToGlobalDB({name:n,type:"potion",property:item.property});closeMod();ntf("Добавлено");render();}
function oAddMiscSmart(){smartModal("Предмет","misc",'<label class="fl">Название</label><input class="inp" id="mi_n"><label class="fl">Свойство</label><input class="inp" id="mi_p"><label class="fl">Комментарий</label><input class="inp" id="mi_c"><div class="row" style="margin-top:16px"><button class="bpri" onclick="sMisc()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
function sMisc(){var n=document.getElementById("mi_n").value.trim();if(!n)return;var item={id:Date.now(),name:n,property:document.getElementById("mi_p").value,comment:document.getElementById("mi_c").value,qty:1};S.misc.push(item);addToGlobalDB({name:n,type:"misc",property:item.property});closeMod();ntf("Добавлено");render();}
function oAddAlch(){openMod('<div class="mtitle">Алхимический предмет</div><label class="fl">Название</label><input class="inp" id="al_n"><label class="fl">Уровень</label><input class="inp" type="number" id="al_l" value="1"><label class="fl">Атрибут</label><input class="inp" id="al_a" placeholder="напр. Огонь"><label class="fl">Свойство</label><input class="inp" id="al_p"><label class="fl">Комментарий</label><input class="inp" id="al_c"><div class="row" style="margin-top:16px"><button class="bpri" onclick="sAlch()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
function sAlch(){var n=document.getElementById("al_n").value.trim();if(!n)return;S.alchItems.push({id:Date.now(),name:n,level:+document.getElementById("al_l").value||1,attribute:document.getElementById("al_a").value,property:document.getElementById("al_p").value,comment:document.getElementById("al_c").value,qty:1});closeMod();ntf("Предмет добавлен");render();}

// ── QUEST MODALS ──────────────────────────────────────────────────────────────

function oAddQuest(){
  openMod('<div class="mtitle">Новый квест</div>'
    +'<label class="fl">Название</label><input class="inp" id="q_n">'
    +'<label class="fl">Описание</label><textarea class="inp" id="q_d"></textarea>'
    +'<div class="row" style="margin-top:16px"><button class="bpri" onclick="sQuest()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');
}
function sQuest(){
  var n=document.getElementById("q_n").value.trim();if(!n)return;
  S.quests.push({id:Date.now(),name:n,description:document.getElementById("q_d").value,done:false,tasks:[]});
  closeMod();ntf("Квест добавлен");render();
}
function oEditQuest(id){
  var q=S.quests.find(function(x){return x.id===id;});if(!q)return;
  openMod('<div class="mtitle">Редактировать квест</div>'
    +'<label class="fl">Название</label><input class="inp" id="eq_n" value="'+q.name+'">'
    +'<label class="fl">Описание</label><textarea class="inp" id="eq_d">'+(q.description||'')+'</textarea>'
    +'<div style="border-top:1px solid #242018;margin-top:14px;padding-top:12px">'
    +'<button class="bdng" style="width:100%" onclick="S.quests=S.quests.filter(x=>x.id!=='+id+');closeMod();render()">🗑 Удалить квест</button>'
    +'</div>'
    +'<div class="row" style="margin-top:12px"><button class="bpri" onclick="sEditQuest('+id+')">Сохранить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');
}
function sEditQuest(id){
  S.quests=S.quests.map(function(q){return q.id===id?Object.assign({},q,{name:document.getElementById("eq_n").value.trim()||q.name,description:document.getElementById("eq_d").value}):q;});
  closeMod();ntf("Квест обновлён");render();
}
function oAddTask(qid){
  openMod('<div class="mtitle">Новый пункт квеста</div>'
    +'<label class="fl">Название</label><input class="inp" id="ta_n">'
    +'<label class="fl">Описание</label><textarea class="inp" id="ta_d"></textarea>'
    +'<div class="row" style="margin-top:16px"><button class="bpri" onclick="sAddTask('+qid+')">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');
}
function sAddTask(qid){
  var n=document.getElementById("ta_n").value.trim();if(!n)return;
  S.quests=S.quests.map(function(q){
    if(q.id!==qid) return q;
    var tasks=(q.tasks||[]).concat([{id:Date.now(),name:n,description:document.getElementById("ta_d").value,done:false}]);
    return Object.assign({},q,{tasks:tasks});
  });
  closeMod();ntf("Пункт добавлен");render();
}
function toggleTask(qid,tid){
  S.quests=S.quests.map(function(q){
    if(q.id!==qid) return q;
    return Object.assign({},q,{tasks:(q.tasks||[]).map(function(t){return t.id===tid?Object.assign({},t,{done:!t.done}):t;})});
  });
  render();
}
function oEditTask(qid,tid){
  var q=S.quests.find(function(x){return x.id===qid;});if(!q)return;
  var t=(q.tasks||[]).find(function(x){return x.id===tid;});if(!t)return;
  openMod('<div class="mtitle">Редактировать пункт</div>'
    +'<label class="fl">Название</label><input class="inp" id="eta_n" value="'+t.name+'">'
    +'<label class="fl">Описание</label><textarea class="inp" id="eta_d">'+(t.description||'')+'</textarea>'
    +'<div style="border-top:1px solid #242018;margin-top:14px;padding-top:12px">'
    +'<button class="bdng" style="width:100%" onclick="deleteTask('+qid+','+tid+')">🗑 Удалить пункт</button>'
    +'</div>'
    +'<div class="row" style="margin-top:12px"><button class="bpri" onclick="sEditTask('+qid+','+tid+')">Сохранить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');
}
function sEditTask(qid,tid){
  S.quests=S.quests.map(function(q){
    if(q.id!==qid) return q;
    return Object.assign({},q,{tasks:(q.tasks||[]).map(function(t){return t.id===tid?Object.assign({},t,{name:document.getElementById("eta_n").value.trim()||t.name,description:document.getElementById("eta_d").value}):t;})});
  });
  closeMod();ntf("Пункт обновлён");render();
}
function deleteTask(qid,tid){
  S.quests=S.quests.map(function(q){
    if(q.id!==qid) return q;
    return Object.assign({},q,{tasks:(q.tasks||[]).filter(function(t){return t.id!==tid;})});
  });
  closeMod();render();
}

// ── NPC MODALS ────────────────────────────────────────────────────────────────

function oAddNPC(){openMod('<div class="mtitle">Новый НПС</div><label class="fl">Имя</label><input class="inp" id="npc_n"><label class="fl">Заметки</label><textarea class="inp" id="npc_d"></textarea><div class="row" style="margin-top:16px"><button class="bpri" onclick="sNPC()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
function sNPC(){var n=document.getElementById("npc_n").value.trim();if(!n)return;S.npcs.push({id:Date.now(),name:n,notes:document.getElementById("npc_d").value});closeMod();ntf("НПС добавлен");render();}
function oEditNPC(id){var n=S.npcs.find(function(x){return x.id===id;});openMod('<div class="mtitle">Редактировать НПС</div><label class="fl">Имя</label><input class="inp" id="en_n" value="'+n.name+'"><label class="fl">Заметки</label><textarea class="inp" id="en_d">'+n.notes+'</textarea><div class="row" style="margin-top:16px"><button class="bpri" onclick="sEditNPC('+id+')">Сохранить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
function sEditNPC(id){S.npcs=S.npcs.map(function(x){return x.id===id?Object.assign({},x,{name:document.getElementById("en_n").value,notes:document.getElementById("en_d").value}):x;});closeMod();ntf("НПС обновлён");render();}
