import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useSession } from '@/lib/session/session-context';
import type { ApiError } from '@/lib/api/types';
import { AuthScreen, ErroMsg, Field, PrimaryButton } from './_form';

// RF02: autentica via e-mail/telefone + senha, recebe token (JWT no backend).
export default function LoginScreen() {
  const router = useRouter();
  const { entrar, carregando } = useSession();

  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  async function aoEntrar() {
    setErro(null);
    if (!identificador.trim() || !senha) {
      setErro('Preencha e-mail/telefone e senha.');
      return;
    }
    try {
      await entrar({ identificador: identificador.trim(), senha });
      // Sucesso → o gate em "/" redireciona conforme o papel (RF03).
      router.replace('/');
    } catch (e) {
      setErro((e as ApiError)?.message ?? 'Não foi possível entrar. Tente novamente.');
    }
  }

  return (
    <AuthScreen titulo="Entrar" subtitulo="Acesse sua Carteira de Qualificação Digital">
      <ErroMsg texto={erro} />
      <Field
        label="E-mail ou telefone"
        placeholder="seu@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={identificador}
        onChangeText={setIdentificador}
      />
      <Field
        label="Senha"
        placeholder="Sua senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      <PrimaryButton titulo="Entrar" onPress={aoEntrar} carregando={carregando} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        <ThemedText type="small" themeColor="textSecondary">
          Não tem conta?
        </ThemedText>
        <Link href="/registro">
          <ThemedText type="smallBold" themeColor="text">
            Criar cadastro
          </ThemedText>
        </Link>
      </View>
    </AuthScreen>
  );
}
