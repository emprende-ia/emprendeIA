/**
 * Sistema de diseño Aurora — EmprendeIA.
 *
 * Aurora Dark es el tema por defecto: profundo, con glow índigo/cyan,
 * pensado para que el dashboard luzca y los datos cobren vida.
 * Aurora Light es la versión diurna: limpia, alta legibilidad, mismas
 * bases cromáticas para mantener identidad.
 */

export type ThemeName = 'aurora-dark' | 'aurora-light';

export interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    '--background': string;
    '--foreground': string;
    '--card': string;
    '--card-foreground': string;
    '--popover': string;
    '--popover-foreground': string;
    '--primary': string;
    '--primary-foreground': string;
    '--secondary': string;
    '--secondary-foreground': string;
    '--muted': string;
    '--muted-foreground': string;
    '--accent': string;
    '--accent-foreground': string;
    '--destructive': string;
    '--destructive-foreground': string;
    '--success': string;
    '--success-foreground': string;
    '--warning': string;
    '--warning-foreground': string;
    '--border': string;
    '--input': string;
    '--ring': string;
    '--radius': string;
    '--chart-1': string;
    '--chart-2': string;
    '--chart-3': string;
    '--chart-4': string;
    '--chart-5': string;
    '--background-gradient-start': string;
    '--background-gradient-end': string;
    '--aurora-glow': string;
  };
}

export const themes: Theme[] = [
  {
    name: 'aurora-dark',
    displayName: 'Aurora Oscuro',
    colors: {
      // base
      '--background': '224 41% 7%',          // #0B0F1A
      '--foreground': '210 40% 98%',         // #F8FAFC
      '--card': '224 35% 10%',               // ligeramente sobre el bg para profundidad
      '--card-foreground': '210 40% 98%',
      '--popover': '224 38% 9%',
      '--popover-foreground': '210 40% 98%',
      // brand
      '--primary': '239 84% 67%',            // #6366F1 índigo
      '--primary-foreground': '210 40% 98%',
      '--secondary': '258 90% 76%',          // #A78BFA lavanda
      '--secondary-foreground': '224 41% 7%',
      '--muted': '224 28% 14%',
      '--muted-foreground': '215 20% 65%',
      '--accent': '188 86% 53%',             // #22D3EE cyan eléctrico
      '--accent-foreground': '224 41% 7%',
      // semantic
      '--destructive': '0 84% 60%',
      '--destructive-foreground': '210 40% 98%',
      '--success': '152 76% 53%',            // verde menta
      '--success-foreground': '224 41% 7%',
      '--warning': '38 92% 60%',             // ámbar alerta
      '--warning-foreground': '224 41% 7%',
      // structural
      '--border': '224 24% 18%',
      '--input': '224 24% 18%',
      '--ring': '239 84% 67%',
      '--radius': '0.75rem',
      // charts (índigo, cyan, coral, lavanda, ámbar)
      '--chart-1': '239 84% 67%',
      '--chart-2': '188 86% 53%',
      '--chart-3': '330 86% 70%',
      '--chart-4': '258 90% 76%',
      '--chart-5': '38 92% 60%',
      // ambient gradient (hero/landing)
      '--background-gradient-start': '#0B0F1A',
      '--background-gradient-end': '#1E1B4B',
      '--aurora-glow': '99 102 241',         // RGB para sombras/glow
    },
  },
  {
    name: 'aurora-light',
    displayName: 'Aurora Claro',
    colors: {
      // base
      '--background': '220 33% 99%',         // #FAFBFF
      '--foreground': '224 41% 10%',         // texto profundo
      '--card': '0 0% 100%',
      '--card-foreground': '224 41% 10%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '224 41% 10%',
      // brand (mismo índigo, ajustado para light)
      '--primary': '239 70% 58%',
      '--primary-foreground': '210 40% 98%',
      '--secondary': '258 70% 65%',
      '--secondary-foreground': '210 40% 98%',
      '--muted': '220 14% 96%',
      '--muted-foreground': '224 12% 45%',
      '--accent': '188 75% 45%',
      '--accent-foreground': '210 40% 98%',
      // semantic
      '--destructive': '0 72% 51%',
      '--destructive-foreground': '210 40% 98%',
      '--success': '152 60% 40%',
      '--success-foreground': '210 40% 98%',
      '--warning': '32 95% 50%',
      '--warning-foreground': '210 40% 98%',
      // structural
      '--border': '220 14% 91%',
      '--input': '220 14% 91%',
      '--ring': '239 70% 58%',
      '--radius': '0.75rem',
      // charts
      '--chart-1': '239 70% 58%',
      '--chart-2': '188 75% 45%',
      '--chart-3': '330 75% 55%',
      '--chart-4': '258 70% 65%',
      '--chart-5': '32 95% 50%',
      // ambient gradient (sutil en light)
      '--background-gradient-start': '#F8FAFC',
      '--background-gradient-end': '#EEF2FF',
      '--aurora-glow': '99 102 241',
    },
  },
];

export const DEFAULT_THEME: ThemeName = 'aurora-light';
