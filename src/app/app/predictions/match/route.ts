import { saveMatchPredictionFromForm } from "@/lib/prediction-mutations";

export async function POST(request: Request) {
  return saveMatchPredictionFromForm(await request.formData());
}
