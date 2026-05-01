import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

/**
 * Cliente de Supabase para componentes de cliente (`'use client'`).
 * La sesión se mantiene en cookies, sincronizadas con el middleware.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
