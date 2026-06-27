import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { TrabalhadorResumo } from '@/lib/api/types';

/** Busca de trabalhadores por competência certificada (RF28; RN06 — só visíveis). */
export default function BuscarScreen() {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<TrabalhadorResumo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    const t = setTimeout(async () => {
      try {
        const r = await api.trabalhadores.buscar(busca);
        if (ativo) setResultados(r);
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
      <AppHeader title="Buscar talentos" subtitle="Trabalhadores certificados e visíveis" />
      <View style={styles.search}>
        <Input icon="search" placeholder="Buscar por competência (ex.: câmara fria)" value={busca} onChangeText={setBusca} />
      </View>
      {carregando ? (
        <ActivityIndicator color={Brand.teal} style={{ marginTop: Spacing.five }} />
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <Card style={styles.row}>
              <Avatar nome={item.nome} size={48} tone="teal" />
              <View style={styles.flex}>
                <ThemedText type="smallBold">{item.nome}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.cidade} · {item.completude}% qualificado
                </ThemedText>
                <View style={{ marginTop: 4 }}>
                  <ProgressBar value={item.completude} />
                </View>
                <View style={styles.tags}>
                  {item.competencias.map((c) => (
                    <Tag key={c} label={c} tone="teal" />
                  ))}
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={<EmptyState icon="people-outline" title="Ninguém encontrado" message={`Sem trabalhadores para “${busca}”.`} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  search: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.two },
  lista: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three },
  tags: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap', marginTop: Spacing.two },
});
