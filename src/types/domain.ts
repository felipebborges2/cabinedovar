import type { Database } from "./database";

export type Pool = Database["public"]["Tables"]["pools"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type Prediction = Database["public"]["Tables"]["predictions"]["Row"];
export type TournamentPrediction =
  Database["public"]["Tables"]["tournament_predictions"]["Row"];
export type Standing = Database["public"]["Tables"]["standings"]["Row"];
export type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export type MatchWithTeams = Match & {
  team_a: Team;
  team_b: Team;
};

export type StandingWithUser = Standing & {
  users: Pick<UserProfile, "id" | "username" | "name" | "avatar_url"> | null;
};

export type PoolWithRole = Pool & {
  pool_members: { role: Database["public"]["Enums"]["pool_member_role"] }[];
};
