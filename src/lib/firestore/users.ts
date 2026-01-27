
'use client';

import { Firestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Checks if a user profile exists in Firestore. If not, it creates one.
 * This ensures every user has a corresponding document in the 'users' collection.
 *
 * @param firestore - The Firestore instance.
 * @param user - The Firebase Auth User object.
 * @param additionalData - Optional additional data to merge into the profile, typically on registration.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export async function getOrCreateUserProfile(
  firestore: Firestore,
  user: User,
  additionalData: Record<string, any> = {}
): Promise<void> {
  if (!user) return;

  const userDocRef = doc(firestore, 'users', user.uid);

  try {
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      // Document doesn't exist, so create it.
      const { displayName, email, photoURL } = user;
      const dataToSet = {
        displayName: displayName || email?.split('@')[0],
        email,
        photoURL,
        createdAt: serverTimestamp(),
        plan: 'básico',
        planStatus: 'inactive',
        ...additionalData,
      };

      try {
        await setDoc(userDocRef, dataToSet);
      } catch (writeError) {
        console.error("Error creating user profile:", writeError);
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: dataToSet,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Re-throw the error so the calling UI function can catch it.
        throw permissionError;
      }
    }
  } catch (error) {
    // This catches errors from getDoc and the re-thrown error from setDoc.
    console.error("Error in getOrCreateUserProfile:", error);
    
    // If it's not already our custom error, wrap it.
    if (!(error instanceof FirestorePermissionError)) {
      const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'get', // Assume the 'get' failed if it's an unknown error.
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError;
    }
    
    // Re-throw the original permission error.
    throw error;
  }
}
