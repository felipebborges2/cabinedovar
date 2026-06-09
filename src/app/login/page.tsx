import Link from "next/link";
import { LogIn, RadioTower, UserPlus } from "lucide-react";
import { Notice } from "@/components/notice";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseConfig } from "@/lib/supabase/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const params = await searchParams;
  const { isConfigured } = getSupabaseConfig();

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <Link href="/" className="mb-4 flex items-center gap-3 font-bold">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <RadioTower className="size-5" />
            </span>
            Cabine do VAR
          </Link>
          <CardTitle>Entre para palpitar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Notice message={params.error} />
          <Notice
            message={
              params.created
                ? "Conta criada. Se a confirmação por e-mail estiver ativa no Supabase, confirme antes de entrar."
                : undefined
            }
            kind="success"
          />
          {!isConfigured ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
            </div>
          ) : null}
          <div className="grid gap-6 md:grid-cols-2">
            <form action="/auth/sign-in" method="post" className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <LogIn className="size-4 text-primary" />
                Entrar
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-email">E-mail</Label>
                <Input id="login-email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input id="login-password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>

            <form action="/auth/sign-up" method="post" className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <UserPlus className="size-4 text-primary" />
                Criar conta
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-username">Nome de usuário</Label>
                <Input
                  id="signup-username"
                  name="username"
                  placeholder="camisa10"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">E-mail</Label>
                <Input id="signup-email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Senha</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Cadastrar
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
