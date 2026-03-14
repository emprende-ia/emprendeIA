'use client';

import { firebaseConfig, isFirebaseConfigured, RECAPTCHA_SITE_KEY } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth,
  Auth,
  browserLocalPersistence,
  setPersistence,
  browserPopupRedirectResolver,
  initializeAuth,
  indexedDBLocalPersistence
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
    // 1. Inicializar Firebase App de forma única
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    if (app) {
      // 2. Inicializar Auth con patrón de seguridad para evitar auth/internal-error
      if (typeof window !== 'undefined') {
        // Intentar recuperar instancia existente primero
        const existingAuth = getAuth(app);
        if (existingAuth) {
          auth = existingAuth;
        } else {
          // Si no existe, inicializar con configuraciones específicas
          auth = initializeAuth(app, {
            persistence: [indexedDBLocalPersistence, browserLocalPersistence],
            popupRedirectResolver: browserPopupRedirectResolver,
          });
        }
      } else {
        auth = getAuth(app);
      }

      // 3. Inicializar Firestore y Storage (Getters son idempotentes y seguros)
      firestore = getFirestore(app);
      storage = getStorage(app);

      // 4. Inicializar App Check (Solo cliente)
      if (typeof window !== 'undefined' && RECAPTCHA_SITE_KEY) {
        try {
          appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
            isTokenAutoRefreshEnabled: true,
          });
        } catch (acError) {
          // Fallo silencioso de App Check para no bloquear el inicio de la app
          console.debug("App Check skipped initialization.");
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
