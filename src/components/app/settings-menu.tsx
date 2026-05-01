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
} from '@/components/ui/dropdown-menu';
import { Settings, Moon, Sun } from 'lucide-react';
import { themes, DEFAULT_THEME, type ThemeName } from '@/lib/themes';

const themeIcons: Record<ThemeName, React.ReactNode> = {
  'aurora-dark': <Moon className="mr-2 h-4 w-4" />,
  'aurora-light': <Sun className="mr-2 h-4 w-4" />,
};

function applyTheme(name: ThemeName) {
  const root = document.documentElement;
  if (name === 'aurora-light') {
    root.classList.add('light');
  } else {
    root.classList.remove('light');
  }
  localStorage.setItem('theme', name);
}

export function SettingsMenu() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as ThemeName | null;
    const valid = saved && themes.some((t) => t.name === saved) ? saved : DEFAULT_THEME;
    setCurrentTheme(valid);
    applyTheme(valid);
  }, []);

  const handleThemeChange = (value: string) => {
    const next = value as ThemeName;
    setCurrentTheme(next);
    applyTheme(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Ajustes</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Apariencia</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={currentTheme} onValueChange={handleThemeChange}>
          {themes.map((theme) => (
            <DropdownMenuRadioItem
              key={theme.name}
              value={theme.name}
              className="cursor-pointer"
            >
              {themeIcons[theme.name]}
              <span>{theme.displayName}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
