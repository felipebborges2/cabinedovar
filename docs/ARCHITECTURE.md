# Cabine do VAR - Arquitetura Geral

## Objetivo do MVP

Cabine do VAR é uma plataforma web para grupos criarem e jogarem bolões de Copa ou campeonatos similares. O MVP prioriza:

- cadastro e login com e-mail, nome de usuário e senha via Supabase Auth;
- criação e entrada em bolões por código de convite;
- palpites pré-torneio;
- palpites por partida com bloqueio automático no horário do jogo;
- ranking geral e por rodada;
- design responsivo com tema claro/escuro.

## Stack

- Next.js 15 com App Router.
- TypeScript.
- Tailwind CSS.
- Componentes no estilo shadcn/ui.
- Supabase:
  - PostgreSQL;
  - Auth;
  - Row Level Security;
  - migrations SQL.
- Deploy preparado para Vercel.

## Camadas da aplicação

### App Router

Rotas principais:

- `/`: tela pública com entrada para login.
- `/login`: cadastro e login com e-mail/senha.
- `/app`: dashboard autenticado.
- `/app/pools`: lista de bolões do usuário.
- `/app/pools/new`: criação de bolão.
- `/app/join`: entrada por código.
- `/app/pools/[poolId]`: detalhe do bolão, ranking e próximos jogos.
- `/app/pools/[poolId]/predictions`: palpites de jogos.
- `/app/pools/[poolId]/tournament`: palpites pré-torneio.
- `/app/pools/[poolId]/ranking`: ranking geral e por rodada.
- `/app/admin/results`: lançamento administrativo de resultados.

### Rotas de mutação

As operações mutáveis usam rotas `POST` no App Router:

- criar bolão;
- entrar em bolão por código;
- atualizar dados do bolão pelo administrador;
- salvar palpites pré-torneio;
- salvar palpites de partidas;
- lançar resultados de partidas.

As rotas usam o Supabase server client, validam autorização via RLS e retornam erros tratáveis para a UI.

### Supabase Clients

- `src/lib/supabase/server.ts`: client server-side usando cookies do App Router.
- `src/lib/supabase/client.ts`: client browser para interações client-side leves.
- `src/lib/supabase/middleware.ts`: refresh de sessão no middleware.
- `src/lib/supabase/admin.ts`: client server-side com service role para rotas administrativas.

### Domínio

Regras de pontuação ficam no banco em funções SQL, para manter consistência mesmo se resultados forem inseridos por painel admin, seed ou automação:

- placar exato: 10 pontos;
- vencedor/empate correto: 5 pontos;
- diferença de gols correta com resultado correto e sem placar exato: +3 pontos;
- campeão: 25 pontos;
- vice: 18 pontos;
- terceiro: 12 pontos;
- quarto: 10 pontos.

O ranking materializado na tabela `standings` é atualizado por triggers e funções após alterações em:

- `predictions`;
- `matches.result_*`;
- `tournament_predictions`;
- `pools.actual_*`.

## Modelo de permissão

### Usuários

`users.id` referencia `auth.users.id`. Um trigger cria/atualiza o perfil público quando um usuário faz login.

### Bolões

- Qualquer usuário autenticado pode criar bolão.
- Criador vira administrador em `pool_members`.
- Membros podem ver dados do bolão, jogos, times, palpites próprios e ranking.
- Administradores de bolão podem editar dados do bolão e configurar prazo dos palpites pré-torneio.
- Administradores da aplicação, configurados em `APP_ADMIN_EMAILS`, podem registrar resultados em `/app/admin/results`.

### Palpites

- Cada membro pode criar/editar apenas seus próprios palpites.
- Palpite de partida é bloqueado quando `matches.kickoff_at <= now()`.
- Palpite pré-torneio é bloqueado quando `pools.tournament_predictions_lock_at <= now()`.

## Fluxo de dados

1. Usuário cria conta ou entra com e-mail e senha.
2. Trigger `handle_new_user` garante linha em `public.users`.
3. Usuário cria bolão.
4. Banco gera `invite_code`.
5. Usuário entra em bolão via `join_pool_by_invite_code`.
6. Membro salva palpites.
7. Ao iniciar uma partida, a rota e as policies impedem edição.
8. Quando resultados são registrados, funções SQL recalculam pontos.
9. UI consulta `standings` e views de ranking.

## Estrutura de pastas

```text
src/
  app/
    (marketing)/
    app/
      pools/
    actions/
    auth/
  components/
    app/
    pools/
    predictions/
    ranking/
    ui/
  lib/
    supabase/
    scoring.ts
    utils.ts
  types/
    database.ts
    domain.ts
supabase/
  migrations/
  seed.sql
docs/
```

## Decisões importantes

- RLS é a primeira linha de defesa de autorização; rotas server-side não substituem policies.
- Pontuação fica em SQL para evitar divergência entre cliente, servidor e automações.
- `standings` é tabela derivada recalculável, não fonte primária de verdade.
- O MVP usa uma competição global de times e partidas compartilhadas entre bolões. Cada bolão pode ter ranking e palpites próprios.
- O MVP tem uma tela administrativa simples para lançamento de resultados; gestão completa de calendário e mata-mata fica para uma próxima etapa.
