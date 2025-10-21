
'use client';

import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface Transaction {
  id?: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  timestamp: Date;
}

type NewTransactionData = Omit<Transaction, 'id' | 'timestamp'>;

/**
 * Saves a new financial transaction for a specific user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param transactionData - The transaction data to save.
 */
export function addTransaction(
  firestore: Firestore,
  userId: string,
  transactionData: NewTransactionData
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
      const permissionError = new FirestorePermissionError({
        path: transactionsCollection.path,
        operation: 'create',
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Updates an existing financial transaction for a specific user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param transactionId - The ID of the transaction to update.
 * @param transactionData - The new data for the transaction.
 */
export function updateTransaction(
  firestore: Firestore,
  userId: string,
  transactionId: string,
  transactionData: NewTransactionData
): void {
  if (!userId || !transactionId) return;
  const transactionDoc = doc(firestore, `users/${userId}/transactions`, transactionId);

  updateDoc(transactionDoc, transactionData)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: transactionDoc.path,
        operation: 'update',
        requestResourceData: transactionData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}


/**
 * Deletes a financial transaction for a specific user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param transactionId - The ID of the transaction to delete.
 */
export function deleteTransaction(
  firestore: Firestore,
  userId: string,
  transactionId: string
): void {
  if (!userId || !transactionId) return;
  const transactionDoc = doc(firestore, `users/${userId}/transactions`, transactionId);
  
  deleteDoc(transactionDoc)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: transactionDoc.path,
        operation: 'delete',
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
  count: number = 50,
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
    onUpdate([]); // Return empty array on error
  });

  return unsubscribe;
}
