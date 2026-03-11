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
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// Variables de servicio
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    // Inicialización del App de Firebase (Singleton)
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    if (app) {
      // Configuración de Auth con persistencia robusta
      if (typeof window !== 'undefined') {
        if (!(window as any)._firebaseAuthInstance) {
          auth = initializeAuth(app, {
            persistence: [indexedDBLocalPersistence, browserLocalPersistence],
            popupRedirectResolver: browserPopupRedirectResolver,
          });
          (window as any)._firebaseAuthInstance = auth;
        } else {
          auth = (window as any)._firebaseAuthInstance;
        }
      } else {
        auth = getAuth(app);
      }
      
      firestore = getFirestore(app);
      storage = getStorage(app);

      // Configuración de App Check con reCAPTCHA Enterprise
      // Importante: Esto debe ocurrir antes de usar cualquier otro servicio si está habilitada la validación forzada
      if (typeof window !== 'undefined' && RECAPTCHA_SITE_KEY) {
        if (!(window as any).appCheckInitialized) {
          try {
            initializeAppCheck(app, {
              provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
              isTokenAutoRefreshEnabled: true
            });
            (window as any).appCheckInitialized = true;
            console.log('Firebase App Check: Inicializado con reCAPTCHA Enterprise.');
          } catch (error) {
            console.error('Firebase App Check Error:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
    app = null;
    auth = null;
    firestore = null;
    storage = null;
  }
}

export { app, auth, firestore, storage };
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
