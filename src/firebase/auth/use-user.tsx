
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, DocumentData, FirestoreError } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';

// Add plan and planStatus to the User type for this app
interface AppUser extends User {
    plan?: 'básico' | 'oro' | 'diamante';
    planStatus?: 'active' | 'inactive';
}

export interface UseUserResult {
  user: AppUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export function useUser(): UseUserResult {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<AppUser | null>(auth?.currentUser as AppUser || null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth || !firestore) {
      setIsUserLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in, now listen for profile updates (plan changes)
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          const unsubscribeFirestore = onSnapshot(userDocRef, 
            (docSnap) => {
              if (docSnap.exists()) {
                const profileData = docSnap.data();
                // Combine Firebase Auth user data with Firestore profile data
                const combinedUser: AppUser = {
                    ...firebaseUser,
                    plan: profileData.plan || 'básico', // Default to 'básico' if not set
                    planStatus: profileData.planStatus || 'inactive',
                };
                setUser(combinedUser);
              } else {
                // Profile doesn't exist yet, use basic auth data
                setUser({ ...firebaseUser, plan: 'básico', planStatus: 'inactive' });
              }
              setIsUserLoading(false);
            },
            (error: FirestoreError) => {
                console.error("Error fetching user profile:", error);
                setUserError(error);
                setIsUserLoading(false);
            }
          );
          // Return the firestore unsubscribe function to be called on cleanup
          return unsubscribeFirestore;
        } else {
          // User is signed out
          setUser(null);
          setIsUserLoading(false);
        }
      },
      (error) => {
        setUserError(error);
        setIsUserLoading(false);
      }
    );

    return () => unsubscribeAuth();
  }, [auth, firestore]);

  return { user, isUserLoading, userError };
}
