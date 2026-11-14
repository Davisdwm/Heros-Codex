-- Hero's Codex: thumbs-up on public quests.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.

create table if not exists public.hero_thumbs (
  to_code    text not null,
  from_code  text not null,
  quest      text not null check (char_length(quest) <= 40),
  day        date not null,
  created_at timestamptz not null default now(),
  primary key (to_code, from_code, quest, day)
);
-- Locked like hero_cards: nobody can read or change it directly, only through the functions below.
alter table public.hero_thumbs enable row level security;
revoke all on table public.hero_thumbs from anon, authenticated;

-- Give a friend a thumbs up on a quest they completed. The giver proves who they are with their card's secret.
create or replace function public.give_thumb(p_code text, p_secret text, p_to text, p_quest text, p_day date)
returns boolean
language plpgsql security definer
set search_path = public, extensions
as $$
declare h text := encode(digest(coalesce(p_secret,''), 'sha256'), 'hex');
begin
  if p_secret is null or length(p_secret) < 20 then return false; end if;
  if not exists (select 1 from hero_cards where code = upper(p_code) and secret_hash = h) then return false; end if;
  if upper(p_to) = upper(p_code) then return false; end if;
  if not exists (select 1 from hero_cards where code = upper(p_to)) then return false; end if;
  if p_quest is null or p_quest = '' or p_day is null or p_day < current_date - 31 or p_day > current_date + 1 then return false; end if;
  insert into hero_thumbs (to_code, from_code, quest, day)
  values (upper(p_to), upper(p_code), left(p_quest, 40), p_day)
  on conflict do nothing;
  delete from hero_thumbs where day < current_date - 90;   -- keep the table small
  return true;
end $$;

-- Read the thumbs up you have received (last 60 days), with the name on each giver's card.
create or replace function public.get_thumbs(p_code text, p_secret text)
returns table (from_code text, from_name text, quest text, day date, created_at timestamptz)
language sql stable security definer
set search_path = public, extensions
as $$
  select t.from_code, left(coalesce(c.card->>'name', ''), 40), t.quest, t.day, t.created_at
  from hero_thumbs t
  join hero_cards me on me.code = upper(p_code) and me.secret_hash = encode(digest(coalesce(p_secret,''), 'sha256'), 'hex')
  left join hero_cards c on c.code = t.from_code
  where t.to_code = me.code and t.day >= current_date - 60
  order by t.created_at desc
  limit 500;
$$;

revoke all on function public.give_thumb(text, text, text, text, date) from public;
revoke all on function public.get_thumbs(text, text) from public;
grant execute on function public.give_thumb(text, text, text, text, date) to anon, authenticated;
grant execute on function public.get_thumbs(text, text) to anon, authenticated;
