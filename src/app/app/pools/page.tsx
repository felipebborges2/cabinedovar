import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PoolCard } from "@/components/pools/pool-card";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getUserPools } from "@/lib/data";

export default async function PoolsPage() {
  const user = await requireUser();
  const pools = await getUserPools(user.id);

  return (
    <>
      <PageHeader
        title="Meus bolões"
        description="Todos os grupos em que voce participa."
        actions={
          <Button asChild>
            <Link href="/app/pools/new">
              <Plus />
              Novo bolão
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pools.map((pool) => (
          <PoolCard key={pool.id} pool={pool} />
        ))}
      </div>
    </>
  );
}
