import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginErrorUrl, signUpSchema, translateAuthError } from "@/lib/auth-schemas";
import { getSiteUrl } from "@/lib/utils";

export async function POST(request: Request) {
  const supabase = await createClient();
  const formData = await request.formData();
  const parsed = signUpSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(loginErrorUrl("Use e-mail, senha e nome de usuário válidos."));
  }

  const username = parsed.data.username.toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      data: {
        username,
        name: username,
      },
    },
  });

  if (error) {
    redirect(loginErrorUrl(translateAuthError(error.message)));
  }

  if (!data.session) {
    redirect("/login?created=1");
  }

  redirect("/app");
}
