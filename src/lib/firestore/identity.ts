'use client';

import { createClient } from '@/lib/supabase/client';
import type { ColorSwatch } from '@/lib/supabase/database.types';

export interface BrandIdentity {
  brandName: string;
  slogan: string;
  colorPalette: ColorSwatch[];
  logoPrompt: string;
  logoUrl: string | null;
  logoSource: 'ai_generated' | 'user_uploaded' | null;
  updatedAt?: Date;
}

export const BRAND_IDENTITY_UPDATED_EVENT = 'brandIdentityUpdated';

function dispatchBrandIdentityUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(BRAND_IDENTITY_UPDATED_EVENT));
  }
}

/**
 * Guarda/actualiza la identidad de marca del usuario (1 fila por usuario,
 * PK = user_id). Usa upsert para crear si no existe, actualizar si sí.
 *
 * Espera al upsert (Promise) para que el caller sepa cuándo se completó, y
 * dispara `brandIdentityUpdated` para que header/dashboard refresquen sin
 * depender de Realtime.
 */
export async function saveBrandIdentity(
  _firestore: unknown,
  userId: string,
  identityData: Omit<BrandIdentity, 'updatedAt'>
): Promise<void> {
  if (!userId) return;

  const supabase = createClient();
  const { error } = await supabase.from('brand_identities').upsert(
    {
      user_id: userId,
      brand_name: identityData.brandName,
      slogan: identityData.slogan,
      color_palette: identityData.colorPalette,
      logo_prompt: identityData.logoPrompt,
      logo_url: identityData.logoUrl,
      logo_source: identityData.logoSource,
    },
    { onConflict: 'user_id' }
  );
  if (error) {
    console.error('saveBrandIdentity:', error.message);
    throw new Error(error.message);
  }
  dispatchBrandIdentityUpdated();
}

export async function deleteBrandIdentity(
  _firestore: unknown,
  userId: string
): Promise<void> {
  if (!userId) return;
  const supabase = createClient();
  const { error } = await supabase
    .from('brand_identities')
    .delete()
    .eq('user_id', userId);
  if (error) {
    console.error('deleteBrandIdentity:', error.message);
    return;
  }
  dispatchBrandIdentityUpdated();
}

export function getBrandIdentity(
  _firestore: unknown,
  userId: string,
  onUpdate: (identity: BrandIdentity | null) => void
): () => void {
  if (!userId) {
    onUpdate(null);
    return () => {};
  }

  const supabase = createClient();

  const fetchOne = async () => {
    const { data, error } = await supabase
      .from('brand_identities')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('getBrandIdentity:', error.message);
      onUpdate(null);
      return;
    }
    if (!data) {
      onUpdate(null);
      return;
    }
    onUpdate({
      brandName: data.brand_name,
      slogan: data.slogan ?? '',
      colorPalette: data.color_palette,
      logoPrompt: data.logo_prompt ?? '',
      logoUrl: data.logo_url,
      logoSource: data.logo_source,
      updatedAt: new Date(data.updated_at),
    });
  };

  fetchOne();

  // Sufijo único por suscriptor: si dos componentes (Dashboard + AppHeader)
  // llaman getBrandIdentity con el mismo userId, sin sufijo Supabase reusa el
  // channel y el segundo .on() falla con "cannot add postgres_changes callbacks
  // after subscribe()".
  const channel = supabase
    .channel(`brand_identities:${userId}:${Math.random().toString(36).slice(2)}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'brand_identities',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        fetchOne();
      }
    )
    .subscribe();

  // Backup local: si Realtime no está habilitado para `brand_identities`, el
  // evento manual disparado por save/delete sigue refrescando los consumers.
  const onManualUpdate = () => {
    fetchOne();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener(BRAND_IDENTITY_UPDATED_EVENT, onManualUpdate);
  }

  return () => {
    supabase.removeChannel(channel);
    if (typeof window !== 'undefined') {
      window.removeEventListener(BRAND_IDENTITY_UPDATED_EVENT, onManualUpdate);
    }
  };
}
