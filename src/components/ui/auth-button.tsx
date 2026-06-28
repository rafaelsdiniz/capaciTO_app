import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session/session-context';

/**
 * Pílula de autenticação no canto superior direito das telas raiz.
 * - Visitante (sem sessão): "Entrar" → abre login/registro.
 * - Logado: "Sair" → encerra a sessão e continua navegando livre.
 */
export function AuthButton() {
  const router = useRouter();
  const { usuario, sair } = useSession();
  const logado = !!usuario;

  function aoTocar() {
    if (logado) {
      sair();
      return;
    }
    router.push('/login' as Href);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={logado ? 'Sair da conta' : 'Entrar ou criar conta'}
      onPress={aoTocar}
      hitSlop={8}
      style={({ pressed }) => [
        styles.pill,
        logado ? styles.pillGhost : styles.pillSolid,
        pressed && { opacity: 0.85 },
      ]}>
      <Ionicons
        name={logado ? 'log-out-outline' : 'log-in-outline'}
        size={16}
        color={logado ? Brand.chumbo : Brand.branco}
      />
      <ThemedText style={[styles.label, { color: logado ? Brand.chumbo : Brand.branco }]}>
        {logado ? 'Sair' : 'Entrar'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 7,
  },
  pillSolid: { backgroundColor: Brand.azulRio },
  pillGhost: { backgroundColor: Brand.cinzaEscama, borderWidth: 1, borderColor: '#E6EAEF' },
  label: { fontFamily: FontFamily.tag, fontSize: 13 },
});
