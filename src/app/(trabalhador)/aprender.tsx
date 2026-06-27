import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { ConteudoCard } from '@/components/capacitacao/conteudo-card';
import { AppHeader } from '@/components/ui/app-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Brand, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Conteudo } from '@/lib/api/types';

/** Catálogo de aprendizagem (RF10) com busca — conteúdos de pescado 🐟. */
export default function AprenderScreen() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    const t = setTimeout(async () => {
      try {
        const lista = await api.conteudos.listar(busca);
        if (ativo) setConteudos(lista);
      } finally {
        if (ativo) setCarregando(false);
      }
    }, 250);
    return () => {
      ativo = false;
      clearTimeout(t);
    };
  }, [busca]);

  return (
    <Screen padded={false}>
      <AppHeader title="Aprender" subtitle="Treinamentos da indústria de pescado" />
      <View style={styles.search}>
        <Input
          icon="search"
          placeholder="Buscar treinamento (ex.: câmara fria)"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {carregando ? (
        <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.five }} />
      ) : (
        <FlatList
          data={conteudos}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <ConteudoCard conteudo={item} onPress={() => router.push({ pathname: '/curso/[id]', params: { id: item.id } })} />
          )}
          ListEmptyComponent={<EmptyState icon="search" title="Nada encontrado" message={`Sem treinamentos para “${busca}”.`} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.two },
  lista: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
});
