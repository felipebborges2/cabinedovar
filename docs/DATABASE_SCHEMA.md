# Cabine do VAR - Schema do Banco

## Entidades

### users

Perfil público do usuário autenticado.

- `id uuid primary key`: referencia `auth.users(id)`.
- `username text not null`: nome de usuário único normalizado.
- `name text not null`.
- `avatar_url text`.
- `email text`.
- `created_at timestamptz not null`.
- `updated_at timestamptz not null`.

### pools

Bolão criado por um usuário.

- `id uuid primary key`.
- `name text not null`.
- `description text`.
- `invite_code text unique not null`.
- `owner_id uuid not null references users(id)`.
- `tournament_predictions_lock_at timestamptz`.
- `actual_champion_id uuid references teams(id)`.
- `actual_runner_up_id uuid references teams(id)`.
- `actual_third_place_id uuid references teams(id)`.
- `actual_fourth_place_id uuid references teams(id)`.
- `created_at timestamptz not null`.
- `updated_at timestamptz not null`.

### pool_members

Participação de usuário em bolão.

- `id uuid primary key`.
- `pool_id uuid not null references pools(id)`.
- `user_id uuid not null references users(id)`.
- `role pool_member_role not null default 'member'`.
- `joined_at timestamptz not null`.
- unique `(pool_id, user_id)`.

### teams

Times/seleções disponíveis no campeonato.

- `id uuid primary key`.
- `name text not null`.
- `short_name text not null`.
- `flag_url text`.
- `group_name text`.
- `created_at timestamptz not null`.

### matches

Partidas do campeonato.

- `id uuid primary key`.
- `team_a_id uuid not null references teams(id)`.
- `team_b_id uuid not null references teams(id)`.
- `kickoff_at timestamptz not null`.
- `stage match_stage not null`.
- `round integer not null default 1`.
- `result_team_a_goals integer`.
- `result_team_b_goals integer`.
- `status match_status not null default 'scheduled'`.
- `created_at timestamptz not null`.
- `updated_at timestamptz not null`.

### predictions

Palpites de partidas por membro/bolão.

- `id uuid primary key`.
- `pool_id uuid not null references pools(id)`.
- `match_id uuid not null references matches(id)`.
- `user_id uuid not null references users(id)`.
- `team_a_goals integer not null`.
- `team_b_goals integer not null`.
- `points integer not null default 0`.
- `is_exact_score boolean not null default false`.
- `is_correct_result boolean not null default false`.
- `has_correct_goal_difference boolean not null default false`.
- `created_at timestamptz not null`.
- `updated_at timestamptz not null`.
- unique `(pool_id, match_id, user_id)`.

### tournament_predictions

Palpites pré-torneio por membro/bolão.

- `id uuid primary key`.
- `pool_id uuid not null references pools(id)`.
- `user_id uuid not null references users(id)`.
- `champion_id uuid not null references teams(id)`.
- `runner_up_id uuid not null references teams(id)`.
- `third_place_id uuid not null references teams(id)`.
- `fourth_place_id uuid not null references teams(id)`.
- `points integer not null default 0`.
- `created_at timestamptz not null`.
- `updated_at timestamptz not null`.
- unique `(pool_id, user_id)`.

### standings

Tabela derivada para ranking por bolão e rodada.

- `id uuid primary key`.
- `pool_id uuid not null references pools(id)`.
- `user_id uuid not null references users(id)`.
- `round integer`: `null` representa ranking geral.
- `match_points integer not null default 0`.
- `tournament_points integer not null default 0`.
- `total_points integer not null default 0`.
- `exact_scores integer not null default 0`.
- `correct_results integer not null default 0`.
- `updated_at timestamptz not null`.
- unique `(pool_id, user_id, round)`.

## Enums

- `pool_member_role`: `owner`, `admin`, `member`.
- `match_stage`: `groups`, `round_of_16`, `quarterfinal`, `semifinal`, `third_place`, `final`.
- `match_status`: `scheduled`, `in_progress`, `finished`.

## Indices

- `pools(invite_code)`.
- unique `lower(users.username)`.
- `pools(owner_id)`.
- `pool_members(user_id)`.
- `pool_members(pool_id)`.
- `matches(kickoff_at)`.
- `matches(stage)`.
- `matches(round)`.
- `predictions(pool_id, user_id)`.
- `predictions(match_id)`.
- `tournament_predictions(pool_id, user_id)`.
- `standings(pool_id, total_points desc)`.
- `standings(pool_id, round, total_points desc)`.

## Policies RLS

Resumo:

- `users`: autenticados leem perfis; cada usuário atualiza seu próprio perfil.
- `pools`: membros leem; autenticados criam; owner/admin atualizam.
- `pool_members`: membros leem lista do próprio bolão; usuário autenticado pode entrar via função RPC; admins gerenciam.
- `teams` e `matches`: leitura para autenticados; escrita por service role/admin.
- `predictions`: membros leem palpites do próprio bolão; cada usuário cria/edita seus palpites antes do kickoff.
- `tournament_predictions`: membros leem; cada usuário cria/edita antes do prazo do bolão.
- `standings`: membros leem; escrita restrita a funções com `security definer`.

## Funções SQL

- `public.is_pool_member(pool_id, user_id)`.
- `public.is_pool_admin(pool_id, user_id)`.
- `public.generate_invite_code()`.
- `public.join_pool_by_invite_code(code)`.
- `public.calculate_match_prediction_points(prediction_id)`.
- `public.recalculate_pool_standings(pool_id)`.
- `public.recalculate_standings_for_match(match_id)`.
- `public.recalculate_tournament_prediction_points(pool_id)`.

## Constraints de negócio

- Gols previstos e resultados devem ser maiores ou iguais a zero.
- `team_a_id <> team_b_id`.
- Times escolhidos no pré-torneio devem ser distintos.
- Palpites de partida só podem ser alterados antes do kickoff.
- Palpites pré-torneio só podem ser alterados antes de `tournament_predictions_lock_at`.
