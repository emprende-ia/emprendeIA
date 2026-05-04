'use client';

/**
 * ⚠️ MÓDULO EN MIGRACIÓN — Firebase → Supabase
 *
 * Este archivo solía exportar Firebase Auth/Firestore/Storage. Durante la
 * migración:
 *   - `useUser` ya viene de Supabase (vía proxy retro-compatible).
 *   - `auth`, `firestore`, `storage` siguen apuntando a Firebase para que las
 *     queries existentes no rompan; se reemplazarán archivo por archivo.
 *   - Cuando todos los componentes usen `@/lib/supabase/*`, este archivo se
 *     elimina y los imports residuales se redirigen a Supabase.
 */

import { firebaseConfig, isFirebaseConfigured } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  initializeAuth,
  indexedDBLocalPersistence,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    if (app) {
      if (typeof window !== 'undefined') {
        const existingAuth = getAuth(app);
        if (existingAuth) {
          auth = existingAuth;
        } else {
          auth = initializeAuth(app, {
            persistence: [indexedDBLocalPersistence, browserLocalPersistence],
            popupRedirectResolver: browserPopupRedirectResolver,
          });
        }
      } else {
        auth = getAuth(app);
      }
      firestore = getFirestore(app);
      storage = getStorage(app);
    }
  } catch (error) {
    console.error('Error inicializando Firebase (modo legado):', error);
  }
}

export { app, auth, firestore, storage };
export * from './provider';
export * from './client-provider';

// ============================================================================
// useUser — proxy retro-compatible al de Supabase
// ============================================================================
// Mantiene la forma Firebase del objeto user (uid, displayName, photoURL,
// email, plan, planStatus) para que los 20+ componentes que ya consumen
// `useUser` desde `@/firebase` no se tengan que tocar todavía.

import { useMemo } from 'react';
import { useUser as useSupabaseUser, type AppUser as SupabaseAppUser } from '@/lib/supabase/use-user';
import type { PlanTier, PlanStatus } from '@/lib/supabase/database.types';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  plan: PlanTier | 'básico';
  planStatus: PlanStatus;
}

export interface UseUserResult {
  user: AppUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

function adapt(supaUser: SupabaseAppUser | null): AppUser | null {
  if (!supaUser) return null;
  const { profile } = supaUser;
  return {
    uid: supaUser.id,
    email: supaUser.email ?? null,
    displayName:
      profile.full_name ||
      profile.username ||
      (supaUser.user_metadata?.full_name as string | undefined) ||
      (supaUser.user_metadata?.name as string | undefined) ||
      supaUser.email?.split('@')[0] ||
      null,
    photoURL:
      profile.photo_url ||
      (supaUser.user_metadata?.avatar_url as string | undefined) ||
      null,
    plan: profile.plan,
    planStatus: profile.plan_status,
  };
}

export function useUser(): UseUserResult {
  const { user, isUserLoading, userError } = useSupabaseUser();
  // Memoizar: sin esto, adapt() devuelve un objeto nuevo en cada render y los
  // consumers que pongan `user` en deps de useEffect entran en loop infinito.
  const adapted = useMemo(() => adapt(user), [user]);
  return { user: adapted, isUserLoading, userError };
}
