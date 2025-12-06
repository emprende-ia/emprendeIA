
'use client';

import { Firestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { SuggestRelevantSuppliersOutput } from '@/ai/flows/suggest-relevant-suppliers';

export type SavedSupplierData = SuggestRelevantSuppliersOutput['suppliers'][0];

export interface SavedSupplier extends SavedSupplierData {
  id: string;
  savedAt: Date;
}

/**
 * Saves a supplier to the user's private list.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param supplierData - The supplier data to save.
 */
export async function saveSupplier(
  firestore: Firestore,
  userId: string,
  supplierData: SavedSupplierData
): Promise<void> {
  if (!userId) {
    return Promise.reject(new Error("User ID is required to save a supplier."));
  }
  const savedSuppliersCollection = collection(firestore, `users/${userId}/savedSuppliers`);
  const dataToSave = {
    ...supplierData,
    savedAt: serverTimestamp()
  };

  try {
    await addDoc(savedSuppliersCollection, dataToSave);
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: savedSuppliersCollection.path,
      operation: 'create',
      requestResourceData: dataToSave,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw error; // Re-throw the error for the calling function to handle
  }
}

/**
 * Retrieves all saved suppliers for a user in real-time.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param onUpdate - Callback function called with the updated list of saved suppliers.
 * @returns An unsubscribe function for the real-time listener.
 */
export function getSavedSuppliers(
  firestore: Firestore,
  userId: string,
  onUpdate: (suppliers: SavedSupplier[]) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }
  const savedSuppliersCollection = collection(firestore, `users/${userId}/savedSuppliers`);
  const q = query(savedSuppliersCollection, orderBy('savedAt', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const suppliers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const savedAt = data.savedAt instanceof Timestamp ? data.savedAt.toDate() : new Date();
      return {
        id: doc.id,
        ...data,
        savedAt,
      } as SavedSupplier;
    });
    onUpdate(suppliers);
  }, (error) => {
    const permissionError = new FirestorePermissionError({
      path: `users/${userId}/savedSuppliers`,
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    onUpdate([]);
  });

  return unsubscribe;
}
