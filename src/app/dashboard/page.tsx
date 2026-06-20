// src/app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '../../utils/supabase/client';
import Dashboard from '../../components/Dashboard';
import Auth from '../../components/Auth';
import NeonBackground from '../../components/NeonBackground';

// Forces Next.js to skip pre-rendering this page during Vercel builds:
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession({
        user: {
          id: 'local-sandbox-profile',
          email: 'guest-operator@garage.com'
        }
      });
      setLoading(false);
      return;
    }

    // Instantiate Browser Client
    const supabase = createClient();

    // Fetch active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen to real-time auth cookie updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a16]">
        <div className="relative w-12 h-12 rounded-full border-2 border-t-neonCyan border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <NeonBackground />
      <main className="min-h-screen">
        {session ? (
          <Dashboard session={session} />
        ) : (
          <Auth />
        )}
      </main>
    </>
  );
}