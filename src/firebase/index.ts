
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  browserSessionPersistence,
  Auth 
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

/**
 * Inicializa los servicios de Firebase de forma robusta.
 * En entornos de desarrollo como Cloud Workstations, usamos initializeAuth
 * con persistencia explícita para evitar errores de origen cruzado.
 */
export function initializeFirebase() {
  if (getApps().length > 0) {
    app = getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
  } else {
    app = initializeApp(firebaseConfig);
    
    // Configuramos la persistencia de forma explícita para evitar auth/internal-error
    auth = initializeAuth(app, {
      persistence: [browserLocalPersistence, browserSessionPersistence],
    });
    
    firestore = getFirestore(app);
    storage = getStorage(app);
  }
  
  return {
    firebaseApp: app,
    auth,
    firestore,
    storage,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './errors';
export * from './error-emitter';
