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

/**
 * Guarda/actualiza la identidad de marca del usuario (1 fila por usuario,
 * PK = user_id). Usa upsert para crear si no existe, actualizar si sí.
 */
export function saveBrandIdentity(
  _firestore: unknown,
  userId: string,
  identityData: Omit<BrandIdentity, 'updatedAt'>
): void {
  if (!userId) return;

  const supabase = createClient();
  void (async () => {
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
    if (error) console.error('saveBrandIdentity:', error.message);
  })();
}

export function deleteBrandIdentity(_firestore: unknown, userId: string): void {
  if (!userId) return;
  const supabase = createClient();
  void supabase
    .from('brand_identities')
    .delete()
    .eq('user_id', userId)
    .then(({ error }) => {
      if (error) console.error('deleteBrandIdentity:', error.message);
    });
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

  const channel = supabase
    .channel(`brand_identities:${userId}`)
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

  return () => {
    supabase.removeChannel(channel);
  };
}
