update public.teams
set name = 'França'
where short_name = 'FRA';

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
