import { saveMatchResultFromForm } from "@/lib/result-mutations";

export async function POST(request: Request) {
  return saveMatchResultFromForm(await request.formData());
}
