
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseAuthUser } from 'firebase/auth';
import { doc, onSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';

// Define el tipo para el perfil de usuario de Firestore
export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
  plan: 'básico' | 'oro' | 'diamante';
}

// Combina el usuario de Auth con el perfil de Firestore
export interface User extends FirebaseAuthUser, Partial<UserProfile> {}

export interface UseUserResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export function useUser(): UseUserResult {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth || !firestore) {
      setIsUserLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (authUser) => {
        if (authUser) {
          // Usuario autenticado, ahora escucha su perfil en Firestore
          const userDocRef = doc(firestore, 'users', authUser.uid);
          const unsubscribeFirestore = onSnapshot(
            userDocRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const profileData = docSnapshot.data() as DocumentData;
                const combinedUser: User = {
                  ...authUser,
                  ...profileData,
                  createdAt: profileData.createdAt instanceof Timestamp ? profileData.createdAt.toDate() : new Date(),
                  plan: profileData.plan || 'básico', // Asigna 'básico' si no hay plan
                };
                setUser(combinedUser);
              } else {
                // Perfil no encontrado, usa solo datos de Auth y un plan básico
                const guestUser: User = {
                  ...authUser,
                  plan: 'básico',
                };
                setUser(guestUser);
              }
              setIsUserLoading(false);
            },
            (error) => {
              console.error("Error fetching user profile:", error);
              setUserError(error);
              setIsUserLoading(false);
            }
          );
          // Retorna la función de desuscripción de Firestore
          return () => unsubscribeFirestore();
        } else {
          // No hay usuario autenticado
          setUser(null);
          setIsUserLoading(false);
        }
      },
      (error) => {
        console.error("Auth state change error:", error);
        setUserError(error);
        setIsUserLoading(false);
      }
    );

    return () => unsubscribeAuth();
  }, [auth, firestore]);

  return { user, isUserLoading, userError };
}
