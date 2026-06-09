import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { RankingTable } from "@/components/ranking/ranking-table";
import { Button } from "@/components/ui/button";
import { getPool, getRounds, getStandings } from "@/lib/data";

export default async function RankingPage({
  params,
  searchParams,
}: {
  params: Promise<{ poolId: string }>;
  searchParams: Promise<{ round?: string }>;
}) {
  const [{ poolId }, query] = await Promise.all([params, searchParams]);
  const selectedRound = query.round ? Number(query.round) : null;
  const [pool, rounds, standings] = await Promise.all([
    getPool(poolId),
    getRounds(),
    getStandings(poolId, selectedRound),
  ]);

  return (
    <>
      <PageHeader
        title="Ranking"
        description={`${pool.name}: geral, por rodada, placares exatos e resultados corretos.`}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild variant={!selectedRound ? "default" : "outline"} size="sm">
          <Link href={`/app/pools/${pool.id}/ranking`}>Geral</Link>
        </Button>
        {rounds.map((round) => (
          <Button
            key={round}
            asChild
            variant={selectedRound === round ? "default" : "outline"}
            size="sm"
          >
            <Link href={`/app/pools/${pool.id}/ranking?round=${round}`}>
              Rodada {round}
            </Link>
          </Button>
        ))}
      </div>
      <RankingTable standings={standings} />
    </>
  );
}
