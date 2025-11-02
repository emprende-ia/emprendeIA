
export interface Theme {
    name: 'vibrant-sunset' | 'pastel-warm' | 'default-dark';
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
    };
  }
  
  export const themes: Theme[] = [
    {
      name: 'vibrant-sunset',
      displayName: 'Atardecer Vibrante',
      colors: {
        '--background': '350 100% 98%',
        '--foreground': '240 10% 3.9%',
        '--card': '350 100% 98%',
        '--card-foreground': '240 10% 3.9%', // Corregido para contraste
        '--popover': '0 0% 100%',
        '--popover-foreground': '240 10% 3.9%',
        '--primary': '262 84% 59%',
        '--primary-foreground': '0 0% 98%',
        '--secondary': '240 4.8% 95.9%',
        '--secondary-foreground': '240 5.9% 10%',
        '--muted': '240 4.8% 95.9%',
        '--muted-foreground': '240 3.8% 46.1%', // Aclarado para mejor legibilidad
        '--accent': '275 85% 65%',
        '--accent-foreground': '0 0% 98%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '0 0% 98%',
        '--border': '240 5.9% 90%',
        '--input': '240 5.9% 90%',
        '--ring': '262 84% 59%',
        '--radius': '0.8rem',
        '--chart-1': '220 70% 50%',
        '--chart-2': '160 60% 45%',
        '--chart-3': '30 80% 55%',
        '--chart-4': '280 65% 60%',
        '--chart-5': '340 75% 55%',
        '--background-gradient-start': '#ffafcc',
        '--background-gradient-end': '#bde0fe',
      },
    },
    {
      name: 'pastel-warm',
      displayName: 'Pastel Cálido',
      colors: {
        '--background': '39 100% 97.5%',
        '--foreground': '24 9.8% 10%',
        '--card': '30 100% 95%',
        '--card-foreground': '24 9.8% 10%', // Corregido para contraste
        '--popover': '0 0% 100%',
        '--popover-foreground': '24 9.8% 10%',
        '--primary': '346.8 77.2% 49.8%',
        '--primary-foreground': '355.7 100% 97.3%',
        '--secondary': '35.6 100% 96.3%',
        '--secondary-foreground': '24 9.8% 10%',
        '--muted': '35.6 100% 96.3%',
        '--muted-foreground': '24 9.8% 40%', // Oscurecido para mejor legibilidad
        '--accent': '35.6 100% 96.3%',
        '--accent-foreground': '24 9.8% 10%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '0 0% 98%',
        '--border': '30 100% 90%',
        '--input': '30 100% 90%',
        '--ring': '346.8 77.2% 49.8%',
        '--radius': '0.8rem',
        '--chart-1': '220 70% 50%',
        '--chart-2': '160 60% 45%',
        '--chart-3': '30 80% 55%',
        '--chart-4': '280 65% 60%',
        '--chart-5': '340 75% 55%',
        '--background-gradient-start': '#fbc2eb',
        '--background-gradient-end': '#a6c1ee',
      },
    },
    {
      name: 'default-dark',
      displayName: 'Futurista Oscuro',
      colors: {
        '--background': '222.2 84% 4.9%',
        '--foreground': '210 40% 98%',
        '--card': '222.2 84% 4.9%',
        '--card-foreground': '210 40% 98%',
        '--popover': '222.2 84% 4.9%',
        '--popover-foreground': '210 40% 98%',
        '--primary': '190 95% 55%',
        '--primary-foreground': '190 100% 5%',
        '--secondary': '217.2 32.6% 17.5%',
        '--secondary-foreground': '210 40% 98%',
        '--muted': '217.2 32.6% 17.5%',
        '--muted-foreground': '215 20.2% 65.1%',
        '--accent': '260 95% 70%',
        '--accent-foreground': '260 100% 98%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '210 40% 98%',
        '--border': '217.2 32.6% 17.5%',
        '--input': '217.2 32.6% 17.5%',
        '--ring': '190 95% 55%',
        '--radius': '0.8rem',
        '--chart-1': '220 70% 50%',
        '--chart-2': '160 60% 45%',
        '--chart-3': '30 80% 55%',
        '--chart-4': '280 65% 60%',
        '--chart-5': '340 75% 55%',
        '--background-gradient-start': '#020617',
        '--background-gradient-end': '#1e1b4b',
      },
    },
  ];
