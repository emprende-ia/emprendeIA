'use client';

import { firebaseConfig, isFirebaseConfigured } from '@/firebase/config';
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
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Inicializar Firebase solo si la configuración es válida
const app: FirebaseApp = isFirebaseConfigured 
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : (null as any);

let auth: Auth;

if (app) {
  if (getApps().length > 0) {
    auth = getAuth(app);
  } else {
    // Inicialización manual para asegurar persistencia y resolver de popups
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  }

  // Configuración de App Check (solo en el cliente)
  if (typeof window !== 'undefined') {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey && !(window as any).appCheckInitialized) {
      try {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(siteKey),
          isTokenAutoRefreshEnabled: true
        });
        (window as any).appCheckInitialized = true;
      } catch (error) {
        console.debug('App Check ya estaba inicializado o falló silenciosamente.');
      }
    }
  }
} else {
  auth = null as any;
}

const firestore = app ? getFirestore(app) : (null as any);
const storage = app ? getStorage(app) : (null as any);

export { app, auth, firestore, storage };
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
