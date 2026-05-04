import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * True si el usuario ya pasó por el onboarding (tiene al menos un análisis
 * de viabilidad guardado). Se usa para decidir post-login si mandarlo a
 * /start (primera vez) o directo a /dashboard (ya configurado).
 *
 * Funciona tanto con cliente browser como server (ambos exponen `from()`).
 * En caso de error de red/RLS retorna false para que el flujo caiga al
 * /start y el usuario no quede atrapado.
 */
export async function hasCompletedOnboarding(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  if (!userId) return false;
  const { data, error } = await supabase
    .from('viability_analyses')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('hasCompletedOnboarding:', error.message);
    return false;
  }
  return !!data;
}

/**
 * Devuelve la ruta a la que debe ir el usuario después de autenticarse,
 * cuando NO hay un `?next=` explícito (rutas protegidas pasan su propio next).
 */
export async function getDefaultPostAuthRoute(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<'/dashboard' | '/start'> {
  return (await hasCompletedOnboarding(supabase, userId)) ? '/dashboard' : '/start';
}
