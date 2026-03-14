'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Palette, Bot, Heart, RefreshCw, AudioWaveform, Trash2, Download, Upload, AlertTriangle } from "lucide-react";
import { generateDigitalIdentity } from '@/ai/flows/generate-digital-identity';
import { generateLogoFromPrompt } from '@/ai/flows/generate-logo-from-prompt';
import { regenerateBrandElements } from '@/ai/flows/regenerate-brand-elements';
import { generateModuleAudio } from '@/ai/flows/generate-module-audio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { saveBrandIdentity, getBrandIdentity, deleteBrandIdentity, BrandIdentity } from '@/lib/firestore/identity';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const identityFormSchema = z.object({
  businessDescription: z.string().min(10, {
    message: 'La descripción de tu negocio debe tener al menos 10 caracteres.',
  }),
});
type IdentityFormValues = z.infer<typeof identityFormSchema>;


const moduleIntroductionText = "Bienvenido a Identidad Digital. Aquí crearemos el nombre, logo y voz de tu marca.";
const AUDIO_CACHE_KEY = 'audio_intro_identidad_digital';

export function IdentidadDigitalModule() {
  const { user } = useUser();
  const firestore = useFirestore();

  const [isIdentityLoading, setIsIdentityLoading] = useState(false);
  const [isLogoLoading, setIsLogoLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const [identityResult, setIdentityResult] = useState<Partial<BrandIdentity> | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        const cachedAudio = localStorage.getItem(AUDIO_CACHE_KEY);
        if (cachedAudio) {
            setGeneratedAudio(cachedAudio);
        }

        if(user && firestore) {
          const unsubscribe = getBrandIdentity(firestore, user.uid, (identity) => {
            if (identity) {
              setIdentityResult(identity);
            } else {
              resetIdentityState();
            }
          });
          return () => unsubscribe();
        }
        
        const savedProfile = localStorage.getItem('businessProfile');
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                businessForm.setValue('businessDescription', profile.idea || profile.situacionActual || '');
            } catch (e) {
                console.error("Failed to parse business profile from localStorage", e);
            }
        }
    }
  }, [isOpen, user, firestore]);

  const businessForm = useForm<IdentityFormValues>({
    resolver: zodResolver(identityFormSchema),
    defaultValues: { businessDescription: '' },
  });

  const handleGenerateAudio = async () => {
    setIsAudioLoading(true);
    try {
        const { audioUrl } = await generateModuleAudio({ textToSpeak: moduleIntroductionText });
        setGeneratedAudio(audioUrl);
        localStorage.setItem(AUDIO_CACHE_KEY, audioUrl);
    } catch (e) {
        console.error(e);
        toast({
            title: "Error al generar audio",
            description: "No se pudo generar la introducción en audio.",
            variant: "destructive"
        });
    } finally {
        setIsAudioLoading(false);
    }
  };

  const resetIdentityState = () => {
      setIdentityResult(null);
      setAiError(null);
  }

  const onBusinessSubmit: SubmitHandler<IdentityFormValues> = async (data) => {
    setIsIdentityLoading(true);
    resetIdentityState();
    try {
      const result = await generateDigitalIdentity(data);
      setIdentityResult(result);
      toast({
        title: "¡Identidad de Marca Generada!",
        description: "Revisa el nombre, eslogan y el prompt para tu logo.",
      });
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.message || e.toString();
      if (errorMsg.includes('403') || errorMsg.toLowerCase().includes('forbidden') || errorMsg.includes('blocked')) {
          setAiError("API_KEY_BLOCKED");
      } else {
          toast({
            title: "Error al crear la identidad",
            description: "Hubo un problema con la IA. Por favor, inténtalo de nuevo.",
            variant: "destructive"
          });
      }
    } finally {
      setIsIdentityLoading(false);
    }
  };
  
  const handleGenerateLogo = async () => {
      if (!identityResult?.logoPrompt) {
          toast({ title: 'Falta el prompt del logo', description: 'Primero genera una identidad de marca para obtener un prompt.', variant: 'destructive'});
          return;
      }
      setIsLogoLoading(true);
      try {
        const { logoUrl } = await generateLogoFromPrompt({ logoPrompt: identityResult.logoPrompt });
        setIdentityResult(prev => ({
            ...prev,
            logoUrl: logoUrl,
            logoSource: 'ai_generated'
        }));
        toast({ title: '¡Logo generado!', description: 'Tu nuevo logo está listo.'});
      } catch (error: any) {
        console.error(error);
        const errorMsg = error.message || error.toString();
        if (errorMsg.includes('403') || errorMsg.toLowerCase().includes('forbidden') || errorMsg.includes('blocked')) {
            setAiError("API_KEY_BLOCKED");
        } else {
            toast({ title: 'Error al generar el logo', description: 'No se pudo crear la imagen. Intenta de nuevo.', variant: 'destructive'});
        }
      } finally {
        setIsLogoLoading(false);
      }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast({ title: "Archivo inválido", description: "Solo puedes subir imágenes.", variant: "destructive" });
        return;
    }
    if (file.size > 4 * 1024 * 1024) { 
        toast({ title: "Archivo muy grande", description: "El logo debe pesar menos de 4MB.", variant: "destructive" });
        return;
    }

    setIsUploadingLogo(true);
    try {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            setIdentityResult(prev => ({
                ...(prev || {}),
                logoUrl: dataUrl,
                logoSource: 'user_uploaded'
            }));
            toast({ title: "Logo cargado", description: "Tu imagen se ha cargado. No olvides guardar y sincronizar." });
        };
        reader.readAsDataURL(file);

    } catch (error) {
        console.error("Error cargando archivo:", error);
        toast({ title: "Error al cargar", description: "No se pudo cargar tu imagen. Intenta de nuevo.", variant: "destructive" });
    } finally {
        setIsUploadingLogo(false);
        if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };
    
  const handleApplyIdentity = async () => {
    if (!identityResult) return;

    if (!user || !firestore) {
      // For guests, we just keep it in state and localStorage
      localStorage.setItem('brandIdentity', JSON.stringify({
          ...identityResult,
          updatedAt: new Date().toISOString()
      }));
      toast({
          title: '¡Identidad Aplicada!',
          description: 'Tu marca se ha aplicado localmente. Inicia sesión para guardarla permanentemente.',
      });
      setIsOpen(false);
      return;
    }
    
    const identityToSave: BrandIdentity = {
      brandName: identityResult.brandName || '',
      slogan: identityResult.slogan || '',
      colorPalette: identityResult.colorPalette || [],
      logoPrompt: identityResult.logoPrompt || '',
      logoUrl: identityResult.logoUrl || null,
      logoSource: identityResult.logoSource || null,
    };
    
    try {
      await saveBrandIdentity(firestore, user.uid, identityToSave);
      toast({
          title: '¡Identidad Sincronizada!',
          description: 'Tu marca se ha guardado en tu cuenta.',
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save brand identity:", error);
      let errorMessage = "No se pudo sincronizar la identidad.";
      if (error instanceof Error && error.message.includes('exceeds the maximum allowed size')) {
          errorMessage = "El logo es demasiado grande para guardarlo. Intenta subir una imagen más pequeña."
      }
      toast({
        title: 'Error al Sincronizar',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleRegenerateElements = async () => {
    const description = businessForm.getValues('businessDescription');
    if (!description) {
        toast({ title: 'Falta descripción', description: 'Por favor, describe tu negocio primero.', variant: 'destructive'});
        return;
    }
    setIsRegenerating(true);
    try {
        const { brandName, slogan } = await regenerateBrandElements({ businessDescription: description });
        setIdentityResult(prev => ({
            ...prev,
            brandName,
            slogan,
        }));
        toast({ title: '¡Nuevas sugerencias!', description: 'Se ha generado un nuevo nombre y eslogan.'});
    } catch (error: any) {
        console.error(error);
        const errorMsg = error.message || error.toString();
        if (errorMsg.includes('403') || errorMsg.toLowerCase().includes('forbidden') || errorMsg.includes('blocked')) {
            setAiError("API_KEY_BLOCKED");
        } else {
            toast({ title: 'Error', description: 'No se pudieron generar nuevas sugerencias.', variant: 'destructive'});
        }
    } finally {
        setIsRegenerating(false);
    }
  }

  const handleDelete = () => {
      if (user && firestore) {
          deleteBrandIdentity(firestore, user.uid);
      }
      localStorage.removeItem('brandIdentity');
      resetIdentityState();
      toast({
          title: "Identidad eliminada",
          description: "Puedes generar una nueva identidad cuando quieras."
      })
  }

  const handleDownloadLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!identityResult?.logoUrl) return;
    const link = document.createElement('a');
    link.href = identityResult.logoUrl;
    const brandName = identityResult.brandName || 'logo';
    const fileExtensionMatch = identityResult.logoUrl.match(/^data:image\/(\w+);base64,/);
    const fileExtension = fileExtensionMatch ? fileExtensionMatch[1] : 'png';
    link.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-logo.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      businessForm.reset();
      setIdentityResult(null);
      setAiError(null);
      setIsIdentityLoading(false);
      setIsUploadingLogo(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold"><Sparkles className="mr-2 h-4 w-4" /> Crear Identidad</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                    <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Palette /> Generador de Identidad Digital</DialogTitle>
                    <DialogDescription>
                        Describe tu negocio y la IA creará un nombre, eslogan, colores y un logo profesional.
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        <div className="py-4 space-y-6 overflow-y-auto pr-4">
            
            <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-4">
                    <FormField
                    control={businessForm.control}
                    name="businessDescription"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Textarea placeholder="Ej: 'Una marca de ropa sostenible hecha con materiales reciclados para jóvenes conscientes del medio ambiente.'" {...field} className="min-h-[100px]"/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" size="sm" className="w-full font-bold" disabled={isIdentityLoading || isUploadingLogo || isLogoLoading}>
                    {isIdentityLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando Magia...</>
                    ) : (
                        <><Sparkles className="mr-2 h-4 w-4" /> Generar Identidad de Marca</>
                    )}
                    </Button>
                </form>
            </Form>

            {aiError === "API_KEY_BLOCKED" && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive shadow-md animate-in slide-in-from-top-2">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle className="font-bold text-lg">Error de Clave de API (403)</AlertTitle>
                    <AlertDescription className="space-y-3 pt-2">
                        <p>La IA no puede responder porque tu solicitud fue rechazada. Esto suele pasar si:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>La <b>Generative Language API</b> no está habilitada en tu consola.</li>
                            <li>Tu <b>API Key</b> es incorrecta o está bloqueada.</li>
                        </ul>
                        <div className="bg-background/50 p-3 rounded border border-destructive/20 text-xs">
                            <p className="font-bold underline mb-1">Cómo arreglarlo:</p>
                            <p>1. Ve a <a href="https://aistudio.google.com/app/apikey" target="_blank" className="font-bold underline">Google AI Studio</a>.</p>
                            <p>2. Genera una <b>API Key</b> nueva y gratuita.</p>
                            <p>3. Pégala en tu archivo <code>.env</code> bajo <code>GOOGLE_GENAI_API_KEY</code>.</p>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {identityResult && (
                <div className="space-y-4 pt-4">
                     <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle className="font-bold">¡Aquí tienes tu nueva Identidad de Marca!</AlertTitle>
                        <AlertDescription className="text-muted-foreground">Puedes editar los elementos y luego generar un logo basado en el prompt.</AlertDescription>
                    </Alert>

                    {identityResult.logoUrl && (
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-lg">Logo</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 flex items-center justify-center">
                                <div className="aspect-square bg-muted flex items-center justify-center relative group w-48 h-48 rounded-lg">
                                    <Image src={identityResult.logoUrl} alt="Logo principal generado por IA" layout="fill" className="object-contain p-2"/>
                                </div>
                            </CardContent>
                             <CardFooter className="p-2 flex justify-end gap-2">
                                <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" disabled={isUploadingLogo}>
                                    {isUploadingLogo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="mr-2 h-4 w-4" />}
                                    Subir Logo
                                </Button>
                                <Button onClick={handleDownloadLogo} variant="secondary" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar
                                </Button>
                            </CardFooter>
                             <input
                                id="logo-upload"
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleFileUpload}
                            />
                        </Card>
                    )}
                   
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Elementos de Marca</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold">Nombre:</label>
                                <div className="flex items-center gap-2">
                                <Input
                                    value={identityResult.brandName || ''}
                                    onChange={(e) => setIdentityResult(prev => ({ ...prev, brandName: e.target.value }))}
                                    className="font-headline text-xl h-auto p-1 mt-1"
                                />
                                <Button onClick={handleRegenerateElements} size="icon" variant="ghost" disabled={isRegenerating}>
                                    {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4 text-primary" />}
                                </Button>
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-semibold">Eslogan:</label>
                                <div className="flex items-center gap-2">
                                <Input
                                    value={identityResult.slogan || ''}
                                    onChange={(e) => setIdentityResult(prev => ({ ...prev, slogan: e.target.value }))}
                                    className="italic text-muted-foreground mt-1"
                                />
                                 <Button onClick={handleRegenerateElements} size="icon" variant="ghost" disabled={isRegenerating}>
                                    {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4 text-primary" />}
                                 </Button>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Paleta de Colores:</p>
                                <div className="flex flex-wrap gap-4 pt-2">
                                    {identityResult.colorPalette?.map((color) => (
                                        <div key={color.hex} className="flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 rounded-full border-2" style={{ backgroundColor: color.hex }} />
                                            <div className="text-center">
                                                <p className="text-xs font-medium">{color.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {identityResult.logoPrompt && (
                                <div>
                                    <label className="text-sm font-semibold">Prompt del Logo:</label>
                                    <Textarea
                                        value={identityResult.logoPrompt || ''}
                                        onChange={(e) => setIdentityResult(prev => ({ ...prev, logoPrompt: e.target.value }))}
                                        className="text-xs font-mono text-muted-foreground bg-secondary/50 p-2 rounded-md mt-1"
                                        rows={4}
                                    />
                                    <Button onClick={handleGenerateLogo} size="sm" className="w-full mt-2" disabled={isLogoLoading || !identityResult.logoPrompt}>
                                        {isLogoLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Sparkles className="h-4 w-4 mr-2" />}
                                        Generar Logo con IA
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
        <DialogFooter className="border-t pt-4 flex-col-reverse sm:flex-row sm:justify-between gap-2">
             {identityResult && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="lg">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Borrar Identidad
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro de que quieres borrar la identidad?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará tu nombre, logo, eslogan y colores. Podrás generar una nueva identidad desde cero.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Sí, borrar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <Button onClick={handleApplyIdentity} size="lg" disabled={!identityResult} className="w-full">
                <Heart className="mr-2 h-4 w-4" />
                {user ? 'Guardar y Sincronizar Identidad' : 'Aplicar Identidad'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
