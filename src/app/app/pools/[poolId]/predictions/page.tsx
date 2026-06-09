import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { getMatchesWithPredictions, getPool } from "@/lib/data";
import { formatDateTime, stageLabel } from "@/lib/utils";

export default async function MatchPredictionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ poolId: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const [{ poolId }, query, user] = await Promise.all([
    params,
    searchParams,
    requireUser(),
  ]);
  const [pool, data] = await Promise.all([
    getPool(poolId),
    getMatchesWithPredictions(poolId, user.id),
  ]);

  return (
    <>
      <PageHeader
        title="Palpites de partidas"
        description={`${pool.name}: cada palpite bloqueia automaticamente no horário do jogo.`}
      />
      <Notice message={query.error} />
      <Notice message={query.saved ? "Palpite salvo." : undefined} kind="success" />
      <div className="grid gap-4">
        {data.matches.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Nenhuma partida cadastrada. Rode o seed ou cadastre jogos no Supabase.
            </CardContent>
          </Card>
        ) : null}
        {data.matches.map((match) => {
          const prediction = data.predictionByMatch.get(match.id);
          const locked = new Date(match.kickoff_at).getTime() <= Date.now();
          const hasResult =
            match.result_team_a_goals !== null && match.result_team_b_goals !== null;

          return (
            <Card key={match.id}>
              <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{stageLabel(match.stage)}</Badge>
                    <Badge variant="secondary">Rodada {match.round}</Badge>
                    {locked ? <Badge variant="outline">Bloqueado</Badge> : null}
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div>
                      <p className="font-bold">{match.team_a.name}</p>
                      <p className="text-sm text-muted-foreground">{match.team_a.short_name}</p>
                    </div>
                    <div className="rounded-md bg-muted px-3 py-2 text-center text-sm font-bold">
                      {hasResult
                        ? `${match.result_team_a_goals} x ${match.result_team_b_goals}`
                        : "x"}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{match.team_b.name}</p>
                      <p className="text-sm text-muted-foreground">{match.team_b.short_name}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(match.kickoff_at)}
                    {prediction ? ` · ${prediction.points} pontos no palpite atual` : ""}
                  </p>
                </div>
                <form action="/app/predictions/match" method="post" className="flex items-center gap-2">
                  <input type="hidden" name="pool_id" value={pool.id} />
                  <input type="hidden" name="match_id" value={match.id} />
                  <Input
                    name="team_a_goals"
                    type="number"
                    min={0}
                    max={30}
                    required
                    disabled={locked}
                    defaultValue={prediction?.team_a_goals ?? ""}
                    className="w-16 text-center"
                    aria-label={`Gols ${match.team_a.name}`}
                  />
                  <span className="font-bold">x</span>
                  <Input
                    name="team_b_goals"
                    type="number"
                    min={0}
                    max={30}
                    required
                    disabled={locked}
                    defaultValue={prediction?.team_b_goals ?? ""}
                    className="w-16 text-center"
                    aria-label={`Gols ${match.team_b.name}`}
                  />
                  <Button type="submit" disabled={locked}>
                    Salvar
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
