
'use client';

import { Firestore, doc, setDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { GenerateDigitalIdentityOutput } from '@/ai/flows/generate-digital-identity';

// This combines the AI output with fields we will add, like the logo URL.
export interface BrandIdentity extends GenerateDigitalIdentityOutput {
  logoUrl: string | null;
  updatedAt?: Date;
}

/**
 * Saves or updates a user's brand identity in Firestore.
 * It uses a single document with a fixed ID 'main' for each user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param identityData - The brand identity data to save.
 */
export function saveBrandIdentity(
  firestore: Firestore,
  userId: string,
  identityData: Omit<BrandIdentity, 'updatedAt'>
): void {
  if (!userId) {
    console.error("User ID is required to save brand identity.");
    return;
  }
  
  // We use a fixed document ID 'main' to ensure there's only one identity doc per user.
  const identityDoc = doc(firestore, `users/${userId}/brandIdentity`, 'main');
  const dataToSave = {
    ...identityData,
    updatedAt: serverTimestamp(),
  };

  setDoc(identityDoc, dataToSave, { merge: true })
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: identityDoc.path,
        operation: 'write', // 'set' with merge is effectively a write/update
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Retrieves a user's brand identity from Firestore in real-time.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param onUpdate - Callback function called with the brand identity data.
 * @returns An unsubscribe function for the real-time listener.
 */
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
