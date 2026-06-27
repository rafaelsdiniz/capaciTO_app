import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Logo } from '@/components/ui/logo';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Cabeçalho de tela. Mostra a Logo (ou título) e um slot de ação à direita.
 * `back` exibe o botão voltar. Deixa o espaço da marca no topo das telas.
 */
export function AppHeader({
  title,
  subtitle,
  showLogo = false,
  back = false,
  right,
}: {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  back?: boolean;
  right?: ReactNode;
}) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {back ? (
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </Pressable>
        ) : null}
        {showLogo ? (
          <Logo size="sm" />
        ) : (
          <View style={styles.titles}>
            {title ? <ThemedText type="subtitle">{title}</ThemedText> : null}
            {subtitle ? (
              <ThemedText type="small" themeColor="textSecondary">
                {subtitle}
              </ThemedText>
            ) : null}
          </View>
        )}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 },
  backBtn: { marginLeft: -4 },
  titles: { gap: 2, flex: 1 },
});
