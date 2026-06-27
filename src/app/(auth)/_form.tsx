/**
 * UI compartilhada das telas de auth (login/registro).
 * Arquivo com prefixo "_" → ignorado pelo roteador (não é rota).
 *
 * Componentes simples e acessíveis (RNF01/RNF09): rótulos claros, alvos de
 * toque grandes, alto contraste. F2 depois extrai isto para components/ui.
 */
import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Logo } from '@/components/ui/logo';
import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function AuthScreen({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}) {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled">
            <Logo size="lg" style={styles.logo} />
            <View style={styles.header}>
              <ThemedText type="subtitle">{titulo}</ThemedText>
              {subtitulo ? (
                <ThemedText type="default" themeColor="textSecondary">
                  {subtitulo}
                </ThemedText>
              ) : null}
            </View>
            <View style={styles.form}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

export function Field({
  label,
  hint,
  ...inputProps
}: TextInputProps & { label: string; hint?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
        ]}
        placeholderTextColor={theme.textSecondary}
        {...inputProps}
      />
      {hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  titulo,
  onPress,
  carregando,
  desabilitado,
}: {
  titulo: string;
  onPress: () => void;
  carregando?: boolean;
  desabilitado?: boolean;
}) {
  const bloqueado = carregando || desabilitado;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={bloqueado}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: Brand.azulRio, opacity: bloqueado ? 0.5 : pressed ? 0.85 : 1 },
      ]}>
      {carregando ? (
        <ActivityIndicator color={Brand.branco} />
      ) : (
        <ThemedText type="default" style={styles.buttonText}>
          {titulo}
        </ThemedText>
      )}
    </Pressable>
  );
}

export function ErroMsg({ texto }: { texto?: string | null }) {
  if (!texto) return null;
  return (
    <View style={styles.erro}>
      <ThemedText type="small" style={styles.erroText}>
        {texto}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.four, gap: Spacing.four },
  logo: { alignSelf: 'center' },
  header: { gap: Spacing.two },
  form: { gap: Spacing.three },
  field: { gap: Spacing.one },
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    minHeight: 52,
  },
  button: {
    minHeight: 56,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  buttonText: { color: Brand.branco, fontFamily: FontFamily.corpoMedio, fontSize: 16 },
  erro: { backgroundColor: '#FDECEC', borderRadius: Radius.sm, padding: Spacing.three },
  erroText: { color: Brand.perigo },
});
