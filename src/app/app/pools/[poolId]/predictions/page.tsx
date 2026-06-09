import { PageHeader } from "@/components/page-header";
import { PredictionsForm } from "@/components/pools/predictions-form";
import { requireUser } from "@/lib/auth";
import { getMatchesWithPredictions, getPool } from "@/lib/data";

export default async function MatchPredictionsPage({
  params,
}: {
  params: Promise<{ poolId: string }>;
}) {
  const [{ poolId }, user] = await Promise.all([params, requireUser()]);
  const [pool, data] = await Promise.all([
    getPool(poolId),
    getMatchesWithPredictions(poolId, user.id),
  ]);

  const predictionsByMatch = Object.fromEntries(data.predictionByMatch);

  return (
    <>
      <PageHeader
        title="Palpites de partidas"
        description={`${pool.name}: cada palpite bloqueia automaticamente no horário do jogo.`}
      />
      <PredictionsForm
        poolId={pool.id}
        matches={data.matches}
        predictionsByMatch={predictionsByMatch}
      />
    </>
  );
}
