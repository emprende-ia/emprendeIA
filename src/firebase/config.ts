/**
 * Configuración de Firebase para EmprendeIA.
 * Las variables deben estar prefijadas con NEXT_PUBLIC_ para ser accesibles en el cliente.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

/**
 * Valida si la configuración de Firebase es válida y completa.
 * Verifica que las llaves esenciales existan y no sean valores por defecto o 'undefined'.
 */
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey.length > 10 && // Una API Key real suele tener más de 10 caracteres
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'undefined' &&
  firebaseConfig.appId &&
  firebaseConfig.appId !== 'undefined'
);
