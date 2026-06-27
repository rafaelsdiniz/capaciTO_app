import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { Conteudo } from '@/lib/api/types';

/** Cadastro de estação + associação de conteúdo/procedimento (RF15). */
export default function EstacaoNovaScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api.conteudos.listar().then((c) => {
      setConteudos(c);
      setSelecionado(c[0]?.id ?? null);
    });
  }, []);

  async function criar() {
    setErro(null);
    if (!nome.trim() || !selecionado) {
      setErro('Informe o nome e selecione o procedimento.');
      return;
    }
    setSalvando(true);
    try {
      const est = await api.estacoes.criar(nome.trim(), selecionado);
      router.replace({ pathname: '/estacao/[id]', params: { id: est.id } });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen scroll>
      <AppHeader back title="Nova estação" />

      <Input label="Nome da estação" value={nome} onChangeText={setNome} placeholder="Ex.: Câmara fria — Setor B" />

      <View style={styles.secao}>
        <ThemedText type="smallBold">Procedimento (conteúdo do QR)</ThemedText>
        {conteudos.map((c) => (
          <ConteudoOption key={c.id} conteudo={c} ativo={selecionado === c.id} onPress={() => setSelecionado(c.id)} />
        ))}
      </View>

      {erro ? (
        <ThemedText type="small" style={{ color: Brand.perigo }}>
          {erro}
        </ThemedText>
      ) : null}

      <Button title="Criar estação e gerar QR" icon="qr-code" variant="secondary" onPress={criar} loading={salvando} />
    </Screen>
  );
}

function ConteudoOption({ conteudo, ativo, onPress }: { conteudo: Conteudo; ativo: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected: ativo }} onPress={onPress}>
      <Card style={[styles.option, { borderColor: ativo ? Brand.teal : theme.border, borderWidth: ativo ? 2 : 1 }]}>
        <Ionicons name={ativo ? 'radio-button-on' : 'radio-button-off'} size={20} color={ativo ? Brand.teal : theme.textSecondary} />
        <View style={styles.flex}>
          <ThemedText type="smallBold">{conteudo.titulo}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {conteudo.competencia.nome}
          </ThemedText>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  secao: { gap: Spacing.two },
  option: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderRadius: Radius.md },
});
