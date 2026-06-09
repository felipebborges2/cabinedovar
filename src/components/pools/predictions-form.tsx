"use client";

import { CheckCircle, Loader2, Save, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MatchWithTeams, Prediction } from "@/types/domain";
import { formatDateTime, stageLabel } from "@/lib/utils";

type MatchState = {
  a: string;
  b: string;
  status: "idle" | "saving" | "saved" | "error";
};

function isLocked(kickoffAt: string) {
  return new Date(kickoffAt).getTime() <= Date.now();
}

function parseGoals(value: string): number | null {
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

async function saveBatch(
  poolId: string,
  predictions: { match_id: string; team_a_goals: number; team_b_goals: number }[],
) {
  const res = await fetch("/app/predictions/match/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pool_id: poolId, predictions }),
  });
  if (!res.ok) throw new Error("Erro ao salvar");
}

export function PredictionsForm({
  poolId,
  matches,
  predictionsByMatch,
}: {
  poolId: string;
  matches: MatchWithTeams[];
  predictionsByMatch: Record<string, Prediction>;
}) {
  const [state, setState] = useState<Record<string, MatchState>>(() =>
    Object.fromEntries(
      matches.map((m) => {
        const p = predictionsByMatch[m.id];
        return [
          m.id,
          {
            a: p?.team_a_goals?.toString() ?? "",
            b: p?.team_b_goals?.toString() ?? "",
            status: "idle" as const,
          },
        ];
      }),
    ),
  );

  function setStatus(id: string, status: MatchState["status"]) {
    setState((prev) => ({ ...prev, [id]: { ...prev[id], status } }));
  }

  async function saveOne(matchId: string) {
    const s = state[matchId];
    const a = parseGoals(s.a);
    const b = parseGoals(s.b);
    if (a === null || b === null) return;
    setStatus(matchId, "saving");
    try {
      await saveBatch(poolId, [{ match_id: matchId, team_a_goals: a, team_b_goals: b }]);
      setStatus(matchId, "saved");
    } catch {
      setStatus(matchId, "error");
    }
  }

  async function saveAll() {
    const toSave = matches.filter((m) => {
      if (isLocked(m.kickoff_at)) return false;
      const s = state[m.id];
      return s.a !== "" && s.b !== "";
    });
    if (toSave.length === 0) return;

    const ids = toSave.map((m) => m.id);
    setState((prev) => {
      const next = { ...prev };
      ids.forEach((id) => { next[id] = { ...next[id], status: "saving" }; });
      return next;
    });

    try {
      await saveBatch(
        poolId,
        toSave.map((m) => ({
          match_id: m.id,
          team_a_goals: parseGoals(state[m.id].a)!,
          team_b_goals: parseGoals(state[m.id].b)!,
        })),
      );
      setState((prev) => {
        const next = { ...prev };
        ids.forEach((id) => { next[id] = { ...next[id], status: "saved" }; });
        return next;
      });
    } catch {
      setState((prev) => {
        const next = { ...prev };
        ids.forEach((id) => { next[id] = { ...next[id], status: "error" }; });
        return next;
      });
    }
  }

  const isSavingAny = Object.values(state).some((s) => s.status === "saving");

  return (
    <div className="grid gap-4">
      <div className="sticky top-16 z-10 flex items-center justify-between rounded-lg border border-border bg-background/95 p-3 shadow-sm backdrop-blur">
        <p className="text-sm text-muted-foreground">
          Preencha os placares e salve tudo de uma vez.
        </p>
        <Button type="button" onClick={saveAll} disabled={isSavingAny}>
          {isSavingAny ? <Loader2 className="animate-spin" /> : <Save />}
          Salvar tudo
        </Button>
      </div>

      {matches.map((match) => {
        const s = state[match.id];
        const locked = isLocked(match.kickoff_at);
        const hasResult =
          match.result_team_a_goals !== null && match.result_team_b_goals !== null;
        const prediction = predictionsByMatch[match.id];

        return (
          <Card key={match.id}>
            <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{stageLabel(match.stage)}</Badge>
                  <Badge variant="secondary">Rodada {match.round}</Badge>
                  {locked && <Badge variant="outline">Bloqueado</Badge>}
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
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(match.kickoff_at)}
                  {prediction ? ` · ${prediction.points} pontos no palpite atual` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={s.a}
                  disabled={locked}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      [match.id]: { ...prev[match.id], a: e.target.value, status: "idle" },
                    }))
                  }
                  className="w-16 text-center"
                  aria-label={`Gols ${match.team_a.name}`}
                />
                <span className="font-bold">x</span>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={s.b}
                  disabled={locked}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      [match.id]: { ...prev[match.id], b: e.target.value, status: "idle" },
                    }))
                  }
                  className="w-16 text-center"
                  aria-label={`Gols ${match.team_b.name}`}
                />
                <Button
                  type="button"
                  disabled={locked || s.status === "saving"}
                  variant={s.status === "error" ? "destructive" : "default"}
                  onClick={() => saveOne(match.id)}
                >
                  {s.status === "saving" && <Loader2 className="animate-spin" />}
                  {s.status === "saved" && <CheckCircle />}
                  {s.status === "error" && <XCircle />}
                  {(s.status === "idle") && <Save />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
