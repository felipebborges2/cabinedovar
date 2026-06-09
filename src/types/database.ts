export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          name: string;
          avatar_url: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          name: string;
          avatar_url?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          name?: string;
          avatar_url?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pools: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          invite_code: string;
          owner_id: string;
          tournament_predictions_lock_at: string | null;
          actual_champion_id: string | null;
          actual_runner_up_id: string | null;
          actual_third_place_id: string | null;
          actual_fourth_place_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          invite_code?: string;
          owner_id: string;
          tournament_predictions_lock_at?: string | null;
          actual_champion_id?: string | null;
          actual_runner_up_id?: string | null;
          actual_third_place_id?: string | null;
          actual_fourth_place_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          invite_code?: string;
          owner_id?: string;
          tournament_predictions_lock_at?: string | null;
          actual_champion_id?: string | null;
          actual_runner_up_id?: string | null;
          actual_third_place_id?: string | null;
          actual_fourth_place_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pool_members: {
        Row: {
          id: string;
          pool_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["pool_member_role"];
          joined_at: string;
        };
        Insert: {
          id?: string;
          pool_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["pool_member_role"];
          joined_at?: string;
        };
        Update: {
          id?: string;
          pool_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["pool_member_role"];
          joined_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          flag_url: string | null;
          group_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          flag_url?: string | null;
          group_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
          flag_url?: string | null;
          group_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          team_a_id: string;
          team_b_id: string;
          kickoff_at: string;
          stage: Database["public"]["Enums"]["match_stage"];
          round: number;
          result_team_a_goals: number | null;
          result_team_b_goals: number | null;
          status: Database["public"]["Enums"]["match_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_a_id: string;
          team_b_id: string;
          kickoff_at: string;
          stage: Database["public"]["Enums"]["match_stage"];
          round?: number;
          result_team_a_goals?: number | null;
          result_team_b_goals?: number | null;
          status?: Database["public"]["Enums"]["match_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_a_id?: string;
          team_b_id?: string;
          kickoff_at?: string;
          stage?: Database["public"]["Enums"]["match_stage"];
          round?: number;
          result_team_a_goals?: number | null;
          result_team_b_goals?: number | null;
          status?: Database["public"]["Enums"]["match_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      predictions: {
        Row: {
          id: string;
          pool_id: string;
          match_id: string;
          user_id: string;
          team_a_goals: number;
          team_b_goals: number;
          points: number;
          is_exact_score: boolean;
          is_correct_result: boolean;
          has_correct_goal_difference: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pool_id: string;
          match_id: string;
          user_id: string;
          team_a_goals: number;
          team_b_goals: number;
          points?: number;
          is_exact_score?: boolean;
          is_correct_result?: boolean;
          has_correct_goal_difference?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pool_id?: string;
          match_id?: string;
          user_id?: string;
          team_a_goals?: number;
          team_b_goals?: number;
          points?: number;
          is_exact_score?: boolean;
          is_correct_result?: boolean;
          has_correct_goal_difference?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tournament_predictions: {
        Row: {
          id: string;
          pool_id: string;
          user_id: string;
          champion_id: string;
          runner_up_id: string;
          third_place_id: string;
          fourth_place_id: string;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pool_id: string;
          user_id: string;
          champion_id: string;
          runner_up_id: string;
          third_place_id: string;
          fourth_place_id: string;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pool_id?: string;
          user_id?: string;
          champion_id?: string;
          runner_up_id?: string;
          third_place_id?: string;
          fourth_place_id?: string;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      standings: {
        Row: {
          id: string;
          pool_id: string;
          user_id: string;
          round: number | null;
          match_points: number;
          tournament_points: number;
          total_points: number;
          exact_scores: number;
          correct_results: number;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_pool: {
        Args: {
          pool_name: string;
          pool_description: string | null;
          tournament_lock_at: string | null;
        };
        Returns: string;
      };
      join_pool_by_invite_code: {
        Args: { invite: string };
        Returns: string;
      };
      recalculate_pool_standings: {
        Args: { target_pool_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      pool_member_role: "owner" | "admin" | "member";
      match_stage:
        | "groups"
        | "round_of_16"
        | "quarterfinal"
        | "semifinal"
        | "third_place"
        | "final";
      match_status: "scheduled" | "in_progress" | "finished";
    };
    CompositeTypes: Record<string, never>;
  };
};
