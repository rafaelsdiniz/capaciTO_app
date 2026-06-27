/**
 * Identidade visual CapaciTO — "O Rio e o Sol".
 * Rede profissional (seriedade tipo LinkedIn) + vivacidade do Tocantins.
 *
 * Tokens base compartilhados (F2 expande em src/lib/theme conforme o ROADMAP).
 */

import '@/global.css';

import { Platform } from 'react-native';

/** Paleta da marca (valores fixos, para uso estático em StyleSheet). */
export const Brand = {
  /** Azul Rio Tocantins — primária (cabeçalho, botões principais). */
  azulRio: '#0A3659',
  /** Verde Água-Doce / Teal — secundária (pescado, frescor, tecnologia). */
  teal: '#008F8C',
  /** Dourado Jalapão — acento (notificações, conectar, destaque). */
  dourado: '#F2A900',
  /** Cinza Escama — fundo da plataforma. */
  cinzaEscama: '#F4F7F6',
  /** Chumbo Industrial — texto principal. */
  chumbo: '#2C3E50',
  branco: '#FFFFFF',
  perigo: '#C0392B',
  sucesso: '#1E9E5A',
} as const;

export const Colors = {
  light: {
    text: Brand.chumbo,
    textSecondary: '#6E7681',
    // Fundo agrupado estilo iOS (systemGroupedBackground) + cards brancos.
    background: '#F2F4F7',
    backgroundElement: Brand.branco,
    backgroundSelected: '#E9EDF1',
    border: '#E6EAEF',
    primary: Brand.azulRio,
    secondary: Brand.teal,
    accent: Brand.dourado,
    onPrimary: Brand.branco,
    danger: Brand.perigo,
    success: Brand.sucesso,
  },
  dark: {
    text: '#EAF1F0',
    textSecondary: '#9AA8B2',
    background: '#0E1B26',
    backgroundElement: '#16242F',
    backgroundSelected: '#22323F',
    border: '#2A3A47',
    primary: '#1E5C8A',
    secondary: '#2BB3AF',
    accent: Brand.dourado,
    onPrimary: Brand.branco,
    danger: '#E74C3C',
    success: '#2ECC71',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Famílias tipográficas da marca — Nunito (família redonda, próxima de
 * Nimbus Sans Round). Carregada via @expo-google-fonts (ver src/app/_layout.tsx).
 * A hierarquia é dada pelos pesos: Bold/SemiBold em títulos e tags, Regular/
 * Medium no corpo.
 */
export const FontFamily = {
  tituloBold: 'Nunito_700Bold',
  tituloSemi: 'Nunito_600SemiBold',
  corpo: 'Nunito_400Regular',
  corpoMedio: 'Nunito_500Medium',
  tag: 'Nunito_600SemiBold',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Cantos arredondados estilo iOS (continuous corners). */
export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

/** Sombras suaves estilo iOS (substituem bordas duras nos cards). */
export const Shadow = {
  card: {
    shadowColor: '#0A2540',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  fab: {
    shadowColor: '#0A2540',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  bar: {
    shadowColor: '#0A2540',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -3 },
    elevation: 16,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
