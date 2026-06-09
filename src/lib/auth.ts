import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("users").upsert({
    id: user.id,
    username:
      user.user_metadata.username ??
      user.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]+/g, "_") ??
      "usuario",
    name:
      user.user_metadata.name ??
      user.user_metadata.username ??
      user.email?.split("@")[0] ??
      "Usuário",
    avatar_url: user.user_metadata.avatar_url ?? null,
    email: user.email ?? null,
  });

  return user;
}

export async function getOptionalUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
