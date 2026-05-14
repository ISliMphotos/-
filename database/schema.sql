-- Выполните этот SQL в Supabase: Dashboard → SQL Editor → New query → вставьте → Run

create table characters (
  id          bigserial primary key,
  telegram_id bigint unique not null,
  character_data jsonb not null default '{}',
  updated_at  timestamp default now()
);

-- Индекс для быстрого поиска по telegram_id
create index on characters (telegram_id);

-- Автоматически обновляет updated_at при каждом изменении строки
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
before update on characters
for each row execute function touch_updated_at();
