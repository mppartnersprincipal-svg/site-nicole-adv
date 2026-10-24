-- Tentativas de login do /dashboard (limite: 5 falhas por IP a cada 15 min → 429; ver lib/painel/limite-login.ts).
-- Sem IP: só ip_hash = sha256(salt fixo do projeto + IP).
-- Acesso só pela service role (API na Vercel). RLS ligado sem policies = bloqueado para anon/authenticated.
-- Projeto compartilhado: tudo daqui começa com nicoli_.
-- Idempotente: pode rodar de novo sem perder dados.
-- Enquanto não for aplicada, o login segue funcionando com o limite só em memória (por instância).

create table if not exists public.nicoli_login_attempts (
  id          bigserial primary key,
  ip_hash     text not null check (char_length(ip_hash) = 64),
  created_at  timestamptz not null default now(),
  success     boolean not null default false
);

-- Consulta do limite: falhas de um ip_hash nos últimos 15 min, mais recentes primeiro
create index if not exists nicoli_login_attempts_ip_created_idx
  on public.nicoli_login_attempts (ip_hash, created_at desc);

alter table public.nicoli_login_attempts enable row level security;
-- Sem policies: anon/authenticated não leem nem escrevem. A API usa a service role.
revoke all on public.nicoli_login_attempts from anon, authenticated;
revoke all on sequence public.nicoli_login_attempts_id_seq from anon, authenticated;

-- Retenção (o limite só olha 15 min). Rodar de vez em quando, sempre com o prefixo:
-- delete from public.nicoli_login_attempts where created_at < now() - interval '90 days';
