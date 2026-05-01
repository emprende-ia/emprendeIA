'use client';

import { createClient } from '@/lib/supabase/client';
import type { GenerateActionPlanOutput } from '@/ai/flows/generate-action-plan';
import type { TaskAudio } from '@/lib/supabase/database.types';

export interface LearningPath {
  id: string;
  createdAt: Date;
  pathData: GenerateActionPlanOutput;
  completedTasks: string[];
  taskAudios?: TaskAudio[];
}

export function saveLearningPath(
  _firestore: unknown,
  userId: string,
  pathData: GenerateActionPlanOutput
): void {
  if (!userId) return;
  const supabase = createClient();
  void supabase
    .from('learning_paths')
    .insert({
      user_id: userId,
      path_data: pathData as unknown as never,
      completed_tasks: [],
      task_audios: [],
    })
    .then(({ error }) => {
      if (error) console.error('saveLearningPath:', error.message);
    });
}

/**
 * Convierte un data URL (base64) a Blob.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(',');
  const mime = /data:([^;]+)/.exec(meta)?.[1] ?? 'audio/wav';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function saveTaskAudioForPath(
  _storage: unknown,
  _firestore: unknown,
  userId: string,
  pathId: string,
  taskKey: string,
  audioDataUrl: string
): Promise<void> {
  if (!userId || !pathId) throw new Error('User ID and Path ID are required.');

  const supabase = createClient();
  const safeKey = taskKey.replace(/\s+/g, '-');
  const path = `${userId}/audios/${safeKey}-${Date.now()}.wav`;

  // 1) Subir a Storage
  const { error: upErr } = await supabase.storage
    .from('audios')
    .upload(path, dataUrlToBlob(audioDataUrl), {
      contentType: 'audio/wav',
      upsert: false,
    });
  if (upErr) {
    console.error('saveTaskAudioForPath upload:', upErr.message);
    throw upErr;
  }

  // 2) Signed URL (bucket privado)
  const { data: signed, error: signErr } = await supabase.storage
    .from('audios')
    .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 año

  if (signErr || !signed) {
    console.error('saveTaskAudioForPath signedUrl:', signErr?.message);
    throw signErr ?? new Error('Could not create signed URL.');
  }

  // 3) Append al jsonb task_audios
  const { data: row, error: getErr } = await supabase
    .from('learning_paths')
    .select('task_audios')
    .eq('id', pathId)
    .eq('user_id', userId)
    .maybeSingle();

  if (getErr || !row) {
    console.error('saveTaskAudioForPath read:', getErr?.message);
    throw getErr ?? new Error('Path not found.');
  }

  const next: TaskAudio[] = [...(row.task_audios ?? []), { taskKey, audioUrl: signed.signedUrl }];

  const { error: updErr } = await supabase
    .from('learning_paths')
    .update({ task_audios: next })
    .eq('id', pathId)
    .eq('user_id', userId);

  if (updErr) {
    console.error('saveTaskAudioForPath update:', updErr.message);
    throw updErr;
  }
}

export async function toggleTaskCompletion(
  _firestore: unknown,
  userId: string,
  pathId: string,
  taskTitle: string,
  isCompleted: boolean
): Promise<void> {
  if (!userId || !pathId) return;
  const supabase = createClient();

  const { data: row, error } = await supabase
    .from('learning_paths')
    .select('completed_tasks')
    .eq('id', pathId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !row) {
    if (error) console.error('toggleTaskCompletion read:', error.message);
    return;
  }

  const set = new Set(row.completed_tasks ?? []);
  if (isCompleted) set.add(taskTitle);
  else set.delete(taskTitle);

  const { error: updErr } = await supabase
    .from('learning_paths')
    .update({ completed_tasks: Array.from(set) })
    .eq('id', pathId)
    .eq('user_id', userId);

  if (updErr) console.error('toggleTaskCompletion update:', updErr.message);
}

export function getLearningPaths(
  _firestore: unknown,
  userId: string,
  onUpdate: (paths: LearningPath[]) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const supabase = createClient();

  const fetchAll = async () => {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('id, path_data, completed_tasks, task_audios, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getLearningPaths:', error.message);
      onUpdate([]);
      return;
    }

    onUpdate(
      (data ?? []).map((row) => ({
        id: row.id,
        createdAt: new Date(row.created_at),
        pathData: row.path_data as GenerateActionPlanOutput,
        completedTasks: row.completed_tasks ?? [],
        taskAudios: row.task_audios ?? [],
      }))
    );
  };

  fetchAll();

  const channel = supabase
    .channel(`learning_paths:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'learning_paths',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        fetchAll();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
