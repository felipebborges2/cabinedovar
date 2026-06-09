import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAppAdmin } from "@/lib/admin";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const matchResultSchema = z.object({
  match_id: z.string().uuid(),
  team_a_goals: z.union([z.null(), z.number().int().min(0).max(30)]),
  team_b_goals: z.union([z.null(), z.number().int().min(0).max(30)]),
});

const bodySchema = z.object({
  matches: z.array(matchResultSchema).min(1),
});

export async function POST(request: Request) {
  const user = await requireUser();
  requireAppAdmin(user);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const results = await Promise.all(
    parsed.data.matches.map(({ match_id, team_a_goals, team_b_goals }) => {
      const hasResult = team_a_goals !== null && team_b_goals !== null;
      return supabase
        .from("matches")
        .update({
          result_team_a_goals: team_a_goals,
          result_team_b_goals: team_b_goals,
          status: hasResult ? "finished" : "scheduled",
        })
        .eq("id", match_id);
    }),
  );

  const failed = results.filter((r) => r.error);
  if (failed.length > 0) {
    return NextResponse.json({ error: "Erro ao salvar resultados." }, { status: 500 });
  }

  revalidatePath("/app/admin/results");
  revalidatePath("/app/pools");

  return NextResponse.json({ ok: true });
}
