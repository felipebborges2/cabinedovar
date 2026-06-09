# Cabine do VAR

Plataforma de bolão para Copa do Mundo e campeonatos esportivos. O MVP permite criar bolões, entrar por código, salvar palpites pré-torneio, palpitar partidas e recalcular rankings automaticamente quando os resultados são lançados.

## Stack

- Next.js 15 com App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth e PostgreSQL
- Vercel

## Configuração local

1. Instale as dependências:

```bash
npm install
```

2. Copie as variáveis de ambiente:

```bash
cp .env.example .env.local
```

3. Preencha `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
APP_ADMIN_EMAILS=seu-email@exemplo.com
```

4. Rode o projeto:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Banco de dados

As migrations ficam em `supabase/migrations`.

Para vincular o projeto Supabase:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
```

Para aplicar migrations no projeto remoto:

```bash
npx supabase db push
```

Para conferir o estado:

```bash
npx supabase migration list
npx supabase db lint --linked
```

## Deploy na Vercel

Configure as variáveis no painel da Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
SUPABASE_SERVICE_ROLE_KEY
APP_ADMIN_EMAILS
```

`NEXT_PUBLIC_SITE_URL` deve apontar para a URL pública da Vercel, por exemplo:

```bash
https://cabine-do-var.vercel.app
```

No Supabase, configure em Authentication:

- Site URL: URL pública da Vercel.
- Redirect URL: `https://seu-dominio.vercel.app/auth/callback`.

## Administração de resultados

Usuários cujo e-mail esteja em `APP_ADMIN_EMAILS` acessam:

```bash
/app/admin/results
```

Essa tela lança ou corrige placares finais. Ao salvar um resultado, o banco recalcula automaticamente:

- pontos dos palpites da partida;
- rankings gerais;
- rankings por rodada.

## Validação antes de publicar

Rode:

```bash
npm run lint
npm run build
npx supabase db lint --linked
```

Fluxo manual recomendado:

1. Criar uma conta.
2. Criar um bolão.
3. Entrar com outro usuário pelo código.
4. Salvar palpites pré-torneio.
5. Salvar palpites de partidas.
6. Lançar resultado em `/app/admin/results`.
7. Conferir ranking e pontuação.
