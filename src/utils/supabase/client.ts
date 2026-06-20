// src/utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

// Add safe placeholder fallbacks so the Vercel compiler doesn't crash:
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );

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