
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Palette, Lightbulb, Users, Brush, Type, Mic, MessageSquare } from "lucide-react";

export function IdentidadDigitalModule() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold"><Sparkles className="mr-2 h-4 w-4" /> Crear Identidad</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Palette /> Guía para tu Identidad de Marca</DialogTitle>
          <DialogDescription>
            Sigue estos pasos para construir una marca memorable y coherente desde cero.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Tabs defaultValue="fundamentos" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="fundamentos">1. Fundamentos</TabsTrigger>
                    <TabsTrigger value="visuales">2. Elementos Visuales</TabsTrigger>
                    <TabsTrigger value="voz">3. Voz y Tono</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fundamentos" className="mt-4 max-h-[60vh] overflow-y-auto p-1 space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Lightbulb className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>¿Qué es la identidad de marca?</CardTitle>
                                <p className="text-sm text-muted-foreground">Es la personalidad de tu negocio y la promesa que haces a tus clientes.</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">No es solo un logo. Es cómo se ve, se siente y habla tu marca. Incluye tus valores, tu forma de comunicar y la experiencia que ofreces. Una identidad sólida genera confianza y lealtad.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Users className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>Define tu público objetivo o "Buyer Persona"</CardTitle>
                                <p className="text-sm text-muted-foreground">¿Para quién es tu negocio?</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-2">Crear un perfil de tu cliente ideal te ayuda a conectar mejor. Responde a estas preguntas:</p>
                             <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>¿Qué edad tiene? ¿Dónde vive? ¿A qué se dedica?</li>
                                <li>¿Qué le frustra? ¿Qué necesita? (El problema que tú resuelves)</li>
                                <li>¿Qué redes sociales usa? ¿Qué le gusta hacer en su tiempo libre?</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="visuales" className="mt-4 max-h-[60vh] overflow-y-auto p-1 space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Brush className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>Creación de un Logotipo</CardTitle>
                                <p className="text-sm text-muted-foreground">Es la cara de tu marca.</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-2">Tu logo debe ser simple, memorable y representar la esencia de tu negocio. Puedes usar herramientas como Canva (gratis) para empezar, o contratar a un diseñador en plataformas como Fiverr si buscas algo más profesional.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Palette className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>Paleta de Colores</CardTitle>
                                <p className="text-sm text-muted-foreground">Los colores comunican emociones.</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm mb-2">Elige 2-3 colores principales y 1-2 de acento. La psicología del color es clave:</p>
                             <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li><strong>Azul:</strong> Confianza, calma, profesionalismo.</li>
                                <li><strong>Rojo:</strong> Pasión, urgencia, energía.</li>
                                <li><strong>Verde:</strong> Naturaleza, crecimiento, frescura.</li>
                                <li><strong>Amarillo:</strong> Alegría, optimismo, atención.</li>
                            </ul>
                             <p className="text-sm mt-2">Herramientas como Coolors.co te ayudan a generar paletas armoniosas.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Type className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>Tipografía</CardTitle>
                                <p className="text-sm text-muted-foreground">La voz escrita de tu marca.</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">Elige una fuente para títulos (puede ser más creativa) y otra para textos largos (debe ser muy legible). Google Fonts ofrece un catálogo inmenso y gratuito. Lo importante es la consistencia.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="voz" className="mt-4 max-h-[60vh] overflow-y-auto p-1 space-y-4">
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Mic className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>Define tu Voz y Tono</CardTitle>
                                <p className="text-sm text-muted-foreground">¿Cómo "habla" tu marca?</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-2">Tu tono debe ser consistente en todas tus comunicaciones (redes, emails, web). Decide si quieres sonar:</p>
                             <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li><strong>Profesional y formal:</strong> Ideal para servicios B2B.</li>
                                <li><strong>Amigable y cercano:</strong> Perfecto para marcas de consumo.</li>
                                <li><strong>Humorístico e ingenioso:</strong> Genial para conectar con audiencias jóvenes.</li>
                                <li><strong>Inspirador y motivacional:</strong> Si tu marca se centra en el crecimiento personal.</li>
                            </ul>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <MessageSquare className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>Mensaje Clave</CardTitle>
                                <p className="text-sm text-muted-foreground">Tu "elevator pitch" en una frase.</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">Resume lo que haces, para quién y por qué eres diferente. Debe ser una frase corta y potente que puedas usar en todas partes. Por ejemplo: "Ayudamos a emprendedores a lanzar su negocio con herramientas de IA, ahorrándoles tiempo y dinero".</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
