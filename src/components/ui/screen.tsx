import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Spacing, TabBarSpace } from '@/constants/theme';

/**
 * Wrapper padrão de tela: fundo Cinza Escama, safe area e padding consistentes.
 * `scroll` envolve o conteúdo num ScrollView; senão usa View flex.
 */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'bottom'],
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
}) {
  const inner = padded ? styles.padded : undefined;
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={edges}>
        {scroll ? (
          <ScrollView contentContainerStyle={[styles.scroll, inner, styles.scrollBottom]} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, inner]}>{children}</View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { padding: Spacing.four },
  scroll: { flexGrow: 1, gap: Spacing.four },
  scrollBottom: { paddingBottom: TabBarSpace },
});
