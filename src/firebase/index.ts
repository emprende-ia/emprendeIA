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
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

/**
 * @fileOverview Inicialización centralizada y robusta de Firebase para Next.js 15.
 * Incluye configuración de App Check para seguridad adicional.
 */

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicialización de App Check (Solo en el cliente)
if (typeof window !== 'undefined') {
  // Se recomienda configurar NEXT_PUBLIC_RECAPTCHA_SITE_KEY en tu archivo .env
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LfkX3osAAAAAHgdtKNvWYAxBEUoyX6jCnOhZX17';
  
  if (siteKey) {
    try {
      // Evitar inicialización doble en modo desarrollo
      const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true
      });
      console.log('Firebase App Check inicializado con éxito.');
    } catch (error) {
      // App Check puede fallar si ya está inicializado, lo cual es normal en recargas de HMR
      console.debug('Aviso de App Check:', error);
    }
  }
}

// Inicialización con resolución explícita de popups y persistencia robusta
// Esto ayuda a prevenir el error auth/internal-error en entornos de workstations
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
