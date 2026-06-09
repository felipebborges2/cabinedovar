delete from public.matches;

with fixtures(match_no, team_a_short, team_b_short, kickoff_at) as (
  values
    (1, 'MEX', 'RSA', '2026-06-11 19:00:00+00'::timestamptz),
    (2, 'KOR', 'CZE', '2026-06-12 02:00:00+00'::timestamptz),
    (3, 'CAN', 'BIH', '2026-06-12 19:00:00+00'::timestamptz),
    (4, 'USA', 'PAR', '2026-06-13 01:00:00+00'::timestamptz),
    (5, 'QAT', 'SUI', '2026-06-13 19:00:00+00'::timestamptz),
    (6, 'BRA', 'MAR', '2026-06-13 22:00:00+00'::timestamptz),
    (7, 'HAI', 'SCO', '2026-06-14 01:00:00+00'::timestamptz),
    (8, 'AUS', 'TUR', '2026-06-14 04:00:00+00'::timestamptz),
    (9, 'GER', 'CUW', '2026-06-14 17:00:00+00'::timestamptz),
    (10, 'NED', 'JPN', '2026-06-14 20:00:00+00'::timestamptz),
    (11, 'CIV', 'ECU', '2026-06-14 23:00:00+00'::timestamptz),
    (12, 'SWE', 'TUN', '2026-06-15 02:00:00+00'::timestamptz),
    (13, 'ESP', 'CPV', '2026-06-15 16:00:00+00'::timestamptz),
    (14, 'BEL', 'EGY', '2026-06-15 19:00:00+00'::timestamptz),
    (15, 'KSA', 'URU', '2026-06-15 22:00:00+00'::timestamptz),
    (16, 'IRN', 'NZL', '2026-06-16 01:00:00+00'::timestamptz),
    (17, 'FRA', 'SEN', '2026-06-16 19:00:00+00'::timestamptz),
    (18, 'IRQ', 'NOR', '2026-06-16 22:00:00+00'::timestamptz),
    (19, 'ARG', 'ALG', '2026-06-17 01:00:00+00'::timestamptz),
    (20, 'AUT', 'JOR', '2026-06-17 04:00:00+00'::timestamptz),
    (21, 'POR', 'COD', '2026-06-17 17:00:00+00'::timestamptz),
    (22, 'ENG', 'CRO', '2026-06-17 20:00:00+00'::timestamptz),
    (23, 'GHA', 'PAN', '2026-06-17 23:00:00+00'::timestamptz),
    (24, 'UZB', 'COL', '2026-06-18 02:00:00+00'::timestamptz),
    (25, 'CZE', 'RSA', '2026-06-18 16:00:00+00'::timestamptz),
    (26, 'SUI', 'BIH', '2026-06-18 19:00:00+00'::timestamptz),
    (27, 'CAN', 'QAT', '2026-06-18 22:00:00+00'::timestamptz),
    (28, 'MEX', 'KOR', '2026-06-19 01:00:00+00'::timestamptz),
    (29, 'USA', 'AUS', '2026-06-19 19:00:00+00'::timestamptz),
    (30, 'SCO', 'MAR', '2026-06-19 22:00:00+00'::timestamptz),
    (31, 'TUR', 'PAR', '2026-06-20 03:00:00+00'::timestamptz),
    (32, 'NED', 'SWE', '2026-06-20 17:00:00+00'::timestamptz),
    (33, 'GER', 'CIV', '2026-06-20 20:00:00+00'::timestamptz),
    (34, 'BRA', 'HAI', '2026-06-21 00:30:00+00'::timestamptz),
    (35, 'TUN', 'JPN', '2026-06-21 04:00:00+00'::timestamptz),
    (36, 'ESP', 'KSA', '2026-06-21 16:00:00+00'::timestamptz),
    (37, 'BEL', 'IRN', '2026-06-21 19:00:00+00'::timestamptz),
    (38, 'URU', 'CPV', '2026-06-21 22:00:00+00'::timestamptz),
    (39, 'ECU', 'CUW', '2026-06-22 00:00:00+00'::timestamptz),
    (40, 'NZL', 'EGY', '2026-06-22 01:00:00+00'::timestamptz),
    (41, 'ARG', 'AUT', '2026-06-22 17:00:00+00'::timestamptz),
    (42, 'FRA', 'IRQ', '2026-06-22 21:00:00+00'::timestamptz),
    (43, 'JOR', 'ALG', '2026-06-23 03:00:00+00'::timestamptz),
    (44, 'POR', 'UZB', '2026-06-23 17:00:00+00'::timestamptz),
    (45, 'ENG', 'GHA', '2026-06-23 20:00:00+00'::timestamptz),
    (46, 'PAN', 'CRO', '2026-06-23 23:00:00+00'::timestamptz),
    (47, 'NOR', 'SEN', '2026-06-24 00:00:00+00'::timestamptz),
    (48, 'COL', 'COD', '2026-06-24 02:00:00+00'::timestamptz),
    (49, 'SUI', 'CAN', '2026-06-24 19:00:00+00'::timestamptz),
    (50, 'BIH', 'QAT', '2026-06-24 19:00:00+00'::timestamptz),
    (51, 'MAR', 'HAI', '2026-06-24 22:00:00+00'::timestamptz),
    (52, 'SCO', 'BRA', '2026-06-24 22:00:00+00'::timestamptz),
    (53, 'CZE', 'MEX', '2026-06-25 01:00:00+00'::timestamptz),
    (54, 'RSA', 'KOR', '2026-06-25 01:00:00+00'::timestamptz),
    (55, 'CUW', 'CIV', '2026-06-25 20:00:00+00'::timestamptz),
    (56, 'ECU', 'GER', '2026-06-25 20:00:00+00'::timestamptz),
    (57, 'JPN', 'SWE', '2026-06-25 23:00:00+00'::timestamptz),
    (58, 'TUN', 'NED', '2026-06-25 23:00:00+00'::timestamptz),
    (59, 'TUR', 'USA', '2026-06-26 02:00:00+00'::timestamptz),
    (60, 'PAR', 'AUS', '2026-06-26 02:00:00+00'::timestamptz),
    (61, 'NOR', 'FRA', '2026-06-26 19:00:00+00'::timestamptz),
    (62, 'SEN', 'IRQ', '2026-06-26 19:00:00+00'::timestamptz),
    (63, 'EGY', 'IRN', '2026-06-27 03:00:00+00'::timestamptz),
    (64, 'NZL', 'BEL', '2026-06-27 03:00:00+00'::timestamptz),
    (65, 'PAN', 'ENG', '2026-06-27 21:00:00+00'::timestamptz),
    (66, 'CRO', 'GHA', '2026-06-27 21:00:00+00'::timestamptz),
    (67, 'COD', 'UZB', '2026-06-27 23:30:00+00'::timestamptz),
    (68, 'COL', 'POR', '2026-06-27 23:30:00+00'::timestamptz),
    (69, 'CPV', 'KSA', '2026-06-28 00:00:00+00'::timestamptz),
    (70, 'URU', 'ESP', '2026-06-28 00:00:00+00'::timestamptz),
    (71, 'ALG', 'AUT', '2026-06-28 02:00:00+00'::timestamptz),
    (72, 'JOR', 'ARG', '2026-06-28 02:00:00+00'::timestamptz)
)
insert into public.matches (team_a_id, team_b_id, kickoff_at, stage, round, status)
select
  team_a.id,
  team_b.id,
  fixtures.kickoff_at,
  'groups'::public.match_stage,
  case
    when fixtures.match_no <= 24 then 1
    when fixtures.match_no <= 48 then 2
    else 3
  end,
  'scheduled'::public.match_status
from fixtures
join public.teams team_a on team_a.short_name = fixtures.team_a_short
join public.teams team_b on team_b.short_name = fixtures.team_b_short;

do $$
declare
  affected_pool_id uuid;
begin
  for affected_pool_id in select id from public.pools loop
    perform public.recalculate_pool_standings(affected_pool_id);
  end loop;
end;
$$;
