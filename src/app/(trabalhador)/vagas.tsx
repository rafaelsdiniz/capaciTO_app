import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { VagaComMatch } from '@/lib/api/types';

/** Vagas compatíveis com o perfil certificado (RF25, RF26; RN05). */
export default function VagasScreen() {
  const router = useRouter();
  const [vagas, setVagas] = useState<VagaComMatch[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      api.vagas
        .compativeis()
        .then((v) => ativo && setVagas(v))
        .finally(() => ativo && setCarregando(false));
      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <Screen padded={false}>
      <AppHeader title="Vagas" subtitle="Oportunidades na indústria de alimentos do TO" />
      {carregando ? (
        <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.five }} />
      ) : (
        <FlatList
          data={vagas}
          keyExtractor={(v) => v.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => <VagaItem vaga={item} onPress={() => router.push({ pathname: '/vaga/[id]', params: { id: item.id } })} />}
          ListEmptyComponent={<EmptyState icon="briefcase-outline" title="Sem vagas" message="Nenhuma vaga disponível no momento." />}
        />
      )}
    </Screen>
  );
}

function VagaItem({ vaga, onPress }: { vaga: VagaComMatch; onPress: () => void }) {
  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <ThemedText type="smallBold">{vaga.funcao}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            <Ionicons name="business-outline" size={12} /> {vaga.empresaNome} · {vaga.municipio}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Brand.azulRio} />
      </View>
      <View style={styles.tags}>
        {vaga.compativel ? (
          <Tag label="Compatível" tone="success" icon="✓" />
        ) : (
          <Tag label={`Faltam ${vaga.faltam.length}`} tone="danger" />
        )}
        {vaga.desejaveisAtendidas > 0 ? <Tag label={`+${vaga.desejaveisAtendidas} desejável`} tone="accent" /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  lista: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  tags: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
});
