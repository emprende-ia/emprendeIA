
'use client';

import { Firestore, doc, setDoc, onSnapshot, serverTimestamp, Timestamp, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, Storage } from 'firebase/storage';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { GenerateDigitalIdentityOutput } from '@/ai/flows/generate-digital-identity';

export interface BrandIdentity extends GenerateDigitalIdentityOutput {
  logoUrl: string | null;
  logoSource?: 'ai_generated' | 'user_uploaded' | null;
  updatedAt?: Date;
  logoSource?: 'ai_generated' | 'user_uploaded' | null;
}

export async function uploadLogo(storage: Storage, userId: string, dataUrl: string): Promise<string> {
    if (!userId) {
        throw new Error("User ID is required to upload a logo.");
    }
    const logoRef = ref(storage, `logos/${userId}/logo.png`);
    const snapshot = await uploadString(logoRef, dataUrl, 'data_url');
    return getDownloadURL(snapshot.ref);
}

export function saveBrandIdentity(
  firestore: Firestore,
  userId: string,
  identityData: Omit<BrandIdentity, 'updatedAt'>
): Promise<void> { // Return a promise
  if (!userId) {
    console.error("User ID is required to save brand identity.");
    return Promise.reject("User ID is required.");
  }
  
  const identityDoc = doc(firestore, `users/${userId}/brandIdentity`, 'main');
  const dataToSave = {
    ...identityData,
    updatedAt: serverTimestamp(),
  };

  return setDoc(identityDoc, dataToSave, { merge: true })
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: identityDoc.path,
        operation: 'write',
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      // Re-throw to allow the caller to handle it
      throw error;
    });
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

    