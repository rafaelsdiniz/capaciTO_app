import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Competencia, VagaComMatch } from '@/lib/api/types';

/** Detalhe da vaga + candidatura (RF24, RF27; RN05). */
export default function VagaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vaga, setVaga] = useState<VagaComMatch | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [candidatando, setCandidatando] = useState(false);
  const [candidatou, setCandidatou] = useState(false);

  useEffect(() => {
    let ativo = true;
    api.vagas
      .obter(String(id))
      .then((v) => ativo && setVaga(v))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [id]);

  async function candidatar() {
    if (!vaga) return;
    setCandidatando(true);
    try {
      await api.vagas.candidatar(vaga.id);
      setCandidatou(true);
    } finally {
      setCandidatando(false);
    }
  }

  const faltamIds = new Set((vaga?.faltam ?? []).map((c) => c.id));

  return (
    <Screen scroll padded={false}>
      <AppHeader back title="Vaga" />
      {carregando ? (
        <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.six }} />
      ) : !vaga ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.pad}>
          Vaga não encontrada.
        </ThemedText>
      ) : (
        <View style={styles.pad}>
          <View style={styles.head}>
            <ThemedText type="subtitle">{vaga.funcao}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              <Ionicons name="business-outline" size={13} /> {vaga.empresaNome} · {vaga.municipio}
            </ThemedText>
            <View style={{ marginTop: Spacing.one }}>
              {vaga.compativel ? (
                <Tag label="Você é compatível" tone="success" icon="✓" />
              ) : (
                <Tag label={`Faltam ${vaga.faltam.length} competência(s)`} tone="danger" />
              )}
            </View>
          </View>

          {vaga.descricao ? (
            <Card>
              <ThemedText type="smallBold">Sobre a vaga</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {vaga.descricao}
              </ThemedText>
            </Card>
          ) : null}

          <Card>
            <ThemedText type="smallBold">Competências obrigatórias</ThemedText>
            <View style={styles.reqList}>
              {vaga.competenciasObrigatorias.map((c) => (
                <RequisitoLinha key={c.id} competencia={c} ok={!faltamIds.has(c.id)} />
              ))}
            </View>
          </Card>

          {vaga.competenciasDesejaveis.length > 0 ? (
            <Card>
              <ThemedText type="smallBold">Competências desejáveis</ThemedText>
              <View style={styles.tags}>
                {vaga.competenciasDesejaveis.map((c) => (
                  <Tag key={c.id} label={c.nome} tone="neutral" />
                ))}
              </View>
            </Card>
          ) : null}

          {candidatou ? (
            <Card style={{ borderColor: Brand.teal }}>
              <View style={styles.okRow}>
                <Ionicons name="checkmark-circle" size={22} color={Brand.teal} />
                <ThemedText type="smallBold">Candidatura enviada!</ThemedText>
              </View>
            </Card>
          ) : (
            <Button
              title={vaga.compativel ? 'Candidatar-se' : 'Candidatar mesmo assim'}
              icon="send"
              variant={vaga.compativel ? 'primary' : 'outline'}
              onPress={candidatar}
              loading={candidatando}
            />
          )}
        </View>
      )}
    </Screen>
  );
}

function RequisitoLinha({ competencia, ok }: { competencia: Competencia; ok: boolean }) {
  return (
    <View style={styles.reqLinha}>
      <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={18} color={ok ? Brand.teal : Brand.perigo} />
      <ThemedText type="small" style={styles.flex}>
        {competencia.nome}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  head: { gap: 2 },
  reqList: { gap: Spacing.one, marginTop: Spacing.one },
  reqLinha: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  tags: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap', marginTop: Spacing.one },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
