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
      clients: {
        Row: {
          id: string
          name: string
          website: string
          address: string
          industry: string
          email?: string | null
          status: 'pending_enrichment' | 'enriched' | 'failed'
          enriched_data?: Json | null
          created_at: string
          updated_at?: string | null
        }
        Insert: {
          id?: string
          name: string
          website: string
          address: string
          industry: string
          email?: string | null
          status?: 'pending_enrichment' | 'enriched' | 'failed'
          enriched_data?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          website?: string
          address?: string
          industry?: string
          email?: string | null
          status?: 'pending_enrichment' | 'enriched' | 'failed'
          enriched_data?: Json | null
          created_at?: string
          updated_at?: string | null
        }
      }
      enrichment_logs: {
        Row: {
          id: string
          client_id: string
          status: 'pending' | 'completed' | 'failed'
          error?: string | null
          metadata?: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          status?: 'pending' | 'completed' | 'failed'
          error?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          status?: 'pending' | 'completed' | 'failed'
          error?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 