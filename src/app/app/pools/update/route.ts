import { updatePoolFromForm } from "@/lib/pool-mutations";

export async function POST(request: Request) {
  return updatePoolFromForm(await request.formData());
}
