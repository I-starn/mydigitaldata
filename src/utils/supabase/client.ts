// src/utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );

// ==========================================
// Added helper exports needed for the Dashboard:
// ==========================================

export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export interface ServiceRecord {
  id?: string;
  user_id?: string;
  client_name: string;
  client_contact: string;
  service_type: string;
  description: string;
  price: number;
  cost: number;
  service_date: string;
  next_service_date?: string | null;
}