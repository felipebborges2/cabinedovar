import { saveTournamentPredictionFromForm } from "@/lib/prediction-mutations";

export async function POST(request: Request) {
  return saveTournamentPredictionFromForm(await request.formData());
}
