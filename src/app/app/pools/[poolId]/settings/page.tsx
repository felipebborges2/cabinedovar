import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireUser } from "@/lib/auth";
import { getPool } from "@/lib/data";
import { toDateTimeLocal } from "@/lib/utils";

export default async function PoolSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ poolId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ poolId }, query, user] = await Promise.all([
    params,
    searchParams,
    requireUser(),
  ]);
  const pool = await getPool(poolId);
  const membership = pool.pool_members.find((member) => member.user_id === user.id);
  const canManage = membership?.role === "owner" || membership?.role === "admin";

  return (
    <>
      <PageHeader
        title="Configurar bolão"
        description="Edite os dados do bolão e o prazo dos palpites pré-torneio."
      />
      <Notice message={query.error} />
      {!canManage ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Apenas administradores podem alterar este bolão.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardContent className="p-5">
              <form action="/app/pools/update" method="post" className="space-y-5">
                <input type="hidden" name="pool_id" value={pool.id} />
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" name="name" defaultValue={pool.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={pool.description ?? ""}
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
                    defaultValue={toDateTimeLocal(pool.tournament_predictions_lock_at)}
                  />
                </div>
                <Button type="submit">Salvar alteracoes</Button>
              </form>
            </CardContent>
          </Card>
          <Card className="border-destructive/35">
            <CardHeader>
              <CardTitle>Zona de perigo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-6 text-muted-foreground">
                Excluir o bolão remove membros, palpites e ranking associado.
              </p>
              <form action="/app/pools/delete" method="post">
                <input type="hidden" name="pool_id" value={pool.id} />
                <Button type="submit" variant="destructive">
                  Excluir bolão
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
