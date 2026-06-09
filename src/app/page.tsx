import Link from "next/link";
import { ArrowRight, RadioTower, ShieldCheck, Trophy, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <RadioTower className="size-5" />
          </span>
          Cabine do VAR
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild>
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Bolão com regra clara, ranking vivo e zero planilha
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-black tracking-normal md:text-6xl">
              Cabine do VAR
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Crie bolões de Copa, chame a turma por código, registre palpites e deixe a
              pontuação automática separar o clubismo da precisão cirúrgica.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="default">
              <Link href="/login">
                Começar agora
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/pools">Ver meus bolões</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Card className="border-primary/35">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ranking geral</p>
                  <h2 className="text-xl font-bold">Copa dos Amigos</h2>
                </div>
                <Trophy className="size-8 text-primary" />
              </div>
              {[
                ["1", "Felipe", "88 pts"],
                ["2", "Marina", "84 pts"],
                ["3", "João", "76 pts"],
              ].map(([pos, name, points]) => (
                <div
                  key={pos}
                  className="grid grid-cols-[36px_1fr_auto] items-center border-t border-border py-3"
                >
                  <span className="font-mono text-sm text-muted-foreground">{pos}</span>
                  <span className="font-semibold">{name}</span>
                  <span className="font-bold">{points}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <Users className="mb-3 size-5 text-accent" />
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">participantes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <ShieldCheck className="mb-3 size-5 text-primary" />
                <p className="text-2xl font-bold">10</p>
                <p className="text-sm text-muted-foreground">placares exatos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
