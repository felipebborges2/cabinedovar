import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  MatchWithTeams,
  Pool,
  PoolWithRole,
  StandingWithUser,
  Team,
  TournamentPrediction,
} from "@/types/domain";
import type { Database } from "@/types/database";

type PoolDetail = Pool & {
  pool_members: {
    role: Database["public"]["Enums"]["pool_member_role"];
    user_id: string;
  }[];
};

export async function getUserPools(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pools")
    .select("*, pool_members!inner(role)")
    .eq("pool_members.user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as PoolWithRole[];
}

export async function getPool(poolId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pools")
    .select("*, pool_members(role, user_id)")
    .eq("id", poolId)
    .single();

  if (error || !data) {
    notFound();
  }

  return data as unknown as PoolDetail;
}

export async function getPoolMembers(poolId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pool_members")
    .select("role, joined_at, users(id, username, name, avatar_url)")
    .eq("pool_id", poolId)
    .order("joined_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as {
    role: Database["public"]["Enums"]["pool_member_role"];
    joined_at: string;
    users: { id: string; username: string; name: string; avatar_url: string | null } | null;
  }[];
}

export async function getTeams() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Team[];
}

export async function getMatchesWithPredictions(poolId: string, userId: string) {
  const supabase = await createClient();
  const [{ data: matches, error: matchesError }, { data: predictions, error: predictionsError }] =
    await Promise.all([
      supabase
        .from("matches")
        .select("*, team_a:teams!matches_team_a_id_fkey(*), team_b:teams!matches_team_b_id_fkey(*)")
        .order("kickoff_at", { ascending: true }),
      supabase
        .from("predictions")
        .select("*")
        .eq("pool_id", poolId)
        .eq("user_id", userId),
    ]);

  if (matchesError) {
    throw new Error(matchesError.message);
  }

  if (predictionsError) {
    throw new Error(predictionsError.message);
  }

  const predictionByMatch = new Map((predictions ?? []).map((item) => [item.match_id, item]));

  return {
    matches: (matches ?? []) as unknown as MatchWithTeams[],
    predictionByMatch,
  };
}

export async function getMatchesWithTeams() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*, team_a:teams!matches_team_a_id_fkey(*), team_b:teams!matches_team_b_id_fkey(*)")
    .order("kickoff_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as MatchWithTeams[];
}

export async function getTournamentPrediction(poolId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournament_predictions")
    .select("*")
    .eq("pool_id", poolId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as TournamentPrediction | null;
}

export async function getStandings(poolId: string, round?: number | null) {
  const supabase = await createClient();
  let query = supabase
    .from("standings")
    .select("*, users(id, username, name, avatar_url)")
    .eq("pool_id", poolId)
    .order("total_points", { ascending: false })
    .order("exact_scores", { ascending: false })
    .order("correct_results", { ascending: false });

  query = round ? query.eq("round", round) : query.is("round", null);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as StandingWithUser[];
}

export async function getRounds() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select("round")
    .order("round", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return Array.from(new Set((data ?? []).map((item) => item.round)));
}
