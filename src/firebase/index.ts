'use client';

import { firebaseConfig } from '@/firebase/config';
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

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
if (getApps().length > 0) {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver,
  });
}

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
      console.debug('App Check inicializado correctamente.');
    }
  }
}

const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
