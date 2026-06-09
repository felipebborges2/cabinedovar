import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { StandingWithUser } from "@/types/domain";

export function RankingTable({ standings }: { standings: StandingWithUser[] }) {
  if (standings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          O ranking aparece assim que houver membros e pontuação calculada.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-[44px_1fr_72px_72px_72px] items-center border-b border-border bg-muted px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
        <span>#</span>
        <span>Jogador</span>
        <span className="text-right">Pts</span>
        <span className="text-right">Exatos</span>
        <span className="text-right">Result.</span>
      </div>
      {standings.map((standing, index) => (
        <div
          key={standing.id}
          className="grid grid-cols-[44px_1fr_72px_72px_72px] items-center border-b border-border px-4 py-3 last:border-b-0"
        >
          <Badge variant={index < 3 ? "success" : "secondary"}>{index + 1}</Badge>
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {standing.users?.name ?? "Jogador"}
            </p>
            <p className="text-xs text-muted-foreground">
              {standing.match_points} jogos + {standing.tournament_points} pré
            </p>
          </div>
          <span className="text-right text-lg font-bold">{standing.total_points}</span>
          <span className="text-right text-sm">{standing.exact_scores}</span>
          <span className="text-right text-sm">{standing.correct_results}</span>
        </div>
      ))}
    </Card>
  );
}
