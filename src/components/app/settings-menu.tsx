'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Monitor, Sun, Moon, Palette } from "lucide-react";

type Theme = 'theme-default' | 'theme-light' | 'theme-vibrant';

const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'theme-default', label: 'Futuristic Dark', icon: <Moon className="mr-2 h-4 w-4" /> },
  { value: 'theme-light', label: 'Minimalist Light', icon: <Sun className="mr-2 h-4 w-4" /> },
  { value: 'theme-vibrant', label: 'Vibrant', icon: <Palette className="mr-2 h-4 w-4" /> },
];

export function SettingsMenu() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('theme-default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && themes.some(t => t.value === savedTheme)) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (themeValue: string) => {
    const theme = themeValue as Theme;
    setCurrentTheme(theme);
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
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
            <DropdownMenuRadioItem key={theme.value} value={theme.value} className="cursor-pointer">
              {theme.icon}
              <span>{theme.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
