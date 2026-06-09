import { ShieldCheck } from "lucide-react";
import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAppAdmin } from "@/lib/admin";
import { requireUser } from "@/lib/auth";
import { getMatchesWithTeams } from "@/lib/data";
import { formatDateTime, stageLabel } from "@/lib/utils";

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const [user, query] = await Promise.all([requireUser(), searchParams]);
  requireAppAdmin(user);
  const matches = await getMatchesWithTeams();

  return (
    <>
      <PageHeader
        title="Resultados das partidas"
        description="Lance ou corrija placares finais. Ao salvar, os pontos e rankings dos bolões são recalculados automaticamente."
      />
      <Notice message={query.error} />
      <Notice message={query.saved ? "Resultado salvo e rankings recalculados." : undefined} kind="success" />
      <div className="grid gap-4">
        {matches.map((match) => {
          const hasResult =
            match.result_team_a_goals !== null && match.result_team_b_goals !== null;

          return (
            <Card key={match.id}>
              <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{stageLabel(match.stage)}</Badge>
                    <Badge variant="secondary">Rodada {match.round}</Badge>
                    <Badge variant={hasResult ? "success" : "outline"}>
                      {hasResult ? "Finalizado" : "Sem resultado"}
                    </Badge>
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
                  <p className="text-sm text-muted-foreground">{formatDateTime(match.kickoff_at)}</p>
                </div>
                <form
                  action="/app/admin/results/save"
                  method="post"
                  className="flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="match_id" value={match.id} />
                  <Input
                    name="team_a_goals"
                    type="number"
                    min={0}
                    max={30}
                    defaultValue={match.result_team_a_goals ?? ""}
                    className="w-20 text-center"
                    aria-label={`Gols ${match.team_a.name}`}
                  />
                  <span className="font-bold">x</span>
                  <Input
                    name="team_b_goals"
                    type="number"
                    min={0}
                    max={30}
                    defaultValue={match.result_team_b_goals ?? ""}
                    className="w-20 text-center"
                    aria-label={`Gols ${match.team_b.name}`}
                  />
                  <Button type="submit">
                    <ShieldCheck />
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
