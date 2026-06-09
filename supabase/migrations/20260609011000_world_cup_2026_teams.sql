update public.teams
set short_name = 'GER', group_name = 'E'
where short_name = 'ALE' or name = 'Alemanha';

update public.teams
set short_name = 'ENG', group_name = 'L'
where short_name = 'ING' or name = 'Inglaterra';

insert into public.teams (name, short_name, group_name)
values
  ('México', 'MEX', 'A'),
  ('Marrocos', 'MAR', 'A'),
  ('Coreia do Sul', 'KOR', 'A'),
  ('Escócia', 'SCO', 'A'),
  ('Canadá', 'CAN', 'B'),
  ('Suíça', 'SUI', 'B'),
  ('Bósnia e Herzegovina', 'BIH', 'B'),
  ('Catar', 'QAT', 'B'),
  ('Argentina', 'ARG', 'C'),
  ('Argélia', 'ALG', 'C'),
  ('Áustria', 'AUT', 'C'),
  ('Haiti', 'HAI', 'C'),
  ('Estados Unidos', 'USA', 'D'),
  ('Turquia', 'TUR', 'D'),
  ('Paraguai', 'PAR', 'D'),
  ('Austrália', 'AUS', 'D'),
  ('Alemanha', 'GER', 'E'),
  ('Equador', 'ECU', 'E'),
  ('Costa do Marfim', 'CIV', 'E'),
  ('Curaçao', 'CUW', 'E'),
  ('Países Baixos', 'NED', 'F'),
  ('Japão', 'JPN', 'F'),
  ('Suécia', 'SWE', 'F'),
  ('Tunísia', 'TUN', 'F'),
  ('Bélgica', 'BEL', 'G'),
  ('Egito', 'EGY', 'G'),
  ('Irã', 'IRN', 'G'),
  ('Nova Zelândia', 'NZL', 'G'),
  ('Espanha', 'ESP', 'H'),
  ('Uruguai', 'URU', 'H'),
  ('Arábia Saudita', 'KSA', 'H'),
  ('Cabo Verde', 'CPV', 'H'),
  ('França', 'FRA', 'I'),
  ('Noruega', 'NOR', 'I'),
  ('Senegal', 'SEN', 'I'),
  ('Iraque', 'IRQ', 'I'),
  ('Brasil', 'BRA', 'J'),
  ('África do Sul', 'RSA', 'J'),
  ('República Tcheca', 'CZE', 'J'),
  ('Jordânia', 'JOR', 'J'),
  ('Portugal', 'POR', 'K'),
  ('Colômbia', 'COL', 'K'),
  ('RD Congo', 'COD', 'K'),
  ('Uzbequistão', 'UZB', 'K'),
  ('Inglaterra', 'ENG', 'L'),
  ('Croácia', 'CRO', 'L'),
  ('Gana', 'GHA', 'L'),
  ('Panamá', 'PAN', 'L')
on conflict (short_name) do update set
  name = excluded.name,
  group_name = excluded.group_name;
