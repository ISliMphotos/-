-- ⚠️  Выполните этот SQL в Supabase:
--     Dashboard → SQL Editor → New query → вставьте → Run
--     Если таблица уже существует — пропустите блок CREATE TABLE,
--     но выполните ALTER и GRANT в конце.

create table if not exists characters (
  id             bigserial primary key,
  telegram_id    bigint unique not null,
  character_data jsonb not null default '{}',
  updated_at     timestamp default now()
);

-- Индекс для быстрого поиска по telegram_id
create index if not exists characters_telegram_id_idx on characters (telegram_id);

-- Автоматически обновляет updated_at при каждом изменении строки
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on characters;
create trigger set_updated_at
before update on characters
for each row execute function touch_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- VK поддержка: добавить колонку vk_id если её ещё нет
-- (выполните отдельно если таблица уже создана)
-- alter table characters add column if not exists vk_id bigint unique;
-- create index if not exists characters_vk_id_idx on characters (vk_id);
-- ─────────────────────────────────────────────────────────────────
-- ВАЖНО: отключаем RLS, чтобы anon-ключ мог читать и писать.
-- Бэкенд сам отвечает за безопасность — данные валидируются там.
-- ─────────────────────────────────────────────────────────────────
alter table characters disable row level security;

-- Явно даём права anon и service_role (на случай если они были отозваны)
grant select, insert, update on table characters to anon, service_role;
grant usage, select on sequence characters_id_seq to anon, service_role;
