
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="flex items-center justify-between">
         <h1 className="font-headline text-4xl font-bold">Política de Privacidad</h1>
         <Button asChild variant="outline">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
            </Link>
         </Button>
      </header>
      <Separator className="my-8" />
      <div className="prose prose-invert max-w-none text-foreground/80 space-y-6">
        <p>Última actualización: 26 de enero de 2025</p>

        <p>
          En Emprende IA nos tomamos muy en serio la privacidad de tu información. Este documento explica de manera clara qué datos recopilamos, cómo los usamos y cuáles son tus derechos.
        </p>
        <p>
          <strong>En resumen:</strong> Solo recopilamos los datos necesarios para que la plataforma funcione y te ayude a hacer crecer tu negocio. No vendemos tu información a terceros.
        </p>

        <h2 className="font-headline text-2xl font-semibold">1. ¿Quién es el responsable de tus datos?</h2>
        <p>El responsable del tratamiento de tus datos personales es:</p>
        <ul className="list-none space-y-1 pl-0">
          <li><strong>Nombre o Razón Social:</strong> Persona Física con Actividad Empresarial</li>
          <li><strong>RFC:</strong> OAQT970107FJ2</li>
          <li><strong>Sitio web:</strong> <a href="https://emprendeia.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://emprendeia.app</a></li>
          <li><strong>Correo de contacto:</strong> <a href="mailto:contacto@emprendeia.app" className="text-primary hover:underline">contacto@emprendeia.app</a></li>
        </ul>


        <h2 className="font-headline text-2xl font-semibold">2. ¿Qué datos recopilamos?</h2>

        <h3 className="font-headline text-xl font-semibold pt-2">2.1 Datos que nos proporcionas directamente</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Tipo de dato</h4>
            <p className="text-muted-foreground">Nombre completo</p>
            <h4 className="font-semibold mt-2">¿Para qué lo usamos?</h4>
            <p className="text-muted-foreground">Personalizar tu experiencia en la plataforma</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold">Tipo de dato</h4>
            <p className="text-muted-foreground">Correo electrónico</p>
            <h4 className="font-semibold mt-2">¿Para qué lo usamos?</h4>
            <p className="text-muted-foreground">Crear tu cuenta y enviarte información importante</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold">Tipo de dato</h4>
            <p className="text-muted-foreground">Foto de perfil (opcional)</p>
            <h4 className="font-semibold mt-2">¿Para qué lo usamos?</h4>
            <p className="text-muted-foreground">Mostrarla en tu cuenta dentro de la app</p>
          </div>
            <Separator />
          <div>
            <h4 className="font-semibold">Tipo de dato</h4>
            <p className="text-muted-foreground">Datos de tu negocio (nombre, giro, ubicación)</p>
            <h4 className="font-semibold mt-2">¿Para qué lo usamos?</h4>
            <p className="text-muted-foreground">Personalizar las herramientas y recomendaciones</p>
          </div>
            <Separator />
          <div>
            <h4 className="font-semibold">Tipo de dato</h4>
            <p className="text-muted-foreground">Información financiera básica que ingreses</p>
            <h4 className="font-semibold mt-2">¿Para qué lo usamos?</h4>
            <p className="text-muted-foreground">Funcionamiento del módulo de Finanzas</p>
          </div>
        </div>

        <h3 className="font-headline text-xl font-semibold pt-4">2.2 Datos que recopilamos automáticamente</h3>
        <ul className="list-disc list-inside space-y-2">
            <li>
                <strong>Datos de uso anónimos:</strong> Recopilamos información sobre cómo usas la aplicación (qué módulos visitas, tiempo de uso, funciones que utilizas) de forma anónima y agregada para mejorar nuestros servicios.
            </li>
            <li>
                <strong>Información técnica:</strong> Tipo de dispositivo, sistema operativo y versión de la app para asegurar compatibilidad.
            </li>
        </ul>

        <h3 className="font-headline text-xl font-semibold pt-4">2.3 Datos de Google (cuando inicias sesión con Google)</h3>
        <p>Si decides iniciar sesión con tu cuenta de Google, accedemos únicamente a:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>Tu nombre</li>
            <li>Tu dirección de correo electrónico</li>
            <li>Tu foto de perfil (si la tienes configurada)</li>
        </ul>
        <p><strong>Importante:</strong> NO accedemos a tus contactos, calendario, archivos de Drive ni ningún otro dato de tu cuenta de Google.</p>

        <h2 className="font-headline text-2xl font-semibold">3. ¿Para qué usamos tus datos?</h2>
        <p>Utilizamos tu información personal para:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Crear y administrar tu cuenta en Emprende IA</li>
          <li>Proporcionarte acceso a los módulos de Identidad, Campañas, Finanzas y Mentoría</li>
          <li>Personalizar las recomendaciones y herramientas según tu negocio</li>
          <li>Enviarte comunicaciones importantes sobre tu cuenta o cambios en el servicio</li>
          <li>Mejorar nuestros servicios basándonos en patrones de uso anónimos</li>
          <li>Cumplir con obligaciones legales aplicables</li>
        </ul>

        <h2 className="font-headline text-2xl font-semibold">4. ¿Con quién compartimos tus datos?</h2>
        <p>
          <strong>NO vendemos ni alquilamos tu información personal a terceros.</strong>
          Podemos compartir información únicamente en estos casos:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar la plataforma (servidores, análisis) bajo estrictos acuerdos de confidencialidad.
          </li>
          <li>
            <strong>Requerimientos legales:</strong> Cuando la ley nos obligue a hacerlo o para proteger nuestros derechos legales.
          </li>
          <li>
            <strong>Con tu consentimiento:</strong> Si nos autorizas expresamente a compartir algo específico.
          </li>
        </ul>

        <h2 className="font-headline text-2xl font-semibold">5. Tus derechos ARCO</h2>
        <p>
          De acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), tienes derecho a:
        </p>
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold">Derecho de Acceso</h4>
                <p className="text-muted-foreground">Solicitar una copia de los datos personales que tenemos sobre ti.</p>
            </div>
            <Separator />
            <div>
                <h4 className="font-semibold">Derecho de Rectificación</h4>
                <p className="text-muted-foreground">Corregir datos inexactos o incompletos.</p>
            </div>
            <Separator />
            <div>
                <h4 className="font-semibold">Derecho de Cancelación</h4>
                <p className="text-muted-foreground">Solicitar que eliminemos tus datos personales.</p>
            </div>
            <Separator />
            <div>
                <h4 className="font-semibold">Derecho de Oposición</h4>
                <p className="text-muted-foreground">Oponerte al uso de tus datos para fines específicos.</p>
            </div>
        </div>
        <p className="pt-4">
          Para ejercer cualquiera de estos derechos, envía un correo a <a href="mailto:contacto@emprendeia.app" className="text-primary hover:underline">contacto@emprendeia.app</a> con el asunto "Derechos ARCO" indicando qué derecho deseas ejercer. Responderemos en un máximo de 20 días hábiles.
        </p>

        <h2 className="font-headline text-2xl font-semibold">6. Cookies y tecnologías similares</h2>
        <p>Utilizamos cookies y tecnologías similares para:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Mantener tu sesión activa</li>
          <li>Recordar tus preferencias</li>
          <li>Analizar el uso de la plataforma de forma anónima</li>
        </ul>
        <p>
          Puedes configurar tu navegador para rechazar cookies, aunque esto podría afectar el funcionamiento de algunas funciones.
        </p>

        <h2 className="font-headline text-2xl font-semibold">7. Seguridad de tu información</h2>
        <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos, incluyendo:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Cifrado de datos en tránsito (HTTPS/TLS)</li>
          <li>Acceso restringido a información personal</li>
          <li>Monitoreo de seguridad continuo</li>
          <li>Almacenamiento seguro en servidores protegidos</li>
        </ul>

        <h2 className="font-headline text-2xl font-semibold">8. Retención de datos</h2>
        <p>
          Conservamos tus datos personales mientras tu cuenta esté activa o mientras sea necesario para proporcionarte nuestros servicios. Si decides eliminar tu cuenta, borraremos tus datos en un plazo de 30 días, excepto aquellos que debamos conservar por obligaciones legales.
        </p>

        <h2 className="font-headline text-2xl font-semibold">9. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad ocasionalmente. Cuando hagamos cambios importantes, te notificaremos por correo electrónico o mediante un aviso visible en la aplicación. Te recomendamos revisar esta página periódicamente.
        </p>

        <h2 className="font-headline text-2xl font-semibold">10. Menores de edad</h2>
        <p>
          Emprende IA está diseñado para personas mayores de 18 años. No recopilamos intencionalmente información de menores de edad. Si detectamos que hemos recopilado datos de un menor, los eliminaremos inmediatamente.
        </p>

        <h2 className="font-headline text-2xl font-semibold">¿Tienes dudas?</h2>
        <p>Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tus datos, contáctanos:</p>
        <ul className="list-none pl-0 space-y-1">
          <li>📧 Correo: <a href="mailto:contacto@emprendeia.app" className="text-primary hover:underline">contacto@emprendeia.app</a></li>
          <li>🌐 Sitio web: <a href="https://emprendeia.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://emprendeia.app</a></li>
        </ul>
      </div>
    </div>
  );
}
