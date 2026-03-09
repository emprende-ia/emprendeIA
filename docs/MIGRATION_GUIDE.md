# Guía de Migración Técnica: EmprendeIA

Este documento contiene la arquitectura completa y los fragmentos de código necesarios para replicar el proyecto EmprendeIA en una nueva cuenta de Google/Firebase.

## 1. Estructura de Inicialización (`src/firebase/config.ts`)
Configura tu nuevo proyecto en la consola de Firebase y sustituye estos valores:

```javascript
export const firebaseConfig = {
  apiKey: "TU_NUEVA_API_KEY",
  authDomain: "TU_NUEVO_PROYECTO.firebaseapp.com",
  projectId: "TU_NUEVO_PROYECTO_ID",
  storageBucket: "TU_NUEVO_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
  measurementId: "TU_G_ID"
};
```

## 2. Lógica de Autenticación Robusta
Para evitar errores de "internal-error" en entornos de desarrollo, se utiliza `initializeAuth` con un resolvedor de popups explícito.

**Ubicación:** `src/firebase/index.ts`
```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  browserPopupRedirectResolver,
  indexedDBLocalPersistence
} from 'firebase/auth';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getApps().length > 0 
  ? getAuth(app) 
  : initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
```

**Login con Google (Pattern):**
```typescript
const handleGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  // Registro en base de datos post-login
  await getOrCreateUserProfile(firestore, result.user);
};
```

## 3. Arquitectura de IA (Genkit + Gemini/Vertex)
EmprendeIA utiliza **Genkit v1.x** para orquestar los modelos de Google.

**Configuración Global (`src/ai/genkit.ts`):**
```typescript
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      apiVersion: 'v1beta',
    }),
  ],
});
```

**Ejemplo de Prompt de Identidad Digital:**
Se utiliza el modelo `gemini-2.5-flash` para velocidad y `imagen-4.0` para logos.
```typescript
const prompt = ai.definePrompt({
    name: 'generateDigitalIdentityPrompt',
    model: 'googleai/gemini-2.5-flash',
    prompt: `Actúa como un experto en branding. Genera nombre, eslogan y paleta de colores para: {{{businessDescription}}}.`,
});
```

## 4. Dependencias del Proyecto
Ejecuta estos comandos en la terminal de tu nuevo proyecto para instalar el stack tecnológico exacto:

```bash
# Core y UI
npm install next@15 react@19 firebase lucide-react clsx tailwind-merge framer-motion

# Firebase SDKs
npm install firebase-admin firebase-functions

# ShadCN UI Components (necesarios para el diseño)
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-dropdown-menu @radix-ui/react-accordion @radix-ui/react-toast

# Genkit AI Stack
npm install genkit @genkit-ai/google-genai zod

# Otros
npm install date-fns recharts stripe @stripe/stripe-js wav
```

## 5. Reglas de Seguridad de Firestore (`firestore.rules`)
Copia y pega estas reglas para mantener la privacidad de los usuarios:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Perfiles de usuario: Lectura pública, escritura solo dueño
    match /users/{userId} {
      allow get, list: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Subcolecciones privadas (Análisis, Notas, Campañas, Rutas)
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Proveedores: Lectura pública, escritura bloqueada
    match /suppliers/{supplierId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## 6. Pasos Cruciales post-migración
1. **Habilitar APIs**: Activa "Generative Language API" en Google Cloud Console.
2. **Auth**: Habilita "Google" y "Email/Password" en la consola de Firebase.
3. **App Check**: Registra tu nueva Site Key de reCAPTCHA v3.
4. **Cloud Functions**: Despliega la carpeta `functions/` para procesar pagos de Stripe.
```