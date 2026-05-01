'use client';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { generateCampaignPlan, type CampaignPlan } from '@/ai/flows/generate-campaign-plan';
import type { TaskAudio } from '@/lib/supabase/database.types';

export const CampaignIdeaSchema = z.object({
  title: z.string().describe('A catchy title for the campaign idea.'),
  channel: z
    .string()
    .describe('The recommended marketing channel (e.g., Instagram, Email Marketing, Google Ads).'),
  keyMessage: z.string().describe('The core message of the campaign.'),
  targetAudience: z.string().describe('The specific audience this campaign should target.'),
});

export type CampaignIdea = z.infer<typeof CampaignIdeaSchema>;

export interface MarketingCampaign {
  id: string;
  createdAt: Date;
  campaignIdea: CampaignIdea;
  campaignPlan: CampaignPlan;
  completedTasks: string[];
  taskAudios?: TaskAudio[];
}

/**
 * Genera un plan detallado a partir de la idea y guarda la campaña completa.
 */
export async function saveCampaign(
  _firestore: unknown,
  userId: string,
  campaignIdea: CampaignIdea
): Promise<void> {
  if (!userId) throw new Error('User ID is required to save a campaign.');

  // 1) Generar plan detallado vía IA
  const campaignPlan = await generateCampaignPlan({
    campaignTitle: campaignIdea.title,
    campaignChannel: campaignIdea.channel,
    campaignMessage: campaignIdea.keyMessage,
    campaignAudience: campaignIdea.targetAudience,
  });

  if (!campaignPlan) throw new Error('Failed to generate a campaign plan from the AI service.');

  const supabase = createClient();
  const { error } = await supabase.from('marketing_campaigns').insert({
    user_id: userId,
    campaign_idea: campaignIdea as unknown as never,
    campaign_plan: campaignPlan as unknown as never,
    completed_tasks: [],
    task_audios: [],
  });

  if (error) {
    console.error('saveCampaign:', error.message);
    throw error;
  }
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(',');
  const mime = /data:([^;]+)/.exec(meta)?.[1] ?? 'audio/wav';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function saveTaskAudioForCampaign(
  _storage: unknown,
  _firestore: unknown,
  userId: string,
  campaignId: string,
  taskKey: string,
  audioDataUrl: string
): Promise<void> {
  if (!userId || !campaignId) throw new Error('User ID and Campaign ID are required.');

  const supabase = createClient();
  const safeKey = taskKey.replace(/\s+/g, '-');
  const path = `${userId}/audios/${safeKey}-${Date.now()}.wav`;

  const { error: upErr } = await supabase.storage
    .from('audios')
    .upload(path, dataUrlToBlob(audioDataUrl), {
      contentType: 'audio/wav',
      upsert: false,
    });
  if (upErr) {
    console.error('saveTaskAudioForCampaign upload:', upErr.message);
    throw upErr;
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from('audios')
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (signErr || !signed) {
    console.error('saveTaskAudioForCampaign signedUrl:', signErr?.message);
    throw signErr ?? new Error('Could not create signed URL.');
  }

  const { data: row, error: getErr } = await supabase
    .from('marketing_campaigns')
    .select('task_audios')
    .eq('id', campaignId)
    .eq('user_id', userId)
    .maybeSingle();

  if (getErr || !row) {
    console.error('saveTaskAudioForCampaign read:', getErr?.message);
    throw getErr ?? new Error('Campaign not found.');
  }

  const next: TaskAudio[] = [...(row.task_audios ?? []), { taskKey, audioUrl: signed.signedUrl }];

  const { error: updErr } = await supabase
    .from('marketing_campaigns')
    .update({ task_audios: next })
    .eq('id', campaignId)
    .eq('user_id', userId);

  if (updErr) {
    console.error('saveTaskAudioForCampaign update:', updErr.message);
    throw updErr;
  }
}

export async function toggleCampaignTaskCompletion(
  _firestore: unknown,
  userId: string,
  campaignId: string,
  taskDescription: string,
  isCompleted: boolean
): Promise<void> {
  if (!userId || !campaignId) return;
  const supabase = createClient();

  const { data: row, error } = await supabase
    .from('marketing_campaigns')
    .select('completed_tasks')
    .eq('id', campaignId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !row) {
    if (error) console.error('toggleCampaignTaskCompletion read:', error.message);
    return;
  }

  const set = new Set(row.completed_tasks ?? []);
  if (isCompleted) set.add(taskDescription);
  else set.delete(taskDescription);

  const { error: updErr } = await supabase
    .from('marketing_campaigns')
    .update({ completed_tasks: Array.from(set) })
    .eq('id', campaignId)
    .eq('user_id', userId);

  if (updErr) console.error('toggleCampaignTaskCompletion update:', updErr.message);
}

export function getMarketingCampaigns(
  _firestore: unknown,
  userId: string,
  onUpdate: (campaigns: MarketingCampaign[]) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const supabase = createClient();

  const fetchAll = async () => {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('id, campaign_idea, campaign_plan, completed_tasks, task_audios, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getMarketingCampaigns:', error.message);
      onUpdate([]);
      return;
    }

    onUpdate(
      (data ?? []).map((row) => ({
        id: row.id,
        createdAt: new Date(row.created_at),
        campaignIdea: row.campaign_idea as CampaignIdea,
        campaignPlan: row.campaign_plan as CampaignPlan,
        completedTasks: row.completed_tasks ?? [],
        taskAudios: row.task_audios ?? [],
      }))
    );
  };

  fetchAll();

  const channel = supabase
    .channel(`marketing_campaigns:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'marketing_campaigns',
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
