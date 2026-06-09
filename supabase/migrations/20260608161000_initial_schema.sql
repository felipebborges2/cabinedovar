create extension if not exists "pgcrypto";

create type public.pool_member_role as enum ('owner', 'admin', 'member');
create type public.match_stage as enum ('groups', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final');
create type public.match_status as enum ('scheduled', 'in_progress', 'finished');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  name text not null,
  avatar_url text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_username_length check (char_length(username) between 3 and 24),
  constraint users_username_format check (username ~ '^[a-z0-9_]+$')
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  flag_url text,
  group_name text,
  created_at timestamptz not null default now(),
  constraint teams_name_unique unique (name),
  constraint teams_short_name_unique unique (short_name)
);

create table public.pools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  invite_code text not null unique,
  owner_id uuid not null references public.users(id) on delete cascade,
  tournament_predictions_lock_at timestamptz,
  actual_champion_id uuid references public.teams(id) on delete set null,
  actual_runner_up_id uuid references public.teams(id) on delete set null,
  actual_third_place_id uuid references public.teams(id) on delete set null,
  actual_fourth_place_id uuid references public.teams(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pools_name_length check (char_length(name) between 3 and 80)
);

create table public.pool_members (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.pool_member_role not null default 'member',
  joined_at timestamptz not null default now(),
  constraint pool_members_unique_user unique (pool_id, user_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  team_a_id uuid not null references public.teams(id) on delete restrict,
  team_b_id uuid not null references public.teams(id) on delete restrict,
  kickoff_at timestamptz not null,
  stage public.match_stage not null,
  round integer not null default 1,
  result_team_a_goals integer,
  result_team_b_goals integer,
  status public.match_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_distinct_teams check (team_a_id <> team_b_id),
  constraint matches_round_positive check (round > 0),
  constraint matches_result_team_a_non_negative check (result_team_a_goals is null or result_team_a_goals >= 0),
  constraint matches_result_team_b_non_negative check (result_team_b_goals is null or result_team_b_goals >= 0),
  constraint matches_result_both_or_none check (
    (result_team_a_goals is null and result_team_b_goals is null)
    or (result_team_a_goals is not null and result_team_b_goals is not null)
  )
);

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  team_a_goals integer not null,
  team_b_goals integer not null,
  points integer not null default 0,
  is_exact_score boolean not null default false,
  is_correct_result boolean not null default false,
  has_correct_goal_difference boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint predictions_unique_user_match unique (pool_id, match_id, user_id),
  constraint predictions_team_a_goals_non_negative check (team_a_goals >= 0),
  constraint predictions_team_b_goals_non_negative check (team_b_goals >= 0)
);

create table public.tournament_predictions (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  champion_id uuid not null references public.teams(id) on delete restrict,
  runner_up_id uuid not null references public.teams(id) on delete restrict,
  third_place_id uuid not null references public.teams(id) on delete restrict,
  fourth_place_id uuid not null references public.teams(id) on delete restrict,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tournament_predictions_unique_user unique (pool_id, user_id),
  constraint tournament_predictions_distinct_teams check (
    champion_id <> runner_up_id
    and champion_id <> third_place_id
    and champion_id <> fourth_place_id
    and runner_up_id <> third_place_id
    and runner_up_id <> fourth_place_id
    and third_place_id <> fourth_place_id
  )
);

create table public.standings (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  round integer,
  match_points integer not null default 0,
  tournament_points integer not null default 0,
  total_points integer not null default 0,
  exact_scores integer not null default 0,
  correct_results integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint standings_round_positive check (round is null or round > 0)
);

create unique index standings_unique_pool_user_round
  on public.standings (pool_id, user_id, coalesce(round, 0));

create unique index users_username_unique_idx on public.users (lower(username));
create index pools_invite_code_idx on public.pools (invite_code);
create index pools_owner_id_idx on public.pools (owner_id);
create index pool_members_user_id_idx on public.pool_members (user_id);
create index pool_members_pool_id_idx on public.pool_members (pool_id);
create index matches_kickoff_at_idx on public.matches (kickoff_at);
create index matches_stage_idx on public.matches (stage);
create index matches_round_idx on public.matches (round);
create index predictions_pool_user_idx on public.predictions (pool_id, user_id);
create index predictions_match_id_idx on public.predictions (match_id);
create index tournament_predictions_pool_user_idx on public.tournament_predictions (pool_id, user_id);
create index standings_pool_total_points_idx on public.standings (pool_id, total_points desc);
create index standings_pool_round_total_points_idx on public.standings (pool_id, round, total_points desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger pools_set_updated_at
before update on public.pools
for each row execute function public.set_updated_at();

create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

create trigger predictions_set_updated_at
before update on public.predictions
for each row execute function public.set_updated_at();

create trigger tournament_predictions_set_updated_at
before update on public.tournament_predictions
for each row execute function public.set_updated_at();

create or replace function public.normalize_username(value text)
returns text
language sql
immutable
as $$
  select nullif(trim(both '_' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9_]+', '_', 'g')), '');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate_username text;
begin
  candidate_username := public.normalize_username(
    coalesce(
      new.raw_user_meta_data->>'username',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1),
      'usuario'
    )
  );

  if candidate_username is null or char_length(candidate_username) < 3 then
    candidate_username := 'usuario_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  insert into public.users (id, username, name, avatar_url, email)
  values (
    new.id,
    candidate_username,
    coalesce(new.raw_user_meta_data->>'name', candidate_username),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  )
  on conflict (id) do update set
    username = excluded.username,
    name = excluded.name,
    avatar_url = excluded.avatar_url,
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
after insert or update on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_pool_member(target_pool_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pool_members pm
    where pm.pool_id = target_pool_id
      and pm.user_id = target_user_id
  );
$$;

create or replace function public.is_pool_admin(target_pool_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pool_members pm
    where pm.pool_id = target_pool_id
      and pm.user_id = target_user_id
      and pm.role in ('owner', 'admin')
  );
$$;

create or replace function public.generate_invite_code()
returns text
language plpgsql
volatile
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := '';
  i integer;
begin
  for i in 1..8 loop
    code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
  end loop;

  return code;
end;
$$;

create or replace function public.set_pool_invite_code()
returns trigger
language plpgsql
as $$
begin
  if new.invite_code is null or new.invite_code = '' then
    loop
      new.invite_code := public.generate_invite_code();
      exit when not exists (select 1 from public.pools where invite_code = new.invite_code);
    end loop;
  end if;

  new.invite_code := upper(new.invite_code);
  return new;
end;
$$;

create trigger pools_set_invite_code
before insert on public.pools
for each row execute function public.set_pool_invite_code();

create or replace function public.create_pool(
  pool_name text,
  pool_description text,
  tournament_lock_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  created_pool_id uuid;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  insert into public.pools (
    name,
    description,
    owner_id,
    tournament_predictions_lock_at
  )
  values (
    pool_name,
    nullif(pool_description, ''),
    current_user_id,
    tournament_lock_at
  )
  returning id into created_pool_id;

  insert into public.pool_members (pool_id, user_id, role)
  values (created_pool_id, current_user_id, 'owner')
  on conflict (pool_id, user_id) do nothing;

  perform public.recalculate_pool_standings(created_pool_id);
  return created_pool_id;
end;
$$;

create or replace function public.recalculate_pool_standings(target_pool_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  return;
end;
$$;

create or replace function public.join_pool_by_invite_code(invite text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_pool_id uuid;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select id into target_pool_id
  from public.pools
  where invite_code = upper(trim(invite));

  if target_pool_id is null then
    raise exception 'Código de convite inválido';
  end if;

  insert into public.pool_members (pool_id, user_id, role)
  values (target_pool_id, current_user_id, 'member')
  on conflict (pool_id, user_id) do nothing;

  perform public.recalculate_pool_standings(target_pool_id);
  return target_pool_id;
end;
$$;

create or replace function public.prediction_result_value(goals_a integer, goals_b integer)
returns integer
language sql
immutable
as $$
  select case
    when goals_a > goals_b then 1
    when goals_a < goals_b then -1
    else 0
  end;
$$;

create or replace function public.score_match_prediction(
  predicted_a integer,
  predicted_b integer,
  actual_a integer,
  actual_b integer
)
returns table (
  points integer,
  is_exact_score boolean,
  is_correct_result boolean,
  has_correct_goal_difference boolean
)
language sql
immutable
as $$
  select
    case
      when actual_a is null or actual_b is null then 0
      when predicted_a = actual_a and predicted_b = actual_b then 10
      when public.prediction_result_value(predicted_a, predicted_b) = public.prediction_result_value(actual_a, actual_b)
        then 5 + case when predicted_a - predicted_b = actual_a - actual_b then 3 else 0 end
      else 0
    end as points,
    (actual_a is not null and actual_b is not null and predicted_a = actual_a and predicted_b = actual_b) as is_exact_score,
    (
      actual_a is not null
      and actual_b is not null
      and public.prediction_result_value(predicted_a, predicted_b) = public.prediction_result_value(actual_a, actual_b)
    ) as is_correct_result,
    (
      actual_a is not null
      and actual_b is not null
      and not (predicted_a = actual_a and predicted_b = actual_b)
      and public.prediction_result_value(predicted_a, predicted_b) = public.prediction_result_value(actual_a, actual_b)
      and predicted_a - predicted_b = actual_a - actual_b
    ) as has_correct_goal_difference;
$$;

create or replace function public.apply_prediction_score()
returns trigger
language plpgsql
as $$
declare
  match_record public.matches%rowtype;
  score record;
begin
  select * into match_record from public.matches where id = new.match_id;

  if match_record.kickoff_at <= now() and (tg_op = 'INSERT' or new.team_a_goals <> old.team_a_goals or new.team_b_goals <> old.team_b_goals) then
    raise exception 'Palpites bloqueados para esta partida';
  end if;

  select * into score
  from public.score_match_prediction(
    new.team_a_goals,
    new.team_b_goals,
    match_record.result_team_a_goals,
    match_record.result_team_b_goals
  );

  new.points := score.points;
  new.is_exact_score := score.is_exact_score;
  new.is_correct_result := score.is_correct_result;
  new.has_correct_goal_difference := score.has_correct_goal_difference;

  return new;
end;
$$;

create trigger predictions_apply_score
before insert or update on public.predictions
for each row execute function public.apply_prediction_score();

create or replace function public.score_tournament_prediction(
  predicted_champion_id uuid,
  predicted_runner_up_id uuid,
  predicted_third_place_id uuid,
  predicted_fourth_place_id uuid,
  actual_champion_id uuid,
  actual_runner_up_id uuid,
  actual_third_place_id uuid,
  actual_fourth_place_id uuid
)
returns integer
language sql
immutable
as $$
  select
    case when actual_champion_id is not null and predicted_champion_id = actual_champion_id then 25 else 0 end
    + case when actual_runner_up_id is not null and predicted_runner_up_id = actual_runner_up_id then 18 else 0 end
    + case when actual_third_place_id is not null and predicted_third_place_id = actual_third_place_id then 12 else 0 end
    + case when actual_fourth_place_id is not null and predicted_fourth_place_id = actual_fourth_place_id then 10 else 0 end;
$$;

create or replace function public.apply_tournament_prediction_score()
returns trigger
language plpgsql
as $$
declare
  pool_record public.pools%rowtype;
begin
  select * into pool_record from public.pools where id = new.pool_id;

  if pool_record.tournament_predictions_lock_at is not null
    and pool_record.tournament_predictions_lock_at <= now()
    and (
      tg_op = 'INSERT'
      or new.champion_id <> old.champion_id
      or new.runner_up_id <> old.runner_up_id
      or new.third_place_id <> old.third_place_id
      or new.fourth_place_id <> old.fourth_place_id
    )
  then
    raise exception 'Palpites pré-torneio bloqueados';
  end if;

  new.points := public.score_tournament_prediction(
    new.champion_id,
    new.runner_up_id,
    new.third_place_id,
    new.fourth_place_id,
    pool_record.actual_champion_id,
    pool_record.actual_runner_up_id,
    pool_record.actual_third_place_id,
    pool_record.actual_fourth_place_id
  );
  return new;
end;
$$;

create trigger tournament_predictions_apply_score
before insert or update on public.tournament_predictions
for each row execute function public.apply_tournament_prediction_score();

create or replace function public.recalculate_pool_standings(target_pool_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.standings where pool_id = target_pool_id;

  insert into public.standings (
    pool_id,
    user_id,
    round,
    match_points,
    tournament_points,
    total_points,
    exact_scores,
    correct_results
  )
  select
    pm.pool_id,
    pm.user_id,
    null::integer,
    coalesce(sum(p.points), 0)::integer,
    coalesce(max(tp.points), 0)::integer,
    (coalesce(sum(p.points), 0) + coalesce(max(tp.points), 0))::integer,
    coalesce(sum(case when p.is_exact_score then 1 else 0 end), 0)::integer,
    coalesce(sum(case when p.is_correct_result then 1 else 0 end), 0)::integer
  from public.pool_members pm
  left join public.predictions p
    on p.pool_id = pm.pool_id
    and p.user_id = pm.user_id
  left join public.tournament_predictions tp
    on tp.pool_id = pm.pool_id
    and tp.user_id = pm.user_id
  where pm.pool_id = target_pool_id
  group by pm.pool_id, pm.user_id;

  insert into public.standings (
    pool_id,
    user_id,
    round,
    match_points,
    tournament_points,
    total_points,
    exact_scores,
    correct_results
  )
  select
    pm.pool_id,
    pm.user_id,
    rounds.round,
    coalesce(sum(p.points), 0)::integer,
    0,
    coalesce(sum(p.points), 0)::integer,
    coalesce(sum(case when p.is_exact_score then 1 else 0 end), 0)::integer,
    coalesce(sum(case when p.is_correct_result then 1 else 0 end), 0)::integer
  from public.pool_members pm
  cross join (select distinct round from public.matches) rounds
  left join public.matches m on m.round = rounds.round
  left join public.predictions p
    on p.pool_id = pm.pool_id
    and p.user_id = pm.user_id
    and p.match_id = m.id
  where pm.pool_id = target_pool_id
  group by pm.pool_id, pm.user_id, rounds.round;
end;
$$;

create or replace function public.recalculate_standings_after_prediction()
returns trigger
language plpgsql
as $$
declare
  changed_pool_id uuid;
begin
  changed_pool_id := coalesce(new.pool_id, old.pool_id);
  perform public.recalculate_pool_standings(changed_pool_id);
  return coalesce(new, old);
end;
$$;

create trigger predictions_recalculate_standings
after insert or update or delete on public.predictions
for each row execute function public.recalculate_standings_after_prediction();

create trigger tournament_predictions_recalculate_standings
after insert or update or delete on public.tournament_predictions
for each row execute function public.recalculate_standings_after_prediction();

create or replace function public.recalculate_standings_for_match_result()
returns trigger
language plpgsql
as $$
declare
  affected_pool_id uuid;
begin
  update public.predictions p
  set
    points = s.points,
    is_exact_score = s.is_exact_score,
    is_correct_result = s.is_correct_result,
    has_correct_goal_difference = s.has_correct_goal_difference,
    updated_at = now()
  from public.score_match_prediction(
    p.team_a_goals,
    p.team_b_goals,
    new.result_team_a_goals,
    new.result_team_b_goals
  ) s
  where p.match_id = new.id;

  for affected_pool_id in
    select distinct pool_id from public.predictions where match_id = new.id
  loop
    perform public.recalculate_pool_standings(affected_pool_id);
  end loop;

  return new;
end;
$$;

create trigger matches_recalculate_standings
after update of result_team_a_goals, result_team_b_goals on public.matches
for each row execute function public.recalculate_standings_for_match_result();

create or replace function public.recalculate_tournament_prediction_points()
returns trigger
language plpgsql
as $$
declare
  affected_pool_id uuid;
begin
  affected_pool_id := new.id;

  update public.tournament_predictions tp
  set
    points = public.score_tournament_prediction(
      tp.champion_id,
      tp.runner_up_id,
      tp.third_place_id,
      tp.fourth_place_id,
      new.actual_champion_id,
      new.actual_runner_up_id,
      new.actual_third_place_id,
      new.actual_fourth_place_id
    ),
    updated_at = now()
  where tp.pool_id = affected_pool_id;

  perform public.recalculate_pool_standings(affected_pool_id);
  return new;
end;
$$;

create trigger pools_recalculate_tournament_points
after update of actual_champion_id, actual_runner_up_id, actual_third_place_id, actual_fourth_place_id on public.pools
for each row execute function public.recalculate_tournament_prediction_points();

alter table public.users enable row level security;
alter table public.pools enable row level security;
alter table public.pool_members enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.tournament_predictions enable row level security;
alter table public.standings enable row level security;

create policy "Users can read profiles"
on public.users for select
to authenticated
using (true);

create policy "Users can update own profile"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Users can insert own profile"
on public.users for insert
to authenticated
with check (id = auth.uid());

create policy "Pool members can read pools"
on public.pools for select
to authenticated
using (public.is_pool_member(id, auth.uid()));

create policy "Authenticated users can create pools"
on public.pools for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Pool admins can update pools"
on public.pools for update
to authenticated
using (public.is_pool_admin(id, auth.uid()))
with check (public.is_pool_admin(id, auth.uid()));

create policy "Pool owners can delete pools"
on public.pools for delete
to authenticated
using (owner_id = auth.uid());

create policy "Pool members can read memberships"
on public.pool_members for select
to authenticated
using (public.is_pool_member(pool_id, auth.uid()));

create policy "Pool owners can insert initial membership"
on public.pool_members for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'owner'
  and exists (
    select 1
    from public.pools p
    where p.id = pool_id
      and p.owner_id = auth.uid()
  )
);

create policy "Pool admins can update memberships"
on public.pool_members for update
to authenticated
using (public.is_pool_admin(pool_id, auth.uid()))
with check (public.is_pool_admin(pool_id, auth.uid()));

create policy "Pool admins can delete memberships"
on public.pool_members for delete
to authenticated
using (public.is_pool_admin(pool_id, auth.uid()));

create policy "Authenticated users can read teams"
on public.teams for select
to authenticated
using (true);

create policy "Authenticated users can read matches"
on public.matches for select
to authenticated
using (true);

create policy "Pool members can read predictions"
on public.predictions for select
to authenticated
using (public.is_pool_member(pool_id, auth.uid()));

create policy "Users can create own unlocked predictions"
on public.predictions for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_pool_member(pool_id, auth.uid())
  and exists (
    select 1
    from public.matches m
    where m.id = match_id
      and m.kickoff_at > now()
  )
);

create policy "Users can update own unlocked predictions"
on public.predictions for update
to authenticated
using (
  user_id = auth.uid()
  and public.is_pool_member(pool_id, auth.uid())
  and exists (
    select 1
    from public.matches m
    where m.id = match_id
      and m.kickoff_at > now()
  )
)
with check (
  user_id = auth.uid()
  and public.is_pool_member(pool_id, auth.uid())
  and exists (
    select 1
    from public.matches m
    where m.id = match_id
      and m.kickoff_at > now()
  )
);

create policy "Users can delete own unlocked predictions"
on public.predictions for delete
to authenticated
using (
  user_id = auth.uid()
  and public.is_pool_member(pool_id, auth.uid())
  and exists (
    select 1
    from public.matches m
    where m.id = match_id
      and m.kickoff_at > now()
  )
);

create policy "Pool members can read tournament predictions"
on public.tournament_predictions for select
to authenticated
using (public.is_pool_member(pool_id, auth.uid()));

create policy "Users can create own unlocked tournament predictions"
on public.tournament_predictions for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_pool_member(pool_id, auth.uid())
  and exists (
    select 1
    from public.pools p
    where p.id = pool_id
      and (p.tournament_predictions_lock_at is null or p.tournament_predictions_lock_at > now())
  )
);

create policy "Users can update own unlocked tournament predictions"
on public.tournament_predictions for update
to authenticated
using (
  user_id = auth.uid()
  and public.is_pool_member(pool_id, auth.uid())
  and exists (
    select 1
    from public.pools p
    where p.id = pool_id
      and (p.tournament_predictions_lock_at is null or p.tournament_predictions_lock_at > now())
  )
)
with check (
  user_id = auth.uid()
  and public.is_pool_member(pool_id, auth.uid())
  and exists (
    select 1
    from public.pools p
    where p.id = pool_id
      and (p.tournament_predictions_lock_at is null or p.tournament_predictions_lock_at > now())
  )
);

create policy "Pool members can read standings"
on public.standings for select
to authenticated
using (public.is_pool_member(pool_id, auth.uid()));

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.pools to authenticated;
grant select, insert, update, delete on public.pool_members to authenticated;
grant select on public.teams to authenticated;
grant select on public.matches to authenticated;
grant select, insert, update, delete on public.predictions to authenticated;
grant select, insert, update, delete on public.tournament_predictions to authenticated;
grant select on public.standings to authenticated;
grant execute on function public.create_pool(text, text, timestamptz) to authenticated;
grant execute on function public.join_pool_by_invite_code(text) to authenticated;
