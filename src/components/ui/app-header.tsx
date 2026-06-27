import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Logo } from '@/components/ui/logo';
import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Cabeçalho estilo iOS:
 * - telas raiz: large title (grande, à esquerda) + subtítulo opcional;
 * - telas raiz `centered`: título centralizado com acento dourado + subtítulo;
 * - telas empilhadas (`back`): navigation bar com chevron e título centralizado.
 */
export function AppHeader({
  title,
  subtitle,
  showLogo = false,
  back = false,
  centered = false,
  right,
}: {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  back?: boolean;
  centered?: boolean;
  right?: ReactNode;
}) {
  const theme = useTheme();
  const router = useRouter();

  // Título centralizado (tela raiz) com acento dourado sob o texto.
  if (centered) {
    return (
      <View style={styles.centered}>
        {title ? <ThemedText style={styles.centeredTitle}>{title}</ThemedText> : null}
        <View style={styles.centeredAccent} />
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centeredSubtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    );
  }

  // Navigation bar (tela empilhada): título centralizado entre back e ação.
  if (back) {
    return (
      <View style={styles.navbar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12} style={styles.navSide}>
          <Ionicons name="chevron-back" size={26} color={theme.primary} />
        </Pressable>
        <View style={styles.navTitle}>
          {title ? (
            <ThemedText style={styles.navTitleText} numberOfLines={1}>
              {title}
            </ThemedText>
          ) : null}
        </View>
        <View style={[styles.navSide, styles.navRight]}>{right}</View>
      </View>
    );
  }

  // Large title (tela raiz).
  return (
    <View style={styles.large}>
      <View style={styles.largeTopRow}>
        {showLogo ? <Logo size="sm" /> : <View />}
        {right ? <View>{right}</View> : null}
      </View>
      {title ? <ThemedText style={styles.largeTitle}>{title}</ThemedText> : null}
      {subtitle ? (
        <ThemedText type="small" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    minHeight: 44,
  },
  navSide: { width: 64, justifyContent: 'center' },
  navRight: { alignItems: 'flex-end' },
  navTitle: { flex: 1, alignItems: 'center' },
  navTitleText: { fontFamily: FontFamily.tituloSemi, fontSize: 17 },

  large: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.two, gap: 2 },
  largeTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 },
  largeTitle: { fontFamily: FontFamily.tituloBold, fontSize: 30, lineHeight: 36, marginTop: Spacing.one },

  centered: { alignItems: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: Spacing.three, gap: Spacing.one },
  centeredTitle: { fontFamily: FontFamily.tituloBold, fontSize: 26, lineHeight: 32, color: Brand.azulRio, textAlign: 'center' },
  centeredAccent: { width: 40, height: 3, borderRadius: Radius.pill, backgroundColor: Brand.dourado },
  centeredSubtitle: { textAlign: 'center' },
});
