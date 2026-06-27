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
import { Brand, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Estacao } from '@/lib/api/types';

/** Estações de trabalho da empresa, cada uma com seu QR (RF15, RF16; RN07). */
export default function EstacoesScreen() {
  const router = useRouter();
  const [estacoes, setEstacoes] = useState<Estacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      api.estacoes
        .listar()
        .then((e) => ativo && setEstacoes(e))
        .finally(() => ativo && setCarregando(false));
      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <Screen padded={false}>
      <AppHeader
        title="Estações"
        right={
          <Button title="Nova" icon="add" variant="secondary" full={false} onPress={() => router.push('/estacao-nova')} />
        }
      />
      {carregando ? (
        <ActivityIndicator color={Brand.teal} style={{ marginTop: Spacing.five }} />
      ) : (
        <FlatList
          data={estacoes}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <Card onPress={() => router.push({ pathname: '/estacao/[id]', params: { id: item.id } })} style={styles.row}>
              <View style={styles.qrMini}>
                <Ionicons name="qr-code" size={26} color={Brand.azulRio} />
              </View>
              <View style={styles.flex}>
                <ThemedText type="smallBold">{item.nome}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {item.conteudo.titulo}
                </ThemedText>
                <View style={{ marginTop: 4 }}>
                  <Tag label={item.conteudo.competencia.nome} tone="teal" />
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Brand.azulRio} />
            </Card>
          )}
          ListEmptyComponent={<EmptyState icon="cube-outline" title="Sem estações" message="Crie sua primeira estação com QR." />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  lista: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  qrMini: { width: 48, height: 48, borderRadius: Radius.sm, backgroundColor: '#E6EEF4', alignItems: 'center', justifyContent: 'center' },
});
