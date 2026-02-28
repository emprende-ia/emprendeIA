
'use client';

import { Firestore, doc, setDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import type { AnalyzeBusinessIdeaOutput } from '@/ai/flows/analyze-business-idea';
import type { AnalyzeExistingBusinessOutput } from '@/ai/flows/analyze-existing-business';

// A union type for any possible analysis result
export type ViabilityAnalysis = AnalyzeBusinessIdeaOutput | AnalyzeExistingBusinessOutput;

export interface SavedAnalysis {
  id: 'latest'; // Using a singleton document
  analysis: ViabilityAnalysis;
  type: 'new-venture' | 'existing-venture';
  savedAt: Date;
}

/**
 * Saves or updates a user's latest viability analysis in Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param analysisData - The analysis data to save.
 */
export function saveViabilityAnalysis(
  firestore: Firestore,
  userId: string,
  analysisData: ViabilityAnalysis,
  type: 'new-venture' | 'existing-venture'
): void { 
  if (!userId) return;
  
  const analysisDocRef = doc(firestore, `users/${userId}/viabilityAnalysis`, 'latest');
  const dataToSave = {
    analysis: analysisData,
    type,
    savedAt: serverTimestamp(),
  };

  // Do not await the mutation to allow instant cache updates
  setDoc(analysisDocRef, dataToSave).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
        path: analysisDocRef.path,
        operation: 'write', 
        requestResourceData: dataToSave,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Retrieves the latest saved viability analysis for a user in real-time.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param onUpdate - Callback function called with the saved analysis.
 * @returns An unsubscribe function for the real-time listener.
 */
export function getViabilityAnalysis(
  firestore: Firestore,
  userId: string,
  onUpdate: (savedAnalysis: SavedAnalysis | null) => void
): () => void {
  if (!userId) {
      onUpdate(null);
      return () => {};
  }
  const analysisDocRef = doc(firestore, `users/${userId}/viabilityAnalysis`, 'latest');

  const unsubscribe = onSnapshot(analysisDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const savedAt = data.savedAt instanceof Timestamp ? data.savedAt.toDate() : new Date();
      onUpdate({ ...data, id: 'latest', savedAt } as SavedAnalysis);
    } else {
      onUpdate(null);
    }
  }, async (error) => {
    const permissionError = new FirestorePermissionError({
      path: analysisDocRef.path,
      operation: 'get',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
    onUpdate(null);
  });

  return unsubscribe;
}
