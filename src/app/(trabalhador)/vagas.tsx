import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { SegmentoEmpresa, VagaComMatch } from '@/lib/api/types';

const SEGMENTOS: { id: SegmentoEmpresa; label: string }[] = [
  { id: 'PESCADO', label: 'Pescado' },
  { id: 'LATICINIO', label: 'Laticínio' },
  { id: 'POLPA', label: 'Polpa' },
  { id: 'PANIFICACAO', label: 'Panificação' },
];

/** Vagas compatíveis com busca + filtros (RF25, RF26; RN05). Filtros client-side. */
export default function VagasScreen() {
  const router = useRouter();
  const [todas, setTodas] = useState<VagaComMatch[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Estado dos filtros (visual; depois liga no back via query params).
  const [busca, setBusca] = useState('');
  const [soCompativeis, setSoCompativeis] = useState(false);
  const [segmento, setSegmento] = useState<SegmentoEmpresa | null>(null);
  const [municipio, setMunicipio] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      api.vagas
        .compativeis()
        .then((v) => ativo && setTodas(v))
        .finally(() => ativo && setCarregando(false));
      return () => {
        ativo = false;
      };
    }, []),
  );

  const municipios = useMemo(() => [...new Set(todas.map((v) => v.municipio))].sort(), [todas]);

  const vagas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return todas.filter((v) => {
      if (soCompativeis && !v.compativel) return false;
      if (segmento && v.segmento !== segmento) return false;
      if (municipio && v.municipio !== municipio) return false;
      if (termo && !`${v.funcao} ${v.empresaNome}`.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [todas, busca, soCompativeis, segmento, municipio]);

  const filtrosAtivos = soCompativeis || !!segmento || !!municipio;

  function limpar() {
    setSoCompativeis(false);
    setSegmento(null);
    setMunicipio(null);
    setBusca('');
  }

  return (
    <Screen padded={false}>
      <AppHeader title="Vagas" subtitle="Oportunidades na indústria de alimentos do TO" />

      <View style={styles.controles}>
        <Input icon="search" placeholder="Buscar por função ou empresa" value={busca} onChangeText={setBusca} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <FilterChip label="Compatíveis" icon="checkmark-circle" ativo={soCompativeis} onPress={() => setSoCompativeis((v) => !v)} />
          {SEGMENTOS.map((s) => (
            <FilterChip key={s.id} label={s.label} ativo={segmento === s.id} onPress={() => setSegmento((cur) => (cur === s.id ? null : s.id))} />
          ))}
          {municipios.map((m) => (
            <FilterChip key={m} label={m} icon="location" ativo={municipio === m} onPress={() => setMunicipio((cur) => (cur === m ? null : m))} />
          ))}
        </ScrollView>

        <View style={styles.resumo}>
          <ThemedText type="small" themeColor="textSecondary">
            {vagas.length} {vagas.length === 1 ? 'vaga' : 'vagas'}
          </ThemedText>
          {filtrosAtivos ? (
            <Pressable onPress={limpar} hitSlop={6} style={styles.limpar}>
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
      ) : (
        <FlatList
          data={vagas}
          keyExtractor={(v) => v.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => <VagaItem vaga={item} onPress={() => router.push({ pathname: '/vaga/[id]', params: { id: item.id } })} />}
          ListEmptyComponent={<EmptyState icon="briefcase-outline" title="Nenhuma vaga" message="Ajuste a busca ou os filtros." />}
        />
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
      style={[styles.chip, { borderColor: ativo ? Brand.azulRio : theme.border, backgroundColor: ativo ? Brand.azulRio : theme.backgroundElement }]}>
      {icon ? <Ionicons name={icon} size={14} color={ativo ? Brand.branco : theme.textSecondary} /> : null}
      <ThemedText type="tag" style={{ color: ativo ? Brand.branco : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
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
  controles: { paddingHorizontal: Spacing.four, gap: Spacing.two, paddingBottom: Spacing.two },
  chips: { gap: Spacing.one, paddingVertical: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 8 },
  resumo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  limpar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lista: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  tags: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
});
