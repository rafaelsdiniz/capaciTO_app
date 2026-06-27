import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';

export type IconName = keyof typeof Ionicons.glyphMap;
type Variant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
type Size = 'md' | 'lg';

/**
 * Botão padrão da plataforma. Variantes seguem a identidade:
 * - primary  → Azul Rio (ações principais)
 * - secondary→ Teal (ações de apoio/pescado)
 * - accent   → Dourado (conectar / destaque)
 * - outline / ghost → ações secundárias
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  full = true,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = VARIANTS[variant];
  const bloqueado = loading || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: bloqueado }}
      onPress={onPress}
      disabled={bloqueado}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: v.bg, borderColor: v.border, borderWidth: v.border ? 1.5 : 0 },
        full && styles.full,
        { opacity: bloqueado ? 0.5 : pressed ? 0.88 : 1 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={18} color={v.fg} /> : null}
          <ThemedText style={[styles.label, { color: v.fg }]}>{title}</ThemedText>
          {iconRight ? <Ionicons name={iconRight} size={18} color={v.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: Brand.azulRio, fg: Brand.branco },
  secondary: { bg: Brand.teal, fg: Brand.branco },
  accent: { bg: Brand.dourado, fg: Brand.chumbo },
  outline: { bg: 'transparent', fg: Brand.azulRio, border: Brand.azulRio },
  ghost: { bg: 'transparent', fg: Brand.azulRio },
};

const styles = StyleSheet.create({
  base: { borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
  md: { minHeight: 50 },
  lg: { minHeight: 58 },
  full: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  label: { fontFamily: FontFamily.corpoMedio, fontSize: 16 },
});
