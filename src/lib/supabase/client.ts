import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

/**
 * True si las envs de Supabase están definidas en build. Los callers que
 * dependan de auth o datos deben gatear su lógica con esto y caer a modo
 * invitado si es false (ver `use-user.ts`).
 */
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

let warned = false;

/**
 * Cliente de Supabase para componentes de cliente (`'use client'`).
 * La sesión se mantiene en cookies, sincronizadas con el middleware.
 *
 * Si faltan envs (entorno mal configurado), devolvemos un cliente con
 * valores placeholder para que la construcción no truene y la app pueda
 * montarse en modo invitado. Cualquier llamada de red fallará, pero los
 * callers críticos deben gatear con `hasSupabaseEnv()` antes de usar.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (!warned && typeof window !== 'undefined') {
      warned = true;
      console.error(
        '[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
          'La app corre en modo invitado y auth/datos no funcionarán hasta configurar envs.'
      );
    }
    return createBrowserClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    );
  }
  return createBrowserClient<Database>(url, key);
}
