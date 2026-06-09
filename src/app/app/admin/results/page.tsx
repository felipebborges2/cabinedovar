import { PageHeader } from "@/components/page-header";
import { ResultsForm } from "@/components/admin/results-form";
import { requireAppAdmin } from "@/lib/admin";
import { requireUser } from "@/lib/auth";
import { getMatchesWithTeams } from "@/lib/data";

export default async function AdminResultsPage() {
  const user = await requireUser();
  requireAppAdmin(user);
  const matches = await getMatchesWithTeams();

  return (
    <>
      <PageHeader
        title="Resultados das partidas"
        description="Lance ou corrija placares finais. Ao salvar, os pontos e rankings dos bolões são recalculados automaticamente."
      />
      <ResultsForm matches={matches} />
    </>
  );
}
