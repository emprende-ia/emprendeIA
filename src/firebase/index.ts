'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  browserPopupRedirectResolver,
  indexedDBLocalPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * @fileOverview Inicialización centralizada y robusta de Firebase para Next.js 15.
 */

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicialización con resolución explícita de popups para evitar auth/internal-error
const auth = getApps().length > 0 
  ? getAuth(app) 
  : initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });

const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './errors';
export * from './error-emitter';
