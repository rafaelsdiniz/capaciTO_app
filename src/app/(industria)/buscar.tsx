import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { TrabalhadorResumo } from '@/lib/api/types';

const MIN_QUALIFICACAO = 80;

/** Busca de trabalhadores por competência + filtros (RF28; RN06 — só visíveis). Filtros client-side. */
export default function BuscarScreen() {
  const [todos, setTodos] = useState<TrabalhadorResumo[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [competencia, setCompetencia] = useState<string | null>(null);
  const [cidade, setCidade] = useState<string | null>(null);
  const [soAltaQualificacao, setSoAltaQualificacao] = useState(false);

  useEffect(() => {
    let ativo = true;
    api.trabalhadores
      .buscar()
      .then((r) => ativo && setTodos(r))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const competencias = useMemo(() => [...new Set(todos.flatMap((t) => t.competencias))].sort(), [todos]);
  const cidades = useMemo(() => [...new Set(todos.map((t) => t.cidade))].sort(), [todos]);

  const resultados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return todos
      .filter((t) => {
        if (competencia && !t.competencias.includes(competencia)) return false;
        if (cidade && t.cidade !== cidade) return false;
        if (soAltaQualificacao && t.completude < MIN_QUALIFICACAO) return false;
        if (termo && !`${t.nome} ${t.competencias.join(' ')}`.toLowerCase().includes(termo)) return false;
        return true;
      })
      .sort((a, b) => b.completude - a.completude);
  }, [todos, busca, competencia, cidade, soAltaQualificacao]);

  const filtrosAtivos = !!competencia || !!cidade || soAltaQualificacao || busca.trim().length > 0;

  function limpar() {
    setCompetencia(null);
    setCidade(null);
    setSoAltaQualificacao(false);
    setBusca('');
  }

  return (
    <Screen padded={false}>
      <AppHeader title="Buscar talentos" subtitle="Trabalhadores certificados e visíveis" />

      <View style={styles.controles}>
        <Input icon="search" placeholder="Buscar por nome ou competência" value={busca} onChangeText={setBusca} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <FilterChip label={`Qualificação ≥ ${MIN_QUALIFICACAO}%`} icon="ribbon" ativo={soAltaQualificacao} onPress={() => setSoAltaQualificacao((v) => !v)} />
          {competencias.map((c) => (
            <FilterChip key={c} label={c} ativo={competencia === c} onPress={() => setCompetencia((cur) => (cur === c ? null : c))} />
          ))}
          {cidades.map((c) => (
            <FilterChip key={c} label={c} icon="location" ativo={cidade === c} onPress={() => setCidade((cur) => (cur === c ? null : c))} />
          ))}
        </ScrollView>

        <View style={styles.resumo}>
          <ThemedText type="small" themeColor="textSecondary">
            {resultados.length} {resultados.length === 1 ? 'trabalhador' : 'trabalhadores'}
          </ThemedText>
          {filtrosAtivos ? (
            <Pressable onPress={limpar} hitSlop={6} style={styles.limpar}>
              <Ionicons name="close-circle" size={14} color={Brand.teal} />
              <ThemedText type="small" style={{ color: Brand.teal }}>
                Limpar filtros
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </View>

      {carregando ? (
        <ActivityIndicator color={Brand.teal} style={{ marginTop: Spacing.five }} />
      ) : resultados.length === 0 ? (
        <EmptyState icon="people-outline" title="Ninguém encontrado" message="Ajuste a busca ou os filtros." />
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {resultados.map((item) => (
            <Card key={item.id} style={styles.row}>
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
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

function FilterChip({ label, icon, ativo, onPress }: { label: string; icon?: keyof typeof Ionicons.glyphMap; ativo: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      onPress={onPress}
      style={[styles.chip, { borderColor: ativo ? Brand.teal : theme.border, backgroundColor: ativo ? Brand.teal : theme.backgroundElement }]}>
      {icon ? <Ionicons name={icon} size={14} color={ativo ? Brand.branco : theme.textSecondary} /> : null}
      <ThemedText type="tag" style={{ color: ativo ? Brand.branco : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  controles: { paddingHorizontal: Spacing.four, gap: Spacing.two, paddingBottom: Spacing.two },
  chips: { gap: Spacing.one, paddingVertical: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 8 },
  resumo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  limpar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lista: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three },
  tags: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap', marginTop: Spacing.two },
});
