'use client';

import { firebaseConfig, isFirebaseConfigured } from '@/firebase/config';
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
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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
      // Configuración de Auth con persistencia robusta y protección contra reinicialización
      if (typeof window !== 'undefined') {
        // Usamos una propiedad global para evitar errores de duplicidad en desarrollo
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

      // Configuración de App Check
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
            console.debug('App Check en espera de configuración final.');
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
