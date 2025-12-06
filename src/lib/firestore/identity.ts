
'use client';

import { Firestore, doc, setDoc, onSnapshot, serverTimestamp, Timestamp, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { GenerateBrandAssetsOutput } from '@/ai/flows/generate-brand-assets';

// This interface is now simplified to only include one standard logo URL.
export interface BrandIdentity extends Omit<GenerateBrandAssetsOutput, 'logoUrl' | 'logoSource'> {
  logoUrl: string | null;
  logoSource: 'ai_generated' | 'user_uploaded' | null;
  updatedAt?: Date;
}

/**
 * Saves or updates a user's brand identity in Firestore.
 * It uses a single document with a fixed ID 'main' for each user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param identityData - The brand identity data to save.
 */
export async function saveBrandIdentity(
  firestore: Firestore,
  userId: string,
  identityData: Omit<BrandIdentity, 'updatedAt'>
): Promise<void> { 
  if (!userId) {
    console.error("User ID is required to save brand identity.");
    return Promise.reject("User ID is required.");
  }
  
  const identityDoc = doc(firestore, `users/${userId}/brandIdentity`, 'main');
  const dataToSave = {
    ...identityData,
    updatedAt: serverTimestamp(),
  };

  try {
    // This will either create a new document or merge data into an existing one.
    // We pass the complete object to ensure all fields are updated.
    await setDoc(identityDoc, dataToSave, { merge: true });
  } catch (error) {
    const permissionError = new FirestorePermissionError({
        path: identityDoc.path,
        operation: 'write', 
        requestResourceData: dataToSave,
    });
    // For LLM-based error fixing, we emit a contextual error.
    errorEmitter.emit('permission-error', permissionError);
    // We also re-throw the error so the calling function can handle it.
    throw error;
  }
}

export function deleteBrandIdentity(firestore: Firestore, userId: string): void {
    if (!userId) {
        console.error("User ID is required to delete brand identity.");
        return;
    }
    const identityDoc = doc(firestore, `users/${userId}/brandIdentity`, 'main');

    deleteDoc(identityDoc)
        .catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: identityDoc.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
}

export function getBrandIdentity(
  firestore: Firestore,
  userId: string,
  onUpdate: (identity: BrandIdentity | null) => void
): () => void {
  if (!userId) {
      onUpdate(null);
      return () => {};
  }
  const identityDoc = doc(firestore, `users/${userId}/brandIdentity`, 'main');

  const unsubscribe = onSnapshot(identityDoc, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date();
      onUpdate({ ...data, updatedAt } as BrandIdentity);
    } else {
      onUpdate(null);
    }
  }, (error) => {
    const permissionError = new FirestorePermissionError({
      path: identityDoc.path,
      operation: 'get',
    });
    errorEmitter.emit('permission-error', permissionError);
    onUpdate(null);
  });

  return unsubscribe;
}
