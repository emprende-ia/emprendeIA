'use client';

import { Firestore, collection, addDoc, doc, updateDoc, arrayUnion, arrayRemove, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { z } from 'zod';
import { generateCampaignPlan, type CampaignPlan } from '@/ai/flows/generate-campaign-plan';

export const CampaignIdeaSchema = z.object({
    title: z.string().describe('A catchy title for the campaign idea.'),
    channel: z.string().describe('The recommended marketing channel (e.g., Instagram, Email Marketing, Google Ads).'),
    keyMessage: z.string().describe('The core message of the campaign.'),
    targetAudience: z.string().describe('The specific audience this campaign should target.'),
});

// The schema definition is now primarily in the flow file.
// We can re-create the schema here for type safety in this file without exporting it.
const CampaignPlanSchema = z.object({
    strategy: z.string(),
    contentSuggestions: z.array(z.string()),
    actionableTasks: z.array(z.string()),
    kpis: z.array(z.string()),
});


export type CampaignIdea = z.infer<typeof CampaignIdeaSchema>;

export interface MarketingCampaign {
  id: string;
  createdAt: Date;
  campaignIdea: CampaignIdea;
  campaignPlan: CampaignPlan;
  completedTasks: string[];
  taskAudios?: { taskKey: string, audioUrl: string }[];
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

  if (!campaignPlan) {
    throw new Error("Failed to generate a campaign plan from the AI service.");
  }

  // Step 2: Save the complete campaign data to Firestore.
  const campaignsCollection = collection(firestore, `users/${userId}/marketingCampaigns`);
  const dataToSave = {
    createdAt: serverTimestamp(),
    campaignIdea,
    campaignPlan,
    completedTasks: [],
    taskAudios: [],
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
 * Uploads a base64 audio string to Firebase Storage and saves the download URL in Firestore.
 * @param storage - The Firebase Storage instance.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param campaignId - The ID of the marketing campaign.
 * @param taskKey - The unique identifier for the task.
 * @param audioDataUrl - The data URL of the generated audio (e.g., 'data:audio/wav;base64,...').
 */
export async function saveTaskAudioForCampaign(
  storage: FirebaseStorage,
  firestore: Firestore,
  userId: string,
  campaignId: string,
  taskKey: string,
  audioDataUrl: string
): Promise<void> {
  if (!userId || !campaignId) throw new Error("User ID and Campaign ID are required.");

  // 1. Upload to Storage
  const audioId = `${taskKey.replace(/\s+/g, '-')}-${Date.now()}.wav`;
  const storageRef = ref(storage, `users/${userId}/audios/${audioId}`);
  
  // The 'data_url' string format is used for base64-encoded strings with a data URL prefix
  const metadata = { contentType: 'audio/wav' };
  const uploadResult = await uploadString(storageRef, audioDataUrl, 'data_url');
  
  // 2. Get Download URL
  const downloadURL = await getDownloadURL(uploadResult.ref);

  // 3. Save URL to Firestore
  const campaignDoc = doc(firestore, `users/${userId}/marketingCampaigns`, campaignId);
  const audioData = { taskKey, audioUrl: downloadURL };
  const updateData = {
    taskAudios: arrayUnion(audioData),
  };

  try {
    await updateDoc(campaignDoc, updateData);
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: campaignDoc.path,
      operation: 'update',
      requestResourceData: updateData,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
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
        taskAudios: data.taskAudios || [],
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
