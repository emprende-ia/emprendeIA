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

// Variables de servicio persistentes
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    // Patrón Singleton para evitar reinicializaciones en Hot Reload
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    if (app) {
      if (typeof window !== 'undefined') {
        // En el cliente, usamos initializeAuth con persistencia robusta para evitar internal-error
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
        // En el servidor, basta con getAuth
        auth = getAuth(app);
      }
      
      firestore = getFirestore(app);
      storage = getStorage(app);
    }
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
  }
}

export { app, auth, firestore, storage };
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
