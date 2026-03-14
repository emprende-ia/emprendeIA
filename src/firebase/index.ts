'use client';

import { firebaseConfig, isFirebaseConfigured, RECAPTCHA_SITE_KEY } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  initializeAuth, 
  browserLocalPersistence, 
  browserPopupRedirectResolver,
  indexedDBLocalPersistence,
  Auth,
  getAuth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, AppCheck } from 'firebase/app-check';

// Variables de servicio persistentes (Singleton pattern)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let appCheck: AppCheck | null = null;

if (isFirebaseConfigured) {
  try {
    // 1. Inicializar Firebase App
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    if (app) {
      // 2. Inicializar Auth (Evitar doble inicialización que causa internal-error)
      if (!auth) {
        if (typeof window !== 'undefined') {
          auth = initializeAuth(app, {
            persistence: [indexedDBLocalPersistence, browserLocalPersistence],
            popupRedirectResolver: browserPopupRedirectResolver,
          });
        } else {
          auth = getAuth(app);
        }
      }

      // 3. Inicializar Firestore y Storage
      if (!firestore) firestore = getFirestore(app);
      if (!storage) storage = getStorage(app);

      // 4. Inicializar App Check (Solo cliente)
      if (typeof window !== 'undefined' && RECAPTCHA_SITE_KEY && !appCheck) {
        try {
          appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
            isTokenAutoRefreshEnabled: true,
          });
        } catch (acError) {
          // Fallback silencioso si ya está inicializado o falla
          console.debug("App Check initialization skipped.");
        }
      }
    }
  } catch (error) {
    console.error("Error crítico al inicializar Firebase:", error);
  }
}

export { app, auth, firestore, storage, appCheck };
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
