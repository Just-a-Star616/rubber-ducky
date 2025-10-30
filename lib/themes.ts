
export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  sidebar: string;
  'sidebar-foreground': string;
  border: string;
  input: string;
  primary: { [key in '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950']: string };
}

export interface Theme {
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
}

// Helper to convert hex to an "R G B" string for CSS variables
export function hexToRgb(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return `${r} ${g} ${b}`;
}

// Helper to convert hex to an "H S% L%" string for CSS variables
export function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}


const tailwindColors = {
  slate: {"50":"#f8fafc","100":"#f1f5f9","200":"#e2e8f0","300":"#cbd5e1","400":"#94a3b8","500":"#64748b","600":"#475569","700":"#334155","800":"#1e293b","900":"#0f172a","950":"#020617"},
  gray: {"50":"#f9fafb","100":"#f3f4f6","200":"#e5e7eb","300":"#d1d5db","400":"#9ca3af","500":"#6b7280","600":"#4b5563","700":"#374151","800":"#1f2937","900":"#111827","950":"#030712"},
  blue: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"},
  sky: {"50":"#f0f9ff","100":"#e0f2fe","200":"#bae6fd","300":"#7dd3fc","400":"#38bdf8","500":"#0ea5e9","600":"#0284c7","700":"#0369a1","800":"#075985","900":"#0c4a6e","950":"#082f49"},
  emerald: {"50":"#ecfdf5","100":"#d1fae5","200":"#a7f3d0","300":"#6ee7b7","400":"#34d399","500":"#10b981","600":"#059669","700":"#047857","800":"#065f46","900":"#064e3b","950":"#022c22"},
  rose: {"50":"#fff1f2","100":"#ffe4e6","200":"#fecdd3","300":"#fda4af","400":"#fb7185","500":"#f43f5e","600":"#e11d48","700":"#be123c","800":"#9f1239","900":"#881337","950":"#4c0519"},
  amber: {"50":"#fffbeb","100":"#fef3c7","200":"#fde68a","300":"#fcd34d","400":"#fbbf24","500":"#f59e0b","600":"#d97706","700":"#b45309","800":"#92400e","900":"#78350f","950":"#451a03"},
}

const takeMeBlue = {
  "50": "#f0f9ff",
  "100": "#e0f2fe",
  "200": "#bae6fd",
  "300": "#7dd3fc",
  "400": "#45c6ff",
  "500": "#0ea5e9",
  "600": "#00a6eb",
  "700": "#0284c7",
  "800": "#0369a1",
  "900": "#0c4a6e",
  "950": "#082f49",
};

const newAmber = {
  "50": "#FFF3E0",
  "100": "#FFE0B2",
  "200": "#FFCC80",
  "300": "#FFB74D",
  "400": "#FFA726",
  "500": "#FF9800",
  "600": "#FF8000",
  "700": "#F57C00",
  "800": "#EF6C00",
  "900": "#E65100",
  "950": "#D84315"
};

export const themes: Theme[] = [
  {
    name: 'Customer',
    light: {
      background: tailwindColors.sky['50'],
      foreground: tailwindColors.sky['950'],
      card: '#ffffff',
      'card-foreground': tailwindColors.sky['950'],
      sidebar: '#000000',
      'sidebar-foreground': '#ffffff',
      border: tailwindColors.sky['200'],
      input: tailwindColors.sky['200'],
      primary: takeMeBlue,
    },
    dark: {
      background: tailwindColors.sky['950'],
      foreground: tailwindColors.sky['100'],
      card: tailwindColors.sky['900'],
      'card-foreground': tailwindColors.sky['100'],
      sidebar: '#000000',
      'sidebar-foreground': '#ffffff',
      border: tailwindColors.sky['800'],
      input: tailwindColors.sky['800'],
      primary: takeMeBlue,
    }
  },
  {
    name: 'Default',
    light: {
      background: tailwindColors.gray['50'],
      foreground: tailwindColors.gray['900'],
      card: '#ffffff',
      'card-foreground': tailwindColors.gray['900'],
      sidebar: '#ffffff',
      'sidebar-foreground': tailwindColors.gray['900'],
      border: tailwindColors.gray['200'],
      input: tailwindColors.gray['200'],
      primary: tailwindColors.blue,
    },
    dark: {
      background: tailwindColors.gray['900'],
      foreground: tailwindColors.gray['100'],
      card: tailwindColors.gray['800'],
      'card-foreground': tailwindColors.gray['100'],
      sidebar: tailwindColors.gray['800'],
      'sidebar-foreground': tailwindColors.gray['100'],
      border: tailwindColors.gray['700'],
      input: tailwindColors.gray['700'],
      primary: tailwindColors.blue,
    },
  },
  {
    name: 'Emerald',
    light: {
      background: tailwindColors.emerald['50'],
      foreground: tailwindColors.emerald['900'],
      card: '#ffffff',
      'card-foreground': tailwindColors.emerald['900'],
      sidebar: tailwindColors.emerald['800'],
      'sidebar-foreground': tailwindColors.emerald['50'],
      border: tailwindColors.emerald['200'],
      input: tailwindColors.emerald['200'],
      primary: tailwindColors.emerald,
    },
    dark: {
      background: tailwindColors.emerald['950'],
      foreground: tailwindColors.emerald['100'],
      card: tailwindColors.emerald['900'],
      'card-foreground': tailwindColors.emerald['100'],
      sidebar: tailwindColors.emerald['900'],
      'sidebar-foreground': tailwindColors.emerald['100'],
      border: tailwindColors.emerald['800'],
      input: tailwindColors.emerald['800'],
      primary: tailwindColors.emerald,
    },
  },
  {
    name: 'Rose',
    light: {
      background: tailwindColors.rose['50'],
      foreground: tailwindColors.rose['900'],
      card: '#ffffff',
      'card-foreground': tailwindColors.rose['900'],
      sidebar: tailwindColors.rose['800'],
      'sidebar-foreground': tailwindColors.rose['50'],
      border: tailwindColors.rose['200'],
      input: tailwindColors.rose['200'],
      primary: tailwindColors.rose,
    },
    dark: {
      background: tailwindColors.rose['950'],
      foreground: tailwindColors.rose['100'],
      card: tailwindColors.rose['900'],
      'card-foreground': tailwindColors.rose['100'],
      sidebar: tailwindColors.rose['900'],
      'sidebar-foreground': tailwindColors.rose['100'],
      border: tailwindColors.rose['800'],
      input: tailwindColors.rose['800'],
      primary: tailwindColors.rose,
    },
  },
  {
    name: 'Papaya',
    light: {
      background: '#ffffff',
      foreground: '#000000',
      card: '#ffffff',
      'card-foreground': '#000000',
      sidebar: '#47C7FC',
      'sidebar-foreground': '#000000',
      border: tailwindColors.slate['200'],
      input: tailwindColors.slate['200'],
      primary: newAmber,
    },
    dark: {
      background: '#000000',
      foreground: '#ffffff',
      card: tailwindColors.slate['900'],
      'card-foreground': '#ffffff',
      sidebar: tailwindColors.sky['900'],
      'sidebar-foreground': '#ffffff',
      border: tailwindColors.slate['800'],
      input: tailwindColors.slate['800'],
      primary: newAmber,
    },
  },
    {
    name: 'Slate',
    light: {
      background: tailwindColors.slate['50'],
      foreground: tailwindColors.slate['900'],
      card: '#ffffff',
      'card-foreground': tailwindColors.slate['900'],
      sidebar: tailwindColors.slate['800'],
      'sidebar-foreground': tailwindColors.slate['50'],
      border: tailwindColors.slate['200'],
      input: tailwindColors.slate['200'],
      primary: tailwindColors.slate,
    },
    dark: {
      background: tailwindColors.slate['950'],
      foreground: tailwindColors.slate['100'],
      card: tailwindColors.slate['900'],
      'card-foreground': tailwindColors.slate['100'],
      sidebar: tailwindColors.slate['900'],
      'sidebar-foreground': tailwindColors.slate['100'],
      border: tailwindColors.slate['800'],
      input: tailwindColors.slate['800'],
      primary: tailwindColors.slate,
    },
  },
];