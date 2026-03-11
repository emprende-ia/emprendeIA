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

// Inicializar variables de servicio como null por defecto
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    // Inicialización del App de Firebase
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    if (app) {
      // Configuración robusta de Auth para evitar 'auth/internal-error' en estaciones de trabajo
      if (typeof window !== 'undefined') {
        auth = initializeAuth(app, {
          persistence: [indexedDBLocalPersistence, browserLocalPersistence],
          popupRedirectResolver: browserPopupRedirectResolver,
        });
      } else {
        auth = getAuth(app);
      }
      
      firestore = getFirestore(app);
      storage = getStorage(app);

      // Configuración de App Check para protección de recursos
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
            console.debug('App Check ya estaba inicializado o no es requerido en este entorno.');
          }
        }
      }
    }
  } catch (error) {
    console.error("Error crítico al inicializar Firebase:", error);
    // Aseguramos que los servicios sean null para que el Provider muestre la pantalla de error
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
