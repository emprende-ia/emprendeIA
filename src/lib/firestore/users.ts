'use client';

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * En Supabase el profile se crea automáticamente vía trigger SQL
 * `handle_new_user` cuando se inserta una fila en `auth.users`. Esta función
 * se mantiene por compatibilidad con los callers existentes — solo asegura
 * que los datos de `additionalData` (full_name, age, etc.) se mergen al
 * profile recién creado.
 */
export async function getOrCreateUserProfile(
  _firestore: unknown,
  user: { id?: string; uid?: string; email?: string | null; displayName?: string | null } | null,
  additionalData: Record<string, unknown> = {}
): Promise<void> {
  const userId = user?.id ?? user?.uid;
  if (!userId) return;

  const supabase = createClient();

  // Mapeo flexible: aceptamos camelCase del frontend y lo convertimos a snake_case
  const updates: ProfileUpdate = {};
  if (additionalData.fullName) updates.full_name = additionalData.fullName as string;
  if (additionalData.full_name) updates.full_name = additionalData.full_name as string;
  if (additionalData.username) updates.username = additionalData.username as string;
  if (additionalData.age !== undefined) updates.age = additionalData.age as number;
  if (user?.displayName && !updates.full_name) updates.full_name = user.displayName;

  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) console.error('getOrCreateUserProfile update:', error.message);
}
