
'use client';

import { Firestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface SearchHistory {
  id?: string;
  term: string;
  timestamp: Date;
  resultingKeywords?: string[];
}

/**
 * Saves a search history record for a specific user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param searchData - The search data to save.
 */
export function saveSearchHistory(
  firestore: Firestore,
  userId: string,
  searchData: Omit<SearchHistory, 'id' | 'timestamp'>
): void {
  const historyCollection = collection(firestore, `users/${userId}/searchHistory`);
  const dataToSave = {
    ...searchData,
    timestamp: serverTimestamp()
  };

  addDoc(historyCollection, dataToSave)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: historyCollection.path,
        operation: 'create',
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Retrieves the search history for a specific user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param count - The number of recent searches to retrieve.
 * @returns A promise that resolves to an array of search history records.
 */
export async function getSearchHistory(
  firestore: Firestore,
  userId: string,
  count: number = 10
): Promise<SearchHistory[]> {
  try {
    const historyCollection = collection(firestore, `users/${userId}/searchHistory`);
    const q = query(historyCollection, orderBy('timestamp', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Safely convert Firestore Timestamp to JS Date
      const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
      return {
        id: doc.id,
        term: data.term,
        timestamp: timestamp,
        resultingKeywords: data.resultingKeywords || [],
      };
    });
  } catch (error: any) {
      const historyCollectionPath = `users/${userId}/searchHistory`;
       const permissionError = new FirestorePermissionError({
        path: historyCollectionPath,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      return []; // Return empty array on error
  }
}
