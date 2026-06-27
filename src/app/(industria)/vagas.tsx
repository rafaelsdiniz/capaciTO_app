import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Vaga } from '@/lib/api/types';

/** Vagas publicadas pela empresa (RF24; RN07). */
export default function VagasIndustriaScreen() {
  const router = useRouter();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      api.vagas
        .daEmpresa()
        .then((v) => ativo && setVagas(v))
        .finally(() => ativo && setCarregando(false));
      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <Screen padded={false}>
      <AppHeader
        title="Vagas"
        right={<Button title="Nova" icon="add" full={false} onPress={() => router.push('/vaga-nova')} />}
      />
      {carregando ? (
        <ActivityIndicator color={Brand.teal} style={{ marginTop: Spacing.five }} />
      ) : (
        <FlatList
          data={vagas}
          keyExtractor={(v) => v.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <ThemedText type="smallBold">{item.funcao}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    <Ionicons name="location-outline" size={12} /> {item.municipio}
                  </ThemedText>
                </View>
                <Tag label={item.status === 'ABERTA' ? 'Aberta' : 'Fechada'} tone={item.status === 'ABERTA' ? 'success' : 'neutral'} />
              </View>
              <View style={styles.tags}>
                {item.competenciasObrigatorias.map((c) => (
                  <Tag key={c.id} label={c.nome} tone="primary" />
                ))}
              </View>
            </Card>
          )}
          ListEmptyComponent={<EmptyState icon="briefcase-outline" title="Sem vagas" message="Publique sua primeira vaga." />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  lista: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  tags: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
});
