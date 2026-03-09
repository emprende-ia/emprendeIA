'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  browserPopupRedirectResolver,
  indexedDBLocalPersistence,
  Auth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from "firebase/app-check";

/**
 * @fileOverview Inicialización centralizada y robusta de Firebase para Next.js 15.
 * Optimizado para evitar errores auth/internal-error y conflictos de reCAPTCHA.
 */

// 1. Inicializar App (Singleton)
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Inicializar Auth con configuración robusta para Workstations
let auth: Auth;
if (getApps().length > 0) {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver,
  });
}

// 3. Inicializar App Check (Solo en el cliente)
if (typeof window !== 'undefined') {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LfkX3osAAAAAHgdtKNvWYAxBEUoyX6jCnOhZX17';
  
  if (siteKey) {
    try {
      // Usamos una propiedad global para evitar re-inicializaciones en HMR
      if (!(window as any).appCheckInitialized) {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(siteKey),
          isTokenAutoRefreshEnabled: true
        });
        (window as any).appCheckInitialized = true;
        console.log('Firebase App Check inicializado.');
      }
    } catch (error) {
      console.debug('Aviso de App Check:', error);
    }
  }
}

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
