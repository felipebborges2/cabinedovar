import { deletePoolFromForm } from "@/lib/pool-mutations";

export async function POST(request: Request) {
  return deletePoolFromForm(await request.formData());
}
