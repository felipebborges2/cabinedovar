import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const poolSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().max(500).optional(),
  tournament_predictions_lock_at: z.string().optional(),
});

function errorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createPoolFromForm(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const parsed = poolSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    tournament_predictions_lock_at: formData.get("tournament_predictions_lock_at"),
  });

  if (!parsed.success) {
    errorRedirect("/app/pools/new", "Revise os dados do bolão.");
  }

  const lockAt = parsed.data.tournament_predictions_lock_at
    ? new Date(parsed.data.tournament_predictions_lock_at).toISOString()
    : null;

  const { data: poolId, error } = await supabase.rpc("create_pool", {
    pool_name: parsed.data.name,
    pool_description: parsed.data.description || null,
    tournament_lock_at: lockAt,
  });

  if (error || !poolId) {
    errorRedirect("/app/pools/new", error?.message ?? "Não foi possível criar o bolão.");
  }

  revalidatePath("/app");
  redirect(`/app/pools/${poolId}`);
}

export async function updatePoolFromForm(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const poolId = z.string().uuid().safeParse(formData.get("pool_id"));

  if (!poolId.success) {
    errorRedirect("/app/pools", "Bolão inválido.");
  }

  const parsed = poolSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    tournament_predictions_lock_at: formData.get("tournament_predictions_lock_at"),
  });

  if (!parsed.success) {
    errorRedirect(`/app/pools/${poolId.data}/settings`, "Revise os dados do bolão.");
  }

  const { error } = await supabase
    .from("pools")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      tournament_predictions_lock_at: parsed.data.tournament_predictions_lock_at
        ? new Date(parsed.data.tournament_predictions_lock_at).toISOString()
        : null,
    })
    .eq("id", poolId.data);

  if (error) {
    errorRedirect(`/app/pools/${poolId.data}/settings`, error.message);
  }

  revalidatePath(`/app/pools/${poolId.data}`);
  redirect(`/app/pools/${poolId.data}`);
}

export async function deletePoolFromForm(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const poolId = z.string().uuid().safeParse(formData.get("pool_id"));

  if (!poolId.success) {
    errorRedirect("/app/pools", "Bolão inválido.");
  }

  const { error } = await supabase.from("pools").delete().eq("id", poolId.data);

  if (error) {
    errorRedirect(`/app/pools/${poolId.data}/settings`, error.message);
  }

  revalidatePath("/app");
  redirect("/app/pools");
}

export async function joinPoolFromForm(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const invite = z.string().trim().min(4).max(16).safeParse(formData.get("invite_code"));

  if (!invite.success) {
    errorRedirect("/app/join", "Informe um código válido.");
  }

  const { data: poolId, error } = await supabase.rpc("join_pool_by_invite_code", {
    invite: invite.data,
  });

  if (error || !poolId) {
    errorRedirect("/app/join", error?.message ?? "Não foi possível entrar no bolão.");
  }

  revalidatePath("/app");
  redirect(`/app/pools/${poolId}`);
}
