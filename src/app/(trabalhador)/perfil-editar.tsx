import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/ui/app-header';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { api } from '@/lib/api';

/** Edição do perfil do trabalhador (RF05). Mock: salva e volta. */
export default function PerfilEditarScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [funcoes, setFuncoes] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api.perfil.me().then((p) => {
      setNome(p.usuario.nome);
      setCidade(p.cidade ?? '');
      setFuncoes(p.funcoesInteresse.join(', '));
    });
  }, []);

  function salvar() {
    setSalvando(true);
    // Mock: simula persistência. F2/back: PUT /perfil/me.
    setTimeout(() => {
      setSalvando(false);
      router.back();
    }, 500);
  }

  return (
    <Screen scroll>
      <AppHeader back title="Editar perfil" />
      <View style={styles.avatar}>
        <Avatar nome={nome} size={88} />
        <Button title="Trocar foto" icon="camera" variant="ghost" full={false} onPress={() => {}} />
      </View>

      <Input label="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome" />
      <Input label="Cidade" icon="location-outline" value={cidade} onChangeText={setCidade} placeholder="Ex.: Palmas" />
      <Input
        label="Funções de interesse"
        hint="Separe por vírgula"
        value={funcoes}
        onChangeText={setFuncoes}
        placeholder="Ex.: Manipulador de pescado, Auxiliar"
      />

      <View style={{ height: Spacing.two }} />
      <Button title="Salvar alterações" icon="checkmark" onPress={salvar} loading={salvando} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', gap: Spacing.one },
});
