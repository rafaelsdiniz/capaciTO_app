import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session/session-context';
import type { ApiError } from '@/lib/api/types';

type IconName = keyof typeof Ionicons.glyphMap;

const LoginColors = {
  primary: '#2F6FDB',
  ink: '#14213D',
  muted: '#6E7A8A',
  surface: Brand.branco,
  page: '#EAF2FF',
  border: '#DDE7F6',
  input: '#F8FAFE',
  tocantinsGold: '#F2A51A',
} as const;

const LoginHeroImage = require('@/assets/images/login-industria.jpg');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const BUTTON_SPRING = {
  damping: 18,
  mass: 0.75,
  stiffness: 220,
};

// RF02: autentica via e-mail/telefone + senha, recebe token (JWT no backend).
export default function LoginScreen() {
  const router = useRouter();
  const { entrar, carregando } = useSession();
  const { height } = useWindowDimensions();

  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(true);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEntrar() {
    setErro(null);
    if (!identificador.trim() || !senha) {
      setErro('Preencha e-mail/telefone e senha.');
      return;
    }
    try {
      await entrar({ identificador: identificador.trim(), senha });
      // Sucesso: o gate em "/" redireciona conforme o papel (RF03).
      router.replace('/');
    } catch (e) {
      setErro((e as ApiError)?.message ?? 'Nao foi possivel entrar. Tente novamente.');
    }
  }

  // Acesso livre/demo: entra com o trabalhador de exemplo do mock, sem credenciais.
  async function aoEntrarDemo() {
    setErro(null);
    try {
      await entrar({ identificador: 'maria@trab.com', senha: '123456' });
      router.replace('/');
    } catch (e) {
      setErro((e as ApiError)?.message ?? 'Nao foi possivel entrar. Tente novamente.');
    }
  }

  function aoRecuperarSenha() {
    setErro('A recuperacao de senha sera liberada em breve.');
  }

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[styles.scroll, { minHeight: Math.max(height, 700) }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={[styles.shell, { minHeight: Math.max(height, 700) }]}>
              <View style={styles.hero}>
                <ImageBackground
                  source={LoginHeroImage}
                  resizeMode="cover"
                  style={styles.heroImage}
                  imageStyle={styles.heroImageAsset}>
                  <View style={styles.heroScrim} />
                  <View style={styles.heroShade} />

                  <View style={styles.brandRow}>
                    <View style={styles.brandMark}>
                      <ThemedText style={styles.brandMarkText}>C</ThemedText>
                    </View>
                    <View style={styles.brandWord}>
                      <ThemedText style={styles.brandName}>Capaci</ThemedText>
                      <ThemedText style={styles.brandNameAccent}>TO</ThemedText>
                    </View>
                  </View>

                  <View style={styles.heroCopy}>
                    <ThemedText style={styles.heroTitle}>Bem-vindo de volta!</ThemedText>
                    <ThemedText style={styles.heroSubtitle}>
                      Acesse sua carteira digital e continue evoluindo na industria.
                    </ThemedText>
                  </View>
                </ImageBackground>
              </View>

              <View style={styles.card}>
                <View style={styles.formHeader}>
                  <ThemedText style={styles.formTitle}>Entrar</ThemedText>
                  <ThemedText style={styles.formSubtitle}>Use seu e-mail, telefone e senha cadastrados.</ThemedText>
                </View>

                <ErrorMessage texto={erro} />

                <LoginField
                  label="E-mail ou telefone"
                  icon="mail-outline"
                  placeholder="seu@email.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={identificador}
                  onChangeText={setIdentificador}
                />

                <LoginField
                  label="Senha"
                  icon="lock-closed-outline"
                  placeholder="Sua senha"
                  secureTextEntry={!senhaVisivel}
                  value={senha}
                  onChangeText={setSenha}
                  right={
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                      hitSlop={8}
                      onPress={() => setSenhaVisivel((atual) => !atual)}>
                      <Ionicons
                        name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={LoginColors.muted}
                      />
                    </Pressable>
                  }
                />

                <View style={styles.optionsRow}>
                  <MotionPressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: lembrar }}
                    onPress={() => setLembrar((atual) => !atual)}
                    hoverScale={1.01}
                    pressScale={0.99}
                    style={styles.rememberRow}>
                    <View style={[styles.checkbox, lembrar && styles.checkboxActive]}>
                      {lembrar ? <Ionicons name="checkmark" size={13} color={Brand.branco} /> : null}
                    </View>
                    <ThemedText style={styles.optionText}>Lembrar-me</ThemedText>
                  </MotionPressable>

                  <MotionPressable
                    accessibilityRole="button"
                    onPress={aoRecuperarSenha}
                    hitSlop={8}
                    hoverScale={1.012}
                    pressScale={0.985}
                    style={styles.forgotButton}>
                    <ThemedText style={styles.forgotText}>Esqueceu a senha?</ThemedText>
                  </MotionPressable>
                </View>

                <MotionPressable
                  accessibilityRole="button"
                  onPress={aoEntrar}
                  disabled={carregando}
                  style={[styles.primaryButton, carregando && styles.buttonDisabled]}>
                  {carregando ? (
                    <ActivityIndicator color={Brand.branco} />
                  ) : (
                    <ThemedText style={styles.primaryButtonText}>Entrar</ThemedText>
                  )}
                </MotionPressable>

                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <ThemedText style={styles.dividerText}>ou entre com</ThemedText>
                  <View style={styles.divider} />
                </View>

                <View style={styles.socialRow}>
                  <SocialIcon icon="logo-google" color="#DB4437" label="Google" />
                  <SocialIcon icon="logo-linkedin" color="#0A66C2" label="LinkedIn" />
                  <SocialIcon icon="logo-facebook" color="#1877F2" label="Facebook" />
                </View>

                <MotionPressable
                  accessibilityRole="button"
                  onPress={aoEntrarDemo}
                  disabled={carregando}
                  hoverScale={1.012}
                  pressScale={0.988}
                  style={[styles.demoButton, carregando && styles.buttonDisabled]}>
                  <Ionicons name="sparkles-outline" size={18} color={LoginColors.primary} />
                  <ThemedText style={styles.demoButtonText}>Entrar como demonstracao</ThemedText>
                </MotionPressable>

                <View style={styles.footerRow}>
                  <ThemedText style={styles.footerText}>Novo por aqui?</ThemedText>
                  <Link href="/registro" asChild>
                    <Pressable style={styles.createLink} accessibilityRole="button">
                      <ThemedText style={styles.createLinkText}>Criar cadastro</ThemedText>
                      <Ionicons name="arrow-forward" size={15} color={LoginColors.primary} />
                    </Pressable>
                  </Link>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function MotionPressable({
  children,
  style,
  disabled,
  onPress,
  accessibilityRole,
  accessibilityLabel,
  accessibilityState,
  hitSlop,
  hoverScale = 1.015,
  pressScale = 0.985,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityRole?: 'button' | 'checkbox' | 'link';
  accessibilityLabel?: string;
  accessibilityState?: { disabled?: boolean; checked?: boolean };
  hitSlop?: number;
  hoverScale?: number;
  pressScale?: number;
}) {
  const hovered = useRef(false);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  function animateHover(active: boolean) {
    if (disabled) return;
    hovered.current = active;
    scale.value = withSpring(active ? hoverScale : 1, BUTTON_SPRING);
    translateY.value = withSpring(active ? -1 : 0, BUTTON_SPRING);
  }

  function animatePress(active: boolean) {
    if (disabled) return;
    scale.value = withSpring(active ? pressScale : hovered.current ? hoverScale : 1, {
      damping: active ? 20 : 16,
      mass: 0.7,
      stiffness: active ? 280 : 210,
    });
    translateY.value = withSpring(active ? 0.5 : hovered.current ? -1 : 0, BUTTON_SPRING);
  }

  return (
    <AnimatedPressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ ...accessibilityState, disabled }}
      disabled={disabled}
      hitSlop={hitSlop}
      onHoverIn={() => animateHover(true)}
      onHoverOut={() => animateHover(false)}
      onPress={onPress}
      onPressIn={() => animatePress(true)}
      onPressOut={() => animatePress(false)}
      style={[style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}

function SocialIcon({ icon, color, label }: { icon: IconName; color: string; label: string }) {
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={`Login com ${label} apenas visual`}
      hoverScale={1.045}
      pressScale={0.965}
      onPress={() => undefined}
      style={styles.socialButton}>
      <Ionicons name={icon} size={22} color={color} />
    </MotionPressable>
  );
}

function LoginField({
  label,
  icon,
  right,
  onFocus,
  onBlur,
  ...inputProps
}: TextInputProps & { label: string; icon: IconName; right?: ReactNode }) {
  const [focado, setFocado] = useState(false);
  const focus = useSharedValue(0);

  const inputBoxStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [LoginColors.border, LoginColors.primary]),
    backgroundColor: interpolateColor(focus.value, [0, 1], [LoginColors.input, Brand.branco]),
    shadowOpacity: focus.value * 0.16,
    transform: [{ translateY: -focus.value }],
  }));

  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <Animated.View style={[styles.inputBox, inputBoxStyle]}>
        <View style={[styles.inputIconBox, focado && styles.inputIconBoxActive]}>
          <Ionicons name={icon} size={18} color={focado ? LoginColors.primary : LoginColors.muted} />
        </View>
        <TextInput
          style={styles.input}
          placeholderTextColor="#9AA8BA"
          selectionColor={LoginColors.primary}
          onFocus={(event) => {
            setFocado(true);
            focus.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocado(false);
            focus.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.cubic) });
            onBlur?.(event);
          }}
          {...inputProps}
        />
        {right}
      </Animated.View>
    </View>
  );
}

function ErrorMessage({ texto }: { texto?: string | null }) {
  if (!texto) return null;
  return (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle-outline" size={18} color={Brand.perigo} />
      <ThemedText style={styles.errorText}>{texto}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: {
    flex: 1,
    backgroundColor: LoginColors.page,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shell: {
    width: '100%',
    maxWidth: 430,
    overflow: 'hidden',
    backgroundColor: LoginColors.surface,
    shadowColor: '#163B73',
    shadowOpacity: 0.16,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  hero: {
    minHeight: 330,
    overflow: 'hidden',
    backgroundColor: '#111820',
  },
  heroImage: {
    flex: 1,
  },
  heroImageAsset: {
    transform: [{ scale: 1.04 }],
  },
  heroScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(5, 12, 20, 0.70)',
  },
  heroShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
    backgroundColor: 'rgba(5, 12, 20, 0.40)',
  },
  brandRow: {
    position: 'absolute',
    top: Spacing.four,
    left: Spacing.four,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  brandMarkText: {
    color: LoginColors.primary,
    fontFamily: FontFamily.tituloBold,
    fontSize: 20,
    lineHeight: 24,
  },
  brandWord: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandName: {
    color: Brand.branco,
    fontFamily: FontFamily.tituloBold,
    fontSize: 22,
    lineHeight: 28,
  },
  brandNameAccent: {
    color: LoginColors.tocantinsGold,
    fontFamily: FontFamily.tituloBold,
    fontSize: 22,
    lineHeight: 28,
  },
  heroCopy: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    bottom: 72,
    zIndex: 2,
    gap: Spacing.two,
  },
  heroTitle: {
    color: Brand.branco,
    fontFamily: FontFamily.tituloBold,
    fontSize: 31,
    lineHeight: 36,
  },
  heroSubtitle: {
    width: '88%',
    color: '#EEF5FF',
    fontFamily: FontFamily.corpoMedio,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    flex: 1,
    marginTop: -44,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
    backgroundColor: LoginColors.surface,
  },
  formHeader: {
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.one,
  },
  formTitle: {
    color: LoginColors.primary,
    fontFamily: FontFamily.tituloBold,
    fontSize: 27,
    lineHeight: 34,
  },
  formSubtitle: {
    color: LoginColors.muted,
    fontFamily: FontFamily.corpo,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  field: {
    gap: Spacing.two,
  },
  fieldLabel: {
    color: LoginColors.ink,
    fontFamily: FontFamily.corpoMedio,
    fontSize: 13,
    lineHeight: 18,
  },
  inputBox: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1.5,
    borderColor: LoginColors.border,
    borderRadius: 16,
    backgroundColor: LoginColors.input,
    paddingHorizontal: Spacing.two,
    shadowColor: LoginColors.primary,
    shadowOpacity: 0,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  inputIconBox: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#EAF2FF',
  },
  inputIconBoxActive: {
    backgroundColor: '#DCE9FF',
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingVertical: Spacing.three,
    paddingRight: Spacing.two,
    color: LoginColors.ink,
    fontFamily: FontFamily.corpo,
    fontSize: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  rememberRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B9C7DC',
    backgroundColor: Brand.branco,
  },
  checkboxActive: {
    borderColor: LoginColors.primary,
    backgroundColor: LoginColors.primary,
  },
  optionText: {
    color: LoginColors.muted,
    fontFamily: FontFamily.corpo,
    fontSize: 13,
    lineHeight: 18,
  },
  forgotText: {
    color: LoginColors.primary,
    fontFamily: FontFamily.corpoMedio,
    fontSize: 13,
    lineHeight: 18,
  },
  forgotButton: {
    minHeight: 32,
    justifyContent: 'center',
  },
  primaryButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: LoginColors.primary,
    shadowColor: LoginColors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.58,
  },
  primaryButtonText: {
    color: Brand.branco,
    fontFamily: FontFamily.corpoMedio,
    fontSize: 16,
    lineHeight: 22,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginVertical: Spacing.one,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: LoginColors.border,
  },
  dividerText: {
    color: '#9AA8BA',
    fontFamily: FontFamily.corpo,
    fontSize: 13,
    lineHeight: 18,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  socialButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: LoginColors.border,
    borderRadius: Radius.md,
    backgroundColor: Brand.branco,
    shadowColor: LoginColors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  demoButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: LoginColors.border,
    borderRadius: Radius.md,
    backgroundColor: '#F6F9FF',
  },
  demoButtonText: {
    color: LoginColors.primary,
    fontFamily: FontFamily.corpoMedio,
    fontSize: 14,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  footerText: {
    color: LoginColors.muted,
    fontFamily: FontFamily.corpo,
    fontSize: 13,
    lineHeight: 18,
  },
  createLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  createLinkText: {
    color: LoginColors.primary,
    fontFamily: FontFamily.corpoMedio,
    fontSize: 13,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    padding: Spacing.three,
    backgroundColor: '#FFF0F0',
  },
  errorText: {
    flex: 1,
    color: Brand.perigo,
    fontFamily: FontFamily.corpoMedio,
    fontSize: 13,
    lineHeight: 18,
  },
});
