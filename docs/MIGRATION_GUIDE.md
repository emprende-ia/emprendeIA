# Guía de Migración de EmprendeIA

Sigue estos pasos para replicar el proyecto en tu nueva cuenta de Firebase Studio.

## 1. Master Boot Prompt (COPIAR Y PEGAR PRIMERO)
Copia este bloque en el chat de tu nuevo proyecto para inicializar la IA con el contexto correcto:

---
**INSTRUCCIONES DE ARQUITECTO: RECONSTRUCCIÓN DE EMPRENDEIA**

"Actúa como mi socio desarrollador senior. Vamos a reconstruir 'EmprendeIA', una plataforma de incubación para emprendedores impulsada por IA.

**Stack Tecnológico:**
- **Framework:** Next.js 15 (App Router) con Turbopack.
- **Backend:** Firebase (Auth, Firestore, Storage, App Check).
- **IA:** Genkit v1.x (Gemini 2.5 Flash para texto, Imagen 4.0 para logos y branding).
- **Estilos:** Tailwind CSS con componentes ShadCN y fuentes Space Grotesk/Inter.

**Reglas Críticas de Implementación:**
1. **Autenticación:** Usa `initializeAuth` con `browserPopupRedirectResolver` en `src/firebase/index.ts` para evitar el error `auth/internal-error`.
2. **IA y Flujos:** Los flujos de IA residen en `src/ai/flows/`. El generador de logos usa `googleai/imagen-4.0-fast-generate-001`.
3. **Privacidad de Datos:** Todos los datos de usuario (marcas, finanzas, campañas) deben estar bajo `/users/{userId}/`.
4. **Diseño:** Sigue estrictamente la paleta Cyan (#00ffff), Fondo Cyan Claro (#e0ffff) y Acento Verde Lima (#32cd32).

Tu primera tarea es revisar la estructura de archivos que te proporcionaré y asegurar que la lógica de autenticación y los flujos de IA estén perfectamente sincronizados."
---

## 2. Configuración de Firebase
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. **Auth:** Habilita Google Auth.
3. **Firestore:** Habilita el modo producción y usa las reglas de `firestore.rules`.
4. **Storage:** Habilita Storage para guardar los audios de ayuda.
5. **App Check:** Habilita App Check con reCAPTCHA v3.
6. Copia tus llaves en `src/firebase/config.ts`.

## 3. Variables de Entorno (.env)
Configura las siguientes variables:
- `GOOGLE_GENAI_API_KEY`: Tu llave de [Google AI Studio](https://aistudio.google.com/).
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`: Tu clave pública de reCAPTCHA v3.
- `NEXT_PUBLIC_APP_URL`: La URL de tu app (ej. `https://tu-app.web.app`).

## 4. Instalación de Dependencias
Ejecuta:
```bash
npm install firebase genkit @genkit-ai/google-genai lucide-react framer-motion clsx tailwind-merge zod react-hook-form @hookform/resolvers date-fns wav
```
