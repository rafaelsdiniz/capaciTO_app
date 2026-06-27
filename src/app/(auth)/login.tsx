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
  StyleSheet,
  TextInput,
  View,
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

const C = {
  primary: '#2F6FDB',
  ink: '#14213D',
  muted: '#6E7A8A',
  surface: Brand.branco,
  border: '#DDE7F6',
  input: '#F8FAFE',
  gold: '#F2A51A',
} as const;

const HeroImage = require('@/assets/images/login-industria.jpg');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 18, mass: 0.75, stiffness: 220 };

// Remove o contorno (quadrado) que o navegador desenha no input focado (RN Web).
const NO_OUTLINE = (Platform.OS === 'web' ? { outlineStyle: 'none' } : null) as object | null;

// RF02: autentica via e-mail + senha, recebe token JWT do backend.
export default function LoginScreen() {
  const router = useRouter();
  const { entrar, carregando } = useSession();

  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(true);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEntrar() {
    setErro(null);
    if (!identificador.trim() || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    try {
      await entrar({ identificador: identificador.trim(), senha });
      router.replace('/');
    } catch (e) {
      setErro((e as ApiError)?.message ?? 'Não foi possível entrar. Tente novamente.');
    }
  }

  return (
    <View style={s.page}>
      <StatusBar style="light" />
      <SafeAreaView style={s.flex} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.flex}>

            {/* ── Hero ─────────────────────────────────────────── */}
            <View style={s.hero}>
              <ImageBackground source={HeroImage} resizeMode="cover" style={s.heroImg} imageStyle={s.heroImgAsset}>
                <View style={s.scrim} />
                <View style={s.shade} />

                <View style={s.brand}>
                  <View style={s.brandMark}>
                    <ThemedText style={s.brandMarkText}>C</ThemedText>
                  </View>
                  <View style={s.brandWord}>
                    <ThemedText style={s.brandName}>Capaci</ThemedText>
                    <ThemedText style={s.brandNameAccent}>TO</ThemedText>
                  </View>
                </View>

                <View style={s.heroCopy}>
                  <ThemedText style={s.heroTitle}>Bem-vindo!</ThemedText>
                  <ThemedText style={s.heroSubtitle}>
                    Acesse sua carteira digital e continue evoluindo na industria.
                  </ThemedText>
                </View>
              </ImageBackground>
            </View>

            {/* ── Card ─────────────────────────────────────────── */}
            <View style={s.card}>

              {/* Bloco superior: título + formulário + ação principal */}
              <View style={s.cardTop}>
                <View style={s.formHeader}>
                  <ThemedText style={s.formTitle}>Entrar</ThemedText>
                  <ThemedText style={s.formSubtitle}>Use seu e-mail e senha cadastrados.</ThemedText>
                </View>

                <ErrorBox texto={erro} />

                <LoginField
                  label="E-mail"
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
                      onPress={() => setSenhaVisivel((v) => !v)}>
                      <Ionicons name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.muted} />
                    </Pressable>
                  }
                />

                <View style={s.optionsRow}>
                  <Btn
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: lembrar }}
                    onPress={() => setLembrar((v) => !v)}
                    style={s.rememberRow}>
                    <View style={[s.checkbox, lembrar && s.checkboxOn]}>
                      {lembrar ? <Ionicons name="checkmark" size={13} color={Brand.branco} /> : null}
                    </View>
                    <ThemedText style={s.optionText}>Lembrar-me</ThemedText>
                  </Btn>

                  <Btn
                    accessibilityRole="button"
                    onPress={() => setErro('A recuperação de senha será liberada em breve.')}
                    hitSlop={8}
                    style={s.forgotBtn}>
                    <ThemedText style={s.forgotText}>Esqueceu a senha?</ThemedText>
                  </Btn>
                </View>

                <Btn
                  accessibilityRole="button"
                  onPress={aoEntrar}
                  disabled={carregando}
                  style={[s.primaryBtn, carregando && s.btnDisabled]}>
                  {carregando
                    ? <ActivityIndicator color={Brand.branco} />
                    : <ThemedText style={s.primaryBtnText}>Entrar</ThemedText>}
                </Btn>
              </View>

              {/* Bloco inferior: login social + criar conta */}
              <View style={s.cardBottom}>
                <View style={s.dividerRow}>
                  <View style={s.divider} />
                  <ThemedText style={s.dividerText}>ou entre com</ThemedText>
                  <View style={s.divider} />
                </View>

                <View style={s.socialRow}>
                  <SocialIcon icon="logo-google"   color="#DB4437" label="Google" />
                  <SocialIcon icon="logo-linkedin" color="#0A66C2" label="LinkedIn" />
                  <SocialIcon icon="logo-facebook" color="#1877F2" label="Facebook" />
                </View>

                <View style={s.footerRow}>
                  <ThemedText style={s.footerText}>Novo por aqui?</ThemedText>
                  <Link href="/registro" asChild>
                    <Pressable style={s.createLink} accessibilityRole="button">
                      <ThemedText style={s.createLinkText}>Criar cadastro</ThemedText>
                      <Ionicons name="arrow-forward" size={15} color={C.primary} />
                    </Pressable>
                  </Link>
                </View>
              </View>
            </View>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function Btn({
  children, style, disabled, onPress,
  accessibilityRole, accessibilityLabel, accessibilityState, hitSlop,
  hoverScale = 1.015, pressScale = 0.985,
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
  const ty = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }, { scale: scale.value }] }));

  function onHover(on: boolean) {
    if (disabled) return;
    hovered.current = on;
    scale.value = withSpring(on ? hoverScale : 1, SPRING);
    ty.value = withSpring(on ? -1 : 0, SPRING);
  }
  function onPress_(on: boolean) {
    if (disabled) return;
    scale.value = withSpring(on ? pressScale : hovered.current ? hoverScale : 1, { damping: on ? 20 : 16, mass: 0.7, stiffness: on ? 280 : 210 });
    ty.value = withSpring(on ? 0.5 : hovered.current ? -1 : 0, SPRING);
  }

  return (
    <AnimatedPressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ ...accessibilityState, disabled }}
      disabled={disabled}
      hitSlop={hitSlop}
      onHoverIn={() => onHover(true)}
      onHoverOut={() => onHover(false)}
      onPress={onPress}
      onPressIn={() => onPress_(true)}
      onPressOut={() => onPress_(false)}
      style={[style, anim]}>
      {children}
    </AnimatedPressable>
  );
}

function SocialIcon({ icon, color, label }: { icon: IconName; color: string; label: string }) {
  return (
    <Btn accessibilityRole="button" accessibilityLabel={`Login com ${label} (apenas visual)`} hoverScale={1.045} pressScale={0.965} onPress={() => undefined} style={s.socialBtn}>
      <Ionicons name={icon} size={22} color={color} />
    </Btn>
  );
}

function LoginField({ label, icon, right, onFocus, onBlur, ...inputProps }: TextInputProps & { label: string; icon: IconName; right?: ReactNode }) {
  const [focused, setFocused] = useState(false);
  const focus = useSharedValue(0);
  const boxAnim = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [C.border, C.primary]),
    backgroundColor: interpolateColor(focus.value, [0, 1], [C.input, Brand.branco]),
    shadowOpacity: focus.value * 0.16,
    transform: [{ translateY: -focus.value }],
  }));

  return (
    <View style={s.field}>
      <ThemedText style={s.fieldLabel}>{label}</ThemedText>
      <Animated.View style={[s.inputBox, boxAnim]}>
        <View style={[s.inputIcon, focused && s.inputIconOn]}>
          <Ionicons name={icon} size={18} color={focused ? C.primary : C.muted} />
        </View>
        <TextInput
          style={[s.input, NO_OUTLINE]}
          placeholderTextColor="#9AA8BA"
          selectionColor={C.primary}
          onFocus={(e) => { setFocused(true); focus.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); focus.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.cubic) }); onBlur?.(e); }}
          {...inputProps}
        />
        {right}
      </Animated.View>
    </View>
  );
}

function ErrorBox({ texto }: { texto?: string | null }) {
  if (!texto) return null;
  return (
    <View style={s.errorBox}>
      <Ionicons name="alert-circle-outline" size={18} color={Brand.perigo} />
      <ThemedText style={s.errorText}>{texto}</ThemedText>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: '#111820' },

  // Hero
  hero: { height: 220, overflow: 'hidden', backgroundColor: '#111820' },
  heroImg: { flex: 1 },
  heroImgAsset: { transform: [{ scale: 1.04 }] },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(5,12,20,0.70)' },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 100, backgroundColor: 'rgba(5,12,20,0.40)' },

  brand: { position: 'absolute', top: Spacing.four, left: Spacing.four, zIndex: 2, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  brandMark: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.96)' },
  brandMarkText: { color: C.primary, fontFamily: FontFamily.tituloBold, fontSize: 20, lineHeight: 24 },
  brandWord: { flexDirection: 'row', alignItems: 'baseline' },
  brandName: { color: Brand.branco, fontFamily: FontFamily.tituloBold, fontSize: 22, lineHeight: 28 },
  brandNameAccent: { color: C.gold, fontFamily: FontFamily.tituloBold, fontSize: 22, lineHeight: 28 },

  heroCopy: { position: 'absolute', left: Spacing.four, right: Spacing.four, bottom: 52, zIndex: 2, gap: Spacing.one },
  heroTitle: { color: Brand.branco, fontFamily: FontFamily.tituloBold, fontSize: 28, lineHeight: 34 },
  heroSubtitle: { width: '88%', color: '#EEF5FF', fontFamily: FontFamily.corpoMedio, fontSize: 13, lineHeight: 19 },

  // Card — dois blocos: form (topo) e social/cadastro (base), distribuídos.
  card: {
    flex: 1,
    marginTop: -30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    backgroundColor: C.surface,
    justifyContent: 'space-between',
  },
  cardTop: { gap: Spacing.three },
  cardBottom: { gap: Spacing.three },

  formHeader: { alignItems: 'center', gap: Spacing.one, marginBottom: Spacing.one },
  formTitle: { color: C.primary, fontFamily: FontFamily.tituloBold, fontSize: 24, lineHeight: 30 },
  formSubtitle: { color: C.muted, fontFamily: FontFamily.corpo, fontSize: 13, lineHeight: 19, textAlign: 'center' },

  // Fields
  field: { gap: Spacing.one },
  fieldLabel: { color: C.ink, fontFamily: FontFamily.corpoMedio, fontSize: 13, lineHeight: 18 },
  inputBox: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.input,
    paddingHorizontal: Spacing.two,
    shadowColor: C.primary,
    shadowOpacity: 0,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  inputIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#EAF2FF' },
  inputIconOn: { backgroundColor: '#DCE9FF' },
  input: { flex: 1, minHeight: 48, paddingVertical: Spacing.two, paddingRight: Spacing.two, color: C.ink, fontFamily: FontFamily.corpo, fontSize: 15 },

  // Options row
  optionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  rememberRow: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  checkbox: { width: 18, height: 18, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#B9C7DC', backgroundColor: Brand.branco },
  checkboxOn: { borderColor: C.primary, backgroundColor: C.primary },
  optionText: { color: C.muted, fontFamily: FontFamily.corpo, fontSize: 13, lineHeight: 18 },
  forgotBtn: { minHeight: 32, justifyContent: 'center' },
  forgotText: { color: C.primary, fontFamily: FontFamily.corpoMedio, fontSize: 13, lineHeight: 18 },

  // Buttons
  primaryBtn: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: C.primary,
    shadowColor: C.primary,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  btnDisabled: { opacity: 0.58 },
  primaryBtnText: { color: Brand.branco, fontFamily: FontFamily.corpoMedio, fontSize: 16, lineHeight: 22 },

  // Divider + Social
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  divider: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { color: '#9AA8BA', fontFamily: FontFamily.corpo, fontSize: 13, lineHeight: 18 },
  socialRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  socialBtn: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border, borderRadius: Radius.md, backgroundColor: Brand.branco },

  // Footer
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: Spacing.two },
  footerText: { color: C.muted, fontFamily: FontFamily.corpo, fontSize: 13, lineHeight: 18 },
  createLink: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  createLinkText: { color: C.primary, fontFamily: FontFamily.corpoMedio, fontSize: 13, lineHeight: 18 },

  // Error
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderRadius: Radius.md, padding: Spacing.two, backgroundColor: '#FFF0F0' },
  errorText: { flex: 1, color: Brand.perigo, fontFamily: FontFamily.corpoMedio, fontSize: 13, lineHeight: 18 },
});
