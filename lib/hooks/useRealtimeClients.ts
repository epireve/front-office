import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function useRealtimeClients() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to all changes in the clients table
    const channel = supabase
      .channel('clients-channel')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'clients',
        },
        () => {
          // Refresh the current route
          router.refresh();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);
} 