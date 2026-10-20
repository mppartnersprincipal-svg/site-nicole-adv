-- ============================================================
-- Analytics first-party da Nicoli (painel /dashboard) — porte da Sólida
-- (0003_analytics + 0004_analytics_visitors), com prefixo nicoli_.
--
-- Projeto Supabase compartilhado: separação SÓ pelo prefixo. Leitura e escrita
-- apenas pelo service role (rotas do Next no servidor): nenhuma policy para
-- anon/authenticated, e as funções só podem ser executadas pelo service_role
-- (outros painéis do mesmo projeto não enxergam estes dados).
--
-- Privacidade: sem IP, sem user-agent cru, sem cookie. Sessão = UUID aleatório
-- da aba. visitor_id só existe para quem ACEITOU cookies de análise.
--
-- Eventos (nomes do dataLayer do site, gtm/TRACKING.md):
--   page_view, page_leave, click            → coletor (lib/painel/coletor.ts)
--   click_whatsapp, click_phone, click_email, click_cta, generate_lead,
--   form_start, blog_read, consent_update   → espelhados de lib/tracking.ts
-- Contato (conversão) = click_whatsapp | click_phone | generate_lead
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Sessões ----------
create table if not exists public.nicoli_sessions (
  id             uuid primary key,
  started_at     timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  landing_path   text not null,
  referrer_host  text,
  channel        text not null check (channel in
                   ('google_ads','google_organic','other_search','social','referral','direct')),
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  utm_term       text,
  utm_content    text,
  has_gclid      boolean not null default false,
  device         text check (device in ('mobile','tablet','desktop')),
  browser        text,
  os             text,
  country        text,
  region         text,
  city           text,
  screen_w       smallint,
  screen_h       smallint,
  lang           text,
  visitor_id     uuid,
  is_returning   boolean not null default false,
  page_views     integer not null default 0,
  events         integer not null default 0,
  converted      boolean not null default false
);

create index if not exists nicoli_sessions_started_idx on public.nicoli_sessions (started_at desc);
create index if not exists nicoli_sessions_channel_idx on public.nicoli_sessions (channel, started_at desc);
create index if not exists nicoli_sessions_geo_idx on public.nicoli_sessions (region, city);
create index if not exists nicoli_sessions_visitor_idx
  on public.nicoli_sessions (visitor_id, started_at desc) where visitor_id is not null;

-- ---------- Eventos ----------
create table if not exists public.nicoli_events (
  id          bigint generated always as identity primary key,
  session_id  uuid not null references public.nicoli_sessions (id) on delete cascade,
  ts          timestamptz not null default now(),
  name        text not null,
  path        text not null,
  title       text,
  params      jsonb not null default '{}'::jsonb
);

create index if not exists nicoli_events_ts_idx on public.nicoli_events (ts desc);
create index if not exists nicoli_events_name_ts_idx on public.nicoli_events (name, ts desc);
create index if not exists nicoli_events_session_idx on public.nicoli_events (session_id, ts);
create index if not exists nicoli_events_path_idx on public.nicoli_events (path, ts desc);

-- ---------- Triggers ----------
create or replace function public.nicoli_bump_session()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  update public.nicoli_sessions
     set last_seen_at = greatest(last_seen_at, new.ts),
         page_views   = page_views + (new.name = 'page_view')::int,
         events       = events + 1,
         converted    = converted or new.name in ('click_whatsapp', 'click_phone', 'generate_lead')
   where id = new.session_id;
  return new;
end;
$$;

drop trigger if exists nicoli_events_bump on public.nicoli_events;
create trigger nicoli_events_bump after insert on public.nicoli_events
  for each row execute function public.nicoli_bump_session();

create or replace function public.nicoli_mark_returning()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.visitor_id is not null then
    new.is_returning := exists (
      select 1 from public.nicoli_sessions s where s.visitor_id = new.visitor_id and s.id <> new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists nicoli_sessions_returning on public.nicoli_sessions;
create trigger nicoli_sessions_returning before insert on public.nicoli_sessions
  for each row execute function public.nicoli_mark_returning();

-- ---------- RLS: ninguém além do service role ----------
alter table public.nicoli_sessions enable row level security;
alter table public.nicoli_events   enable row level security;
revoke all on public.nicoli_sessions from anon, authenticated;
revoke all on public.nicoli_events   from anon, authenticated;

-- ============================================================
-- Agregações (fuso America/Sao_Paulo; p_channel null = todas as origens)
-- ============================================================

-- Área de atuação a partir do caminho (/areas-de-atuacao/<slug>)
create or replace function public.nicoli_area(p_path text)
returns text language sql immutable set search_path = public
as $$
  select case when p_path like '/areas-de-atuacao/%' then nullif(split_part(p_path, '/', 3), '') end;
$$;

create or replace function public.nicoli_kpis(p_from timestamptz, p_to timestamptz, p_channel text default null)
returns table (sessions bigint, page_views bigint, avg_session_ms numeric, avg_page_ms numeric,
               wa_clicks bigint, phone_clicks bigint, leads bigint, contact_sessions bigint, conv_rate numeric)
language sql stable security invoker set search_path = public
as $$
  with s as (
    select * from nicoli_sessions
    where started_at >= p_from and started_at < p_to and (p_channel is null or channel = p_channel)
  ),
  ev as (select e.* from nicoli_events e join s on s.id = e.session_id),
  agg as (
    select
      (select count(*) from s) as sessions,
      (select count(*) from ev where name = 'page_view') as page_views,
      (select coalesce(round(avg(extract(epoch from (last_seen_at - started_at)) * 1000)), 0) from s) as avg_session_ms,
      (select coalesce(round(avg((params->>'duration_ms')::numeric)), 0) from ev
        where name = 'page_leave' and (params->>'duration_ms') ~ '^[0-9]+$') as avg_page_ms,
      (select count(*) from ev where name = 'click_whatsapp') as wa_clicks,
      (select count(*) from ev where name = 'click_phone') as phone_clicks,
      (select count(*) from ev where name = 'generate_lead') as leads,
      (select count(distinct session_id) from ev
        where name in ('click_whatsapp', 'click_phone', 'generate_lead')) as contact_sessions
  )
  select sessions, page_views, avg_session_ms, avg_page_ms, wa_clicks, phone_clicks, leads, contact_sessions,
         case when sessions = 0 then 0 else round(contact_sessions::numeric / sessions * 100, 1) end
  from agg;
$$;

create or replace function public.nicoli_daily(p_from timestamptz, p_to timestamptz, p_channel text default null)
returns table (day date, sessions bigint, page_views bigint, contacts bigint)
language sql stable security invoker set search_path = public
as $$
  with days as (
    select generate_series((p_from at time zone 'America/Sao_Paulo')::date,
                           ((p_to - interval '1 second') at time zone 'America/Sao_Paulo')::date,
                           interval '1 day')::date as day
  ),
  s as (
    select id, (started_at at time zone 'America/Sao_Paulo')::date as day from nicoli_sessions
    where started_at >= p_from and started_at < p_to and (p_channel is null or channel = p_channel)
  ),
  ev as (
    select e.name, (e.ts at time zone 'America/Sao_Paulo')::date as day
    from nicoli_events e join s on s.id = e.session_id
    where e.name in ('page_view', 'click_whatsapp', 'click_phone', 'generate_lead')
  )
  select d.day,
         (select count(*) from s where s.day = d.day),
         (select count(*) from ev where ev.day = d.day and ev.name = 'page_view'),
         (select count(*) from ev where ev.day = d.day and ev.name <> 'page_view')
  from days d order by d.day;
$$;

create or replace function public.nicoli_heatmap(p_from timestamptz, p_to timestamptz, p_channel text default null)
returns table (dow smallint, hour smallint, sessions bigint)
language sql stable security invoker set search_path = public
as $$
  select extract(dow from (started_at at time zone 'America/Sao_Paulo'))::smallint,
         extract(hour from (started_at at time zone 'America/Sao_Paulo'))::smallint,
         count(*)
  from nicoli_sessions
  where started_at >= p_from and started_at < p_to and (p_channel is null or channel = p_channel)
  group by 1, 2 order by 1, 2;
$$;

create or replace function public.nicoli_by_channel(p_from timestamptz, p_to timestamptz)
returns table (channel text, sessions bigint, contacts bigint)
language sql stable security invoker set search_path = public
as $$
  select s.channel, count(distinct s.id), count(e.id)
  from nicoli_sessions s
  left join nicoli_events e on e.session_id = s.id and e.name in ('click_whatsapp', 'click_phone', 'generate_lead')
  where s.started_at >= p_from and s.started_at < p_to
  group by s.channel order by 2 desc;
$$;

create or replace function public.nicoli_by_device(p_from timestamptz, p_to timestamptz, p_channel text default null)
returns table (device text, sessions bigint)
language sql stable security invoker set search_path = public
as $$
  select coalesce(device, 'desconhecido'), count(*) from nicoli_sessions
  where started_at >= p_from and started_at < p_to and (p_channel is null or channel = p_channel)
  group by 1 order by 2 desc;
$$;

create or replace function public.nicoli_top_pages(
  p_from timestamptz, p_to timestamptz, p_channel text default null, p_limit int default 20)
returns table (path text, title text, views bigint, avg_ms numeric, avg_scroll numeric, contacts bigint)
language sql stable security invoker set search_path = public
as $$
  with ev as (
    select e.* from nicoli_events e join nicoli_sessions s on s.id = e.session_id
    where e.ts >= p_from and e.ts < p_to and (p_channel is null or s.channel = p_channel)
      and e.name in ('page_view', 'page_leave', 'click_whatsapp', 'click_phone', 'generate_lead')
  ),
  v as (select path, max(title) as title, count(*) as views from ev where name = 'page_view' group by path),
  l as (
    select path, round(avg((params->>'duration_ms')::numeric)) as avg_ms,
           round(avg((params->>'max_scroll_pct')::numeric)) as avg_scroll
    from ev where name = 'page_leave' and (params->>'duration_ms') ~ '^[0-9]+$' group by path
  ),
  c as (select path, count(*) as contacts from ev
        where name in ('click_whatsapp', 'click_phone', 'generate_lead') group by path)
  select v.path, v.title, v.views, coalesce(l.avg_ms, 0), coalesce(l.avg_scroll, 0), coalesce(c.contacts, 0)
  from v left join l on l.path = v.path left join c on c.path = v.path
  order by v.views desc limit p_limit;
$$;

create or replace function public.nicoli_geo(
  p_from timestamptz, p_to timestamptz, p_channel text default null, p_limit int default 30)
returns table (country text, region text, city text, sessions bigint, contacts bigint)
language sql stable security invoker set search_path = public
as $$
  select s.country, s.region, s.city, count(distinct s.id), count(e.id)
  from nicoli_sessions s
  left join nicoli_events e on e.session_id = s.id and e.name in ('click_whatsapp', 'click_phone', 'generate_lead')
  where s.started_at >= p_from and s.started_at < p_to and (p_channel is null or s.channel = p_channel)
  group by s.country, s.region, s.city order by 4 desc limit p_limit;
$$;

create or replace function public.nicoli_campaigns(p_from timestamptz, p_to timestamptz)
returns table (utm_campaign text, utm_term text, utm_content text, sessions bigint, contacts bigint, conv_rate numeric)
language sql stable security invoker set search_path = public
as $$
  with s as (
    select * from nicoli_sessions
    where started_at >= p_from and started_at < p_to and channel = 'google_ads'
  )
  select s.utm_campaign, s.utm_term, s.utm_content, count(distinct s.id), count(e.id),
         round(count(distinct e.session_id)::numeric / nullif(count(distinct s.id), 0) * 100, 1)
  from s
  left join nicoli_events e on e.session_id = s.id and e.name in ('click_whatsapp', 'click_phone', 'generate_lead')
  group by s.utm_campaign, s.utm_term, s.utm_content order by 4 desc;
$$;

-- Contatos (WhatsApp, telefone, formulário) × área × local do botão × origem
create or replace function public.nicoli_contacts(p_from timestamptz, p_to timestamptz, p_channel text default null)
returns table (kind text, area text, location text, channel text, clicks bigint, sessions bigint)
language sql stable security invoker set search_path = public
as $$
  select e.name,
         coalesce(public.nicoli_area(e.path), e.params->>'lead_area'),
         case when e.name = 'generate_lead' then coalesce(e.params->>'form_id', 'formulario')
              else e.params->>'link_location' end,
         s.channel, count(*), count(distinct e.session_id)
  from nicoli_events e join nicoli_sessions s on s.id = e.session_id
  where e.name in ('click_whatsapp', 'click_phone', 'generate_lead')
    and e.ts >= p_from and e.ts < p_to and (p_channel is null or s.channel = p_channel)
  group by 1, 2, 3, 4 order by 5 desc;
$$;

create or replace function public.nicoli_clicks(
  p_from timestamptz, p_to timestamptz, p_channel text default null, p_limit int default 30)
returns table (label text, tag text, href text, clicks bigint, sessions bigint)
language sql stable security invoker set search_path = public
as $$
  select coalesce(e.params->>'track', e.params->>'text', e.params->>'href'),
         max(e.params->>'tag'), max(e.params->>'href'), count(*), count(distinct e.session_id)
  from nicoli_events e join nicoli_sessions s on s.id = e.session_id
  where e.name = 'click' and e.ts >= p_from and e.ts < p_to and (p_channel is null or s.channel = p_channel)
  group by 1 order by 4 desc limit p_limit;
$$;

-- Blog: artigos mais vistos, leituras completas (blog_read), tempo e scroll
create or replace function public.nicoli_blog(
  p_from timestamptz, p_to timestamptz, p_channel text default null, p_limit int default 20)
returns table (path text, title text, views bigint, reads bigint, avg_ms numeric, avg_scroll numeric)
language sql stable security invoker set search_path = public
as $$
  with ev as (
    select e.* from nicoli_events e join nicoli_sessions s on s.id = e.session_id
    where e.ts >= p_from and e.ts < p_to and (p_channel is null or s.channel = p_channel)
      and e.path like '/blog/%' and e.name in ('page_view', 'page_leave', 'blog_read')
  ),
  v as (select path, max(title) as title, count(*) as views from ev where name = 'page_view' group by path),
  r as (select path, count(*) as reads from ev where name = 'blog_read' group by path),
  l as (
    select path, round(avg((params->>'duration_ms')::numeric)) as avg_ms,
           round(avg((params->>'max_scroll_pct')::numeric)) as avg_scroll
    from ev where name = 'page_leave' and (params->>'duration_ms') ~ '^[0-9]+$' group by path
  )
  select v.path, v.title, v.views, coalesce(r.reads, 0), coalesce(l.avg_ms, 0), coalesce(l.avg_scroll, 0)
  from v left join r on r.path = v.path left join l on l.path = v.path
  order by v.views desc limit p_limit;
$$;

-- Funil: visitou → começou o formulário → enviou o formulário; e quem falou por WhatsApp/telefone
create or replace function public.nicoli_funnel(p_from timestamptz, p_to timestamptz, p_channel text default null)
returns table (step text, sessions bigint)
language sql stable security invoker set search_path = public
as $$
  with s as (
    select id from nicoli_sessions
    where started_at >= p_from and started_at < p_to and (p_channel is null or channel = p_channel)
  ),
  ev as (select e.session_id, e.name from nicoli_events e join s on s.id = e.session_id)
  select 'page_view'::text, count(*) from s
  union all select 'contact', count(distinct session_id) from ev
    where name in ('click_whatsapp', 'click_phone', 'generate_lead')
  union all select 'form_start', count(distinct session_id) from ev where name = 'form_start'
  union all select 'generate_lead', count(distinct session_id) from ev where name = 'generate_lead';
$$;

create or replace function public.nicoli_journeys(
  p_from timestamptz, p_to timestamptz, p_channel text default null,
  p_only_converted boolean default true, p_limit int default 50)
returns table (id uuid, started_at timestamptz, last_seen_at timestamptz, channel text,
               utm_campaign text, utm_term text, device text, browser text, os text,
               region text, city text, landing_path text, referrer_host text, converted boolean,
               is_returning boolean, trail jsonb)
language sql stable security invoker set search_path = public
as $$
  select s.id, s.started_at, s.last_seen_at, s.channel, s.utm_campaign, s.utm_term, s.device, s.browser, s.os,
         s.region, s.city, s.landing_path, s.referrer_host, s.converted, s.is_returning,
         coalesce((select jsonb_agg(jsonb_build_object(
                     'ts', e.ts, 'name', e.name, 'path', e.path, 'title', e.title, 'params', e.params)
                   order by e.ts, e.id)
                   from nicoli_events e where e.session_id = s.id), '[]'::jsonb)
  from nicoli_sessions s
  where s.started_at >= p_from and s.started_at < p_to and (p_channel is null or s.channel = p_channel)
    and (not p_only_converted or s.converted)
  order by s.started_at desc limit p_limit;
$$;

create or replace function public.nicoli_recent(p_limit int default 50)
returns table (ts timestamptz, session_id uuid, name text, path text, params jsonb,
               channel text, device text, city text, region text)
language sql stable security invoker set search_path = public
as $$
  select e.ts, e.session_id, e.name, e.path, e.params, s.channel, s.device, s.city, s.region
  from nicoli_events e join nicoli_sessions s on s.id = e.session_id
  order by e.ts desc, e.id desc limit p_limit;
$$;

create or replace function public.nicoli_visitors(p_from timestamptz, p_to timestamptz, p_channel text default null)
returns table (kind text, sessions bigint, contacts bigint)
language sql stable security invoker set search_path = public
as $$
  select case when s.visitor_id is null then 'unknown' when s.is_returning then 'returning' else 'new' end,
         count(distinct s.id), count(e.id)
  from nicoli_sessions s
  left join nicoli_events e on e.session_id = s.id and e.name in ('click_whatsapp', 'click_phone', 'generate_lead')
  where s.started_at >= p_from and s.started_at < p_to and (p_channel is null or s.channel = p_channel)
  group by 1 order by 2 desc;
$$;

-- Banner LGPD: aceitou análise × recusou × não respondeu
create or replace function public.nicoli_consent(p_from timestamptz, p_to timestamptz)
returns table (choice text, sessions bigint)
language sql stable security invoker set search_path = public
as $$
  with s as (select id from nicoli_sessions where started_at >= p_from and started_at < p_to),
  c as (
    select distinct on (e.session_id) e.session_id,
           case when e.params->>'consent_analytics' = 'granted' then 'accepted' else 'essential' end as choice
    from nicoli_events e join s on s.id = e.session_id
    where e.name = 'consent_update'
    order by e.session_id, e.ts desc
  )
  select coalesce(c.choice, 'none'), count(*) from s left join c on c.session_id = s.id
  group by 1 order by 2 desc;
$$;

-- Retenção (13 meses)
create or replace function public.nicoli_purge(p_months int default 13)
returns integer language plpgsql security definer set search_path = public
as $$
declare n integer;
begin
  delete from nicoli_sessions where started_at < now() - make_interval(months => p_months);
  get diagnostics n = row_count;
  return n;
end;
$$;

-- ---------- Permissões: só o service role executa ----------
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'nicoli\_%'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end;
$$;

-- Opcional (pg_cron): select cron.schedule('nicoli-purge', '0 4 1 * *', 'select public.nicoli_purge(13)');
