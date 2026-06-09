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

grant execute on function public.create_pool(text, text, timestamptz) to authenticated;
