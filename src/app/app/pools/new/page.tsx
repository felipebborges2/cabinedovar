import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Medal, ShieldCheck, Target, Trophy } from "lucide-react";

const matchRules = [
  ["Placar exato", "10 pts"],
  ["Vencedor ou empate correto", "5 pts"],
  ["Diferença de gols correta", "+3 pts"],
];

const tournamentRules = [
  ["Campeão correto", "25 pts"],
  ["Vice-campeão correto", "18 pts"],
  ["Terceiro colocado correto", "12 pts"],
  ["Quarto colocado correto", "10 pts"],
];

export default async function NewPoolPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <PageHeader
        title="Criar bolão"
        description="Defina os dados do grupo, revise as regras de pontuação e configure quando os palpites pré-torneio serão bloqueados."
      />
      <Notice message={params.error} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Dados do bolão</CardTitle>
            <CardDescription>
              O código de convite será gerado automaticamente depois da criação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/app/pools/create" method="post" className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do bolão</Label>
                <Input id="name" name="name" placeholder="Copa dos Amigos" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Regras combinadas, prêmio, grupo do WhatsApp..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tournament_predictions_lock_at">
                  Bloqueio dos palpites pré-torneio
                </Label>
                <Input
                  id="tournament_predictions_lock_at"
                  name="tournament_predictions_lock_at"
                  type="datetime-local"
                />
                <p className="text-sm leading-6 text-muted-foreground">
                  Depois desse horário, campeão, vice, terceiro e quarto colocado não
                  poderão mais ser alterados.
                </p>
              </div>
              <Button type="submit">Criar bolão</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <CardTitle>Regras de pontuação</CardTitle>
                <CardDescription>Critérios oficiais deste bolão.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-primary" />
                <h2 className="text-sm font-bold">Palpites de partidas</h2>
              </div>
              <div className="space-y-2">
                {matchRules.map(([label, points]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
                  >
                    <span className="text-sm">{label}</span>
                    <Badge variant="success">{points}</Badge>
                  </div>
                ))}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Exemplo: se o palpite for 3 x 2 e o resultado for 2 x 1, o jogador
                acerta o vencedor e a diferença de gols: 5 + 3 = 8 pontos.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-primary" />
                <h2 className="text-sm font-bold">Palpites pré-torneio</h2>
              </div>
              <div className="space-y-2">
                {tournamentRules.map(([label, points]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
                  >
                    <span className="text-sm">{label}</span>
                    <Badge>{points}</Badge>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-md border border-border p-3">
                <Clock className="mb-2 size-4 text-primary" />
                <p className="text-sm font-semibold">Bloqueio automático</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Palpites de jogo travam no horário de início da partida.
                </p>
              </div>
              <div className="rounded-md border border-border p-3">
                <Medal className="mb-2 size-4 text-primary" />
                <p className="text-sm font-semibold">Ranking completo</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  O ranking mostra pontos totais, placares exatos e resultados corretos.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
