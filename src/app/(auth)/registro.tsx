import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useState } from 'react';
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
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session/session-context';
import type { ApiError, Papel } from '@/lib/api/types';

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

// Remove o contorno (quadrado) que o navegador desenha no input focado (RN Web).
const NO_OUTLINE = (Platform.OS === 'web' ? { outlineStyle: 'none' } : null) as object | null;

// RF01: cadastro como Trabalhador ou Indústria. RN09: trabalhador exige ≥ 18 anos.
export default function RegistroScreen() {
  const router = useRouter();
  const { registrar, carregando } = useSession();

  const [papel, setPapel] = useState<Papel>('TRABALHADOR');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoRegistrar() {
    setErro(null);

    if (!nome.trim() || !email.trim() || !senha) {
      setErro('Preencha nome, e-mail e senha.');
      return;
    }

    let dataNascimentoIso: string | undefined;
    if (papel === 'TRABALHADOR') {
      dataNascimentoIso = paraIso(nascimento);
      if (!dataNascimentoIso) {
        setErro('Informe a data de nascimento no formato DD/MM/AAAA.');
        return;
      }
      if (!maiorDeIdade(dataNascimentoIso)) {
        setErro('O cadastro de trabalhador exige idade mínima de 18 anos.');
        return;
      }
    }

    try {
      await registrar({
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim() || undefined,
        senha,
        papel,
        dataNascimento: dataNascimentoIso,
      });
      router.replace('/');
    } catch (e) {
      setErro((e as ApiError)?.message ?? 'Não foi possível cadastrar. Tente novamente.');
    }
  }

  return (
    <View style={s.page}>
      <StatusBar style="light" />
      <SafeAreaView style={s.flex} edges={['bottom']}>
        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={s.flex}
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}>

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
                  <ThemedText style={s.heroTitle}>Crie sua conta</ThemedText>
                  <ThemedText style={s.heroSubtitle}>
                    Comece sua qualificação na indústria de alimentos do TO.
                  </ThemedText>
                </View>
              </ImageBackground>
            </View>

            {/* ── Card ─────────────────────────────────────────── */}
            <View style={s.card}>
              <View style={s.formHeader}>
                <ThemedText style={s.formTitle}>Cadastrar</ThemedText>
                <ThemedText style={s.formSubtitle}>Escolha seu perfil e preencha seus dados.</ThemedText>
              </View>

              <ErrorBox texto={erro} />

              {/* Seletor de papel */}
              <View style={s.papelRow}>
                <PapelOpt label="Sou Trabalhador" ativo={papel === 'TRABALHADOR'} onPress={() => setPapel('TRABALHADOR')} />
                <PapelOpt label="Sou Indústria"   ativo={papel === 'INDUSTRIA'}   onPress={() => setPapel('INDUSTRIA')} />
              </View>

              <RegField label="Nome completo" placeholder="Seu nome" value={nome} onChangeText={setNome} />

              <RegField
                label="E-mail"
                placeholder="seu@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <RegField
                label="Telefone (opcional)"
                placeholder="(63) 90000-0000"
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={setTelefone}
              />

              {papel === 'TRABALHADOR' ? (
                <RegField
                  label="Data de nascimento"
                  placeholder="DD/MM/AAAA"
                  hint="Exige-se idade mínima de 18 anos."
                  keyboardType="number-pad"
                  value={nascimento}
                  onChangeText={setNascimento}
                />
              ) : null}

              <RegField
                label="Senha"
                placeholder="Crie uma senha"
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

              <Pressable
                accessibilityRole="button"
                disabled={carregando}
                onPress={aoRegistrar}
                style={({ pressed }) => [s.primaryBtn, carregando && s.btnDisabled, pressed && s.btnPressed]}>
                {carregando
                  ? <ActivityIndicator color={Brand.branco} />
                  : <ThemedText style={s.primaryBtnText}>Criar cadastro</ThemedText>}
              </Pressable>

              <View style={s.footerRow}>
                <ThemedText style={s.footerText}>Já tem conta?</ThemedText>
                <Link href="/login" asChild>
                  <Pressable style={s.loginLink} accessibilityRole="button">
                    <ThemedText style={s.loginLinkText}>Entrar</ThemedText>
                    <Ionicons name="arrow-forward" size={15} color={C.primary} />
                  </Pressable>
                </Link>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function PapelOpt({ label, ativo, onPress }: { label: string; ativo: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: ativo }}
      onPress={onPress}
      style={[s.papelOpt, ativo && s.papelOptOn]}>
      <ThemedText style={[s.papelOptText, ativo && s.papelOptTextOn]}>{label}</ThemedText>
    </Pressable>
  );
}

function RegField({
  label, hint, right, ...inputProps
}: TextInputProps & { label: string; hint?: string; right?: ReactNode }) {
  return (
    <View style={s.field}>
      <ThemedText style={s.fieldLabel}>{label}</ThemedText>
      <View style={s.inputBox}>
        <TextInput
          style={[s.input, NO_OUTLINE]}
          placeholderTextColor="#9AA8BA"
          selectionColor={C.primary}
          {...inputProps}
        />
        {right}
      </View>
      {hint ? <ThemedText style={s.fieldHint}>{hint}</ThemedText> : null}
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

// ── Utilitários ───────────────────────────────────────────────────────────────

function paraIso(ddmmaaaa: string): string | undefined {
  const m = ddmmaaaa.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return undefined;
  const [, dd, mm, aaaa] = m;
  if (Number(mm) < 1 || Number(mm) > 12 || Number(dd) < 1 || Number(dd) > 31) return undefined;
  const iso = `${aaaa}-${mm}-${dd}`;
  return Number.isNaN(new Date(iso).getTime()) ? undefined : iso;
}

function maiorDeIdade(iso: string): boolean {
  const nasc = new Date(iso);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade >= 18;
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: '#111820' },
  scroll: { flexGrow: 1, backgroundColor: C.surface },

  // Hero (mesmo modelo do login)
  hero: { height: 200, overflow: 'hidden', backgroundColor: '#111820' },
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

  heroCopy: { position: 'absolute', left: Spacing.four, right: Spacing.four, bottom: 44, zIndex: 2, gap: Spacing.one },
  heroTitle: { color: Brand.branco, fontFamily: FontFamily.tituloBold, fontSize: 26, lineHeight: 32 },
  heroSubtitle: { width: '90%', color: '#EEF5FF', fontFamily: FontFamily.corpoMedio, fontSize: 13, lineHeight: 19 },

  // Card
  card: {
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: C.surface,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },

  formHeader: { alignItems: 'center', gap: Spacing.one, marginBottom: Spacing.one },
  formTitle: { color: C.primary, fontFamily: FontFamily.tituloBold, fontSize: 24, lineHeight: 30 },
  formSubtitle: { color: C.muted, fontFamily: FontFamily.corpo, fontSize: 13, lineHeight: 19, textAlign: 'center' },

  // Seletor de papel
  papelRow: { flexDirection: 'row', gap: Spacing.two },
  papelOpt: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: C.border,
    backgroundColor: C.input,
  },
  papelOptOn: { borderColor: C.primary, backgroundColor: C.primary },
  papelOptText: { fontFamily: FontFamily.corpoMedio, fontSize: 13, lineHeight: 18, color: C.muted },
  papelOptTextOn: { color: Brand.branco },

  // Fields
  field: { gap: Spacing.one },
  fieldLabel: { color: C.ink, fontFamily: FontFamily.corpoMedio, fontSize: 13, lineHeight: 18 },
  fieldHint: { color: C.muted, fontFamily: FontFamily.corpo, fontSize: 12, lineHeight: 17 },
  inputBox: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.input,
    paddingHorizontal: Spacing.three,
  },
  input: { flex: 1, minHeight: 48, paddingVertical: Spacing.two, color: C.ink, fontFamily: FontFamily.corpo, fontSize: 15 },

  // Botão principal
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
    marginTop: Spacing.one,
  },
  btnDisabled: { opacity: 0.58 },
  btnPressed: { opacity: 0.85 },
  primaryBtnText: { color: Brand.branco, fontFamily: FontFamily.corpoMedio, fontSize: 16, lineHeight: 22 },

  // Footer
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: Spacing.two },
  footerText: { color: C.muted, fontFamily: FontFamily.corpo, fontSize: 13, lineHeight: 18 },
  loginLink: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  loginLinkText: { color: C.primary, fontFamily: FontFamily.corpoMedio, fontSize: 13, lineHeight: 18 },

  // Error
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderRadius: Radius.md, padding: Spacing.two, backgroundColor: '#FFF0F0' },
  errorText: { flex: 1, color: Brand.perigo, fontFamily: FontFamily.corpoMedio, fontSize: 13, lineHeight: 18 },
});
