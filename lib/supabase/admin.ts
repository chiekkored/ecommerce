import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

/**
 * Supabase Admin Client using the Service Role Key.
 * ONLY use this in Server Components, Server Actions, or API Routes.
 * Never expose the Service Role Key to the client.
 */
export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
