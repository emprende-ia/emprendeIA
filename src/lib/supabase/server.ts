import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

/**
 * Cliente de Supabase para Server Components, Route Handlers y Server Actions.
 * Usa cookies de Next.js para mantener la sesión.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Llamado desde un Server Component: no se puede escribir cookie.
            // El middleware se encarga de refrescar la sesión.
          }
        },
      },
    }
  );
}

/**
 * Cliente con service_role key — solo para operaciones administrativas
 * desde el servidor (webhooks Stripe, jobs, scripts). NUNCA exponer al cliente.
 */
export function createAdminClient() {
  // Import dinámico para no incluir supabase-js en el bundle del cliente.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient: createSupabaseClient } =
    require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
