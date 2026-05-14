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

// ── START ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
