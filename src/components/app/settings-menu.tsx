
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Zap, Wind, Palette as PaletteIcon } from "lucide-react";
import { themes, type Theme } from '@/lib/themes';

const themeIcons: Record<Theme['name'], React.ReactNode> = {
    'vibrant-sunset': <Zap className="mr-2 h-4 w-4" />,
    'pastel-warm': <Wind className="mr-2 h-4 w-4" />,
    'default-dark': <PaletteIcon className="mr-2 h-4 w-4" />,
}

export function SettingsMenu() {
  const [currentTheme, setCurrentTheme] = useState<Theme['name']>('default-dark');

  useEffect(() => {
    const savedThemeName = localStorage.getItem('theme') as Theme['name'] | null;
    const theme = themes.find(t => t.name === savedThemeName) ?? themes[2]; // Default to 'default-dark'
    
    setCurrentTheme(theme.name);
    applyTheme(theme);

  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.body;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    localStorage.setItem('theme', theme.name);
  };

  const handleThemeChange = (themeName: string) => {
    const theme = themes.find(t => t.name === themeName);
    if(theme){
        setCurrentTheme(theme.name);
        applyTheme(theme);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Ajustes</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Apariencia</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={currentTheme} onValueChange={handleThemeChange}>
          {themes.map((theme) => (
            <DropdownMenuRadioItem key={theme.name} value={theme.name} className="cursor-pointer">
              {themeIcons[theme.name]}
              <span>{theme.displayName}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
