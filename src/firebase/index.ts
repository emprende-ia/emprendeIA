'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  browserPopupRedirectResolver 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * @fileOverview Inicialización centralizada de Firebase.
 * Se usa initializeAuth con browserPopupRedirectResolver para evitar el error 'auth/internal-error'
 * común en entornos de desarrollo y bundlers modernos (Next.js/Turbopack).
 */

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicialización robusta de Auth
const auth = getApps().length > 0 
  ? getAuth(app) 
  : initializeAuth(app, {
      persistence: browserLocalPersistence,
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
