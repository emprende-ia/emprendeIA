# Manual de Migración: EmprendeIA

Sigue estos pasos para replicar el proyecto en tu nueva cuenta de Firebase Studio.

## 1. Master Boot Prompt (COPIAR Y PEGAR PRIMERO)
Copia este bloque en el chat de tu nuevo proyecto para inicializar la IA con el contexto correcto:

---
**INSTRUCCIONES DE ARQUITECTO: RECONSTRUCCIÓN DE EMPRENDEIA**

"Actúa como mi socio desarrollador senior. Vamos a reconstruir 'EmprendeIA', una plataforma de incubación para emprendedores impulsada por IA.

**Estructura del Proyecto (Paso a Paso):**
1. **Landing (`/`):** Bienvenida con Registro, Login y Tutorial.
2. **Selección (`/start`):** Bifurcación entre 'Nuevo Emprendimiento' y 'Potenciar Negocio'.
3. **Captura:** Formularios detallados en `/new-venture` o `/existing-venture`.
4. **Análisis:** Resultados en `/analysis` con Semáforo de Viabilidad, FODA y Presupuesto.
5. **Dashboard (`/dashboard`):** Centro de control con 5 módulos de IA (Identidad, Finanzas, Campañas, Proveedores y Guías).

**Stack Tecnológico:**
- **Framework:** Next.js 15 (App Router) con Turbopack.
- **Backend:** Firebase (Auth con popupRedirectResolver, Firestore, Storage, App Check).
- **IA:** Genkit v1.x (Gemini 2.5 Flash para texto, Imagen 4.0 para logos).
- **Estilos:** Tailwind CSS con ShadCN UI. Paleta: Cyan (#00ffff), Fondo Cyan Claro (#e0ffff) y Acento Verde Lima (#32cd32).

Tu primera tarea es revisar los archivos que te proporcionaré y asegurar que la lógica de autenticación y los flujos de IA estén sincronizados."
---

## 2. Configuración de Firebase
1. Crea un proyecto en la consola de Firebase.
2. Habilita **Google Auth**.
3. Habilita **Firestore** en modo producción.
4. Habilita **App Check** con reCAPTCHA v3.
5. Copia tus credenciales en `src/firebase/config.ts`.

## 3. Variables de Entorno (.env)
- `GOOGLE_GENAI_API_KEY`: Tu llave de Google AI Studio.
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`: Tu clave pública de reCAPTCHA v3.
- `NEXT_PUBLIC_APP_URL`: La URL de tu app.

## 4. Instalación
`npm install firebase genkit @genkit-ai/google-genai lucide-react framer-motion clsx tailwind-merge zod react-hook-form @hookform/resolvers date-fns wav`
