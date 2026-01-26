
import React from 'react';

const H1: React.FC<{ children: React.ReactNode }> = ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 font-headline text-primary">{children}</h1>;
const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3 font-headline text-primary/90">{children}</h2>;
const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-xl font-semibold mt-4 mb-2 font-headline">{children}</h3>;
const P: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => <p className={`mb-4 leading-relaxed ${className}`}>{children}</p>;
const A: React.FC<{ href: string, children: React.ReactNode }> = ({ href, children }) => <a href={href} className="text-accent hover:underline">{children}</a>;
const LI: React.FC<{ children: React.ReactNode }> = ({ children }) => <li className="mb-2">{children}</li>;
const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => <ul className="list-disc list-inside mb-4">{children}</ul>;

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-background text-foreground min-h-screen p-4 sm:p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <H1>Política de Privacidad</H1>
        <P className="text-muted-foreground">Última actualización: 26 de enero de 2025</P>

        <P>En Emprende IA nos tomamos muy en serio la privacidad de tu información. Este documento explica de manera clara qué datos recopilamos, cómo los usamos y cuáles son tus derechos.</P>
        <P className="font-bold border-l-4 border-primary pl-4">En resumen: Solo recopilamos los datos necesarios para que la plataforma funcione y te ayude a hacer crecer tu negocio. No vendemos tu información a terceros.</P>
        
        <H2>1. ¿Quién es el responsable de tus datos?</H2>
        <P>El responsable del tratamiento de tus datos personales es:</P>
        <UL>
          <LI>Nombre o Razón Social: Persona Física con Actividad Empresarial</LI>
          <LI>RFC: OAQT970107FJ2</LI>
          <LI>Sitio web: <A href="https://emprendeia.app">https://emprendeia.app</A></LI>
          <LI>Correo de contacto: <A href="mailto:contacto@emprendeia.app">contacto@emprendeia.app</A></LI>
        </UL>

        <H2>2. ¿Qué datos recopilamos?</H2>
        <H3>2.1 Datos que nos proporcionas directamente</H3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
              <thead className="border-b border-border">
                  <tr>
                  <th className="p-2">Tipo de dato</th>
                  <th className="p-2">¿Para qué lo usamos?</th>
                  </tr>
              </thead>
              <tbody>
                  <tr className="border-b border-border/50"><td className="p-2">Nombre completo</td><td className="p-2">Personalizar tu experiencia en la plataforma</td></tr>
                  <tr className="border-b border-border/50"><td className="p-2">Correo electrónico</td><td className="p-2">Crear tu cuenta y enviarte información importante</td></tr>
                  <tr className="border-b border-border/50"><td className="p-2">Foto de perfil (opcional)</td><td className="p-2">Mostrarla en tu cuenta dentro de la app</td></tr>
                  <tr className="border-b border-border/50"><td className="p-2">Datos de tu negocio (nombre, giro, ubicación)</td><td className="p-2">Personalizar las herramientas y recomendaciones</td></tr>
                  <tr><td className="p-2">Información financiera básica que ingreses</td><td className="p-2">Funcionamiento del módulo de Finanzas</td></tr>
              </tbody>
          </table>
        </div>


        <H3>2.2 Datos que recopilamos automáticamente</H3>
        <UL>
            <LI><strong>Datos de uso anónimos:</strong> Recopilamos información sobre cómo usas la aplicación (qué módulos visitas, tiempo de uso, funciones que utilizas) de forma anónima y agregada para mejorar nuestros servicios.</LI>
            <LI><strong>Información técnica:</strong> Tipo de dispositivo, sistema operativo y versión de la app para asegurar compatibilidad.</LI>
        </UL>
        
        <H3>2.3 Datos de Google (cuando inicias sesión con Google)</H3>
        <P>Si decides iniciar sesión con tu cuenta de Google, accedemos únicamente a:</P>
        <UL>
            <LI>Tu nombre</LI>
            <LI>Tu dirección de correo electrónico</LI>
            <LI>Tu foto de perfil (si la tienes configurada)</LI>
        </UL>
        <P><strong>Importante:</strong> NO accedemos a tus contactos, calendario, archivos de Drive ni ningún otro dato de tu cuenta de Google.</P>
        
        <H2>3. ¿Para qué usamos tus datos?</H2>
        <P>Utilizamos tu información personal para:</P>
        <UL>
            <LI>Crear y administrar tu cuenta en Emprende IA</LI>
            <LI>Proporcionarte acceso a los módulos de Identidad, Campañas, Finanzas y Mentoría</LI>
            <LI>Personalizar las recomendaciones y herramientas según tu negocio</LI>
            <LI>Enviarte comunicaciones importantes sobre tu cuenta o cambios en el servicio</LI>
            <LI>Mejorar nuestros servicios basándonos en patrones de uso anónimos</LI>
            <LI>Cumplir con obligaciones legales aplicables</LI>
        </UL>
        
        <H2>4. ¿Con quién compartimos tus datos?</H2>
        <P><strong>NO vendemos ni alquilamos tu información personal a terceros.</strong> Podemos compartir información únicamente en estos casos:</P>
        <UL>
            <LI><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar la plataforma (servidores, análisis) bajo estrictos acuerdos de confidencialidad.</LI>
            <LI><strong>Requerimientos legales:</strong> Cuando la ley nos obligue a hacerlo o para proteger nuestros derechos legales.</LI>
            <LI><strong>Con tu consentimiento:</strong> Si nos autorizas expresamente a compartir algo específico.</LI>
        </UL>

        <H2>5. Tus derechos ARCO</H2>
        <P>De acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), tienes derecho a:</P>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="border-b border-border">
                    <tr>
                    <th className="p-2">Derecho</th>
                    <th className="p-2">¿Qué significa?</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-border/50"><td className="p-2">Acceso</td><td className="p-2">Solicitar una copia de los datos personales que tenemos sobre ti</td></tr>
                    <tr className="border-b border-border/50"><td className="p-2">Rectificación</td><td className="p-2">Corregir datos inexactos o incompletos</td></tr>
                    <tr className="border-b border-border/50"><td className="p-2">Cancelación</td><td className="p-2">Solicitar que eliminemos tus datos personales</td></tr>
                    <tr><td className="p-2">Oposición</td><td className="p-2">Oponerte al uso de tus datos para fines específicos</td></tr>
                </tbody>
            </table>
        </div>
        <P>Para ejercer cualquiera de estos derechos, envía un correo a <A href="mailto:contacto@emprendeia.app">contacto@emprendeia.app</A> con el asunto "Derechos ARCO" indicando qué derecho deseas ejercer. Responderemos en un máximo de 20 días hábiles.</P>
        
        <H2>6. Cookies y tecnologías similares</H2>
        <P>Utilizamos cookies y tecnologías similares para:</P>
        <UL>
            <LI>Mantener tu sesión activa</LI>
            <LI>Recordar tus preferencias</LI>
            <LI>Analizar el uso de la plataforma de forma anónima</LI>
        </UL>
        <P>Puedes configurar tu navegador para rechazar cookies, aunque esto podría afectar el funcionamiento de algunas funciones.</P>

        <H2>7. Seguridad de tu información</H2>
        <P>Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos, incluyendo:</P>
        <UL>
            <LI>Cifrado de datos en tránsito (HTTPS/TLS)</LI>
            <LI>Acceso restringido a información personal</LI>
            <LI>Monitoreo de seguridad continuo</LI>
            <LI>Almacenamiento seguro en servidores protegidos</LI>
        </UL>

        <H2>8. Retención de datos</H2>
        <P>Conservamos tus datos personales mientras tu cuenta esté activa o mientras sea necesario para proporcionarte nuestros servicios. Si decides eliminar tu cuenta, borraremos tus datos en un plazo de 30 días, excepto aquellos que debamos conservar por obligaciones legales.</P>
        
        <H2>9. Cambios a esta política</H2>
        <P>Podemos actualizar esta Política de Privacidad ocasionalmente. Cuando hagamos cambios importantes, te notificaremos por correo electrónico o mediante un aviso visible en la aplicación. Te recomendamos revisar esta página periódicamente.</P>
        
        <H2>10. Menores de edad</H2>
        <P>Emprende IA está diseñado para personas mayores de 18 años. No recopilamos intencionalmente información de menores de edad. Si detectamos que hemos recopilado datos de un menor, los eliminaremos inmediatamente.</P>
        
        <H2>¿Tienes dudas?</H2>
        <P>Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tus datos, contáctanos:</P>
        <UL>
            <LI>📧 Correo: <A href="mailto:contacto@emprendeia.app">contacto@emprendeia.app</A></LI>
            <LI>🌐 Sitio web: <A href="https://emprendeia.app">https://emprendeia.app</A></LI>
        </UL>
      </div>
    </main>
  );
}
