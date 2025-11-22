
'use client';

import { Sparkles, LogOut, User as UserIcon, Gem, Bot, StickyNote, EllipsisVertical } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
import { NotesModule } from './modules/notes-module';
import { LuminarAssistantModule } from './modules/luminar-assistant';
import { getBrandIdentity, type BrandIdentity } from '@/lib/firestore/identity';
import { Loader2 } from 'lucide-react';

export function AppHeader() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);
  const [isIdentityLoading, setIsIdentityLoading] = useState(true);

  const brandName = brandIdentity?.brandName || "EmprendeIA";
  const logoUrl = brandIdentity?.logoUrl || "https://i.postimg.cc/wxVbJF5r/Gemini-Generated-Image-19a6sy19a6sy19a6.png";


  useEffect(() => {
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

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
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
      <Link href="/start" className="flex items-center gap-3">
        {isIdentityLoading ? (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        ) : (
            <Image src={logoUrl} alt={`${brandName} Logo`} width={64} height={64} className="rounded-full object-cover drop-shadow-[0_5px_15px_rgba(99,102,241,0.5)]" />
        )}
        <div>
            <h1 className="font-headline text-2xl font-bold tracking-tighter text-foreground sm:text-3xl">
            {brandName}
            </h1>
            <p className="text-sm text-foreground/80 hidden sm:block">
                Convierte tus ideas en negocios reales.
            </p>
        </div>
      </Link>
      
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
                <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                    <NotesModule isMenuItem={true}/>
                </DropdownMenuItem>
                <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                    <LuminarAssistantModule isMenuItem={true} />
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
