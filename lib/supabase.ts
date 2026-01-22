import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/use-auth";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase credentials");
}

/**
 * Supabase client instance
 * Used for database queries, real-time subscriptions, and file storage
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

/**
 * Hook to get authenticated Supabase client
 * Automatically includes user ID in queries
 */
export function useSupabase() {
  const { user } = useAuth();

  return {
    client: supabase,
    userId: user?.id,
  };
}
