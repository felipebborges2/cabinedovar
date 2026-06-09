import Link from "next/link";
import { Trophy, Users, Plus, LogOut, RadioTower, ShieldCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { isAppAdminEmail } from "@/lib/admin";

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const isAdmin = isAppAdminEmail(user.email);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/88 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/app" className="flex items-center gap-3 font-bold">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <RadioTower className="size-5" />
            </span>
            <span>Cabine do VAR</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Button asChild variant="ghost">
              <Link href="/app/pools">
                <Trophy />
                Bolões
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/app/join">
                <Users />
                Entrar
              </Link>
            </Button>
            <Button asChild>
              <Link href="/app/pools/new">
                <Plus />
                Novo bolão
              </Link>
            </Button>
            {isAdmin ? (
              <Button asChild variant="ghost">
                <Link href="/app/admin/results">
                  <ShieldCheck />
                  Resultados
                </Link>
              </Button>
            ) : null}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action="/auth/sign-out" method="post">
              <Button variant="ghost" size="icon" aria-label="Sair" title="Sair">
                <LogOut />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-2 backdrop-blur md:hidden">
        <div className={isAdmin ? "grid grid-cols-4 gap-2" : "grid grid-cols-3 gap-2"}>
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/pools">Bolões</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/join">Entrar</Link>
          </Button>
          {isAdmin ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/admin/results">Resultados</Link>
            </Button>
          ) : null}
          <Button asChild size="sm">
            <Link href="/app/pools/new">Novo</Link>
          </Button>
        </div>
      </nav>
      <div className="h-16 md:hidden" />
      <span className="sr-only">{user.email}</span>
    </div>
  );
}
