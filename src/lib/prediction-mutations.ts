import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function errorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

const goalsSchema = z.coerce.number().int().min(0).max(30);

export async function saveMatchPredictionFromForm(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const parsed = z
    .object({
      pool_id: z.string().uuid(),
      match_id: z.string().uuid(),
      team_a_goals: goalsSchema,
      team_b_goals: goalsSchema,
    })
    .safeParse({
      pool_id: formData.get("pool_id"),
      match_id: formData.get("match_id"),
      team_a_goals: formData.get("team_a_goals"),
      team_b_goals: formData.get("team_b_goals"),
    });

  if (!parsed.success) {
    errorRedirect("/app/pools", "Palpite inválido.");
  }

  const { error } = await supabase.from("predictions").upsert(
    {
      pool_id: parsed.data.pool_id,
      match_id: parsed.data.match_id,
      user_id: user.id,
      team_a_goals: parsed.data.team_a_goals,
      team_b_goals: parsed.data.team_b_goals,
    },
    { onConflict: "pool_id,match_id,user_id" },
  );

  if (error) {
    errorRedirect(`/app/pools/${parsed.data.pool_id}/predictions`, error.message);
  }

  revalidatePath(`/app/pools/${parsed.data.pool_id}`);
  redirect(`/app/pools/${parsed.data.pool_id}/predictions?saved=1`);
}

export async function saveTournamentPredictionFromForm(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const parsed = z
    .object({
      pool_id: z.string().uuid(),
      champion_id: z.string().uuid(),
      runner_up_id: z.string().uuid(),
      third_place_id: z.string().uuid(),
      fourth_place_id: z.string().uuid(),
    })
    .refine(
      (value) =>
        new Set([
          value.champion_id,
          value.runner_up_id,
          value.third_place_id,
          value.fourth_place_id,
        ]).size === 4,
      "Escolha quatro times diferentes.",
    )
    .safeParse({
      pool_id: formData.get("pool_id"),
      champion_id: formData.get("champion_id"),
      runner_up_id: formData.get("runner_up_id"),
      third_place_id: formData.get("third_place_id"),
      fourth_place_id: formData.get("fourth_place_id"),
    });

  if (!parsed.success) {
    errorRedirect("/app/pools", "Palpite pré-torneio inválido.");
  }

  const { error } = await supabase.from("tournament_predictions").upsert(
    {
      pool_id: parsed.data.pool_id,
      user_id: user.id,
      champion_id: parsed.data.champion_id,
      runner_up_id: parsed.data.runner_up_id,
      third_place_id: parsed.data.third_place_id,
      fourth_place_id: parsed.data.fourth_place_id,
    },
    { onConflict: "pool_id,user_id" },
  );

  if (error) {
    errorRedirect(`/app/pools/${parsed.data.pool_id}/tournament`, error.message);
  }

  revalidatePath(`/app/pools/${parsed.data.pool_id}`);
  redirect(`/app/pools/${parsed.data.pool_id}/tournament?saved=1`);
}
