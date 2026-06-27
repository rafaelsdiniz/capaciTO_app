import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Candidatura } from '@/lib/api/types';

/** Candidaturas do trabalhador: em andamento (vaga aberta) e encerradas (RF27). */
export default function MinhasCandidaturasScreen() {
  const router = useRouter();
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      api.vagas
        .minhasCandidaturas()
        .then((c) => ativo && setCandidaturas(c))
        .finally(() => ativo && setCarregando(false));
      return () => {
        ativo = false;
      };
    }, []),
  );

  const emAndamento = candidaturas.filter((c) => c.vaga.status === 'ABERTA');
  const encerradas = candidaturas.filter((c) => c.vaga.status === 'FECHADA');

  return (
    <Screen padded={false}>
      <AppHeader back title="Minhas candidaturas" />

      {carregando ? (
        <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.five }} />
      ) : candidaturas.length === 0 ? (
        <EmptyState icon="document-text-outline" title="Sem candidaturas" message="Candidate-se a uma vaga compatível para acompanhar aqui." />
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          <Secao titulo="Em andamento" itens={emAndamento} onAbrir={(id) => router.push({ pathname: '/vaga/[id]', params: { id } })} />
          <Secao titulo="Encerradas" itens={encerradas} encerrada onAbrir={(id) => router.push({ pathname: '/vaga/[id]', params: { id } })} />
        </ScrollView>
      )}
    </Screen>
  );
}

function Secao({ titulo, itens, encerrada, onAbrir }: { titulo: string; itens: Candidatura[]; encerrada?: boolean; onAbrir: (id: string) => void }) {
  if (itens.length === 0) return null;
  return (
    <View style={styles.secao}>
      <ThemedText type="smallBold">
        {titulo} ({itens.length})
      </ThemedText>
      {itens.map((c) => (
        <Card key={c.id} onPress={() => onAbrir(c.vaga.id)} style={[styles.item, encerrada && styles.itemEncerrado]}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <ThemedText type="smallBold">{c.vaga.funcao}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                <Ionicons name="business-outline" size={12} /> {c.vaga.empresaNome} · {c.vaga.municipio}
              </ThemedText>
              <ThemedText type="tag" themeColor="textSecondary">
                Enviada em {formatarData(c.data)}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Brand.azulRio} />
          </View>
          <View style={styles.tags}>
            <Tag label={rotuloStatus(c.status)} tone={toneStatus(c.status)} />
            {encerrada ? <Tag label="Vaga encerrada" tone="neutral" /> : null}
          </View>
        </Card>
      ))}
    </View>
  );
}

function rotuloStatus(s: Candidatura['status']): string {
  return s === 'APROVADA' ? 'Aprovada' : s === 'EM_ANALISE' ? 'Em análise' : 'Enviada';
}
function toneStatus(s: Candidatura['status']): 'success' | 'accent' | 'primary' {
  return s === 'APROVADA' ? 'success' : s === 'EM_ANALISE' ? 'accent' : 'primary';
}
function formatarData(iso: string): string {
  const [a, m, d] = iso.split('-');
  return a && m && d ? `${d}/${m}/${a}` : iso;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  lista: { padding: Spacing.four, gap: Spacing.four },
  secao: { gap: Spacing.two },
  item: { gap: Spacing.two },
  itemEncerrado: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  tags: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
});
