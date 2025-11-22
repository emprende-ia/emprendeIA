
'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Palette, PenTool, Bot, Image as ImageIcon, Heart, RefreshCw, AudioWaveform, Trash2, Download } from "lucide-react";
import { generateDigitalIdentity, type GenerateDigitalIdentityOutput } from '@/ai/flows/generate-digital-identity';
import { generateOptimizedImage, type GenerateOptimizedImageOutput } from '@/ai/flows/generate-optimized-image';
import { generateModuleAudio } from '@/ai/flows/generate-module-audio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { saveBrandIdentity, getBrandIdentity, BrandIdentity } from '@/lib/firestore/identity';


const identityFormSchema = z.object({
  businessDescription: z.string().min(10, {
    message: 'La descripción de tu negocio debe tener al menos 10 caracteres.',
  }),
});
type IdentityFormValues = z.infer<typeof identityFormSchema>;

const brandElementsSchema = z.object({
    brandName: z.string(),
    slogan: z.string(),
});
type BrandElementsFormValues = z.infer<typeof brandElementsSchema>;

const moduleIntroductionText = "Bienvenido a Identidad Digital. Aquí crearemos el nombre, logo y voz de tu marca.";
const AUDIO_CACHE_KEY = 'audio_intro_identidad_digital';

export function IdentidadDigitalModule() {
  const { user } = useUser();
  const firestore = useFirestore();

  const [isIdentityLoading, setIsIdentityLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  const [identityResult, setIdentityResult] = useState<GenerateDigitalIdentityOutput | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GenerateOptimizedImageOutput | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [logoPrompt, setLogoPrompt] = useState<string>('');
  
  const [isRegeneratingName, setIsRegeneratingName] = useState(false);
  const [isRegeneratingSlogan, setIsRegeneratingSlogan] = useState(false);
  const [isRegeneratingLogoPrompt, setIsRegeneratingLogoPrompt] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        // Load intro audio from cache if available
        const cachedAudio = localStorage.getItem(AUDIO_CACHE_KEY);
        if (cachedAudio) {
            setGeneratedAudio(cachedAudio);
        }

        // Load existing identity from Firestore if user is logged in
        if(user && firestore) {
          const unsubscribe = getBrandIdentity(firestore, user.uid, (identity) => {
            if (identity) {
              setIdentityResult(identity);
              setGeneratedImage(identity.logoUrl ? { imageUrl: identity.logoUrl, optimizedPrompt: identity.logoPrompt || '' } : null);
              brandForm.reset({ brandName: identity.brandName, slogan: identity.slogan });
              setLogoPrompt(identity.logoPrompt || '');
            }
          });
          return () => unsubscribe();
        } else {
          // Fallback to localStorage for guest users
          const savedIdentity = localStorage.getItem('brandIdentity');
          if (savedIdentity) {
            const parsed = JSON.parse(savedIdentity);
            setIdentityResult(parsed);
            brandForm.reset({ brandName: parsed.brandName, slogan: parsed.slogan });
            setLogoPrompt(parsed.logoPrompt);
          }
        }
        
        // Pre-fill business description from profile
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

  const brandForm = useForm<BrandElementsFormValues>({
    resolver: zodResolver(brandElementsSchema),
    defaultValues: { brandName: '', slogan: '' },
  });

  const isBrandDirty = brandForm.formState.isDirty;

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


  const onBusinessSubmit: SubmitHandler<IdentityFormValues> = async (data) => {
    setIsIdentityLoading(true);
    setIdentityResult(null);
    setGeneratedImage(null);
    brandForm.reset();
    setLogoPrompt('');
    try {
      const result = await generateDigitalIdentity(data);
      setIdentityResult(result);
      brandForm.reset({ brandName: result.brandName, slogan: result.slogan });
      setLogoPrompt(result.logoPrompt);
      toast({
        title: "¡Identidad Digital Generada!",
        description: "Aquí tienes los elementos clave para tu nueva marca.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error al crear la identidad",
        description: "Hubo un problema con la IA. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsIdentityLoading(false);
    }
  };

  const handleRegenerateField = async (field: 'brandName' | 'slogan') => {
      const businessDescription = businessForm.getValues('businessDescription');
      if (!businessDescription) return;

      if (field === 'brandName') setIsRegeneratingName(true);
      if (field === 'slogan') setIsRegeneratingSlogan(true);
      
      try {
        const result = await generateDigitalIdentity({ businessDescription });
        brandForm.setValue(field, result[field], { shouldDirty: true });
      } catch (e) {
        toast({ title: `Error al regenerar el ${field === 'brandName' ? 'nombre' : 'eslogan'}`, variant: "destructive" });
      } finally {
        if (field === 'brandName') setIsRegeneratingName(false);
        if (field === 'slogan') setIsRegeneratingSlogan(false);
      }
  };

  const handleUpdateLogoPrompt = async () => {
    const businessDescription = businessForm.getValues('businessDescription');
    const brandName = brandForm.getValues('brandName');
    const slogan = brandForm.getValues('slogan');
    if (!businessDescription || !brandName || !slogan) return;
    
    setIsRegeneratingLogoPrompt(true);
    try {
        const result = await generateDigitalIdentity({ 
            businessDescription: `${businessDescription} The brand name is '${brandName}' and the slogan is '${slogan}'`
        });
        setLogoPrompt(result.logoPrompt);
        brandForm.reset(brandForm.getValues());
        toast({ title: "Idea para logo actualizada" });
    } catch (e) {
        toast({ title: "Error al actualizar la idea para el logo", variant: "destructive" });
    } finally {
        setIsRegeneratingLogoPrompt(false);
    }
  };

  const onImageGenerate = async () => {
      if (!logoPrompt) return;

      setIsImageLoading(true);
      try {
          const result = await generateOptimizedImage({
              prompt: logoPrompt,
              creativeType: 'LOGO',
          });
          setGeneratedImage(result);
          toast({
              title: "¡Logo generado!",
              description: "Tu logo está listo para que lo veas."
          });
      } catch (e) {
          console.error(e);
          toast({
              title: "Error al generar la imagen",
              description: "No se pudo crear el logo. Inténtalo de nuevo.",
              variant: "destructive",
          });
      } finally {
          setIsImageLoading(false);
      }
  };

  const handleApplyIdentity = () => {
    if (!identityResult) return;
    const identityToSave: BrandIdentity = {
      ...identityResult,
      brandName: brandForm.getValues('brandName'),
      slogan: brandForm.getValues('slogan'),
      logoPrompt: logoPrompt,
      logoUrl: generatedImage?.imageUrl || null,
    };
    
    if (user && firestore) {
        saveBrandIdentity(firestore, user.uid, identityToSave);
        toast({
            title: '¡Identidad Sincronizada!',
            description: 'Tu marca se ha guardado en tu cuenta.',
        });
    } else {
        localStorage.setItem('brandIdentity', JSON.stringify(identityToSave));
        toast({
            title: '¡Identidad Guardada!',
            description: 'Tu marca se ha guardado en este dispositivo.',
        });
    }
    setIsOpen(false);
  };

  const handleDownloadLogo = () => {
    if (!generatedImage?.imageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImage.imageUrl;
    const brandName = brandForm.getValues('brandName') || 'logo';
    link.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      businessForm.reset();
      brandForm.reset();
      setIdentityResult(null);
      setGeneratedImage(null);
      setIsIdentityLoading(false);
      setIsImageLoading(false);
      setLogoPrompt('');
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
                        Describe tu negocio y la IA creará un nombre, eslogan, paleta de colores y hasta un borrador de tu logo.
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        <div className="py-4 space-y-6 overflow-y-auto pr-4">
            <div className="space-y-4">
                {generatedAudio ? (
                    <div className="flex flex-col items-center gap-2">
                        <audio src={generatedAudio} controls className="w-full h-10" />
                        <p className="text-xs text-muted-foreground">Reproduce la introducción al módulo.</p>
                    </div>
                ) : (
                    <Button variant="outline" className="w-full" onClick={handleGenerateAudio} disabled={isAudioLoading}>
                        {isAudioLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando audio...</>
                        ) : (
                            <><AudioWaveform className="mr-2 h-4 w-4" /> Introducción al módulo</>
                        )}
                    </Button>
                )}
            </div>
            
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
                    <Button type="submit" size="sm" className="w-full font-bold" disabled={isIdentityLoading || isImageLoading}>
                    {isIdentityLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando Magia...</>
                    ) : (
                        <><Sparkles className="mr-2 h-4 w-4" /> Generar Identidad de Marca</>
                    )}
                    </Button>
                </form>
            </Form>

            {identityResult && (
                <div className="space-y-4 pt-4">
                     <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle className="font-bold">¡Aquí tienes tu nueva Identidad de Marca!</AlertTitle>
                        <AlertDescription className="text-muted-foreground">Puedes editar, regenerar y guardar los elementos para sincronizarlos con tu cuenta.</AlertDescription>
                    </Alert>

                    {generatedImage ? (
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="aspect-video bg-muted flex items-center justify-center relative group">
                                    <Image src={generatedImage.imageUrl} alt="Logo generado por IA" width={512} height={288} className="object-contain"/>
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button onClick={handleDownloadLogo}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Descargar Logo
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex">
                                    {identityResult.colorPalette.map(color => (
                                        <div key={color.hex} style={{ backgroundColor: color.hex }} className="h-4 flex-1"/>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                         <div className="space-y-4">
                            <Form {...brandForm}>
                            <Card className="bg-secondary/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">Nombre de Marca</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={brandForm.control}
                                        name="brandName"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <Input {...field} className="text-xl font-headline"/>
                                                </FormControl>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRegenerateField('brandName')} disabled={isRegeneratingName || isRegeneratingSlogan}>
                                                    {isRegeneratingName ? <Loader2 className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4"/>}
                                                </Button>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                             <Card className="bg-secondary/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">Eslogan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     <FormField
                                        control={brandForm.control}
                                        name="slogan"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <Input {...field} className="italic"/>
                                                </FormControl>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRegenerateField('slogan')} disabled={isRegeneratingName || isRegeneratingSlogan}>
                                                    {isRegeneratingSlogan ? <Loader2 className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4"/>}
                                                </Button>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            </Form>
                        </div>
                    )}
                   
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Paleta de Colores</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            {identityResult.colorPalette.map((color) => (
                                <div key={color.hex} className="flex flex-col items-center gap-2">
                                    <div className="h-16 w-16 rounded-full border-2" style={{ backgroundColor: color.hex }} />
                                    <div className="text-center">
                                        <p className="text-sm font-medium">{color.name}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><PenTool className="h-5 w-5" /> Idea para tu Logo</CardTitle>
                            <CardDescription>Usa esta descripción (prompt) en un generador de imágenes con IA.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <p className="text-sm italic p-4 bg-secondary rounded-md text-muted-foreground font-mono">"{logoPrompt}"</p>
                           {isBrandDirty && (
                             <Button onClick={handleUpdateLogoPrompt} disabled={isRegeneratingLogoPrompt} className="w-full" variant="secondary">
                                {isRegeneratingLogoPrompt ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...</>
                                ) : (
                                    <><RefreshCw className="mr-2 h-4 w-4" /> Actualizar idea para logo</>
                                )}
                            </Button>
                           )}
                        </CardContent>
                        <CardFooter>
                            <Button onClick={onImageGenerate} disabled={isImageLoading || isIdentityLoading || isBrandDirty} className="w-full">
                                {isImageLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando logo...</>
                                ) : (
                                    <><ImageIcon className="mr-2 h-4 w-4" /> Generar imagen con esta idea</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                </div>
            )}
        </div>
        <DialogFooter className="border-t pt-4">
            <Button onClick={handleApplyIdentity} size="lg">
                <Heart className="mr-2 h-4 w-4" />
                Guardar y Sincronizar Identidad
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
