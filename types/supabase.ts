/**
 * types/supabase.ts
 *
 * This file contains type definitions for your Supabase database.
 * You can generate more specific types using Supabase CLI:
 * npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
 */

export interface Database {
  public: {
    Tables: {
      // Define your tables here when ready
      // Example:
      // todos: {
      //   Row: {
      //     id: string
      //     user_id: string
      //     content: string
      //     completed: boolean
      //     created_at: string
      //     updated_at: string
      //   }
      //   Insert: {
      //     id?: string
      //     user_id: string
      //     content: string
      //     completed?: boolean
      //     created_at?: string
      //     updated_at?: string
      //   }
      //   Update: {
      //     id?: string
      //     user_id?: string
      //     content?: string
      //     completed?: boolean
      //     created_at?: string
      //     updated_at?: string
      //   }
      // }
    }
    Views: {
      // Define your views here
    }
    Functions: {
      // Define your functions here
    }
    Enums: {
      // Define your enums here
    }
  }
}
