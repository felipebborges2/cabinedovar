import { createPoolFromForm } from "@/lib/pool-mutations";

export async function POST(request: Request) {
  return createPoolFromForm(await request.formData());
}
