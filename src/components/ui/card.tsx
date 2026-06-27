import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Caixa de conteúdo com cantos suaves (8–12px) e leve borda. */
export function Card({
  children,
  onPress,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const base: StyleProp<ViewStyle> = [
    styles.card,
    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [base, { opacity: pressed ? 0.9 : 1 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={base}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
});
