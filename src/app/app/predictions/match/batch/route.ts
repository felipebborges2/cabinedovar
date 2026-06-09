import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  pool_id: z.string().uuid(),
  predictions: z
    .array(
      z.object({
        match_id: z.string().uuid(),
        team_a_goals: z.number().int().min(0).max(30),
        team_b_goals: z.number().int().min(0).max(30),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { pool_id, predictions } = parsed.data;

  const { error } = await supabase.from("predictions").upsert(
    predictions.map(({ match_id, team_a_goals, team_b_goals }) => ({
      pool_id,
      match_id,
      user_id: user.id,
      team_a_goals,
      team_b_goals,
    })),
    { onConflict: "pool_id,match_id,user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(`/app/pools/${pool_id}`);
  revalidatePath(`/app/pools/${pool_id}/predictions`);

  return NextResponse.json({ ok: true });
}
