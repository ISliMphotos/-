require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Проверка переменных окружения при старте
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ set' : '❌ MISSING');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✅ set' : '❌ MISSING');
console.log('BOT_TOKEN:',    process.env.BOT_TOKEN    ? '✅ set' : '❌ MISSING');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────

app.use(cors({ origin: '*' }));

app.use(express.json({ limit: '2mb' }));

// ── HELPERS ───────────────────────────────────────────────────────────────────

/**
 * Проверяет подпись Telegram WebApp initData по алгоритму HMAC-SHA256.
 * Документация: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
function verifyTelegramInitData(initData) {
  try {
    const params = new URLSearchParams(initData);
    const receivedHash = params.get('hash');
    if (!receivedHash) return false;

    params.delete('hash');

    // Строка для проверки: параметры отсортированы по алфавиту, разделены \n
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    // Секретный ключ = HMAC-SHA256("WebAppData", BOT_TOKEN)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN)
      .digest();

    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return expectedHash === receivedHash;
  } catch {
    return false;
  }
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

// Health check — Render.com пингует этот endpoint чтобы не усыплять сервис
app.get('/health', (_req, res) => res.json({ ok: true }));

/**
 * POST /api/auth/verify
 * Тело: { initData: string }  — сырая строка Telegram.WebApp.initData
 * Ответ: { valid: boolean }
 */
app.post('/api/auth/verify', (req, res) => {
  const { initData } = req.body;
  if (!initData) {
    return res.status(400).json({ error: 'initData is required' });
  }
  res.json({ valid: verifyTelegramInitData(initData) });
});

/**
 * GET /api/character/:telegram_id
 * Ответ: { character_data: object } или 404
 */
app.get('/api/character/:telegram_id', async (req, res) => {
  const { telegram_id } = req.params;

  const { data, error } = await supabase
    .from('characters')
    .select('character_data')
    .eq('telegram_id', telegram_id)
    .single();

  // PGRST116 — строка не найдена, это нормально для нового пользователя
  if (error && error.code !== 'PGRST116') {
    console.error('Supabase load error:', error);
    return res.status(500).json({ error: 'Database error' });
  }

  if (!data) {
    return res.status(404).json({ error: 'Character not found' });
  }

  res.json({ character_data: data.character_data });
});

/**
 * POST /api/character/save
 * Тело: { telegram_id: string|number, character_data: object }
 * Ответ: { success: true }
 */
app.post('/api/character/save', async (req, res) => {
  const { telegram_id, character_data } = req.body;

  if (!telegram_id || !character_data) {
    return res.status(400).json({ error: 'telegram_id and character_data are required' });
  }

  const { error } = await supabase
    .from('characters')
    .upsert(
      {
        telegram_id: Number(telegram_id),   // bigint — передаём числом
        character_data
        // updated_at обновляет триггер автоматически
      },
      { onConflict: 'telegram_id' }
    );

  if (error) {
    console.error('Supabase save error:', JSON.stringify(error));
    return res.status(500).json({
      error: 'Database error',
      details: error.message,
      hint: error.hint || null,
      code: error.code || null
    });
  }

  res.json({ success: true });
});

// ── VK ROUTES ────────────────────────────────────────────────────────────────

/**
 * GET /api/character/vk/:vk_id
 * Ответ: { character_data: object } или 404
 */
app.get('/api/character/vk/:vk_id', async (req, res) => {
  const { vk_id } = req.params;

  const { data, error } = await supabase
    .from('characters')
    .select('character_data')
    .eq('vk_id', Number(vk_id))
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Supabase vk load error:', JSON.stringify(error));
    return res.status(500).json({ error: 'Database error', details: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'Character not found' });
  }

  res.json({ character_data: data.character_data });
});

/**
 * POST /api/character/vk/save
 * Тело: { vk_id: number, character_data: object }
 * Ответ: { success: true }
 */
app.post('/api/character/vk/save', async (req, res) => {
  const { vk_id, character_data } = req.body;

  if (!vk_id || !character_data) {
    return res.status(400).json({ error: 'vk_id and character_data are required' });
  }

  const { error } = await supabase
    .from('characters')
    .upsert(
      {
        vk_id: Number(vk_id),
        character_data
      },
      { onConflict: 'vk_id' }
    );

  if (error) {
    console.error('Supabase vk save error:', JSON.stringify(error));
    return res.status(500).json({
      error: 'Database error',
      details: error.message,
      hint: error.hint || null,
      code: error.code || null
    });
  }

  res.json({ success: true });
});

// ── LINK CODES (in-memory, TTL 10 мин) ───────────────────────────────────────

const linkCodes = new Map(); // code → { platform, user_id, expires }

function makeLinkCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

/**
 * POST /api/link/generate
 * Тело: { platform: 'telegram'|'vk', user_id: number }
 * Ответ: { code, expires_in: 600 }
 */
app.post('/api/link/generate', (req, res) => {
  const { platform, user_id } = req.body;
  if (!platform || !user_id) {
    return res.status(400).json({ error: 'platform and user_id required' });
  }

  // Чистим протухшие коды
  for (const [k, v] of linkCodes) if (Date.now() > v.expires) linkCodes.delete(k);

  const code = makeLinkCode();
  linkCodes.set(code, { platform, user_id: Number(user_id), expires: Date.now() + 600_000 });

  res.json({ code, expires_in: 600 });
});

/**
 * POST /api/link/connect
 * Тело: { code, platform: 'telegram'|'vk', user_id: number }
 * Ответ: { success: true }
 */
app.post('/api/link/connect', async (req, res) => {
  const { code, platform, user_id } = req.body;
  if (!code || !platform || !user_id) {
    return res.status(400).json({ error: 'code, platform and user_id required' });
  }

  const entry = linkCodes.get(code.toUpperCase());
  if (!entry) return res.status(404).json({ error: 'Код не найден' });
  if (Date.now() > entry.expires) {
    linkCodes.delete(code.toUpperCase());
    return res.status(410).json({ error: 'Код истёк (10 минут)' });
  }
  if (entry.platform === platform) {
    return res.status(400).json({ error: 'Нельзя связать два аккаунта одной платформы' });
  }

  linkCodes.delete(code.toUpperCase());

  const field1 = entry.platform === 'telegram' ? 'telegram_id' : 'vk_id';
  const field2 = platform === 'telegram' ? 'telegram_id' : 'vk_id';
  const id1 = entry.user_id;
  const id2 = Number(user_id);

  const { data: char1, error: e1 } = await supabase.from('characters').select('*').eq(field1, id1).single();
  const { data: char2, error: e2 } = await supabase.from('characters').select('*').eq(field2, id2).single();

  console.log('link/connect char1:', char1?.id, 'char2:', char2?.id);

  // Определяем, чьи данные "богаче" — у кого есть имя или уровень > 1
  function hasData(ch) {
    if (!ch) return false;
    const d = ch.character_data || {};
    return !!(d.name || (d.level && d.level > 1));
  }

  if (char1 && char2 && char1.id !== char2.id) {
    // Оба существуют — сохраняем того, у кого есть данные персонажа.
    // Если оба заполнены или оба пусты — приоритет у создателя кода (char1).
    const primary   = (!hasData(char1) && hasData(char2)) ? char2 : char1;
    const secondary = primary === char1 ? char2 : char1;
    const addField  = primary === char1 ? field2 : field1;
    const addId     = primary === char1 ? id2    : id1;

    console.log('merge: keep', primary.id, 'delete', secondary.id);
    const { error: upErr } = await supabase.from('characters').update({ [addField]: addId }).eq('id', primary.id);
    const { error: delErr } = await supabase.from('characters').delete().eq('id', secondary.id);
    if (upErr)  console.error('update error:', JSON.stringify(upErr));
    if (delErr) console.error('delete error:', JSON.stringify(delErr));

  } else if (char1) {
    // Только первый — добавляем ID второй платформы
    const { error: upErr } = await supabase.from('characters').update({ [field2]: id2 }).eq('id', char1.id);
    if (upErr) console.error('update error:', JSON.stringify(upErr));

  } else if (char2) {
    // Только второй — добавляем ID первой платформы
    const { error: upErr } = await supabase.from('characters').update({ [field1]: id1 }).eq('id', char2.id);
    if (upErr) console.error('update error:', JSON.stringify(upErr));

  } else {
    // Никого нет — создаём запись с обоими ID
    const { error: insErr } = await supabase.from('characters').insert({ [field1]: id1, [field2]: id2, character_data: {} });
    if (insErr) console.error('insert error:', JSON.stringify(insErr));
  }

  res.json({ success: true });
});

// ── START ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
