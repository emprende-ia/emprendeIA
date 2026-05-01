'use client';

import { LogOut, User as UserIcon, Gem, EllipsisVertical, Lightbulb, RefreshCw, Loader2 } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
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
  const [isClient, setIsClient] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const brandName = brandIdentity?.brandName || "EmprendeIA";
  const logoUrl = brandIdentity?.logoUrl || "https://i.postimg.cc/wxVbJF5r/Gemini-Generated-Image-19a6sy19a6sy19a6.png";


  useEffect(() => {
    setIsClient(true);

    if (user && firestore) {
      setIsIdentityLoading(true);
      const unsubscribe = getBrandIdentity(firestore, user.uid, (identity) => {
        setBrandIdentity(identity);
        setIsIdentityLoading(false);
      });
      return () => unsubscribe();
    } else {
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

    if (!user) {
        toast({ title: 'Inicia sesión', description: 'Debes iniciar sesión para cambiar el logo.', variant: 'destructive'});
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      const updatedIdentity = {
          ...(brandIdentity || { brandName: 'Mi Marca', slogan: 'Mi Eslogan', colorPalette: [], logoPrompt: '', logoUrl: null, logoSource: null }),
          logoUrl: dataUrl,
          logoSource: 'user_uploaded' as const
      };
      setBrandIdentity(updatedIdentity as BrandIdentity);

      try {
        if(user && firestore) {
            await saveBrandIdentity(firestore, user.uid, updatedIdentity);
            toast({
                title: 'Logo actualizado',
                description: 'Tu nuevo logo ha sido guardado y sincronizado.',
            });
        }
      } catch (error) {
         toast({ title: 'Error al guardar el logo', description: 'No se pudo guardar la imagen. Inténtalo de nuevo.', variant: 'destructive'});
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    localStorage.removeItem('viabilityAnalysis');
    localStorage.removeItem('brandIdentity');
    localStorage.removeItem('businessProfile');
    router.push('/');
    router.refresh();
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  }

  return (
    <header className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/60 px-4 py-3 shadow-soft backdrop-blur-sm">
      {/* Lado izquierdo: logo + marca */}
      <div className="flex items-center gap-3">
        <label htmlFor="logo-upload-header" className="group relative cursor-pointer">
          <div className="h-12 w-12 overflow-hidden rounded-xl border bg-card transition-all group-hover:shadow-aurora">
            {isIdentityLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <Image
                src={logoUrl}
                alt={`${brandName} Logo`}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/55 text-[10px] font-semibold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">
            Cambiar
          </span>
        </label>
        <input
          id="logo-upload-header"
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleLogoUpload}
        />
        <div className="min-w-0">
          <h1 className="font-headline text-lg font-bold tracking-tight sm:text-xl">
            <span className="text-aurora">{brandName}</span>
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Tu copiloto para emprender
          </p>
        </div>
      </div>

      {/* Lado derecho: acciones */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {isClient && <SettingsMenu />}

        {isClient && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <EllipsisVertical className="h-4 w-4" />
                <span className="sr-only">Herramientas rápidas</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Herramientas rápidas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                <ViabilityAnalysisViewer isMenuItem={true} />
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <MisRutasModule isMenuItem={true} />
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <MisCampanasModule isMenuItem={true} />
              </DropdownMenuItem>
              <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground">
                      <Lightbulb className="mr-2 h-4 w-4" /> Conceptos de Marketing
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="font-headline text-2xl">Conceptos clave de marketing</DialogTitle>
                      <DialogDescription>Una guía rápida para entender los pilares del marketing digital.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto py-4">
                      <BrandCampaign />
                    </div>
                  </DialogContent>
                </Dialog>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/start')}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reformular mi negocio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
          <Link href="/pricing">
            <Gem className="mr-1.5 h-3.5 w-3.5" />
            Planes
          </Link>
        </Button>

        {isClient && (
          isUserLoading ? (
            <Button variant="outline" size="icon" disabled className="rounded-full">
              <UserIcon className="h-4 w-4" />
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 border-2 border-primary/40">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Usuario'} />
                    <AvatarFallback className="bg-primary/15 text-xs font-semibold">{getInitials(user.displayName)}</AvatarFallback>
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
            <Button asChild variant="outline" size="sm">
              <Link href="/login">
                <UserIcon className="mr-1.5 h-3.5 w-3.5" />
                Iniciar sesión
              </Link>
            </Button>
          )
        )}
      </div>
    </header>
  );
}
