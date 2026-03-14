
'use client';

import { Firestore, doc, setDoc, onSnapshot, serverTimestamp, Timestamp, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export interface BrandIdentity {
  brandName: string;
  slogan: string;
  colorPalette: Array<{ hex: string; name: string }>;
  logoPrompt: string;
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
export function saveBrandIdentity(
  firestore: Firestore,
  userId: string,
  identityData: Omit<BrandIdentity, 'updatedAt'>
): void { 
  if (!userId) return;
  
  const identityDoc = doc(firestore, `users/${userId}/brandIdentity`, 'main');
  const dataToSave = {
    ...identityData,
    updatedAt: serverTimestamp(),
  };

  // Do not await mutation to allow instant cache updates
  setDoc(identityDoc, dataToSave, { merge: true }).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
        path: identityDoc.path,
        operation: 'write', 
        requestResourceData: dataToSave,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Deletes the brand identity for a user.
 */
export function deleteBrandIdentity(firestore: Firestore, userId: string): void {
    if (!userId) return;
    const identityDoc = doc(firestore, `users/${userId}/brandIdentity`, 'main');

    deleteDoc(identityDoc)
        .catch(async (error) => {
            const permissionError = new FirestorePermissionError({
                path: identityDoc.path,
                operation: 'delete',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}

/**
 * Retrieves the brand identity for a user in real-time.
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
  }, async (error) => {
    const permissionError = new FirestorePermissionError({
      path: identityDoc.path,
      operation: 'get',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
    onUpdate(null);
  });

  return unsubscribe;
}
