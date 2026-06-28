import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, FontFamily, Radius, Shadow, Spacing, TabBarSpace } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { Oportunidade, TipoOportunidade } from '@/lib/api/types';

type IconName = keyof typeof Ionicons.glyphMap;

const TIPO_META: Record<TipoOportunidade, { label: string; icon: IconName; cor: string }> = {
  EDITAL: { label: 'Edital', icon: 'document-text', cor: Brand.azulRio },
  CURSO_GRATUITO: { label: 'Curso gratuito', icon: 'school', cor: Brand.teal },
  BOLSA: { label: 'Bolsa', icon: 'ribbon', cor: Brand.dourado },
};

const FILTROS: { id: TipoOportunidade; label: string }[] = [
  { id: 'CURSO_GRATUITO', label: 'Cursos' },
  { id: 'EDITAL', label: 'Editais' },
  { id: 'BOLSA', label: 'Bolsas' },
];

/** Aba Editais & Cursos: onde o trabalhador pode se qualificar (gratuito/bolsa). */
export default function EditaisScreen() {
  const [todas, setTodas] = useState<Oportunidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tipo, setTipo] = useState<TipoOportunidade | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      api.oportunidades
        .listar()
        .then((o) => ativo && setTodas(o))
        .finally(() => ativo && setCarregando(false));
      return () => {
        ativo = false;
      };
    }, []),
  );

  const lista = useMemo(() => (tipo ? todas.filter((o) => o.tipo === tipo) : todas), [todas, tipo]);

  return (
    <Screen padded={false}>
      <AppHeader centered title="Editais & Cursos" subtitle="Qualifique-se de graça ou com bolsa no TO" />

      <View style={styles.controles}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <FilterChip label="Todos" ativo={tipo === null} onPress={() => setTipo(null)} />
          {FILTROS.map((f) => (
            <FilterChip key={f.id} label={f.label} ativo={tipo === f.id} onPress={() => setTipo((c) => (c === f.id ? null : f.id))} />
          ))}
        </ScrollView>
      </View>

      {carregando ? (
        <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.five }} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.listaWrap}
          renderItem={({ item }) => <OportunidadeCard op={item} />}
          ListEmptyComponent={<EmptyState icon="school-outline" title="Nada por aqui" message="Ajuste o filtro." />}
        />
      )}
    </Screen>
  );
}

function OportunidadeCard({ op }: { op: Oportunidade }) {
  const meta = TIPO_META[op.tipo];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => Linking.openURL(op.link).catch(() => {})}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cardTop}>
        <View style={[styles.emblema, { backgroundColor: meta.cor }]}>
          <Ionicons name={meta.icon} size={22} color={Brand.branco} />
        </View>
        <View style={styles.flex}>
          <ThemedText type="smallBold" style={styles.titulo} numberOfLines={2}>
            {op.titulo}
          </ThemedText>
          <View style={styles.metaRow}>
            <Ionicons name="business-outline" size={13} color="#6E7681" />
            <ThemedText type="small" themeColor="textSecondary">
              {op.instituicao}
            </ThemedText>
          </View>
        </View>
        <Ionicons name="open-outline" size={18} color="#9AA8B2" />
      </View>

      {op.descricao ? (
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {op.descricao}
        </ThemedText>
      ) : null}

      <View style={styles.tagsRow}>
        <Tag label={meta.label} tone={op.tipo === 'BOLSA' ? 'accent' : op.tipo === 'EDITAL' ? 'primary' : 'teal'} />
        {op.gratuito ? <Tag label="Gratuito" tone="success" icon="✓" /> : null}
        <Tag label={op.modalidade === 'ONLINE' ? 'Online' : op.municipio ?? 'Presencial'} tone="neutral" icon="📍" />
      </View>

      <View style={styles.compsRow}>
        {op.competencias.map((c) => (
          <Tag key={c.id} label={c.nome} tone="neutral" />
        ))}
      </View>

      {op.prazoInscricao ? (
        <View style={styles.prazo}>
          <Ionicons name="time-outline" size={13} color={Brand.perigo} />
          <ThemedText type="small" style={{ color: Brand.perigo }}>
            Inscrições até {formatarData(op.prazoInscricao)}
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

function FilterChip({ label, ativo, onPress }: { label: string; ativo: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, { borderColor: ativo ? Brand.azulRio : theme.border, backgroundColor: ativo ? Brand.azulRio : theme.backgroundElement }]}>
      <ThemedText type="tag" style={{ color: ativo ? Brand.branco : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function formatarData(iso: string): string {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  controles: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.two },
  chips: { gap: Spacing.one, paddingVertical: 2 },
  chip: { borderWidth: 1.5, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 8 },
  listaWrap: { paddingHorizontal: Spacing.four, paddingBottom: TabBarSpace, gap: Spacing.three },

  card: { borderRadius: Radius.lg, backgroundColor: Brand.branco, padding: Spacing.three, gap: Spacing.two, ...Shadow.card },
  pressed: { opacity: 0.96, transform: [{ scale: 0.99 }] },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  emblema: { width: 46, height: 46, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: FontFamily.tituloSemi, fontSize: 16, lineHeight: 21 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  tagsRow: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
  compsRow: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
  prazo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
