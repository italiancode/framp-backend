import { createClient } from "@supabase/supabase-js";

// Use the public anon key for client-side supabase instance
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create the client with the public anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// For admin operations that need service role (to be used ONLY on server-side)
export const createAdminClient = () => {
  if (typeof window !== 'undefined') {
    console.error('createAdminClient should never be called on the client side');
    return supabase; // Return regular client on browser for safety
  }
  
  const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
