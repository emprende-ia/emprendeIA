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
      // 2. Inicializar Auth de forma segura (Idempotente)
      if (typeof window !== 'undefined') {
        try {
          // Intentamos inicializar con persistencia avanzada
          auth = initializeAuth(app, {
            persistence: [indexedDBLocalPersistence, browserLocalPersistence],
            popupRedirectResolver: browserPopupRedirectResolver,
          });
        } catch (authInitError: any) {
          // Si ya estaba inicializado (error común en HMR), recuperamos la instancia existente
          auth = getAuth(app);
        }
      } else {
        auth = getAuth(app);
      }

      // 3. Inicializar Firestore y Storage (Getters son seguros por defecto)
      firestore = getFirestore(app);
      storage = getStorage(app);

      // 4. Inicializar App Check (Solo cliente y solo si hay llave)
      if (typeof window !== 'undefined' && RECAPTCHA_SITE_KEY && !appCheck) {
        try {
          appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
            isTokenAutoRefreshEnabled: true,
          });
        } catch (acError) {
          console.debug("App Check initialization skipped or already active.");
        }
      }
    }
  } catch (error) {
    console.error("Error crítico al inicializar los servicios de Firebase:", error);
  }
}

export { app, auth, firestore, storage, appCheck };
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
