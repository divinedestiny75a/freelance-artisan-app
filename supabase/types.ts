// supabase/types.ts
/**
 * Types generated from Supabase schema. For brevity we only declare the tables we need.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      artisan_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          location: string | null;
          skill_tags: string[] | null;
          bio: string | null;
          portfolio_url: string | null;
          rating: number | null;
          review_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          location?: string;
          skill_tags?: string[];
          bio?: string;
          portfolio_url?: string;
          rating?: number;
          review_count?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          location?: string;
          skill_tags?: string[];
          bio?: string;
          portfolio_url?: string;
          rating?: number;
          review_count?: number;
        };
      };
      gigs: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string;
          budget: number;
          location: string | null;
          required_skills: string[] | null;
          status: "open" | "in_progress" | "completed" | "cancelled";
          created_at: string;
          deadline: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description: string;
          budget: number;
          location?: string;
          required_skills?: string[];
          status?: "open" | "in_progress" | "completed" | "cancelled";
          created_at?: string;
          deadline?: string;
        };
        Update: {
          title?: string;
          description?: string;
          budget?: number;
          location?: string;
          required_skills?: string[];
          status?: "open" | "in_progress" | "completed" | "cancelled";
          deadline?: string;
        };
      };
      gig_applications: {
        Row: {
          id: string;
          gig_id: string;
          artisan_id: string;
          cover_letter: string | null;
          proposed_price: number | null;
          status: "pending" | "accepted" | "rejected" | "withdrawn";
          created_at: string;
        };
        Insert: {
          id?: string;
          gig_id: string;
          artisan_id: string;
          cover_letter?: string;
          proposed_price?: number;
          status?: "pending" | "accepted" | "rejected" | "withdrawn";
          created_at?: string;
        };
        Update: {
          cover_letter?: string;
          proposed_price?: number;
          status?: "pending" | "accepted" | "rejected" | "withdrawn";
        };
      };
      escrows: {
        Row: {
          id: string;
          gig_id: string;
          amount: number;
          paystack_ref: string | null;
          status: "initialized" | "paid" | "released" | "refunded";
          created_at: string;
        };
        Insert: {
          id?: string;
          gig_id: string;
          amount: number;
          paystack_ref?: string;
          status?: "initialized" | "paid" | "released" | "refunded";
          created_at?: string;
        };
        Update: {
          paystack_ref?: string;
          status?: "initialized" | "paid" | "released" | "refunded";
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
