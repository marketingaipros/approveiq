export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          stripe_customer_id: string | null
          subscription_tier: string
          subscription_status: string
          bureau_readiness_score: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          stripe_customer_id?: string | null
          subscription_tier?: string
          subscription_status?: string
          bureau_readiness_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          stripe_customer_id?: string | null
          subscription_tier?: string
          subscription_status?: string
          bureau_readiness_score?: number
          created_at?: string
        }
      }
      bureau_programs: {
        Row: {
          id: string
          org_id: string
          title: string
          bureau: string
          status: string
          progress_percent: number
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          title: string
          bureau: string
          status?: string
          progress_percent?: number
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          title?: string
          bureau?: string
          status?: string
          progress_percent?: number
          created_at?: string
        }
      }
      checklist_items: {
        Row: {
          id: string
          program_id: string
          title: string
          description: string | null
          source_attribution: string | null
          required: boolean
          status: string
          file_url: string | null
          rejection_reason: string | null
          last_updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          program_id: string
          title: string
          description?: string | null
          source_attribution?: string | null
          required?: boolean
          status?: string
          file_url?: string | null
          rejection_reason?: string | null
          last_updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          title?: string
          description?: string | null
          source_attribution?: string | null
          required?: boolean
          status?: string
          file_url?: string | null
          rejection_reason?: string | null
          last_updated_by?: string | null
          updated_at?: string
        }
      }
      knowledge_base: {
        Row: {
          id: string
          topic: string
          content: string
          bureau: string | null
          created_at: string
        }
        Insert: {
          id?: string
          topic: string
          content: string
          bureau?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          topic?: string
          content?: string
          bureau?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          org_id: string | null
          user_id: string | null
          action: string
          metadata: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          user_id?: string | null
          action: string
          metadata?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          user_id?: string | null
          action?: string
          metadata?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
  }
}
