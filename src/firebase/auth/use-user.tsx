
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

export interface UseUserResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export function useUser(): UseUserResult {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(auth?.currentUser || null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth) {
      setIsUserLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setIsUserLoading(false);
      },
      (error) => {
        setUserError(error);
        setIsUserLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, isUserLoading, userError };
}
