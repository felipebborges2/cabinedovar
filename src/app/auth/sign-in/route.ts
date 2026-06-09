import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginErrorUrl, signInSchema, translateAuthError } from "@/lib/auth-schemas";

export async function POST(request: Request) {
  const supabase = await createClient();
  const formData = await request.formData();
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(loginErrorUrl("Informe e-mail e senha válidos."));
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect(loginErrorUrl(translateAuthError(error.message)));
  }

  redirect("/app");
}
