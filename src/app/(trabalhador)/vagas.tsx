import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, FontFamily, Radius, Shadow, Spacing, TabBarSpace } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { SegmentoEmpresa, VagaComMatch } from '@/lib/api/types';

type IconName = keyof typeof Ionicons.glyphMap;

/** Identidade visual por segmento (emblema do card). */
const SEG_META: Record<SegmentoEmpresa, { label: string; icon: IconName; cor: string }> = {
  PESCADO: { label: 'Pescado', icon: 'fish', cor: Brand.teal },
  LATICINIO: { label: 'Laticínio', icon: 'water', cor: '#3B82C4' },
  POLPA: { label: 'Polpa', icon: 'leaf', cor: Brand.sucesso },
  PANIFICACAO: { label: 'Panificação', icon: 'restaurant', cor: Brand.dourado },
};

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
      <AppHeader centered title="Vagas" subtitle="Oportunidades na indústria de alimentos do TO" />

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
  const seg = SEG_META[vaga.segmento];
  const faltamIds = new Set(vaga.faltam.map((c) => c.id));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.vagaCard, pressed && styles.vagaPressed]}>
      {/* Acento lateral pela compatibilidade */}
      <View style={[styles.accent, { backgroundColor: vaga.compativel ? Brand.sucesso : '#D7DEE6' }]} />

      <View style={styles.vagaBody}>
        <View style={styles.vagaTop}>
          <View style={[styles.emblema, { backgroundColor: seg.cor }]}>
            <Ionicons name={seg.icon} size={22} color={Brand.branco} />
          </View>

          <View style={styles.flex}>
            <ThemedText type="smallBold" style={styles.vagaFuncao} numberOfLines={1}>
              {vaga.funcao}
            </ThemedText>
            <View style={styles.metaRow}>
              <Ionicons name="business-outline" size={13} color="#6E7681" />
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.flex}>
                {vaga.empresaNome}
              </ThemedText>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={13} color="#6E7681" />
              <ThemedText type="small" themeColor="textSecondary">
                {vaga.municipio} · {seg.label}
              </ThemedText>
            </View>
          </View>

          {vaga.compativel ? (
            <View style={[styles.matchPill, styles.matchOk]}>
              <Ionicons name="checkmark-circle" size={14} color={Brand.sucesso} />
              <ThemedText type="tag" style={{ color: Brand.sucesso }}>
                Compatível
              </ThemedText>
            </View>
          ) : (
            <View style={[styles.matchPill, styles.matchWarn]}>
              <Ionicons name="lock-closed" size={12} color={Brand.perigo} />
              <ThemedText type="tag" style={{ color: Brand.perigo }}>
                Faltam {vaga.faltam.length}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Competências obrigatórias (verde = você tem, vermelho = falta) */}
        <View style={styles.compsRow}>
          {vaga.competenciasObrigatorias.map((c) => {
            const falta = faltamIds.has(c.id);
            return <Tag key={c.id} label={c.nome} tone={falta ? 'danger' : 'success'} icon={falta ? '🔒' : '✓'} />;
          })}
          {vaga.desejaveisAtendidas > 0 ? <Tag label={`+${vaga.desejaveisAtendidas} desejável`} tone="accent" /> : null}
        </View>
      </View>
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
  lista: { paddingHorizontal: Spacing.four, paddingBottom: TabBarSpace, gap: Spacing.three },

  // Card da vaga
  vagaCard: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    backgroundColor: Brand.branco,
    overflow: 'hidden',
    ...Shadow.card,
  },
  vagaPressed: { opacity: 0.96, transform: [{ scale: 0.99 }] },
  accent: { width: 5 },
  vagaBody: { flex: 1, padding: Spacing.three, gap: Spacing.two },
  vagaTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  emblema: { width: 46, height: 46, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  vagaFuncao: { fontFamily: FontFamily.tituloSemi, fontSize: 16, lineHeight: 21 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },

  matchPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.pill, paddingHorizontal: Spacing.two, paddingVertical: 4 },
  matchOk: { backgroundColor: '#E4F6EC' },
  matchWarn: { backgroundColor: '#FDECEC' },

  compsRow: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
});
