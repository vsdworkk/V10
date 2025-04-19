/**
 * lib/supabase-browser.ts
 *
 * A tiny wrapper that gives React components a ready‑to‑use Supabase JS client
 * (browser‑side only).  We keep it in /lib so any component can:
 *
 *   import { supabase } from "@/lib/supabase-browser"
 *
 * Environment variables **must** be set in .env.local (or Vercel dashboard):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js"

// Fix: Create a placeholder Database type or comment it out until you generate types
export type Database = Record<string, any>

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY as string

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: { eventsPerSecond: 10 }
  }
})