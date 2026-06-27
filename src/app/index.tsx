import { Redirect, type Href } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session/session-context';

/**
 * Gate de entrada: decide a primeira tela conforme a sessão e o papel (RF03).
 * PROPRIEDADE: trilha F2 (shell). Versão mínima do M0 feita por F1.
 */
export default function Index() {
  const { usuario } = useSession();

  if (!usuario) {
    return <Redirect href={'/login' as Href} />;
  }

  if (usuario.papel === 'TRABALHADOR') {
    return <Redirect href={'/carteira' as Href} />;
  }

  // INDUSTRIA/ADMIN: shell ainda não construído (trilha F2, M1/M3).
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ThemedText type="subtitle">Olá, {usuario.nome}</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          A área da Indústria está em construção (trilha F2).
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.three, padding: Spacing.four },
});
