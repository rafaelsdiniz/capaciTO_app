import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ConteudoCard } from '@/components/capacitacao/conteudo-card';
import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Brand, Radius, Spacing, TabBarSpace } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { Conteudo } from '@/lib/api/types';

/** Catálogo de aprendizagem (RF10) com busca + filtros por tema — pescado 🐟. Filtros client-side. */
export default function AprenderScreen() {
  const router = useRouter();
  const [todos, setTodos] = useState<Conteudo[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [tema, setTema] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      api.conteudos
        .listar()
        .then((c) => ativo && setTodos(c))
        .finally(() => ativo && setCarregando(false));
      return () => {
        ativo = false;
      };
    }, []),
  );

  const temas = useMemo(() => [...new Set(todos.map((c) => c.tema))].sort(), [todos]);

  const conteudos = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return todos.filter((c) => {
      if (tema && c.tema !== tema) return false;
      if (termo && !`${c.titulo} ${c.competencia.nome} ${c.tema}`.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [todos, busca, tema]);

  const filtrosAtivos = !!tema || busca.trim().length > 0;

  return (
    <Screen padded={false}>
      <AppHeader title="Aprender" subtitle="Treinamentos da indústria de pescado" />

      <View style={styles.controles}>
        <Input icon="search" placeholder="Buscar treinamento (ex.: câmara fria)" value={busca} onChangeText={setBusca} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {temas.map((t) => (
            <FilterChip key={t} label={capitalizar(t)} ativo={tema === t} onPress={() => setTema((cur) => (cur === t ? null : t))} />
          ))}
        </ScrollView>

        <View style={styles.resumo}>
          <ThemedText type="small" themeColor="textSecondary">
            {conteudos.length} {conteudos.length === 1 ? 'treinamento' : 'treinamentos'}
          </ThemedText>
          {filtrosAtivos ? (
            <Pressable
              onPress={() => {
                setTema(null);
                setBusca('');
              }}
              hitSlop={6}
              style={styles.limpar}>
              <Ionicons name="close-circle" size={14} color={Brand.azulRio} />
              <ThemedText type="small" style={{ color: Brand.azulRio }}>
                Limpar filtros
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </View>

      {carregando ? (
        <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.five }} />
      ) : conteudos.length === 0 ? (
        <EmptyState icon="search" title="Nada encontrado" message="Ajuste a busca ou o tema." />
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {conteudos.map((item) => (
            <ConteudoCard key={item.id} conteudo={item} onPress={() => router.push({ pathname: '/curso/[id]', params: { id: item.id } })} />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

function FilterChip({ label, ativo, onPress }: { label: string; ativo: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      onPress={onPress}
      style={[styles.chip, { borderColor: ativo ? Brand.teal : theme.border, backgroundColor: ativo ? Brand.teal : theme.backgroundElement }]}>
      <ThemedText type="tag" style={{ color: ativo ? Brand.branco : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  controles: { paddingHorizontal: Spacing.four, gap: Spacing.two, paddingBottom: Spacing.two },
  chips: { gap: Spacing.one, paddingVertical: 2 },
  chip: { borderWidth: 1.5, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 8 },
  resumo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  limpar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lista: { paddingHorizontal: Spacing.four, paddingBottom: TabBarSpace, gap: Spacing.two },
});
