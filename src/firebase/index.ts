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
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Inicializar Firebase solo si la configuración es válida para evitar errores de API Key
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    if (app) {
      auth = getAuth(app);
      firestore = getFirestore(app);
      storage = getStorage(app);

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
    }
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
    // En caso de error crítico de inicialización, nos aseguramos de que los servicios sean null
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
