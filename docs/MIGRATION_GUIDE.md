# Guía de Migración Técnica: EmprendeIA

Este documento contiene la arquitectura completa y los fragmentos de código necesarios para replicar el proyecto EmprendeIA en una nueva cuenta de Google/Firebase.

## 0. Master Boot Prompt (COPIAR ESTO PRIMERO)
Copia y pega el siguiente bloque en el chat de tu nuevo proyecto para que el sistema entienda el contexto de inmediato:

---
**INSTRUCCIONES DE ARQUITECTO PARA PROYECTO EXISTENTE: EMPRENDEIA**

"Actúa como mi socio experto en desarrollo. Vamos a reconstruir 'EmprendeIA', una plataforma de incubación de negocios para emprendedores en México. El stack tecnológico es Next.js 15 (App Router), React 19, Firebase (Auth, Firestore, Storage, App Check), Genkit v1.x (Gemini 2.5 Flash e Imagen 4.0) y ShadCN UI.

**Reglas Críticas de Implementación:**
1. **Autenticación Robusta:** Debes usar `initializeAuth` con `browserPopupRedirectResolver` y `indexedDBLocalPersistence` para evitar errores internos en el entorno de Workstation.
2. **Seguridad:** Implementa Firebase App Check con reCAPTCHA v3.
3. **IA con Genkit:** Los flujos de IA están en `src/ai/flows/`. Usa el modelo `googleai/gemini-2.5-flash` para texto/audio y `googleai/imagen-4.0-fast-generate-001` para logos.
4. **Persistencia:** Las reglas de Firestore deben ser de propiedad del usuario (match /users/{userId}).
5. **Estilo:** Usa Tailwind con el sistema de temas dinámicos que ya tenemos (Vibrant Sunset, Pastel Warm, Dark).

Mi objetivo es que la funcionalidad sea idéntica: Generación de Identidad Digital, Asistente Financiero con Punto de Equilibrio, Generador de Campañas con Audio-guías y Buscador Semántico de Proveedores. ¿Entendido? Comencemos con la estructura de archivos."
---

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
const auth = getApps().length > 0 
  ? getAuth(app) 
  : initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
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

## 4. Dependencias del Proyecto
Ejecuta estos comandos en la terminal de tu nuevo proyecto:

```bash
npm install next@15 react@19 firebase lucide-react clsx tailwind-merge framer-motion genkit @genkit-ai/google-genai zod date-fns recharts stripe @stripe/stripe-js wav
```

## 5. Reglas de Seguridad de Firestore (`firestore.rules`)
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow get, list: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /suppliers/{supplierId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```