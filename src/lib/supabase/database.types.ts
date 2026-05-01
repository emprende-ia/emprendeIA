/**
 * Tipos del schema Postgres (manuales por ahora).
 *
 * Para regenerar automáticamente desde Supabase cuando cambie el schema:
 *   npx supabase login
 *   npx supabase gen types typescript --project-id bldtbcwpyibwvcqsdlwh > src/lib/supabase/database.types.ts
 *
 * Mientras tanto, esta versión refleja `supabase/migrations/0001_schema.sql`.
 *
 * NOTA: postgrest-js v1.x exige el shape completo (Tables/Views/Functions y
 * Relationships en cada tabla). Sin ellos, los tipos colapsan a `never`.
 */

export type PlanTier = 'basico' | 'oro' | 'diamante';
export type PlanStatus = 'active' | 'inactive' | 'past_due' | 'canceled';
export type VentureType = 'new-venture' | 'existing-venture';
export type LogoSource = 'ai_generated' | 'user_uploaded';
export type TransactionType = 'income' | 'expense';

export interface ColorSwatch {
  hex: string;
  name: string;
}

export interface TaskAudio {
  taskKey: string;
  audioUrl: string;
}

type EmptyRels = [];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          username: string | null;
          age: number | null;
          photo_url: string | null;
          plan: PlanTier;
          plan_status: PlanStatus;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: EmptyRels;
      };
      viability_analyses: {
        Row: {
          id: string;
          user_id: string;
          type: VentureType;
          analysis: unknown;
          inputs: unknown | null;
          saved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: VentureType;
          analysis: unknown;
          inputs?: unknown | null;
          saved_at?: string;
        };
        Update: Partial<Database['public']['Tables']['viability_analyses']['Row']>;
        Relationships: EmptyRels;
      };
      brand_identities: {
        Row: {
          user_id: string;
          brand_name: string;
          slogan: string | null;
          color_palette: ColorSwatch[];
          logo_prompt: string | null;
          logo_url: string | null;
          logo_source: LogoSource | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['brand_identities']['Row'], 'updated_at'> & {
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['brand_identities']['Row']>;
        Relationships: EmptyRels;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          type: TransactionType;
          category: string;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          amount: number;
          type: TransactionType;
          category: string;
          occurred_at?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Row']>;
        Relationships: EmptyRels;
      };
      marketing_campaigns: {
        Row: {
          id: string;
          user_id: string;
          campaign_idea: unknown;
          campaign_plan: unknown;
          completed_tasks: string[];
          task_audios: TaskAudio[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['marketing_campaigns']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['marketing_campaigns']['Row']>;
        Relationships: EmptyRels;
      };
      learning_paths: {
        Row: {
          id: string;
          user_id: string;
          path_data: unknown;
          completed_tasks: string[];
          task_audios: TaskAudio[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['learning_paths']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['learning_paths']['Row']>;
        Relationships: EmptyRels;
      };
      saved_suppliers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          contact: string | null;
          location: string | null;
          reasoning: string | null;
          raw: unknown;
          saved_at: string;
        };
        Insert: Omit<Database['public']['Tables']['saved_suppliers']['Row'], 'id' | 'saved_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['saved_suppliers']['Row']>;
        Relationships: EmptyRels;
      };
      search_history: {
        Row: {
          id: string;
          user_id: string;
          term: string;
          resulting_keywords: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['search_history']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['search_history']['Row']>;
        Relationships: EmptyRels;
      };
      ai_usage: {
        Row: {
          id: string;
          user_id: string;
          flow_name: string;
          tokens_in: number | null;
          tokens_out: number | null;
          duration_ms: number | null;
          status: 'success' | 'error';
          error: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ai_usage']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['ai_usage']['Row']>;
        Relationships: EmptyRels;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      plan_tier: PlanTier;
      plan_status: PlanStatus;
      venture_type: VentureType;
      logo_source: LogoSource;
      transaction_type: TransactionType;
    };
    CompositeTypes: Record<string, never>;
  };
}
