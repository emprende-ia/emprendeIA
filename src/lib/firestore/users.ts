
'use client';

import { Firestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * Checks if a user profile exists in Firestore. If not, it creates one.
 * This ensures every user has a corresponding document in the 'users' collection.
 *
 * @param firestore - The Firestore instance.
 * @param user - The Firebase Auth User object.
 * @param additionalData - Optional additional data to merge into the profile, typically on registration.
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

      // Mutation without direct await to use optimistic UI and cache
      setDoc(userDocRef, dataToSet).catch(async (writeError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: dataToSet,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    }
  } catch (error) {
    if (!(error instanceof FirestorePermissionError)) {
      const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'get',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    }
  }
}
