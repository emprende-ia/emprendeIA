
'use client';

import { Firestore, collection, addDoc, query, orderBy, limit, serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface Transaction {
  id?: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string; // Optional for now
  timestamp: Date;
}

/**
 * Saves a financial transaction for a specific user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param transactionData - The transaction data to save.
 */
export function saveTransaction(
  firestore: Firestore,
  userId: string,
  transactionData: Omit<Transaction, 'id' | 'timestamp'>
): void {
  if (!userId) {
    console.error("User ID is required to save a transaction.");
    return;
  }
  const transactionsCollection = collection(firestore, `users/${userId}/transactions`);
  const dataToSave = {
    ...transactionData,
    timestamp: serverTimestamp()
  };

  addDoc(transactionsCollection, dataToSave)
    .catch((error) => {
      console.error("Error saving transaction: ", error);
      const permissionError = new FirestorePermissionError({
        path: transactionsCollection.path,
        operation: 'create',
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Retrieves transactions for a specific user in real-time.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param count - The number of recent transactions to retrieve.
 * @param onUpdate - Callback function to be called with the new transaction data.
 * @returns An unsubscribe function for the real-time listener.
 */
export function getTransactions(
  firestore: Firestore,
  userId: string,
  count: number = 20,
  onUpdate: (transactions: Transaction[]) => void
): () => void {
  const transactionsCollection = collection(firestore, `users/${userId}/transactions`);
  const q = query(transactionsCollection, orderBy('timestamp', 'desc'), limit(count));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const transactions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
      return {
        id: doc.id,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category || 'Sin categoría',
        timestamp: timestamp,
      } as Transaction;
    });
    onUpdate(transactions);
  }, (error) => {
    const transactionsCollectionPath = `users/${userId}/transactions`;
    const permissionError = new FirestorePermissionError({
      path: transactionsCollectionPath,
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    console.error("Error getting transactions:", error);
    onUpdate([]); // Return empty array on error
  });

  return unsubscribe;
}
