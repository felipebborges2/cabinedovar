import Link from "next/link";
import { BarChart3, CalendarCheck, Settings, Target } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { RankingTable } from "@/components/ranking/ranking-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPool, getPoolMembers, getStandings } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function PoolDetailPage({
  params,
}: {
  params: Promise<{ poolId: string }>;
}) {
  const { poolId } = await params;
  const [pool, members, standings] = await Promise.all([
    getPool(poolId),
    getPoolMembers(poolId),
    getStandings(poolId),
  ]);

  return (
    <>
      <PageHeader
        title={pool.name}
        description={pool.description ?? "Bolão sem descrição."}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/app/pools/${pool.id}/settings`}>
                <Settings />
                Configurar
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/app/pools/${pool.id}/predictions`}>
                <Target />
                Palpitar jogos
              </Link>
            </Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Codigo</p>
            <p className="mt-2 font-mono text-2xl font-bold">{pool.invite_code}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Participantes</p>
            <p className="mt-2 text-2xl font-bold">{members.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pre-torneio</p>
            <p className="mt-2 text-sm font-semibold">
              {pool.tournament_predictions_lock_at
                ? formatDateTime(pool.tournament_predictions_lock_at)
                : "Sem bloqueio configurado"}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <BarChart3 className="size-5 text-primary" />
              Ranking geral
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/app/pools/${pool.id}/ranking`}>Ver completo</Link>
            </Button>
          </div>
          <RankingTable standings={standings} />
        </section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="size-5 text-primary" />
              Atalhos
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild variant="outline">
              <Link href={`/app/pools/${pool.id}/tournament`}>Palpites pré-torneio</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/app/pools/${pool.id}/predictions`}>Palpites de partidas</Link>
            </Button>
            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <Badge>Regra</Badge>
              <p className="mt-2">
                Exato vale 10. Resultado certo vale 5 e diferença certa soma +3.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
