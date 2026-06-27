import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/lib/session/session-context';
import type { ApiError, Papel } from '@/lib/api/types';
import { AuthScreen, ErroMsg, Field, PrimaryButton } from './_form';

// RF01: cadastro como Trabalhador ou Indústria. RN09: trabalhador exige ≥18 anos.
export default function RegistroScreen() {
  const router = useRouter();
  const { registrar, carregando } = useSession();

  const [papel, setPapel] = useState<Papel>('TRABALHADOR');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [nascimento, setNascimento] = useState(''); // DD/MM/AAAA
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
      // RN09 — validação no cliente antes de chamar a API.
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
    <AuthScreen titulo="Criar cadastro" subtitulo="Comece sua qualificação na indústria de alimentos do TO">
      <ErroMsg texto={erro} />

      <View style={styles.papelGroup}>
        <PapelOption label="Sou Trabalhador" ativo={papel === 'TRABALHADOR'} onPress={() => setPapel('TRABALHADOR')} />
        <PapelOption label="Sou Indústria" ativo={papel === 'INDUSTRIA'} onPress={() => setPapel('INDUSTRIA')} />
      </View>

      <Field label="Nome" placeholder="Seu nome" value={nome} onChangeText={setNome} />
      <Field
        label="E-mail"
        placeholder="seu@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Field
        label="Telefone (opcional)"
        placeholder="(63) 90000-0000"
        keyboardType="phone-pad"
        value={telefone}
        onChangeText={setTelefone}
      />
      {papel === 'TRABALHADOR' ? (
        <Field
          label="Data de nascimento"
          hint="Você precisa ter 18 anos ou mais."
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          value={nascimento}
          onChangeText={setNascimento}
        />
      ) : null}
      <Field label="Senha" placeholder="Crie uma senha" secureTextEntry value={senha} onChangeText={setSenha} />

      <PrimaryButton titulo="Cadastrar" onPress={aoRegistrar} carregando={carregando} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        <ThemedText type="small" themeColor="textSecondary">
          Já tem conta?
        </ThemedText>
        <Link href="/login">
          <ThemedText type="smallBold" themeColor="text">
            Entrar
          </ThemedText>
        </Link>
      </View>
    </AuthScreen>
  );
}

function PapelOption({ label, ativo, onPress }: { label: string; ativo: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: ativo }}
      onPress={onPress}
      style={[
        styles.papelOption,
        { borderColor: ativo ? '#208AEF' : theme.backgroundSelected, backgroundColor: ativo ? '#208AEF' : theme.backgroundElement },
      ]}>
      <ThemedText type="smallBold" style={{ color: ativo ? '#ffffff' : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

/** DD/MM/AAAA → yyyy-mm-dd; retorna undefined se inválida. */
function paraIso(ddmmaaaa: string): string | undefined {
  const m = ddmmaaaa.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return undefined;
  const [, dd, mm, aaaa] = m;
  const d = Number(dd);
  const mo = Number(mm);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return undefined;
  const iso = `${aaaa}-${mm}-${dd}`;
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? undefined : iso;
}

/** RN09 — idade ≥ 18 a partir de ISO yyyy-mm-dd. */
function maiorDeIdade(iso: string): boolean {
  const nasc = new Date(iso);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade >= 18;
}

const styles = StyleSheet.create({
  papelGroup: { flexDirection: 'row', gap: Spacing.two },
  papelOption: {
    flex: 1,
    minHeight: 56,
    borderWidth: 2,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
});
