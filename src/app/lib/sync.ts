// src/app/lib/sync.ts
import { createClient, isSupabaseConfigured, ServiceRecord } from '../../utils/supabase/client';

const CACHE_KEY = 'garage_services_cache';
const supabase = createClient();

export const getCachedServices = (): ServiceRecord[] => {
  if (typeof window === 'undefined') return [];
  const cached = localStorage.getItem(CACHE_KEY);
  return cached ? JSON.parse(cached) : [];
};

export const setCachedServices = (data: ServiceRecord[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  }
};

export const fetchAndSyncServices = async (userId: string): Promise<ServiceRecord[]> => {
  if (!isSupabaseConfigured) {
    return getCachedServices();
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', userId)
      .order('service_date', { ascending: false });

    if (error) throw error;

    if (data) {
      setCachedServices(data);
      return data;
    }
  } catch (err) {
    console.error('Network sync failed, loading from local cache:', err);
  }
  return getCachedServices();
};