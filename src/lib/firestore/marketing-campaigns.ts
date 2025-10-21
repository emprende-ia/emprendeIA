
'use client';

import { Firestore, collection, addDoc, doc, updateDoc, arrayUnion, arrayRemove, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { z } from 'zod';
import { generateCampaignPlan } from '@/ai/flows/generate-campaign-plan';

export const CampaignIdeaSchema = z.object({
    title: z.string().describe('A catchy title for the campaign idea.'),
    channel: z.string().describe('The recommended marketing channel (e.g., Instagram, Email Marketing, Google Ads).'),
    keyMessage: z.string().describe('The core message of the campaign.'),
    targetAudience: z.string().describe('The specific audience this campaign should target.'),
});

export const CampaignPlanSchema = z.object({
    strategy: z.string().describe("A brief, one-paragraph summary of the overall strategy for this campaign."),
    contentSuggestions: z.array(z.string()).describe("A list of 3-5 specific content ideas to create for this campaign (e.g., 'Un Reel mostrando el proceso artesanal', 'Un carrusel con testimonios de clientes')."),
    actionableTasks: z.array(z.string()).describe("A list of 5-7 concrete, actionable tasks to execute the campaign (e.g., 'Definir paleta de colores para la campaña', 'Escribir 3 borradores de copy para anuncios', 'Contactar a 2 micro-influencers')."),
    kpis: z.array(z.string()).describe("A list of 2-3 key performance indicators (KPIs) to measure the campaign's success (e.g., 'Tasa de interacción', 'Número de seguidores nuevos', 'Ventas generadas desde el link en bio')."),
});

export type CampaignIdea = z.infer<typeof CampaignIdeaSchema>;
export type CampaignPlan = z.infer<typeof CampaignPlanSchema>;

export interface MarketingCampaign {
  id: string;
  createdAt: Date;
  campaignIdea: CampaignIdea;
  campaignPlan: CampaignPlan;
  completedTasks: string[];
}

/**
 * Saves a new marketing campaign and generates its detailed action plan.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param campaignIdea - The initial campaign idea to save and expand.
 */
export async function saveCampaign(
  firestore: Firestore,
  userId: string,
  campaignIdea: CampaignIdea
): Promise<void> {
  if (!userId) {
    throw new Error("User ID is required to save a campaign.");
  }

  // Step 1: Generate the detailed campaign plan from the idea.
  const campaignPlan = await generateCampaignPlan({
      campaignTitle: campaignIdea.title,
      campaignChannel: campaignIdea.channel,
      campaignMessage: campaignIdea.keyMessage,
      campaignAudience: campaignIdea.targetAudience,
  });

  // Step 2: Save the complete campaign data to Firestore.
  const campaignsCollection = collection(firestore, `users/${userId}/marketingCampaigns`);
  const dataToSave = {
    createdAt: serverTimestamp(),
    campaignIdea,
    campaignPlan,
    completedTasks: [],
  };

  try {
    await addDoc(campaignsCollection, dataToSave);
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: campaignsCollection.path,
      operation: 'create',
      requestResourceData: dataToSave,
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw the original error to be caught by the caller
    throw error;
  }
}

/**
 * Toggles the completion status of a task within a specific campaign.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param campaignId - The ID of the campaign.
 * @param taskDescription - The description of the task to toggle.
 * @param isCompleted - The new completion status.
 */
export function toggleCampaignTaskCompletion(
  firestore: Firestore,
  userId: string,
  campaignId: string,
  taskDescription: string,
  isCompleted: boolean
): void {
  if (!userId || !campaignId) return;
  const campaignDoc = doc(firestore, `users/${userId}/marketingCampaigns`, campaignId);
  const updateData = {
    completedTasks: isCompleted ? arrayUnion(taskDescription) : arrayRemove(taskDescription),
  };

  updateDoc(campaignDoc, updateData)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: campaignDoc.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Retrieves all saved marketing campaigns for a user in real-time.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param onUpdate - Callback function called with the updated list of campaigns.
 * @returns An unsubscribe function for the real-time listener.
 */
export function getMarketingCampaigns(
  firestore: Firestore,
  userId: string,
  onUpdate: (campaigns: MarketingCampaign[]) => void
): () => void {
  if (!userId) {
      onUpdate([]);
      return () => {};
  }
  const campaignsCollection = collection(firestore, `users/${userId}/marketingCampaigns`);
  const q = query(campaignsCollection, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const campaigns = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
      return {
        id: doc.id,
        createdAt,
        campaignIdea: data.campaignIdea,
        campaignPlan: data.campaignPlan,
        completedTasks: data.completedTasks || [],
      } as MarketingCampaign;
    });
    onUpdate(campaigns);
  }, (error) => {
    const permissionError = new FirestorePermissionError({
      path: `users/${userId}/marketingCampaigns`,
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    onUpdate([]);
  });

  return unsubscribe;
}
