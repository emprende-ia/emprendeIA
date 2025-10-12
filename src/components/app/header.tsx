'use client';

import { Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import React from 'react';
import { useUser, useAuth } from '@/firebase';
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

export function AppHeader() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('');
  }

  return (
    <header className="relative flex flex-col items-center justify-center space-y-4 text-center">
      <div className="absolute top-4 right-4">
        {isUserLoading ? (
          <Button variant="outline" size="sm" disabled>Cargando...</Button>
        ) : user ? (
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Usuario'} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
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

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary p-3 shadow-lg">
          <Sparkles className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
          EmprendeIA Marketplace
        </h1>
      </div>
      <p className="max-w-2xl text-lg text-muted-foreground">
        Desde la idea hasta el proveedor. Conectamos tu visión con oportunidades reales, impulsado por inteligencia artificial.
      </p>
    </header>
  );
}
