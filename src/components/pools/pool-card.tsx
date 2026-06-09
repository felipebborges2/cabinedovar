import Link from "next/link";
import { CalendarDays, KeyRound, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { PoolWithRole } from "@/types/domain";

export function PoolCard({ pool }: { pool: PoolWithRole }) {
  const role = pool.pool_members?.[0]?.role ?? "member";

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{pool.name}</CardTitle>
          <Badge variant={role === "member" ? "secondary" : "success"}>{role}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="min-h-10 text-sm leading-5 text-muted-foreground">
          {pool.description || "Bolão sem descrição."}
        </p>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4" />
            <span className="font-mono text-foreground">{pool.invite_code}</span>
          </div>
          {pool.tournament_predictions_lock_at ? (
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              <span>Pre-torneio fecha em {formatDateTime(pool.tournament_predictions_lock_at)}</span>
            </div>
          ) : null}
        </div>
        <Button asChild className="w-full">
          <Link href={`/app/pools/${pool.id}`}>
            <Users />
            Abrir bolão
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
