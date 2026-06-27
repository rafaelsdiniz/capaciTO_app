import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session/session-context';

/**
 * Carteira de Qualificação Digital (perfil do trabalhador).
 * M0: landing pós-login. M1 (F1): exibir competências certificadas (RF06) e
 * indicador de completude (RF07), consumindo GET /api/v1/perfil/me.
 */
export default function CarteiraScreen() {
  const router = useRouter();
  const { usuario, sair } = useSession();

  function aoSair() {
    sair();
    router.replace('/');
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="small" themeColor="textSecondary">
              Carteira de Qualificação Digital
            </ThemedText>
            <ThemedText type="subtitle">{usuario?.nome ?? 'Trabalhador'}</ThemedText>
          </View>

          {/* Placeholder — competências certificadas (RF06) entram no M1. */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Competências certificadas</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Você ainda não tem certificações. Assista a um treinamento ou escaneie o
              QR de uma estação para começar.
            </ThemedText>
          </ThemedView>

          <View style={styles.flex} />

          <Pressable accessibilityRole="button" onPress={aoSair} style={styles.sair}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Sair
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, padding: Spacing.four, gap: Spacing.four },
  header: { gap: Spacing.one },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  sair: { alignSelf: 'center', padding: Spacing.three },
});
