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
    name:"",level:1,exp:0,expNext:30,avatar:"",
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
      + '<button class="btn" onclick="event.stopPropagation();openSlotEdit(' + i + ')" style="padding:3px 7px;font-size:.65rem" title="Редактировать">✏</button>'
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

function openSlotEdit(idx){
  saveCurrentSlot();
  var sl=slots[idx]||{};
  var nm=sl.name||'';
  var av=sl.avatar||'';
  var previewStyle=av?'background-image:url('+av+');background-size:cover;background-position:center;':'';
  var html='<div class="mtitle">✏ Редактировать персонажа '+(idx+1)+'</div>'
    +'<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:10px">'
    +'<div id="se_av_prev" style="width:64px;height:64px;border:2px solid var(--border);border-radius:6px;background:var(--bg-deep);flex-shrink:0;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;'+previewStyle+'" onclick="document.getElementById(\'se_av_inp\').click()">'
    +(av?'':'<span style="font-size:1.4rem;opacity:.3">⚔</span>')
    +'</div>'
    +'<div style="flex:1">'
    +'<label class="fl" style="margin-top:0">Имя персонажа</label>'
    +'<input class="inp" id="se_name" value="'+nm+'">'
    +'<label class="fl" style="margin-top:6px;font-size:.65rem;color:var(--text-dim)">Аватарка (нажми на картинку слева)</label>'
    +'<input type="file" id="se_av_inp" accept="image/*" style="display:none" onchange="handleSlotAvatarPick(this,'+idx+')">'
    +'</div></div>'
    +'<div class="row" style="margin-top:8px">'
    +'<button class="bpri" style="flex:1" onclick="saveSlotEdit('+idx+')">Сохранить</button>'
    +(av?'<button class="bdng" style="padding:8px 12px" onclick="clearSlotAvatar('+idx+')" title="Удалить аватарку">✕</button>':'')
    +'<button class="btn" style="flex:1" onclick="openCharSelect()">Назад</button>'
    +'</div>';
  openMod(html);
}
function handleSlotAvatarPick(input,idx){
  var file=input.files&&input.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    var img=new Image();
    img.onload=function(){
      var canvas=document.createElement('canvas');
      var size=128;
      canvas.width=size;canvas.height=size;
      var ctx=canvas.getContext('2d');
      var scale=Math.max(size/img.width,size/img.height);
      var w=img.width*scale,h=img.height*scale;
      ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);
      var b64=canvas.toDataURL('image/jpeg',0.7);
      var prev=document.getElementById('se_av_prev');
      if(prev){prev.style.backgroundImage='url('+b64+')';prev.style.backgroundSize='cover';prev.style.backgroundPosition='center';prev.innerHTML='';}
      if(!slots[idx])slots[idx]={};
      slots[idx]._pendingAvatar=b64;
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}
function saveSlotEdit(idx){
  var nm=document.getElementById('se_name');
  if(!slots[idx])slots[idx]=defaultChar();
  if(nm)slots[idx].name=nm.value.trim();
  if(slots[idx]._pendingAvatar){slots[idx].avatar=slots[idx]._pendingAvatar;delete slots[idx]._pendingAvatar;}
  if(idx===activeSlot){S.name=slots[idx].name;S.avatar=slots[idx].avatar||'';}
  closeMod();ntf('Сохранено','#27ae60');render();
}
function clearSlotAvatar(idx){
  if(slots[idx])slots[idx].avatar='';
  if(idx===activeSlot)S.avatar='';
  openSlotEdit(idx);
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
var skillGrpOpen={};
let questTasksOpen={};
let alchSectOpen={inv:true,proc:true,recipes:true,circle:true,base:true,hist:true};
let alchReagentCount=2,alchCircleReagentCount=2;
let alchBaseSortCol="name",alchBaseSortDir=1,alchBaseSearch="";
let alchBaseGroupBy="",alchInvGroupBy="",alchInvSortBy="name",alchInvSortDir=1;
let alchInvGroupVisible=false,alchBaseGroupVisible=false;
let alchInvSortVisible=false,alchBaseSortVisible=false;
let hcv="",gcv="";
let notesOpen=false;
let charSecState={prof:false,props:false,titles:false,ach:false,notes:false};

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
// openHpCalc / closeHpCalc defined as bridge functions in index.html
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
  hcv="";
  var _hpn=document.getElementById("hpcnum");if(_hpn)_hpn.textContent="0";
  var _hpd=document.getElementById("hp-disp");if(_hpd)_hpd.textContent="0";
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
// openGoldCalc / closeGoldCalc defined as bridge functions in index.html
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
  gcv="";
  var _gcn=document.getElementById("gcnum");if(_gcn)_gcn.textContent="0";
  var _gcd=document.getElementById("gold-disp");if(_gcd)_gcd.textContent="0";
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
  const pp=Math.min(100,Math.max(0,h>0?hp/h*100:0));
  const ep=Math.min(100,S.expNext>0?S.exp/S.expNext*100:0);
  const sc=charSecState;

  // Attribute cells (2×3 compact grid)
  const attrGrid=Object.entries(AT).map(([k,l])=>{
    const base=S.attributes[k],fs=skBonus(l),fc=acBonus(l),total=base+fs+fc;
    const bonusTip=fs>0||fc>0?` title="база: ${base}${fs>0?', +'+fs+' навыки':''}${fc>0?', +'+fc+' аксессуары':''}"`:' title="Изменить атрибуты"';
    return `<div class="ac"${bonusTip} onclick="oAttr()">
      <div class="av-total">${total}</div>
      <div class="al">${l}</div>
    </div>`;
  }).join("");

  // Armor sub-text
  const eqArmor=S.armors.find(x=>x.equipped);
  const armorSub=eqArmor?eqArmor.name+(eqArmor.armorValue?' (+'+eqArmor.armorValue+')':''):(a>0?'навыки / аксессуары':'нет доспеха');

  // Professions section
  const KCOLORS={Лечение:"tg-green",Алхимия:"tg-gold",Магия:"tg-blue",Бой:"tg-red"};
  const profCards=S.professions.map(p=>{
    const pp2=Math.min(100,p.expNext>0?p.exp/p.expNext*100:0);
    const cnt=S.skills.filter(s=>s.source===p.name).length;
    const displayName=p.uniqueName||p.name;
    const klass=p.knowledgeArea?(KCOLORS[p.knowledgeArea]||'tg-dim'):'';
    return `<div class="prof-card" onclick="oEditProf(${p.id})">
      <div class="flex-between">
        <div class="prof-name">${displayName}</div>
        <span class="tg tg-gold" style="font-size:.5rem">УР. ${p.level}</span>
      </div>
      <div class="prof-sub mt6" style="display:flex;gap:4px;flex-wrap:wrap">
        ${p.knowledgeArea?`<span class="tg ${klass}" style="font-size:.45rem">${p.knowledgeArea}</span>`:''}
        ${cnt>0?`<span class="tg tg-dim" style="font-size:.45rem">${cnt} навык${cnt===1?'':'ов'}</span>`:''}
      </div>
      <div class="exp-block mt10" onclick="event.stopPropagation()">
        <div class="bwrap" style="margin-top:0;height:3px"><div class="bfill exp-fill" style="width:${pp2}%"></div></div>
        <div class="flex-between" style="margin-top:4px">
          <span class="fs-xs text-dim">Опыт</span>
          <span class="fs-xs text-gold">${p.exp} / ${p.expNext}</span>
        </div>
      </div>
    </div>`;
  }).join("");
  const profAdd=S.professions.length<S.professionLimit
    ?`<div class="prof-card grid-add" onclick="oAddPr()" style="min-height:80px">+</div>`:
    '';

  // Special props rows
  const specialRows=S.specialProps.map(t=>`<div class="text-row">
    <span style="color:var(--blue);font-size:.8rem">◈</span>
    <input class="editable" value="${t.text}" onchange="S.specialProps=S.specialProps.map(x=>x.id===${t.id}?{...x,text:this.value}:x)">
    <button class="bdng" onclick="confirmDeleteProp(${t.id})">✕</button>
  </div>`).join("");

  // Title rows
  const titleRows=S.titles.map(t=>`<div class="text-row">
    <span style="color:var(--gold-dim);font-size:.8rem">✦</span>
    <input class="editable" value="${t.text}" onchange="S.titles=S.titles.map(x=>x.id===${t.id}?{...x,text:this.value}:x)">
    <button class="bdng" onclick="confirmDeleteTitle(${t.id})">✕</button>
  </div>`).join("");

  // Achievement rows
  const achItems=S.achievements.map(a=>`<div class="ach-item">
    <div class="ach-icon">🏆</div>
    <div class="ach-body">
      <div class="ach-name">${a.name}</div>
      ${a.property?`<div class="ach-prop">${a.property}</div>`:''}
    </div>
    <button class="bdng" onclick="confirmDeleteAch(${a.id})">✕</button>
  </div>`).join("");

  return `<div class="card card-accent">
  <div class="stitle stitle-gold"><div class="orn-diamond"></div> Персонаж <div class="orn-diamond"></div><div class="sline"></div></div>
  <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:14px">
    <div class="ag ag-compact" style="grid-template-columns:repeat(2,1fr);align-content:start">
      ${attrGrid}
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;min-width:0;overflow:hidden">
      <div class="lvl-badge" onclick="openExpModal()">Уровень ${S.level}</div>
      <div class="exp-block" onclick="openExpModal()">
        <div class="bwrap" style="margin-top:0"><div class="bfill exp-fill" style="width:${ep}%"></div></div>
        <div class="flex-between" style="margin-top:5px">
          <span class="fs-xs text-dim">Опыт</span>
          <span class="fs-xs text-gold">${S.exp} / ${S.expNext}</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;min-width:0">
        <div class="stat-box hp hp-block" style="min-width:0;overflow:hidden" onclick="openHpModal()">
          <div class="stat-box-label">Здоровье</div>
          <div class="stat-box-val">${hp}<span style="font-size:.9rem;opacity:.5"> / ${h}</span></div>
          <div class="bwrap mt6"><div class="bfill hp-fill" style="width:${pp}%"></div></div>
          <div class="stat-box-sub">⚔ изменить HP</div>
        </div>
        <div class="stat-box" style="min-width:0;overflow:hidden">
          <div class="stat-box-label">Броня</div>
          <div class="stat-box-val" style="font-size:1.2rem">${a}</div>
          <div class="stat-box-sub">${armorSub}</div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="card${sc.prof?' collapsed':''}" id="sec-prof">
  <div class="stitle stitle-clickable" onclick="toggleSection('sec-prof')">
    <div class="orn-diamond"></div> Профессии <span class="text-dim fs-xs" style="font-weight:normal;letter-spacing:0">· ${S.professions.length}/${S.professionLimit}</span>
    <div class="orn-diamond"></div><div class="sline"></div>
    <span class="sec-grp-chevron">▼</span>
  </div>
  <div class="sec-grp-body">
    ${S.professions.length===0?'<div style="color:var(--text-dim);font-size:.8rem;margin-bottom:10px">Нет профессий</div>':""}
    <div class="prof-grid">${profCards}${profAdd}</div>
  </div>
</div>

<div class="card${sc.props?' collapsed':''}" id="sec-props">
  <div class="stitle stitle-clickable" onclick="toggleSection('sec-props')">
    <div class="orn-diamond"></div> Особые свойства <div class="orn-diamond"></div><div class="sline"></div>
    <span class="sec-grp-chevron">▼</span>
  </div>
  <div class="sec-grp-body">
    ${S.specialProps.length===0?'<div style="color:var(--text-dim);font-size:.8rem">Нет записей</div>':""}
    ${specialRows}
    <button class="btn mt6" style="font-size:.55rem" onclick="addSpecial()">+ Добавить</button>
  </div>
</div>

<div class="card${sc.titles?' collapsed':''}" id="sec-titles">
  <div class="stitle stitle-clickable" onclick="toggleSection('sec-titles')">
    <div class="orn-diamond"></div> Звания и титулы <div class="orn-diamond"></div><div class="sline"></div>
    <span class="sec-grp-chevron">▼</span>
  </div>
  <div class="sec-grp-body">
    ${S.titles.length===0?'<div style="color:var(--text-dim);font-size:.8rem">Нет записей</div>':""}
    ${titleRows}
    <button class="btn mt6" style="font-size:.55rem" onclick="addTitle()">+ Добавить</button>
  </div>
</div>

<div class="card${sc.ach?' collapsed':''}" id="sec-ach">
  <div class="stitle stitle-clickable" onclick="toggleSection('sec-ach')">
    <div class="orn-diamond"></div> Достижения <div class="orn-diamond"></div><div class="sline"></div>
    <span class="sec-grp-chevron">▼</span>
  </div>
  <div class="sec-grp-body">
    ${S.achievements.length===0?'<div style="color:var(--text-dim);font-size:.8rem">Нет достижений</div>':""}
    ${achItems}
    <button class="btn mt6" style="font-size:.55rem" onclick="oAddAch()">+ Добавить</button>
  </div>
</div>

<div class="card${sc.notes?' collapsed':''}" id="sec-notes">
  <div class="stitle stitle-clickable" onclick="toggleSection('sec-notes')">
    <div class="orn-diamond"></div> Заметки <div class="orn-diamond"></div><div class="sline"></div>
    <span class="sec-grp-chevron">▼</span>
  </div>
  <div class="sec-grp-body">
    <textarea class="inp" style="min-height:120px;resize:vertical" oninput="S.notes=this.value">${S.notes||""}</textarea>
  </div>
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

function _skillCard(s,showFavBtn){
  const typeClr={passive:"tg-blue",active:"tg-red"};
  return `<div class="skill-card" onclick="this.classList.toggle('expanded')">
    <div class="skill-card-name">${s.favorite?'★ ':''}${s.name}</div>
    <div class="row" style="gap:4px;flex-wrap:wrap;margin-top:2px">
      <span class="tg ${typeClr[s.type]||'tg-dim'}" style="font-size:.48rem">${s.type==="passive"?"Пассивный":"Активный"}</span>
      ${s.level?`<span class="tg tg-gold" style="font-size:.48rem">УР. ${s.level}</span>`:""}
    </div>
    ${s.property?`<div class="skill-prop">${s.property}</div>`:""}
    <div class="skill-hidden">
      ${s.description?`<div style="font-size:.78rem;color:var(--text-dim);font-style:italic;margin-bottom:6px">${s.description}</div>`:""}
      ${s.comment?`<div style="font-size:.68rem;color:var(--text-dim);font-style:italic;margin-bottom:6px">${s.comment}</div>`:""}
      <div class="row" style="gap:6px;margin-top:4px">
        ${showFavBtn?`<button class="btn" style="font-size:.62rem;padding:6px 10px;touch-action:manipulation;flex-shrink:0" onclick="event.stopPropagation();S.skills=S.skills.map(x=>x.id===${s.id}?{...x,favorite:!x.favorite}:x);render()" title="${s.favorite?'Убрать из избранного':'Добавить в избранное'}">${s.favorite?'★':'☆'}</button>`:''}
        <button class="btn" style="font-size:.62rem;padding:6px 14px;touch-action:manipulation;flex:1" onclick="event.stopPropagation();oEditSk(${s.id})">Редактировать</button>
      </div>
    </div>
  </div>`;
}
function rSkills(){
  const sources=[...Object.values(AT),...S.professions.map(p=>p.name),"Другое"];
  const used=sources.filter(s=>S.skills.some(x=>x.source===s));
  const favs=S.skills.filter(s=>s.favorite);
  let html=`<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
    <div class="stitle" style="margin-bottom:0"><div class="orn-diamond"></div> Навыки персонажа <div class="orn-diamond"></div><div class="sline"></div></div>
    <button class="btn" onclick="oAddSk()">+ Навык</button>
  </div>
  ${S.skills.length===0?'<div style="color:var(--text-dim);font-size:.8rem;margin-bottom:8px">Нет навыков</div>':""}`;

  // Избранные группа
  if(favs.length>0){
    const grpKey='★ Избранные';
    if(skillGrpOpen[grpKey]===undefined)skillGrpOpen[grpKey]=true;
    const open=skillGrpOpen[grpKey];
    html+=`<div class="grp-title" style="cursor:pointer" onclick="skillGrpOpen['${grpKey}']=!skillGrpOpen['${grpKey}'];render()">★ Избранные · ${favs.length} навык${favs.length===1?'':'ов'}<span style="float:right;font-size:.6rem">${open?'▲':'▼'}</span></div>`;
    if(open){
      html+=`<div class="skills-grid" style="margin-bottom:12px">${favs.map(s=>_skillCard(s,false)).join("")}</div>`;
    }
  }

  // Обычные группы
  html+=used.map(src=>{
    if(skillGrpOpen[src]===undefined)skillGrpOpen[src]=true;
    const open=skillGrpOpen[src];
    const group=S.skills.filter(s=>s.source===src);
    return `<div class="grp-title" style="cursor:pointer" onclick="skillGrpOpen['${src}']=!skillGrpOpen['${src}'];render()">${src} · ${group.length} навык${group.length===1?'':'ов'}<span style="float:right;font-size:.6rem">${open?'▲':'▼'}</span></div>
    ${open?`<div class="skills-grid" style="margin-bottom:12px">
      ${group.map(s=>_skillCard(s,true)).join("")}
      <div class="skill-card grid-add" style="min-height:80px" onclick="oAddSk()">+</div>
    </div>`:''}`;
  }).join("");

  html+=`${used.length===0?`<div class="skills-grid"><div class="skill-card grid-add" style="min-height:80px" onclick="oAddSk()">+</div></div>`:""}
</div>`;
  return html;
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
  const slotColor=u>=mx?"var(--red)":"var(--gold)";
  return `
<div class="g2" style="margin-bottom:14px">
  <div class="card" style="margin-bottom:0">
    <div class="stat-box-label">Слоты инвентаря</div>
    <div class="row" style="gap:8px;align-items:center;justify-content:center;margin-top:6px">
      <button class="bp-toggle-btn${S.backpackOn?'':' off'}" onclick="S.backpackOn=!S.backpackOn;render()" title="${S.backpackOn?'Рюкзак надет — нажми чтобы снять':'Рюкзак снят — нажми чтобы надеть'}">🎒</button>
      <div style="cursor:pointer" onclick="toggleBackpack()">
        <div class="row" style="gap:4px;align-items:baseline">
          <span class="snum" style="color:${slotColor}">${u}</span>
          <span class="text-dim fs-xs">/ ${mx}</span>
        </div>
      </div>
    </div>
    <div class="bwrap mt6"><div class="bfill" style="width:${p}%;background:${u>=mx?"var(--red)":"linear-gradient(90deg,var(--gold-dark),var(--gold))"}"></div></div>
    <div class="bp-settings" id="bp-settings" onclick="event.stopPropagation()">
      <label class="fl" style="margin-top:8px;text-align:center;display:block">Вместимость рюкзака</label>
      <div class="row" style="justify-content:center;gap:8px;margin-top:6px">
        <button class="btn" onclick="S.backpackSlots=Math.max(1,S.backpackSlots-1);render()">−</button>
        <span style="color:var(--gold);font-size:.9rem;min-width:22px;text-align:center">${S.backpackSlots}</span>
        <button class="btn" onclick="S.backpackSlots++;render()">+</button>
      </div>
    </div>
  </div>
  <div class="card" style="margin-bottom:0;cursor:pointer;text-align:center" onclick="openGoldModal()">
    <div class="stat-box-label">Золото</div>
    <div class="gold-num" style="margin-top:4px">${S.gold}</div>
    <div class="stat-box-sub" style="margin-top:4px">💰 изменить</div>
  </div>
</div>
${invCardSec("weapons","⚔ Оружие",S.weapons,
    w=>`<div class="item-card${w.equipped?' equipped':''}" onclick="oEditInvItem('weapons',${w.id})">
      <div class="item-card-name">${w.name||'—'}</div>
      ${w.consumable?`<div class="item-qty" onclick="event.stopPropagation()">
        <button class="item-qty-btn" onclick="S.weapons=S.weapons.map(x=>x.id===${w.id}?{...x,qty:Math.max(0,x.qty-1)}:x);render()">−</button>
        <span class="item-qty-val">${w.qty||1}</span>
        <button class="item-qty-btn" onclick="S.weapons=S.weapons.map(x=>x.id===${w.id}?{...x,qty:(x.qty||1)+1}:x);render()">+</button>
      </div>`:''}
      ${w.damage?`<div class="item-prop">⚔ ${w.damage}${w.bonusDamage?' · '+w.bonusDamage:''}</div>`:''}
      ${w.property?`<div class="item-prop">${w.property}</div>`:''}
      <button class="item-eq-btn${w.equipped?' on':''}" onclick="event.stopPropagation();S.weapons=S.weapons.map(x=>x.id===${w.id}?{...x,equipped:!x.equipped}:x);render()">${w.equipped?'Снять':'Надеть'}</button>
    </div>`,
    "oAddWpSmart()"
  )}
${invCardSec("armors","🛡 Доспехи",S.armors,
    a=>`<div class="item-card${a.equipped?' equipped':''}" onclick="oEditInvItem('armors',${a.id})">
      <div class="item-card-name">${a.name||'—'}</div>
      <div class="item-qty" onclick="event.stopPropagation()" style="justify-content:center">
        <span class="item-qty-val" style="color:var(--blue)">+${a.armorValue||0} брон.</span>
      </div>
      ${a.property?`<div class="item-prop">${a.property}</div>`:''}
      <button class="item-eq-btn${a.equipped?' on':''}" onclick="event.stopPropagation();S.armors=S.armors.map(x=>x.id===${a.id}?{...x,equipped:!x.equipped}:{...x,equipped:false});render()">${a.equipped?'Снять':'Надеть'}</button>
    </div>`,
    "oAddArSmart()"
  )}
${invCardSec("accessories","💍 Аксессуары",S.accessories,
    a=>`<div class="item-card${a.equipped?' equipped':''}" onclick="oEditInvItem('accessories',${a.id})">
      <div class="item-card-name">${a.name||'—'}</div>
      <div class="item-qty" onclick="event.stopPropagation()" style="justify-content:center">
        ${a.bonusTarget?`<span class="item-qty-val" style="font-size:.62rem;color:var(--green)">${a.bonusTarget}: +${a.bonusValue||0}</span>`:'<span class="item-qty-val" style="font-size:.6rem;opacity:.5">нет бонуса</span>'}
      </div>
      ${a.property?`<div class="item-prop">${a.property}</div>`:''}
      <button class="item-eq-btn${a.equipped?' on':''}" onclick="event.stopPropagation();S.accessories=S.accessories.map(x=>x.id===${a.id}?{...x,equipped:!x.equipped}:x);render()">${a.equipped?'Снять':'Надеть'}</button>
    </div>`,
    "oAddAcSmart()"
  )}
${invCardSec("alch","⚗ Алхимические",S.alchItems,
    it=>`<div class="item-card" onclick="oEditInvItem('alch',${it.id})">
      <div class="item-card-name">${it.name||'—'}</div>
      <div class="item-qty" onclick="event.stopPropagation()">
        <button class="item-qty-btn" onclick="S.alchItems=S.alchItems.map(x=>x.id===${it.id}?{...x,qty:Math.max(0,x.qty-1)}:x);render()">−</button>
        <span class="item-qty-val">${it.qty||1}</span>
        <button class="item-qty-btn" onclick="S.alchItems=S.alchItems.map(x=>x.id===${it.id}?{...x,qty:(x.qty||1)+1}:x);render()">+</button>
      </div>
      ${it.attribute?`<div class="item-prop">Ур.${it.level||1} · ${it.attribute}</div>`:''}
      ${it.property?`<div class="item-prop">${it.property}</div>`:''}
    </div>`,
    "oAddAlch()"
  )}
${invCardSec("potions","🧪 Зелья",S.potions,
    it=>`<div class="item-card" onclick="oEditInvItem('potions',${it.id})">
      <div class="item-card-name">${it.name||'—'}</div>
      ${it.consumable?`<div class="item-qty" onclick="event.stopPropagation()">
        <button class="item-qty-btn" onclick="S.potions=S.potions.map(x=>x.id===${it.id}?{...x,qty:Math.max(0,x.qty-1)}:x);render()">−</button>
        <span class="item-qty-val">${it.qty||1}</span>
        <button class="item-qty-btn" onclick="S.potions=S.potions.map(x=>x.id===${it.id}?{...x,qty:(it.qty||1)+1}:x);render()">+</button>
      </div>`:''}
      ${it.property?`<div class="item-prop">${it.property}</div>`:''}
    </div>`,
    "oAddPotSmart()"
  )}
${invCardSec("misc","📦 Остальное",S.misc,
    it=>`<div class="item-card" onclick="oEditInvItem('misc',${it.id})">
      <div class="item-card-name">${it.name||'—'}</div>
      ${it.consumable?`<div class="item-qty" onclick="event.stopPropagation()">
        <button class="item-qty-btn" onclick="S.misc=S.misc.map(x=>x.id===${it.id}?{...x,qty:Math.max(0,x.qty-1)}:x);render()">−</button>
        <span class="item-qty-val">${it.qty||1}</span>
        <button class="item-qty-btn" onclick="S.misc=S.misc.map(x=>x.id===${it.id}?{...x,qty:(it.qty||1)+1}:x);render()">+</button>
      </div>`:''}
      ${it.property?`<div class="item-prop">${it.property}</div>`:''}
    </div>`,
    "oAddMiscSmart()"
  )}
`;
}

function invCardSec(key,title,items,cardFn,addFn){
  const open=invOpen[key];
  return `<div class="card${open?'':' collapsed'}" id="inv-sec-${key}" style="margin-bottom:14px">
    <div class="stitle stitle-clickable" onclick="invOpen['${key}']=!invOpen['${key}'];render()">
      <div class="orn-diamond"></div> ${title} <span class="text-dim fs-xs" style="font-weight:normal;letter-spacing:0">· ${items.length}</span>
      <div class="orn-diamond"></div><div class="sline"></div>
      <span class="sec-grp-chevron">▼</span>
    </div>
    <div class="sec-grp-body">
      <div class="items-grid">
        ${items.map(cardFn).join("")}
        <div class="item-card grid-add" style="min-height:88px" onclick="${addFn}">+</div>
      </div>
    </div>
  </div>`;
}

function oEditInvItem(type,id){
  const arrMap={weapons:S.weapons,armors:S.armors,accessories:S.accessories,alch:S.alchItems,potions:S.potions,misc:S.misc};
  const arr=arrMap[type];
  const it=arr&&arr.find(x=>x.id===id);
  if(!it)return;
  var f=(k,v)=>`<label class="fl">${k}</label><input class="inp" id="eii_${k.replace(/\s/g,'_')}" value="${v||''}">`;
  var fn=(k,v,t)=>`<label class="fl">${k}</label><input class="inp" type="${t||'text'}" id="eii_${k.replace(/\s/g,'_')}" value="${v||''}">`;
  var html=`<div class="mtitle">Редактировать: ${it.name||'предмет'}</div>`;
  html+=fn('Название',it.name);
  if(type==='weapons'){html+=fn('Урон',it.damage)+fn('Бонусный урон',it.bonusDamage);}
  if(type==='armors'){html+=fn('Броня',it.armorValue,'number');}
  if(type==='accessories'){
    html+=`<label class="fl">Бонус к</label><select class="inp" id="eii_bonusTarget">`+["","Броня","Максимум HP","Урон","Бонусный урон","Сила","Ловкость","Живучесть","Интеллект","Торговля","Талант","Мана"].map(x=>`<option${x===it.bonusTarget?' selected':''}>${x}</option>`).join('')+`</select>`;
    html+=fn('Значение бонуса',it.bonusValue,'number');
  }
  if(type==='alch'){html+=fn('Уровень',it.level,'number')+fn('Атрибут',it.attribute);}
  html+=f('Свойство',it.property)+f('Заметка',it.comment);
  if(type!=='alch'){
    html+=`<label style="display:flex;align-items:center;gap:8px;margin-top:8px;cursor:pointer;font-size:.78rem;color:var(--text-dim)"><input type="checkbox" id="eii_consumable" ${it.consumable?'checked':''}> Расходуемое (показывать количество)</label>`;
  }
  html+=`<div class="row" style="margin-top:14px">
    <button class="bpri" onclick="_saveInvItem('${type}',${id})">Сохранить</button>
    <button class="bdng" onclick="_deleteInvItem('${type}',${id})">✕ Удалить</button>
    <button class="btn" onclick="closeMod()">Отмена</button>
  </div>`;
  openMod(html);
}
function _deleteInvItem(type,id){
  var keyMap={weapons:'weapons',armors:'armors',accessories:'accessories',alch:'alchItems',potions:'potions',misc:'misc'};
  var k=keyMap[type];if(!k)return;
  var arr=S[k];var it=arr&&arr.find(function(x){return x.id===id;});
  var nm=it&&it.name?it.name:'предмет';
  openMod('<div class="mtitle">Удалить предмет?</div>'
    +'<div style="font-size:.82rem;color:#e8dcc8;margin-bottom:16px">«'+nm+'» будет удалён безвозвратно.</div>'
    +'<div class="row"><button class="bdng" style="flex:1" onclick="S[\''+k+'\']=S[\''+k+'\'].filter(function(x){return x.id!=='+id+';});closeMod();ntf(\'Удалено\',\'#e05050\');render()">Удалить</button>'
    +'<button class="btn" style="flex:1" onclick="oEditInvItem(\''+type+'\','+id+')">Отмена</button></div>');
}
function _saveInvItem(type,id){
  var g=k=>document.getElementById('eii_'+k.replace(/\s/g,'_'));
  var v=k=>(g(k)?g(k).value:'');
  var arrKey={weapons:'weapons',armors:'armors',accessories:'accessories',alch:'alchItems',potions:'potions',misc:'misc'}[type];
  S[arrKey]=S[arrKey].map(x=>{
    if(x.id!==id)return x;
    var u={...x,name:v('Название'),property:v('Свойство'),comment:v('Заметка')};
    if(type==='weapons'){u.damage=v('Урон');u.bonusDamage=v('Бонусный_урон');}
    if(type==='armors'){u.armorValue=+v('Броня')||0;}
    if(type==='accessories'){u.bonusTarget=v('Бонус_к');u.bonusValue=+v('Значение_бонуса')||0;}
    if(type==='alch'){u.level=+v('Уровень')||1;u.attribute=v('Атрибут');}
    if(type!=='alch'){var ce=document.getElementById('eii_consumable');u.consumable=ce?ce.checked:false;}
    return u;
  });
  closeMod();render();ntf('Сохранено','#27ae60');
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
  // level → tag color
  function lvlTg(lv){if(lv>=4)return'tg-red';if(lv===3)return'tg-gold';if(lv===2)return'tg-blue';return'tg-dim';}

  // section card wrapper — collapse driven by alchSectOpen
  function aCard(key,title,body,extra){
    var col=!alchSectOpen[key]?' collapsed':'';
    return '<div class="card'+col+'">'
      +'<div class="flex-between" style="margin-bottom:0">'
      +'<div class="stitle stitle-clickable" style="margin-bottom:0" onclick="alchSectOpen.'+key+'=!alchSectOpen.'+key+';render()">'
      +'<div class="orn-diamond"></div> '+title+' <div class="orn-diamond"></div>'
      +'<span class="sec-grp-chevron">▼</span>'
      +'</div>'
      +(extra?'<div onclick="event.stopPropagation()" style="flex-shrink:0">'+extra+'</div>':'')
      +'</div>'
      +'<div class="sec-grp-body" style="margin-top:10px">'+body+'</div>'
      +'</div>';
  }
  const lockedMsg=function(skill){return '<div style="color:var(--text-dim);font-size:.78rem;padding:8px">🔒 Доступно при наличии навыка «'+skill+'»</div>';};

  // ── 1. INVENTORY ──────────────────────────────────────────────────────────────
  let invSorted=[...S.alchInventory];
  invSorted.sort((a,b)=>{
    const ia=alchFind(a.dbId),ib=alchFind(b.dbId);if(!ia||!ib)return 0;
    if(alchInvSortBy==="level")return alchInvSortDir*(ia.level-ib.level);
    if(alchInvSortBy==="attribute")return alchInvSortDir*ia.attribute.localeCompare(ib.attribute,"ru");
    if(alchInvSortBy==="qty")return alchInvSortDir*(a.qty-b.qty);
    return alchInvSortDir*ia.name.localeCompare(ib.name,"ru");
  });
  // build inventory groups
  var invGroups;
  if(!alchInvGroupBy){invGroups=[{groupKey:"",items:invSorted}];}
  else{
    const m={};
    invSorted.forEach(e=>{const it=alchFind(e.dbId);const k=!it?"?":(alchInvGroupBy==="level"?String(it.level):it.attribute);m[k]=m[k]||[];m[k].push(e);});
    invGroups=Object.entries(m).map(([g,items])=>({groupKey:g,items})).sort((a,b)=>alchInvGroupBy==="level"?Number(a.groupKey)-Number(b.groupKey):a.groupKey.localeCompare(b.groupKey,"ru"));
  }
  let invCardsHtml="";
  for(const g of invGroups){
    if(alchInvGroupBy&&g.groupKey)invCardsHtml+='<div class="grp-title" style="grid-column:1/-1">'+(alchInvGroupBy==="level"?"УР. ":"")+g.groupKey+'</div>';
    for(const entry of g.items){
      const it=alchFind(entry.dbId);if(!it)continue;
      invCardsHtml+='<div class="alch-item-card">'
        +'<div class="alch-item-name">'+it.name+'</div>'
        +'<div class="alch-item-tags"><span class="tg '+lvlTg(it.level)+'">Ур. '+it.level+'</span><span class="tg tg-dim">'+it.attribute+'</span></div>'
        +'<div style="display:flex;align-items:center;justify-content:center;gap:3px;margin-top:auto">'
        +'<button class="item-qty-btn" onclick="alchQtyChange(\''+entry.dbId+'\',-1)">−</button>'
        +'<span class="item-qty-val">'+entry.qty+'</span>'
        +'<button class="item-qty-btn" onclick="alchQtyChange(\''+entry.dbId+'\',1)">+</button>'
        +'</div>'
        +'<button class="alch-process-btn" onclick="alchProcessOne(\''+entry.dbId+'\')">⚗ Обработать</button>'
        +'</div>';
    }
  }
  if(!invCardsHtml)invCardsHtml='<div style="grid-column:1/-1;color:var(--text-dim);font-style:italic;padding:8px;text-align:center;font-size:.78rem">Инвентарь пуст</div>';

  const invGrpPanel='<div class="alch-filter-panel'+(alchInvGroupVisible?" open":"")+'">'
    +'<div class="alch-filter-row"><span class="fs-xs text-dim">Группировка:</span>'
    +'<button class="alch-ctrl-btn'+(alchInvGroupBy===""?" active":"")+'" onclick="alchInvGroupBy=\'\';render()">Нет</button>'
    +'<button class="alch-ctrl-btn'+(alchInvGroupBy==="level"?" active":"")+'" onclick="alchInvGroupBy=\'level\';render()">По уровню</button>'
    +'<button class="alch-ctrl-btn'+(alchInvGroupBy==="attribute"?" active":"")+'" onclick="alchInvGroupBy=\'attribute\';render()">По атрибуту</button>'
    +'</div></div>';
  const invSortPanel='<div class="alch-filter-panel'+(alchInvSortVisible?" open":"")+'">'
    +'<div class="alch-filter-row"><span class="fs-xs text-dim">Сортировка:</span>'
    +'<button class="alch-ctrl-btn'+(alchInvSortBy==="name"&&alchInvSortDir===1?" active":"")+'" onclick="alchInvSortBy=\'name\';alchInvSortDir=1;render()">По названию ↑</button>'
    +'<button class="alch-ctrl-btn'+(alchInvSortBy==="level"?" active":"")+'" onclick="alchInvSortBy=\'level\';alchInvSortDir=1;render()">По уровню ↑</button>'
    +'<button class="alch-ctrl-btn'+(alchInvSortBy==="qty"?" active":"")+'" onclick="alchInvSortBy=\'qty\';alchInvSortDir=-1;render()">По кол-ву</button>'
    +'</div></div>';
  const invBody=invGrpPanel+invSortPanel+'<div class="alch-items-grid" style="margin-top:6px">'+invCardsHtml+'</div>';
  const invExtraHdr='<div class="alch-ctrl-bar">'
    +'<button class="alch-icon-btn'+(alchInvGroupVisible?" active":"")+'" onclick="alchInvGroupVisible=!alchInvGroupVisible;render()" title="Группировка">⊞</button>'
    +'<button class="alch-icon-btn'+(alchInvSortVisible?" active":"")+'" onclick="alchInvSortVisible=!alchInvSortVisible;render()" title="Сортировка">↕</button>'
    +'<button class="btn" style="font-size:.5rem;flex-shrink:0" onclick="oSetAlchChance()">🎲 '+S.alchSuccessChance+'%</button>'
    +'</div>';

  // ── 2. RECIPE CARDS (базовая реакция + круг) ──────────────────────────────────
  function recipeCardsFn(arr,arrName){
    if(!arr.length)return '<div style="color:var(--text-dim);font-size:.78rem;padding:8px;text-align:center;font-style:italic">Нет рецептов</div>';
    return arr.map((r,i)=>{
      const prod=alchFind(r.resultId);
      const reagHtml=r.reagentIds.map(rid=>{const it=alchFind(rid);return '<div class="alch-recipe-ing">'+(it?'<span class="tg tg-dim" style="font-size:.42rem;padding:1px 5px">Ур.'+it.level+'</span>'+it.name:'?')+'</div>';}).join('');
      return '<div class="alch-recipe-card" onclick="alchCreate('+i+','+arrName+')">'
        +'<button class="alch-recipe-del" onclick="event.stopPropagation();'+arrName+'.splice('+i+',1);render()">✕</button>'
        +'<div><div class="alch-recipe-result">'+(prod?prod.name:'(удалён)')+'</div>'
        +(prod?'<div class="alch-item-tags" style="margin-top:3px"><span class="tg '+lvlTg(prod.level)+'">Ур. '+prod.level+'</span><span class="tg tg-dim">'+prod.attribute+'</span></div>':'')
        +'</div>'
        +'<div class="alch-recipe-sep"></div>'
        +'<div class="alch-recipe-ingredients">'+reagHtml+'</div>'
        +'</div>';
    }).join('');
  }
  const addRecipeBtn='<button class="btn" style="font-size:.52rem;flex-shrink:0;background:var(--alch-btn-bg);border-color:var(--alch-btn-bd);color:var(--alch-btn-clr)" onclick="openAlchRecipeModal()">+ Рецепт</button>';

  const hasProcessing=S.skills.some(s=>s.name==="Обработка алхимических ингредиентов");
  const hasBaseReaction=S.skills.some(s=>s.name==="Базовая алхимическая реакция");
  const hasCircle=S.skills.some(s=>s.name==="Алхимический круг");

  const rxnBody=hasBaseReaction
    ?'<div class="alch-recipe-grid">'+recipeCardsFn(S.alchRecipes,"S.alchRecipes")+'</div>'
    :lockedMsg("Базовая алхимическая реакция");
  const circleBody=hasCircle
    ?'<div class="alch-recipe-grid">'+recipeCardsFn(S.alchCircleRecipes,"S.alchCircleRecipes")+'</div>'
    :lockedMsg("Алхимический круг");

  // ── 3. PROCESSING RECIPES ──────────────────────────────────────────────────────
  const dbOpts=S.alchDB.map(it=>'<option value="'+it.id+'">'+alchLabel(it)+'</option>').join("");
  const procForm='<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end;margin-bottom:10px;padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:6px">'
    +'<div><div class="fl" style="font-size:.6rem">Исходник</div><select class="inp" id="procSrc" style="width:auto">'+(dbOpts||'<option>База пуста</option>')+'</select></div>'
    +'<div><div class="fl" style="font-size:.6rem">Результат</div><select class="inp" id="procRes" style="width:auto">'+(dbOpts||'<option>База пуста</option>')+'</select></div>'
    +'<button class="btn" style="font-size:.55rem" onclick="saveProcRecipe()">Сохранить</button>'
    +'</div>';
  const procCardsHtml=S.procRecipes.map((r,i)=>{
    const src=alchFind(r.srcId),res=alchFind(r.resId);
    return '<div class="alch-recipe-card" style="cursor:default">'
      +'<button class="alch-recipe-del" onclick="S.procRecipes.splice('+i+',1);render()">✕</button>'
      +'<div><div class="alch-recipe-result">'+(src?src.name:'(удалён)')+'</div>'
      +(src?'<div class="alch-item-tags" style="margin-top:3px"><span class="tg '+lvlTg(src.level)+'">Ур. '+src.level+'</span><span class="tg tg-dim">'+src.attribute+'</span></div>':'')
      +'</div>'
      +'<div class="alch-recipe-sep"></div>'
      +'<div class="alch-recipe-ingredients"><div class="alch-recipe-ing" style="color:var(--gold)">→ '+(res?res.name:'(удалён)')+'</div></div>'
      +'</div>';
  }).join('')||'<div style="color:var(--text-dim);font-size:.78rem;padding:8px;text-align:center;font-style:italic">Нет рецептов</div>';
  const procBody=hasProcessing
    ?procForm+'<div class="alch-recipe-grid">'+procCardsHtml+'</div>'
    :lockedMsg("Обработка алхимических ингредиентов");

  // ── 4. BASE DB ────────────────────────────────────────────────────────────────
  const groups=alchSortedFiltered();
  let baseCardsHtml="";
  for(const bg of groups){
    if(alchBaseGroupBy&&bg.groupKey)baseCardsHtml+='<div class="grp-title" style="grid-column:1/-1">'+bg.groupKey+'</div>';
    for(const bit of bg.items){
      baseCardsHtml+='<div class="alch-base-card">'
        +'<div class="alch-base-name">'+bit.name+'</div>'
        +'<div class="alch-item-tags"><span class="tg '+lvlTg(bit.level)+'">Ур. '+bit.level+'</span><span class="tg tg-dim">'+bit.attribute+'</span></div>'
        +'<div class="alch-base-actions">'
        +'<button class="alch-add-inv-btn" onclick="alchQtyChange(\''+bit.id+'\',1)">+ в инв.</button>'
        +'<button class="bdng" style="padding:2px 6px;font-size:.5rem" onclick="alchDelFromDB(\''+bit.id+'\')">✕</button>'
        +'</div></div>';
    }
  }
  if(!baseCardsHtml)baseCardsHtml='<div style="grid-column:1/-1;color:var(--text-dim);font-style:italic;padding:8px;text-align:center;font-size:.78rem">База пуста</div>';

  const baseGrpPanel='<div class="alch-filter-panel'+(alchBaseGroupVisible?" open":"")+'">'
    +'<div class="alch-filter-row"><span class="fs-xs text-dim">Группировка:</span>'
    +'<button class="alch-ctrl-btn'+(alchBaseGroupBy===""?" active":"")+'" onclick="alchBaseGroupBy=\'\';render()">Нет</button>'
    +'<button class="alch-ctrl-btn'+(alchBaseGroupBy==="level"?" active":"")+'" onclick="alchBaseGroupBy=\'level\';render()">По уровню</button>'
    +'<button class="alch-ctrl-btn'+(alchBaseGroupBy==="attribute"?" active":"")+'" onclick="alchBaseGroupBy=\'attribute\';render()">По атрибуту</button>'
    +'</div></div>';
  const baseSortPanel='<div class="alch-filter-panel'+(alchBaseSortVisible?" open":"")+'">'
    +'<div class="alch-filter-row"><span class="fs-xs text-dim">Сортировка:</span>'
    +'<button class="alch-ctrl-btn'+(alchBaseSortCol==="name"&&alchBaseSortDir===1?" active":"")+'" onclick="alchBaseSortCol=\'name\';alchBaseSortDir=1;render()">По названию ↑</button>'
    +'<button class="alch-ctrl-btn'+(alchBaseSortCol==="level"?" active":"")+'" onclick="alchBaseSortCol=\'level\';alchBaseSortDir=1;render()">По уровню ↑</button>'
    +'<button class="alch-ctrl-btn'+(alchBaseSortCol==="attribute"?" active":"")+'" onclick="alchBaseSortCol=\'attribute\';alchBaseSortDir=1;render()">По атрибуту</button>'
    +'</div></div>';
  const baseBody=baseGrpPanel+baseSortPanel+'<div class="alch-base-grid" style="margin-top:6px">'+baseCardsHtml+'</div>';
  const baseExtraHdr='<div class="alch-ctrl-bar">'
    +'<button class="alch-icon-btn'+(alchBaseGroupVisible?" active":"")+'" onclick="alchBaseGroupVisible=!alchBaseGroupVisible;render()" title="Группировка">⊞</button>'
    +'<button class="alch-icon-btn'+(alchBaseSortVisible?" active":"")+'" onclick="alchBaseSortVisible=!alchBaseSortVisible;render()" title="Сортировка">↕</button>'
    +'<input class="inp" placeholder="Поиск..." style="width:80px;padding:4px 6px;font-size:.62rem" oninput="alchBaseSearch=this.value;render()" value="'+alchBaseSearch+'">'
    +'<button class="btn" style="font-size:.5rem;flex-shrink:0" onclick="openAlchItemModal()">+ Добавить</button>'
    +'</div>';

  // ── 5. HISTORY ────────────────────────────────────────────────────────────────
  const histColors={add:"#27ae60",update:"#7ec8e3",del:"#e67e22",success:"#27ae60",error:"#e05050",synth:"#9b59b6",recipe:"#c9a84c"};
  const histHtml=S.alchHistory&&S.alchHistory.length
    ?S.alchHistory.slice(0,80).map(e=>'<div class="log-entry">'
      +'<span><span style="color:'+(histColors[e.type]||"var(--text-dim)")+'">'+e.txt+'</span>'
      +(e.extra?' <span style="color:var(--text-dim)">'+e.extra+'</span>':"")
      +'</span><span class="log-time">'+alchTimePretty(e.t)+'</span></div>').join("")
    :'<div style="color:var(--text-dim);font-size:.78rem;padding:6px">Нет событий</div>';
  const histBody='<div class="log-scroll" id="alch-log">'+histHtml+'</div>';
  const histExtraHdr='<button class="btn" style="font-size:.55rem" onclick="S.alchHistory=[];render()">Очистить</button>';

  return aCard("inv","Инвентарь алхимика",invBody,invExtraHdr)
    +aCard("recipes","Базовая реакция",rxnBody,hasBaseReaction?addRecipeBtn:"")
    +aCard("circle","Алхимический круг",circleBody,hasCircle?addRecipeBtn:"")
    +aCard("proc","Рецепты обработки",procBody,"")
    +aCard("base","База предметов",baseBody,baseExtraHdr)
    +aCard("hist","История",histBody,histExtraHdr);
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
    if(!tasks.length)return '';
    return '<div class="task-list">'
      +tasks.map(function(t){
        return '<div class="task-item">'
          +'<div class="task-check'+(t.done?' checked':'')+'" onclick="toggleTask('+q.id+','+t.id+')">'+(t.done?'✓':'')+'</div>'
          +'<div style="flex:1;min-width:0">'
          +'<div style="font-size:.8rem;'+(t.done?'text-decoration:line-through;color:var(--text-dim)':'')+'">'+t.name+'</div>'
          +(t.description?'<div class="task-hint">'+t.description+'</div>':"")
          +'</div>'
          +'<button class="btn" style="padding:2px 7px;font-size:.58rem;flex-shrink:0" onclick="oEditTask('+q.id+','+t.id+')">✏</button>'
          +'</div>';
      }).join('')
      +'<button class="task-add-btn" onclick="oAddTask('+q.id+')">+ задача</button>'
      +'</div>';
  }

  var activeHtml=active.map(function(q){
    var tasks=q.tasks||[];
    var doneCount=tasks.filter(function(t){return t.done;}).length;
    var tasksOpen=questTasksOpen[q.id]!==false;
    var toggle='questTasksOpen['+q.id+']='+(!tasksOpen)+';render()';
    var hasTasks=tasks.length>0;
    return '<div class="quest-item">'
      +'<div class="flex-between">'
      +'<div style="flex:1;min-width:0">'
      +'<div class="row" style="align-items:flex-start;gap:6px">'
      +'<div class="quest-name" style="cursor:pointer" onclick="'+toggle+'">'+q.name+'</div>'
      +(hasTasks?'<span class="quest-task-badge'+(doneCount>0?' has-tasks':'')+'" onclick="'+toggle+'">'
        +doneCount+'/'+tasks.length+'</span>':"")
      +'</div>'
      +(q.description?'<div class="quest-desc">'+q.description+'</div>':"")
      +'</div>'
      +'<div class="row" style="flex-shrink:0;gap:4px">'
      +'<button class="btn" style="padding:3px 8px;font-size:.58rem" onclick="event.stopPropagation();oEditQuest('+q.id+')">✏</button>'
      +'<button class="btn" style="padding:3px 8px;font-size:.58rem;color:var(--green);border-color:var(--green)" onclick="event.stopPropagation();S.quests=S.quests.map(function(x){return x.id==='+q.id+'?Object.assign({},x,{done:true}):x;});render()">✓</button>'
      +'</div></div>'
      +(tasksOpen?taskListHtml(q)
        +(!(q.tasks&&q.tasks.length)?'<button class="task-add-btn" style="margin-top:4px" onclick="oAddTask('+q.id+')">+ задача</button>':"")
        :"")
      +'</div>';
  }).join("");

  var doneHtml=done.map(function(q){
    return '<div class="quest-item quest-done">'
      +'<div class="flex-between">'
      +'<div class="quest-name" style="text-decoration:line-through">'+q.name+'</div>'
      +'<div class="row" style="gap:4px">'
      +'<button class="btn" style="padding:3px 8px;font-size:.58rem" onclick="S.quests=S.quests.map(function(x){return x.id==='+q.id+'?Object.assign({},x,{done:false}):x;});render()">↩</button>'
      +'<button class="bdng" onclick="S.quests=S.quests.filter(function(x){return x.id!=='+q.id+';});render()">✕</button>'
      +'</div></div></div>';
  }).join("");

  var npcHtml='<div class="npc-grid">'
    +S.npcs.map(function(n){
      return '<div class="npc-card" onclick="oEditNPC('+n.id+')">'
        +'<div class="npc-card-name">'+n.name+'</div>'
        +(n.notes?'<div class="npc-card-notes">'+n.notes+'</div>':"")
        +'</div>';
    }).join("")
    +'<div class="npc-card grid-add" onclick="oAddNPC()">+</div>'
    +'</div>';

  return '<div class="card">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
    +'<div class="stitle" style="margin-bottom:0"><div class="orn-diamond"></div> Квесты <div class="orn-diamond"></div><div class="sline"></div></div>'
    +'<button class="btn" onclick="oAddQuest()">+ Квест</button></div>'
    +'<div class="quest-grp-lbl" style="cursor:pointer" onclick="questsOpenActive=!questsOpenActive;render()">АКТИВНЫЕ ('+active.length+')<span class="toggle-lnk">'+(questsOpenActive?"▲":"▼")+'</span></div>'
    +(questsOpenActive
      ?(active.length?activeHtml:'<div style="color:var(--text-dim);font-size:.8rem;margin-bottom:8px">Нет активных квестов</div>')
      :'')
    +'<div class="quest-grp-lbl" style="cursor:pointer;margin-top:10px" onclick="questsOpenDone=!questsOpenDone;render()">ВЫПОЛНЕНЫ ('+done.length+')<span class="toggle-lnk">'+(questsOpenDone?"▲":"▼")+'</span></div>'
    +(questsOpenDone
      ?(done.length?doneHtml:'<div style="color:var(--text-dim);font-size:.8rem;margin-bottom:8px">Нет выполненных</div>')
      :'')
    +'</div>'
    +'<div class="card">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
    +'<div class="stitle" style="margin-bottom:0"><div class="orn-diamond"></div> НПС <div class="orn-diamond"></div><div class="sline"></div></div>'
    +'<button class="btn" onclick="oAddNPC()">+ НПС</button></div>'
    +(S.npcs.length===0&&!S.npcs.length?'<div style="color:var(--text-dim);font-size:.8rem;margin-bottom:8px">Нет НПС</div>':'')
    +npcHtml
    +'</div>';
}

function rPh(i,t){return '<div class="card"><div style="text-align:center;padding:36px 16px"><div style="font-size:2.2rem;margin-bottom:10px">'+i+'</div><div style="color:#c9a84c;font-size:.95rem;letter-spacing:.1em">'+t+'</div><div style="color:#7a6a52;font-size:.78rem;margin-top:6px">В разработке</div></div></div>';}

// ── MAIN RENDER ───────────────────────────────────────────────────────────────

function render(){
  scheduleSave();
  document.getElementById("charNameDisp").textContent = S.name || "Персонаж";
  var lvlEl = document.getElementById("lvlD");
  if (lvlEl) lvlEl.textContent = "УР. " + S.level;
  var slotEl = document.getElementById("slotD");
  if (slotEl) slotEl.style.display = "none";

  var hdrSubEl=document.getElementById("hdrSub");
  if(hdrSubEl){
    var profNames=S.professions.map(function(p){return p.uniqueName||p.name;}).join(" · ");
    hdrSubEl.textContent=profNames||"";
  }
  var ph=document.getElementById("char-photo");
  if(ph){
    if(S.avatar){
      ph.style.backgroundImage="url("+S.avatar+")";
      ph.style.backgroundSize="cover";
      ph.style.backgroundPosition="center";
      var pl=ph.querySelector(".char-photo-placeholder");
      if(pl)pl.style.display="none";
    } else {
      ph.style.backgroundImage="";
      var pl2=ph.querySelector(".char-photo-placeholder");
      if(pl2)pl2.style.display="";
    }
  }
  var hasAlch=S.professions.some(function(p){return p.knowledgeArea==="Алхимия";});
  var hasMagic=S.professions.some(function(p){return p.knowledgeArea==="Магия";});
  var tbs=[["char","Персонаж"],["skills","Навыки"],["inventory","Инвентарь"]];
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
    comment:document.getElementById("sk_com").value,bonusTarget:bt,bonusValue:bt?+document.getElementById("sk_bv").value:0,favorite:false});
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

function confirmDeleteProp(id){
  var t=S.specialProps.find(function(x){return x.id===id;});if(!t)return;
  openMod('<div class="mtitle">Удалить свойство?</div>'
    +'<div style="font-size:.82rem;color:#e8dcc8;margin-bottom:16px">«'+t.text+'» будет удалено безвозвратно.</div>'
    +'<div class="row"><button class="bdng" style="flex:1" onclick="S.specialProps=S.specialProps.filter(x=>x.id!=='+id+');closeMod();ntf(\'Удалено\',\'#e05050\');render()">Удалить</button><button class="btn" style="flex:1" onclick="closeMod()">Отмена</button></div>');
}
function confirmDeleteTitle(id){
  var t=S.titles.find(function(x){return x.id===id;});if(!t)return;
  openMod('<div class="mtitle">Удалить звание?</div>'
    +'<div style="font-size:.82rem;color:#e8dcc8;margin-bottom:16px">«'+t.text+'» будет удалено безвозвратно.</div>'
    +'<div class="row"><button class="bdng" style="flex:1" onclick="S.titles=S.titles.filter(x=>x.id!=='+id+');closeMod();ntf(\'Удалено\',\'#e05050\');render()">Удалить</button><button class="btn" style="flex:1" onclick="closeMod()">Отмена</button></div>');
}
function confirmDeleteAch(id){
  var a=S.achievements.find(function(x){return x.id===id;});if(!a)return;
  openMod('<div class="mtitle">Удалить достижение?</div>'
    +'<div style="font-size:.82rem;color:#e8dcc8;margin-bottom:16px">«'+a.name+'» будет удалено безвозвратно.</div>'
    +'<div class="row"><button class="bdng" style="flex:1" onclick="S.achievements=S.achievements.filter(x=>x.id!=='+id+');closeMod();ntf(\'Удалено\',\'#e05050\');render()">Удалить</button><button class="btn" style="flex:1" onclick="closeMod()">Отмена</button></div>');
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

var _consumableCbHtml='<label style="display:flex;align-items:center;gap:8px;margin-top:8px;cursor:pointer;font-size:.78rem;color:var(--text-dim)"><input type="checkbox" id="add_consumable"> Расходуемое (показывать количество)</label>';
function _getConsumable(){var el=document.getElementById('add_consumable');return el?el.checked:false;}
function oAddWpSmart(){smartModal("Оружие","weapon",'<label class="fl">Название</label><input class="inp" id="wp_n"><label class="fl">Урон</label><input class="inp" id="wp_d" placeholder="напр. 1d8+3"><label class="fl">Бонусный урон</label><input class="inp" id="wp_b" placeholder="напр. +2 огня"><label class="fl">Свойство</label><input class="inp" id="wp_p"><label class="fl">Комментарий</label><input class="inp" id="wp_c">'+_consumableCbHtml+'<div class="row" style="margin-top:16px"><button class="bpri" onclick="sWp()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
function sWp(){var n=document.getElementById("wp_n").value.trim();if(!n)return;var item={id:Date.now(),name:n,damage:document.getElementById("wp_d").value,bonusDamage:document.getElementById("wp_b").value,property:document.getElementById("wp_p").value,comment:document.getElementById("wp_c").value,qty:1,equipped:false,consumable:_getConsumable()};S.weapons.push(item);addToGlobalDB({name:n,type:"weapon",damage:item.damage,bonusDamage:item.bonusDamage,property:item.property});closeMod();ntf("Оружие добавлено");render();}
function oAddArSmart(){smartModal("Доспех","armor",'<label class="fl">Название</label><input class="inp" id="ar_n"><label class="fl">Значение брони</label><input class="inp" type="number" id="ar_v" value="0"><label class="fl">Свойство</label><input class="inp" id="ar_p"><label class="fl">Комментарий</label><input class="inp" id="ar_c">'+_consumableCbHtml+'<div class="row" style="margin-top:16px"><button class="bpri" onclick="sAr()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
function sAr(){var n=document.getElementById("ar_n").value.trim();if(!n)return;var item={id:Date.now(),name:n,armorValue:+document.getElementById("ar_v").value||0,property:document.getElementById("ar_p").value,comment:document.getElementById("ar_c").value,qty:1,equipped:false,consumable:_getConsumable()};S.armors.push(item);addToGlobalDB({name:n,type:"armor",armorValue:item.armorValue,property:item.property});closeMod();ntf("Доспех добавлен");render();}
function oAddAcSmart(){
  var btOpts=BT.map(function(x){return '<option>'+x+'</option>';}).join("");
  var form='<label class="fl">Название</label><input class="inp" id="ac_n">'
    +'<label class="fl">Свойство</label><input class="inp" id="ac_p">'
    +'<label class="fl">Комментарий</label><input class="inp" id="ac_c">'
    +'<label class="fl">Бонус к (необязательно)</label>'
    +'<select class="inp" id="ac_bt" onchange="document.getElementById(&quot;ac_bvw&quot;).style.display=this.value?&quot;block&quot;:&quot;none&quot;">'
    +'<option value="">— нет —</option>'+btOpts+'</select>'
    +'<div id="ac_bvw" style="display:none"><label class="fl">Значение бонуса</label><input class="inp" type="number" id="ac_bv" value="0"></div>'
    +_consumableCbHtml
    +'<div class="row" style="margin-top:16px"><button class="bpri" onclick="sAc()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>';
  smartModal("Аксессуар","accessory",form);
}
function sAc(){var n=document.getElementById("ac_n").value.trim();if(!n)return;var bt=document.getElementById("ac_bt").value;var item={id:Date.now(),name:n,property:document.getElementById("ac_p").value,comment:document.getElementById("ac_c").value,bonusTarget:bt,bonusValue:bt?+document.getElementById("ac_bv").value:0,qty:1,equipped:false,consumable:_getConsumable()};S.accessories.push(item);addToGlobalDB({name:n,type:"accessory",property:item.property,bonusTarget:bt,bonusValue:item.bonusValue});closeMod();ntf("Аксессуар добавлен");render();}
function oAddPotSmart(){smartModal("Зелье / аптечка","potion",'<label class="fl">Название</label><input class="inp" id="pot_n"><label class="fl">Свойство</label><input class="inp" id="pot_p"><label class="fl">Комментарий</label><input class="inp" id="pot_c">'+_consumableCbHtml+'<div class="row" style="margin-top:16px"><button class="bpri" onclick="sPotion()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
function sPotion(){var n=document.getElementById("pot_n").value.trim();if(!n)return;var item={id:Date.now(),name:n,property:document.getElementById("pot_p").value,comment:document.getElementById("pot_c").value,qty:1,consumable:_getConsumable()};S.potions.push(item);addToGlobalDB({name:n,type:"potion",property:item.property});closeMod();ntf("Добавлено");render();}
function oAddMiscSmart(){smartModal("Предмет","misc",'<label class="fl">Название</label><input class="inp" id="mi_n"><label class="fl">Свойство</label><input class="inp" id="mi_p"><label class="fl">Комментарий</label><input class="inp" id="mi_c">'+_consumableCbHtml+'<div class="row" style="margin-top:16px"><button class="bpri" onclick="sMisc()">Добавить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
function sMisc(){var n=document.getElementById("mi_n").value.trim();if(!n)return;var item={id:Date.now(),name:n,property:document.getElementById("mi_p").value,comment:document.getElementById("mi_c").value,qty:1,consumable:_getConsumable()};S.misc.push(item);addToGlobalDB({name:n,type:"misc",property:item.property});closeMod();ntf("Добавлено");render();}
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
function oEditNPC(id){var n=S.npcs.find(function(x){return x.id===id;});openMod('<div class="mtitle">Редактировать НПС</div><label class="fl">Имя</label><input class="inp" id="en_n" value="'+n.name+'"><label class="fl">Заметки</label><textarea class="inp" id="en_d">'+n.notes+'</textarea><div class="row" style="margin-top:16px"><button class="bpri" onclick="sEditNPC('+id+')">Сохранить</button><button class="btn" onclick="closeMod()">Отмена</button></div><div style="margin-top:10px;padding-top:10px;border-top:1px solid #1a1510"><button class="bdng" style="width:100%" onclick="oDelNPC('+id+')">Удалить персонажа</button></div>');}
function sEditNPC(id){S.npcs=S.npcs.map(function(x){return x.id===id?Object.assign({},x,{name:document.getElementById("en_n").value,notes:document.getElementById("en_d").value}):x;});closeMod();ntf("НПС обновлён");render();}
function oDelNPC(id){var n=S.npcs.find(function(x){return x.id===id;});openMod('<div class="mtitle">Удалить персонажа?</div><div style="font-size:.82rem;color:#e8dcc8;margin-bottom:16px">«'+n.name+'» будет удалён без возможности восстановления.</div><div class="row"><button class="bdng" style="flex:1" onclick="S.npcs=S.npcs.filter(function(x){return x.id!=='+id+';});closeMod();ntf(\'Удалено\',\'#e05050\');render()">Удалить</button><button class="btn" onclick="closeMod()">Отмена</button></div>');}
