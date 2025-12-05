
'use client';

import { Sparkles, LogOut, User as UserIcon, Gem, Bot, StickyNote, EllipsisVertical, FileText, BookOpen, Target, Lightbulb, RefreshCw } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import Image from 'next/image';
import { SettingsMenu } from './settings-menu';
import { getBrandIdentity, saveBrandIdentity, type BrandIdentity } from '@/lib/firestore/identity';
import { Loader2 } from 'lucide-react';
import { ViabilityAnalysisViewer } from './modules/viability-analysis-viewer';
import { useToast } from '@/hooks/use-toast';
import { MisRutasModule } from './modules/mis-rutas';
import { MisCampanasModule } from './modules/mis-campanas';
import { BrandCampaign } from './modules/brand-campaign';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';


export function AppHeader() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);
  const [isIdentityLoading, setIsIdentityLoading] = useState(true);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);


  const brandName = brandIdentity?.brandName || "EmprendeIA";
  const logoUrl = brandIdentity?.logoUrl || "https://i.postimg.cc/wxVbJF5r/Gemini-Generated-Image-19a6sy19a6sy19a6.png";


  useEffect(() => {
    // Check for saved analysis in localStorage
    if (localStorage.getItem('viabilityAnalysis')) {
        setHasAnalysis(true);
    }
    
    if (user && firestore) {
      setIsIdentityLoading(true);
      const unsubscribe = getBrandIdentity(firestore, user.uid, (identity) => {
        setBrandIdentity(identity);
        setIsIdentityLoading(false);
      });
      return () => unsubscribe();
    } else {
      // If no user, check localStorage for a guest identity
      const savedIdentity = localStorage.getItem('brandIdentity');
      if (savedIdentity) {
        try {
          setBrandIdentity(JSON.parse(savedIdentity));
        } catch (e) {
          console.error("Failed to parse brand identity from localStorage", e);
        }
      }
      setIsIdentityLoading(false);
    }
  }, [user, firestore]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      
      // Immediately update local state for preview
      const updatedIdentity = {
          ...(brandIdentity || { brandName: 'Mi Marca', slogan: 'Mi Eslogan', colorPalette: [], logoPrompt: '' }),
          logoUrl: dataUrl,
      };
      setBrandIdentity(updatedIdentity as BrandIdentity);
      
      // Asynchronously save to backend
      try {
        await saveBrandIdentity(firestore, user?.uid, updatedIdentity);
        toast({
            title: 'Logo actualizado',
            description: 'Tu nuevo logo ha sido guardado y sincronizado.',
        });
      } catch (error) {
         toast({ title: 'Error al guardar el logo', description: 'No se pudo guardar la imagen. Inténtalo de nuevo.', variant: 'destructive'});
         // Optionally, revert the local state if save fails
         // setBrandIdentity(brandIdentity); 
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      // Optional: Clear guest data on logout
      localStorage.removeItem('viabilityAnalysis');
      localStorage.removeItem('brandIdentity');
      router.push('/');
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  }

  return (
    <header className="relative flex w-full items-center justify-between">
      <div className="flex items-center gap-3 group relative">
         <label htmlFor="logo-upload-header" className="cursor-pointer">
            {isIdentityLoading ? (
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            ) : (
                <Image src={logoUrl} alt={`${brandName} Logo`} width={64} height={64} className="rounded-full object-cover drop-shadow-[0_5px_15px_rgba(99,102,241,0.5)]" />
            )}
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white">Cambiar</p>
            </div>
         </label>
         <input
            id="logo-upload-header"
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleLogoUpload}
        />
        <div>
            <h1 className="font-headline text-2xl font-bold tracking-tighter text-foreground sm:text-3xl">
            {brandName}
            </h1>
            <p className="text-sm text-foreground/80 hidden sm:block">
                Convierte tus ideas en negocios reales.
            </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <SettingsMenu />
        
         <Button asChild variant="outline" size="sm">
            <Link href="/pricing">
            <Gem className="mr-2 h-4 w-4" />
            Ver Planes
            </Link>
        </Button>

         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <EllipsisVertical className="h-4 w-4" />
                    <span className="sr-only">Herramientas rápidas</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Herramientas Rápidas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hasAnalysis && (
                    <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                       <ViabilityAnalysisViewer isMenuItem={true} />
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <MisRutasModule isMenuItem={true} />
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <MisCampanasModule isMenuItem={true} />
                </DropdownMenuItem>
                <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                    <Dialog>
                        <DialogTrigger asChild>
                             <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                                <Lightbulb className="mr-2 h-4 w-4" /> Conceptos de Marketing
                            </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                                <DialogTitle className="font-headline text-2xl">Conceptos Clave de Marketing</DialogTitle>
                                <DialogDescription>Una guía rápida para entender los pilares del marketing digital.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 max-h-[70vh] overflow-y-auto">
                                <BrandCampaign />
                            </div>
                        </DialogContent>
                    </Dialog>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/start')}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reformular mi Negocio
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        {isUserLoading ? (
          <Button variant="outline" size="icon" disabled>
            <UserIcon className="h-4 w-4" />
          </Button>
        ) : user ? (
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-primary/50">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Usuario'} />
                  <AvatarFallback className='bg-primary/20'>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="outline">
            <Link href="/login">
            <UserIcon className="mr-2 h-4 w-4" />
            Iniciar Sesión
            </Link>
        </Button>
        )}
      </div>
    </header>
  );
}
