import { joinPoolFromForm } from "@/lib/pool-mutations";

export async function POST(request: Request) {
  return joinPoolFromForm(await request.formData());
}
