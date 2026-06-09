import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PoolCard } from "@/components/pools/pool-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getUserPools } from "@/lib/data";

export default async function DashboardPage() {
  const user = await requireUser();
  const pools = await getUserPools(user.id);

  return (
    <>
      <PageHeader
        title="Sua rodada começa aqui"
        description="Acompanhe seus bolões, entre em novos grupos e registre palpites antes do apito inicial."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/app/join">
                <Users />
                Entrar por código
              </Link>
            </Button>
            <Button asChild>
              <Link href="/app/pools/new">
                <Plus />
                Criar bolão
              </Link>
            </Button>
          </>
        }
      />
      {pools.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold">Nenhum bolão ainda</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Crie seu primeiro bolão ou use um código de convite.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Button asChild>
                <Link href="/app/pools/new">Criar bolão</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/app/join">Entrar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </div>
      )}
    </>
  );
}
