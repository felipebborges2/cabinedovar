"use client";

import { CheckCircle, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDateTime, stageLabel } from "@/lib/utils";

type Match = {
  id: string;
  stage: string;
  round: number;
  kickoff_at: string;
  result_team_a_goals: number | null;
  result_team_b_goals: number | null;
  team_a: { name: string; short_name: string };
  team_b: { name: string; short_name: string };
};

type MatchState = {
  a: string;
  b: string;
  status: "idle" | "saving" | "saved" | "error";
};

async function saveMatches(matches: { match_id: string; team_a_goals: number | null; team_b_goals: number | null }[]) {
  const res = await fetch("/app/admin/results/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matches }),
  });
  if (!res.ok) throw new Error("Erro ao salvar");
}

function parseGoals(value: string): number | null {
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

export function ResultsForm({ matches }: { matches: Match[] }) {
  const [state, setState] = useState<Record<string, MatchState>>(() =>
    Object.fromEntries(
      matches.map((m) => [
        m.id,
        {
          a: m.result_team_a_goals?.toString() ?? "",
          b: m.result_team_b_goals?.toString() ?? "",
          status: "idle",
        },
      ]),
    ),
  );

  function setMatchStatus(id: string, status: MatchState["status"]) {
    setState((prev) => ({ ...prev, [id]: { ...prev[id], status } }));
  }

  async function saveOne(match: Match) {
    setMatchStatus(match.id, "saving");
    try {
      const s = state[match.id];
      await saveMatches([
        { match_id: match.id, team_a_goals: parseGoals(s.a), team_b_goals: parseGoals(s.b) },
      ]);
      setMatchStatus(match.id, "saved");
    } catch {
      setMatchStatus(match.id, "error");
    }
  }

  async function saveAll() {
    const filled = matches.filter((m) => state[m.id].a !== "" && state[m.id].b !== "");
    if (filled.length === 0) return;

    const ids = filled.map((m) => m.id);
    setState((prev) => {
      const next = { ...prev };
      ids.forEach((id) => { next[id] = { ...next[id], status: "saving" }; });
      return next;
    });
    try {
      await saveMatches(
        filled.map((m) => ({
          match_id: m.id,
          team_a_goals: parseGoals(state[m.id].a),
          team_b_goals: parseGoals(state[m.id].b),
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

  const isSavingAll = Object.values(state).some((s) => s.status === "saving");

  return (
    <div className="grid gap-4">
      <div className="sticky top-16 z-10 flex justify-end rounded-lg border border-border bg-background/95 p-3 shadow-sm backdrop-blur">
        <Button type="button" onClick={saveAll} disabled={isSavingAll}>
          {isSavingAll ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
          Salvar tudo
        </Button>
      </div>

      {matches.map((match) => {
        const s = state[match.id];
        const hasResult = s.a !== "" && s.b !== "";

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
                    {hasResult ? `${s.a} x ${s.b}` : "x"}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{match.team_b.name}</p>
                    <p className="text-sm text-muted-foreground">{match.team_b.short_name}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{formatDateTime(match.kickoff_at)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={s.a}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, [match.id]: { ...prev[match.id], a: e.target.value, status: "idle" } }))
                  }
                  className="w-20 text-center"
                  aria-label={`Gols ${match.team_a.name}`}
                />
                <span className="font-bold">x</span>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={s.b}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, [match.id]: { ...prev[match.id], b: e.target.value, status: "idle" } }))
                  }
                  className="w-20 text-center"
                  aria-label={`Gols ${match.team_b.name}`}
                />
                <Button
                  type="button"
                  onClick={() => saveOne(match)}
                  disabled={s.status === "saving"}
                  variant={s.status === "error" ? "destructive" : "default"}
                >
                  {s.status === "saving" && <Loader2 className="animate-spin" />}
                  {s.status === "saved" && <CheckCircle />}
                  {s.status === "error" && <XCircle />}
                  {s.status === "idle" && <ShieldCheck />}
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
