'use client';

import { createClient } from '@/lib/supabase/client';
import type { AnalyzeBusinessIdeaOutput } from '@/ai/flows/analyze-business-idea';
import type { AnalyzeExistingBusinessOutput } from '@/ai/flows/analyze-existing-business';

export type ViabilityAnalysis = AnalyzeBusinessIdeaOutput | AnalyzeExistingBusinessOutput;

export interface SavedAnalysis {
  id: 'latest';
  analysis: ViabilityAnalysis;
  type: 'new-venture' | 'existing-venture';
  savedAt: Date;
}

/**
 * Guarda/actualiza el último análisis de viabilidad del usuario.
 * El primer parámetro existe por compatibilidad con la firma anterior (Firestore);
 * Supabase usa su propio cliente.
 */
export function saveViabilityAnalysis(
  _firestore: unknown,
  userId: string,
  analysisData: ViabilityAnalysis,
  type: 'new-venture' | 'existing-venture'
): void {
  if (!userId) return;
  const supabase = createClient();

  // Eliminamos análisis anteriores y guardamos el nuevo (siempre 1 vigente).
  void (async () => {
    await supabase.from('viability_analyses').delete().eq('user_id', userId);
    const { error } = await supabase.from('viability_analyses').insert({
      user_id: userId,
      type,
      analysis: analysisData as unknown as never,
    });
    if (error) console.error('saveViabilityAnalysis:', error.message);
  })();
}

/**
 * Suscripción al último análisis de viabilidad. Devuelve una función para
 * desuscribirse del canal de Realtime.
 */
export function getViabilityAnalysis(
  _firestore: unknown,
  userId: string,
  onUpdate: (savedAnalysis: SavedAnalysis | null) => void
): () => void {
  if (!userId) {
    onUpdate(null);
    return () => {};
  }

  const supabase = createClient();

  // 1) Fetch inicial
  const fetchLatest = async () => {
    const { data, error } = await supabase
      .from('viability_analyses')
      .select('analysis, type, saved_at')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('getViabilityAnalysis:', error.message);
      onUpdate(null);
      return;
    }
    if (!data) {
      onUpdate(null);
      return;
    }
    onUpdate({
      id: 'latest',
      analysis: data.analysis as ViabilityAnalysis,
      type: data.type,
      savedAt: new Date(data.saved_at),
    });
  };

  fetchLatest();

  // 2) Realtime: cualquier cambio en filas del usuario → re-fetch
  const channel = supabase
    .channel(`viability_analyses:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'viability_analyses',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        fetchLatest();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
