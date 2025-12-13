
'use client';

import { Firestore, collection, addDoc, doc, updateDoc, arrayUnion, arrayRemove, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { GenerateActionPlanOutput } from '@/ai/flows/generate-action-plan';

export interface LearningPath {
  id: string;
  createdAt: Date;
  pathData: GenerateActionPlanOutput;
  completedTasks: string[];
}

/**
 * Saves a new learning path for a specific user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param pathData - The generated learning path data to save.
 */
export function saveLearningPath(
  firestore: Firestore,
  userId: string,
  pathData: GenerateActionPlanOutput
): void {
  if (!userId) {
    console.error("User ID is required to save a learning path.");
    return;
  }
  const pathsCollection = collection(firestore, `users/${userId}/learningPaths`);
  const dataToSave = {
    createdAt: serverTimestamp(),
    pathData: pathData,
    completedTasks: [],
  };

  addDoc(pathsCollection, dataToSave)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: pathsCollection.path,
        operation: 'create',
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Toggles the completion status of a task within a specific learning path.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param pathId - The ID of the learning path.
 * @param taskTitle - The title of the task to toggle.
 * @param isCompleted - The new completion status.
 */
export function toggleTaskCompletion(
  firestore: Firestore,
  userId: string,
  pathId: string,
  taskTitle: string,
  isCompleted: boolean
): void {
  if (!userId || !pathId) return;
  const pathDoc = doc(firestore, `users/${userId}/learningPaths`, pathId);
  const updateData = {
    completedTasks: isCompleted ? arrayUnion(taskTitle) : arrayRemove(taskTitle),
  };

  updateDoc(pathDoc, updateData)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: pathDoc.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Retrieves all saved learning paths for a user in real-time.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param onUpdate - Callback function called with the updated list of paths.
 * @returns An unsubscribe function for the real-time listener.
 */
export function getLearningPaths(
  firestore: Firestore,
  userId: string,
  onUpdate: (paths: LearningPath[]) => void
): () => void {
  if (!userId) {
      onUpdate([]);
      return () => {};
  }
  const pathsCollection = collection(firestore, `users/${userId}/learningPaths`);
  const q = query(pathsCollection, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const paths = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
      return {
        id: doc.id,
        createdAt: createdAt,
        pathData: data.pathData,
        completedTasks: data.completedTasks || [],
      } as LearningPath;
    });
    onUpdate(paths);
  }, (error) => {
    const permissionError = new FirestorePermissionError({
      path: `users/${userId}/learningPaths`,
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    onUpdate([]);
  });

  return unsubscribe;
}
