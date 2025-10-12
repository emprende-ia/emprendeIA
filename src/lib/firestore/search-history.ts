
'use client';

import { Firestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';

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
export async function saveSearchHistory(
  firestore: Firestore,
  userId: string,
  searchData: Omit<SearchHistory, 'id' | 'timestamp'>
): Promise<void> {
  try {
    const historyCollection = collection(firestore, `users/${userId}/searchHistory`);
    await addDoc(historyCollection, {
        ...searchData,
        timestamp: serverTimestamp() // Use server timestamp for consistency
    });
  } catch (error) {
    console.error("Error saving search history: ", error);
    // Optionally re-throw or handle the error as needed
    throw error;
  }
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
  } catch (error) {
    console.error("Error getting search history: ", error);
    // Optionally re-throw or handle the error as needed
    return []; // Return empty array on error
  }
}
