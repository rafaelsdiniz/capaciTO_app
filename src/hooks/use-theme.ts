/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';

// Plataforma trava no tema CLARO (identidade "Rio e Sol" é light-first).
export function useTheme() {
  return Colors.light;
}
