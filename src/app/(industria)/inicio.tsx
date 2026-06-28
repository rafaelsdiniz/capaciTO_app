import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StatCard } from '@/components/ui/stat-card';
import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { EmpresaDashboard, Funcionario, Vaga } from '@/lib/api/types';
import { useSession } from '@/lib/session/session-context';

/** Painel da Indústria — indicadores, gráfico e ações rápidas. */
export default function InicioScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { usuario, sair } = useSession();
  const [dash, setDash] = useState<EmpresaDashboard | null>(null);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      Promise.all([api.empresa.dashboard(), api.vagas.daEmpresa(), api.funcionarios.daEmpresa()])
        .then(([d, v, f]) => {
          if (!ativo) return;
          setDash(d);
          setVagas(v);
          setFuncionarios(f);
        })
        .finally(() => ativo && setCarregando(false));
      return () => {
        ativo = false;
      };
    }, []),
  );

  // Competências mais exigidas nas vagas da empresa (série do gráfico).
  const serie = montarSerieCompetencias(vagas);
  const maxValor = Math.max(1, ...serie.map((s) => s.valor));

  function aoSair() {
    sair();
    router.replace('/');
  }

  return (
    <Screen scroll padded={false}>
      <AppHeader
        showLogo
        right={
          <Pressable accessibilityRole="button" onPress={aoSair} hitSlop={10}>
            <Ionicons name="log-out-outline" size={22} color={theme.textSecondary} />
          </Pressable>
        }
      />

      <View style={styles.body}>
        <View>
          <ThemedText type="subtitle">{dash?.empresa.nome ?? usuario?.nome ?? 'Indústria'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            <Ionicons name="location-outline" size={13} /> {dash?.empresa.municipio ?? 'Tocantins'}
          </ThemedText>
        </View>

        {carregando && !dash ? (
          <ActivityIndicator color={Brand.teal} style={{ marginTop: Spacing.five }} />
        ) : dash ? (
          <>
            <View style={styles.stats}>
              <StatCard icon="briefcase" valor={dash.totalVagas} rotulo="Vagas" tone="primary" />
              <StatCard icon="people" valor={dash.totalCandidatos} rotulo="Candidatos" tone="accent" />
              <StatCard icon="ribbon" valor={funcionarios.length} rotulo="Equipe" tone="teal" />
            </View>

            {/* Gráfico: competências mais exigidas */}
            <Card>
              <ThemedText type="smallBold">Competências mais buscadas</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                O que suas vagas mais exigem
              </ThemedText>
              <View style={styles.chart}>
                {serie.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Publique vagas para ver os dados.
                  </ThemedText>
                ) : (
                  serie.map((s, i) => (
                    <View key={s.label} style={styles.barRow}>
                      <ThemedText type="small" numberOfLines={1} style={styles.barLabel}>
                        {s.label}
                      </ThemedText>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { width: `${(s.valor / maxValor) * 100}%`, backgroundColor: CORES[i % CORES.length] },
                          ]}
                        />
                      </View>
                      <ThemedText type="smallBold" style={styles.barVal}>
                        {s.valor}
                      </ThemedText>
                    </View>
                  ))
                )}
              </View>
            </Card>

            <ThemedText type="smallBold">Ações rápidas</ThemedText>
            <View style={styles.acoes}>
              <Button title="Publicar vaga" icon="add-circle" onPress={() => router.push('/vaga-nova')} />
              <Button title="Buscar trabalhadores" icon="search" variant="outline" onPress={() => router.push('/buscar')} />
            </View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const CORES = [Brand.azulRio, Brand.teal, Brand.dourado, '#3B82C4'];

function montarSerieCompetencias(vagas: Vaga[]): { label: string; valor: number }[] {
  const contagem = new Map<string, number>();
  vagas.forEach((v) =>
    [...v.competenciasObrigatorias, ...v.competenciasDesejaveis].forEach((c) =>
      contagem.set(c.nome, (contagem.get(c.nome) ?? 0) + 1),
    ),
  );
  return [...contagem.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  stats: { flexDirection: 'row', gap: Spacing.two },
  acoes: { gap: Spacing.two },
  chart: { gap: Spacing.two, marginTop: Spacing.two },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  barLabel: { width: 92 },
  barTrack: { flex: 1, height: 12, borderRadius: Radius.pill, backgroundColor: '#EEF2F1', overflow: 'hidden' },
  barFill: { height: 12, borderRadius: Radius.pill },
  barVal: { width: 20, textAlign: 'right', fontFamily: FontFamily.tituloSemi },
});
