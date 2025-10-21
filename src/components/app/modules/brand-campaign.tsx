
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, BarChart2, Lightbulb, Users, Send, Share2, ZoomIn, TrendingUp, Handshake, Bot } from 'lucide-react';

export function BrandCampaign() {
  return (
    <Tabs defaultValue="planning" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="planning">1. Planificación</TabsTrigger>
        <TabsTrigger value="strategies">2. Estrategias Digitales</TabsTrigger>
        <TabsTrigger value="measurement">3. Medición</TabsTrigger>
      </TabsList>
      
      <TabsContent value="planning" className="mt-4">
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>
                <div className="flex items-center gap-3"><Target className="h-5 w-5 text-primary" /> Plan de Marketing Simple</div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pl-8">
              <p className="text-muted-foreground">Un buen plan es tu mapa. No tiene que ser complicado, solo claro.</p>
              <Card>
                <CardHeader><CardTitle className="text-base">Define Objetivos SMART</CardTitle></CardHeader>
                <CardContent className="text-sm">
                  <div><Badge>S</Badge> (Específico): ¿Qué quieres lograr? (Ej: "Aumentar seguidores en Instagram").</div>
                  <div><Badge>M</Badge> (Medible): ¿Cómo sabrás que lo lograste? (Ej: "Llegar a 500 seguidores").</div>
                  <div><Badge>A</Badge> (Alcanzable): ¿Es realista con tus recursos? (Ej: "Sí, puedo dedicar 1h/día").</div>
                  <div><Badge>R</Badge> (Relevante): ¿Por qué es importante para tu negocio? (Ej: "Para construir una comunidad").</div>
                  <div><Badge>T</Badge> (Tiempo): ¿En cuánto tiempo? (Ej: "En 3 meses").</div>
                </CardContent>
              </Card>
               <Card>
                <CardHeader><CardTitle className="text-base">Identifica tu Público</CardTitle></CardHeader>
                <CardContent className="text-sm">
                    <p>¿A quién le vendes? Sé específico. No es "mujeres", es "mujeres de 25-35 años, interesadas en moda sostenible que viven en zonas urbanas".</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Establece un Presupuesto</CardTitle></CardHeader>
                <CardContent className="text-sm">
                    <p>Puede ser $0 al principio. Lo importante es saber con qué cuentas. Puedes destinar un pequeño monto para publicidad en redes sociales (Ej: $20 USD al mes).</p>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
                <div className="flex items-center gap-3"><Lightbulb className="h-5 w-5 text-primary" /> Marketing de Contenido</div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pl-8">
              <p className="text-muted-foreground">Crea contenido que tu audiencia quiera consumir. No solo vendas, educa y entretén.</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><span className="font-semibold">Blogs:</span> Escribe sobre temas que tu público busca en Google. Ej: Si vendes café, escribe sobre "cómo preparar el café perfecto en casa".</li>
                <li><span className="font-semibold">Videos Cortos (Reels/TikToks):</span> Muestra el "detrás de cámaras" de tu negocio, tutoriales rápidos, o participa en tendencias.</li>
                <li><span className="font-semibold">Infografías:</span> Resume información útil de forma visual. Son fáciles de compartir.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

           <AccordionItem value="item-3">
            <AccordionTrigger>
                <div className="flex items-center gap-3"><Share2 className="h-5 w-5 text-primary" /> Selección de Canales</div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pl-8">
              <p className="text-muted-foreground font-bold">No tienes que estar en todas partes. Es mejor ser excelente en uno o dos canales que mediocre en cinco.</p>
               <ul className="list-disc list-inside space-y-2 text-sm">
                <li><span className="font-semibold">¿Tu producto es muy visual?</span> → Instagram, TikTok, Pinterest.</li>
                <li><span className="font-semibold">¿Vendes a otros negocios (B2B)?</span> → LinkedIn, Email Marketing.</li>
                <li><span className="font-semibold">¿Tu público busca activamente soluciones?</span> → Blog (SEO), Google Ads.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      <TabsContent value="strategies" className="mt-4">
         <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    <div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary" /> Marketing en Redes Sociales</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pl-8">
                <Card>
                    <CardHeader><CardTitle className="text-base">Contenido Orgánico</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><span className="font-semibold">Tutoriales:</span> Enseña a usar tu producto.</p>
                        <p><span className="font-semibold">Detrás de Cámaras:</span> Muestra tu proceso de creación, esto genera confianza.</p>
                        <p><span className="font-semibold">Encuestas y Preguntas:</span> Involucra a tu comunidad en tus decisiones.</p>
                        <p><span className="font-semibold">Contenido Generado por Usuario:</span> Pide a tus clientes que compartan fotos con tu producto y compártelas.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Uso de Hashtags</CardTitle></CardHeader>
                    <CardContent className="text-sm">
                        <p>Usa una mezcla de hashtags: populares (#emprendimiento), de nicho (#joyeriaartesanal) y de marca (#TuMarca). Investiga qué hashtags usa tu competencia y tu público.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Interacción con la Comunidad</CardTitle></CardHeader>
                    <CardContent className="text-sm">
                        <p>Responde a CADA comentario y mensaje. No es una tarea, es construir relaciones. Dedica 15 minutos al día solo a esto.</p>
                    </CardContent>
                </Card>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>
                    <div className="flex items-center gap-3"><Send className="h-5 w-5 text-primary" /> Email Marketing Básico</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pl-8">
                     <p className="text-muted-foreground">Tu lista de correos es tu activo más valioso. No depende de ningún algoritmo.</p>
                     <ul className="list-decimal list-inside space-y-2 text-sm">
                        <li><span className="font-semibold">Crea un "Lead Magnet":</span> Ofrece algo de valor gratis a cambio del correo. Ej: un pequeño ebook, una guía, un descuento del 10%.</li>
                        <li><span className="font-semibold">Usa una herramienta gratuita:</span> Mailchimp, Brevo o similares tienen planes gratuitos para empezar.</li>
                        <li><span className="font-semibold">Envía contenido de valor:</span> No solo envíes ofertas. Comparte noticias, consejos, y haz que tus suscriptores se sientan especiales. Una newsletter semanal o quincenal es un buen comienzo.</li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>
                    <div className="flex items-center gap-3"><Handshake className="h-5 w-5 text-primary" /> Estrategias de Bajo Presupuesto</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pl-8">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Colaboraciones</CardTitle></CardHeader>
                        <CardContent className="text-sm">
                            <p>Busca otros emprendedores o micro-influencers (con 1k-10k seguidores) que se dirijan a un público similar pero no sean competencia directa. Proponles un live en Instagram juntos, un sorteo o intercambiar productos.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="text-base">Marketing de Guerrilla</CardTitle></CardHeader>
                        <CardContent className="text-sm">
                            <p>Piensa de forma creativa. ¿Vendes productos para mascotas? Organiza un pequeño concurso de disfraces para perros en un parque local. ¿Vendes comida? Ofrece muestras en un mercado de tu zona. La clave es sorprender y generar conversación.</p>
                        </CardContent>
                    </Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </TabsContent>

      <TabsContent value="measurement" className="mt-4">
         <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    <div className="flex items-center gap-3"><BarChart2 className="h-5 w-5 text-primary" /> KPIs (Indicadores Clave)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pl-8">
                    <p className="text-muted-foreground">No puedes mejorar lo que no mides. Elige 2 o 3 métricas clave para empezar.</p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li><span className="font-semibold">Redes Sociales:</span> Número de seguidores, tasa de interacción (likes + comentarios / seguidores), alcance de publicaciones.</li>
                        <li><span className="font-semibold">Email Marketing:</span> Tasa de apertura (%), tasa de clics (CTR, %).</li>
                        <li><span className="font-semibold">Ventas:</span> Número de ventas, ticket promedio, costo de adquisición de cliente (CAC).</li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-2">
                <AccordionTrigger>
                    <div className="flex items-center gap-3"><ZoomIn className="h-5 w-5 text-primary" /> Análisis y Ajustes</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pl-8">
                    <p className="text-muted-foreground">Revisa tus KPIs cada semana o cada mes. No te obsesiones con los números diarios.</p>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Hazte estas preguntas:</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p>• ¿Qué tipo de publicación tuvo más "me gusta" o comentarios este mes? → <span className="font-semibold">Haz más de eso.</span></p>
                            <p>• ¿De qué canal vinieron más visitas a tu web? → <span className="font-semibold">Invierte más tiempo ahí.</span></p>
                            <p>• ¿La newsletter que enviaste generó alguna venta? → <span className="font-semibold">Analiza el asunto y el llamado a la acción.</span></p>
                        </CardContent>
                    </Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </TabsContent>
    </Tabs>
  );
}
