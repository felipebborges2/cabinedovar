import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAppAdmin } from "@/lib/admin";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function errorRedirect(message: string): never {
  redirect(`/app/admin/results?error=${encodeURIComponent(message)}`);
}

const resultSchema = z
  .object({
    match_id: z.string().uuid(),
    team_a_goals: z.union([z.literal(""), z.coerce.number().int().min(0).max(30)]),
    team_b_goals: z.union([z.literal(""), z.coerce.number().int().min(0).max(30)]),
  })
  .refine(
    (value) =>
      (value.team_a_goals === "" && value.team_b_goals === "") ||
      (value.team_a_goals !== "" && value.team_b_goals !== ""),
    "Informe os dois placares ou deixe os dois em branco.",
  );

export async function saveMatchResultFromForm(formData: FormData) {
  const user = await requireUser();
  requireAppAdmin(user);

  const parsed = resultSchema.safeParse({
    match_id: formData.get("match_id"),
    team_a_goals: formData.get("team_a_goals") ?? "",
    team_b_goals: formData.get("team_b_goals") ?? "",
  });

  if (!parsed.success) {
    errorRedirect("Resultado inválido.");
  }

  const hasResult = parsed.data.team_a_goals !== "" && parsed.data.team_b_goals !== "";
  const teamAGoals = hasResult ? Number(parsed.data.team_a_goals) : null;
  const teamBGoals = hasResult ? Number(parsed.data.team_b_goals) : null;
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("matches")
    .update({
      result_team_a_goals: teamAGoals,
      result_team_b_goals: teamBGoals,
      status: hasResult ? "finished" : "scheduled",
    })
    .eq("id", parsed.data.match_id);

  if (error) {
    errorRedirect(error.message);
  }

  revalidatePath("/app/admin/results");
  revalidatePath("/app/pools");
  redirect("/app/admin/results?saved=1");
}
