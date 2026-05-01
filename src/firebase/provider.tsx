'use client';

/**
 * ⚠️ Provider en modo legado.
 *
 * Tras la migración a Supabase, Firebase es opcional. Este provider:
 *   - Acepta servicios `null` sin romper (no muestra pantalla de error).
 *   - `useFirestore`/`useAuth`/`useStorage` devuelven `null` si no hay config.
 *   - El estado de usuario auténtico viene de Supabase (vía `useUser` del proxy).
 *
 * Cuando todos los componentes hayan migrado a `@/lib/supabase/*`, eliminar
 * por completo `src/firebase/`.
 */

import React, { DependencyList, createContext, useContext, ReactNode, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
  storage,
}) => {
  const servicesAvailable = !!(firebaseApp && firestore && auth && storage);

  const contextValue = useMemo<FirebaseContextState>(
    () => ({
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      storage: servicesAvailable ? storage : null,
    }),
    [servicesAvailable, firebaseApp, firestore, auth, storage]
  );

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

function useFirebaseContext(): FirebaseContextState {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase debe usarse dentro de un FirebaseProvider.');
  }
  return context;
}

/**
 * Hooks legados — los `lib/firestore/*.ts` ignoran el primer parámetro y usan
 * Supabase, así que devolvemos un sentinel truthy para que checks como
 * `if (user && firestore)` no corten flujos válidos cuando Firebase no está
 * configurado en producción.
 */
const FIRESTORE_STUB = {} as Firestore;
const STORAGE_STUB = {} as FirebaseStorage;
const AUTH_STUB = {} as Auth;

export const useFirebaseApp = (): FirebaseApp | null => useFirebaseContext().firebaseApp;
export const useFirestore = (): Firestore =>
  useFirebaseContext().firestore ?? FIRESTORE_STUB;
export const useAuth = (): Auth => useFirebaseContext().auth ?? AUTH_STUB;
export const useStorage = (): FirebaseStorage =>
  useFirebaseContext().storage ?? STORAGE_STUB;

type MemoFirebase<T> = T & { __memo?: boolean };

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | MemoFirebase<T> {
  const memoized = useMemo(factory, deps);
  if (typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  return memoized;
}
