import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { requireUser } from "@/lib/auth";
import { getPool, getTeams, getTournamentPrediction } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

function TeamSelect({
  name,
  label,
  teams,
  defaultValue,
  disabled,
}: {
  name: string;
  label: string;
  teams: { id: string; name: string; short_name: string }[];
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        required
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <option value="" disabled>
          Selecione
        </option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name} ({team.short_name})
          </option>
        ))}
      </select>
    </div>
  );
}

export default async function TournamentPredictionsPage({
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
  const [pool, teams, prediction] = await Promise.all([
    getPool(poolId),
    getTeams(),
    getTournamentPrediction(poolId, user.id),
  ]);
  const locked = pool.tournament_predictions_lock_at
    ? new Date(pool.tournament_predictions_lock_at).getTime() <= Date.now()
    : false;

  return (
    <>
      <PageHeader
        title="Palpites pré-torneio"
        description="Escolha campeao, vice, terceiro e quarto colocado antes do prazo configurado."
      />
      <Notice message={query.error} />
      <Notice message={query.saved ? "Palpite pré-torneio salvo." : undefined} kind="success" />
      <Card className="max-w-3xl">
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={locked ? "outline" : "success"}>
              {locked ? "Bloqueado" : "Aberto"}
            </Badge>
            {pool.tournament_predictions_lock_at ? (
              <span className="text-sm text-muted-foreground">
                Fecha em {formatDateTime(pool.tournament_predictions_lock_at)}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Sem prazo configurado</span>
            )}
            {prediction ? (
              <span className="text-sm font-semibold">{prediction.points} pontos</span>
            ) : null}
          </div>
          <form action="/app/predictions/tournament" method="post" className="space-y-5">
            <input type="hidden" name="pool_id" value={pool.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <TeamSelect
                name="champion_id"
                label="Campeão"
                teams={teams}
                defaultValue={prediction?.champion_id}
                disabled={locked}
              />
              <TeamSelect
                name="runner_up_id"
                label="Vice-campeão"
                teams={teams}
                defaultValue={prediction?.runner_up_id}
                disabled={locked}
              />
              <TeamSelect
                name="third_place_id"
                label="Terceiro colocado"
                teams={teams}
                defaultValue={prediction?.third_place_id}
                disabled={locked}
              />
              <TeamSelect
                name="fourth_place_id"
                label="Quarto colocado"
                teams={teams}
                defaultValue={prediction?.fourth_place_id}
                disabled={locked}
              />
            </div>
            <Button type="submit" disabled={locked || teams.length < 4}>
              Salvar palpites
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
