# Guía de Migración de EmprendeIA

Sigue estos pasos para replicar el proyecto en tu nueva cuenta de Firebase Studio.

## 1. Master Boot Prompt (COPIAR Y PEGAR PRIMERO)
Copia este bloque en el chat de tu nuevo proyecto:

---
**INSTRUCCIONES DE ARQUITECTO: RECONSTRUCCIÓN DE EMPRENDEIA**

"Actúa como mi socio desarrollador senior. Vamos a reconstruir 'EmprendeIA', una plataforma de incubación para emprendedores. 

**Stack:** Next.js 15 (App Router), Firebase (Auth, Firestore, App Check), Genkit v1.x (Gemini 2.5 Flash, Imagen 4.0).

**Reglas Críticas:**
1. **Auth:** Usa `initializeAuth` con `browserPopupRedirectResolver` para evitar errores internos.
2. **IA:** Los flujos están en `src/ai/flows/`. Usa el modelo `googleai/imagen-4.0-fast-generate-001` para logos.
3. **Privacidad:** Los datos del usuario (marcas, finanzas, rutas) deben estar bajo `/users/{userId}/`.
4. **Estilo:** Usa Tailwind con temas dinámicos.

Tu primera tarea es revisar la estructura de archivos que te voy a proporcionar y asegurarte de que la autenticación y los flujos de IA estén sincronizados."
---

## 2. Configuración de Firebase
1. Crea un proyecto en Firebase Console.
2. Habilita Google Auth.
3. Habilita Firestore y Storage.
4. Habilita App Check con reCAPTCHA v3.
5. Copia tus llaves en `src/firebase/config.ts`.

## 3. Variables de Entorno (.env)
Asegúrate de configurar:
- `GOOGLE_GENAI_API_KEY`: Tu llave de Google AI Studio.
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`: Tu clave pública de reCAPTCHA v3.
- `NEXT_PUBLIC_APP_URL`: La URL de tu app.