import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, FontFamily, Radius, Shadow, Spacing, TabBarSpace } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Funcionario } from '@/lib/api/types';

/** Aba Funcionários: o time já contratado pela empresa (RN07). */
export default function FuncionariosScreen() {
  const [lista, setLista] = useState<Funcionario[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      api.funcionarios
        .daEmpresa()
        .then((f) => ativo && setLista(f))
        .finally(() => ativo && setCarregando(false));
      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <Screen padded={false}>
      <AppHeader centered title="Sua equipe" subtitle="Trabalhadores contratados pela sua empresa" />
      {carregando ? (
        <ActivityIndicator color={Brand.teal} style={{ marginTop: Spacing.five }} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.listaWrap}
          renderItem={({ item }) => <FuncionarioCard f={item} />}
          ListEmptyComponent={
            <EmptyState icon="people-outline" title="Ainda sem funcionários" message="Ao contratar um candidato, ele aparece aqui." />
          }
        />
      )}
    </Screen>
  );
}

function FuncionarioCard({ f }: { f: Funcionario }) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Avatar nome={f.nome} size={52} />
        <View style={styles.flex}>
          <ThemedText type="smallBold" style={styles.nome} numberOfLines={1}>
            {f.nome}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {f.cargo}
          </ThemedText>
          {f.admissao ? (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={12} color="#6E7681" />
              <ThemedText type="small" themeColor="textSecondary">
                Desde {formatarData(f.admissao)}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.comps}>
        {f.competencias.map((c) => (
          <Tag key={c} label={c} tone="teal" />
        ))}
      </View>
    </View>
  );
}

function formatarData(iso: string): string {
  const [a, m] = iso.split('-');
  return `${m}/${a}`;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listaWrap: { paddingHorizontal: Spacing.four, paddingBottom: TabBarSpace, gap: Spacing.three },
  card: { borderRadius: Radius.lg, backgroundColor: Brand.branco, padding: Spacing.three, gap: Spacing.two, ...Shadow.card },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  nome: { fontSize: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  comps: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
});
