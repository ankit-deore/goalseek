/**
 * Database types matching supabase/migrations/0001_init.sql.
 * If you change the schema, regenerate with:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 */
import type { Category, Status } from "@/config/items";

type Timestamp = string;

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: { id: string; name: string; created_by: string; created_at: Timestamp };
        Insert: { id?: string; name: string; created_by: string; created_at?: Timestamp };
        Update: { name?: string };
        Relationships: [];
      };
      workspace_members: {
        Row: { workspace_id: string; user_id: string; role: "owner" | "member"; joined_at: Timestamp };
        Insert: { workspace_id: string; user_id: string; role?: "owner" | "member"; joined_at?: Timestamp };
        Update: { role?: "owner" | "member" };
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          timezone: string;
          reminder_hour: number;
          reminders_enabled: boolean;
          last_digest_sent_on: string | null;
          default_workspace_id: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          reminder_hour?: number;
          reminders_enabled?: boolean;
          last_digest_sent_on?: string | null;
          default_workspace_id?: string | null;
        };
        Update: {
          full_name?: string | null;
          timezone?: string;
          reminder_hour?: number;
          reminders_enabled?: boolean;
          last_digest_sent_on?: string | null;
          default_workspace_id?: string | null;
        };
        Relationships: [];
      };
      workspace_invites: {
        Row: {
          id: string;
          workspace_id: string;
          token: string;
          created_by: string;
          expires_at: Timestamp;
          created_at: Timestamp;
        };
        Insert: { workspace_id: string; created_by: string; token?: string; expires_at?: Timestamp };
        Update: { expires_at?: Timestamp };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          workspace_id: string;
          url: string;
          normalized_url: string;
          title: string | null;
          description: string | null;
          image_url: string | null;
          site_name: string | null;
          category: Category;
          status: Status;
          owner_id: string | null;
          added_by: string | null;
          notes: string | null;
          jd_text: string | null;
          resume_version: string | null;
          deadline: string | null;
          last_activity_at: Timestamp;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          workspace_id: string;
          url: string;
          normalized_url: string;
          title?: string | null;
          description?: string | null;
          image_url?: string | null;
          site_name?: string | null;
          category?: Category;
          status?: Status;
          owner_id?: string | null;
          added_by?: string | null;
          notes?: string | null;
          jd_text?: string | null;
          resume_version?: string | null;
          deadline?: string | null;
        };
        Update: {
          title?: string | null;
          category?: Category;
          status?: Status;
          owner_id?: string | null;
          notes?: string | null;
          jd_text?: string | null;
          resume_version?: string | null;
          deadline?: string | null;
        };
        Relationships: [];
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          prefix: string;
          key_hash: string;
          last_used_at: Timestamp | null;
          revoked_at: Timestamp | null;
          created_at: Timestamp;
        };
        Insert: { user_id: string; name: string; prefix: string; key_hash: string };
        Update: { last_used_at?: Timestamp | null; revoked_at?: Timestamp | null };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_workspace_member: { Args: { ws: string }; Returns: boolean };
      is_workspace_owner: { Args: { ws: string }; Returns: boolean };
      create_workspace: { Args: { workspace_name: string }; Returns: string };
      accept_invite: { Args: { invite_token: string }; Returns: string };
      invite_preview: {
        Args: { invite_token: string };
        Returns: { workspace_name: string; expired: boolean }[];
      };
    };
    Enums: {
      item_category: Category;
      item_status: Status;
      workspace_role: "owner" | "member";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Item = Tables<"items">;
export type Profile = Tables<"profiles">;
export type Workspace = Tables<"workspaces">;
export type ApiKey = Tables<"api_keys">;
