import { StyleSheet, View } from 'react-native';

import { Brand, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Barra de progresso (ex.: completude do perfil). */
export function ProgressBar({ value, color = Brand.teal }: { value: number; color?: string }) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.bg, { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { height: 10, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: 10, borderRadius: Radius.pill },
});
