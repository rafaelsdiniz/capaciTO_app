import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { StatCard } from '@/components/ui/stat-card';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { EmpresaDashboard } from '@/lib/api/types';
import { useSession } from '@/lib/session/session-context';

/** Painel da Indústria — indicadores + ações rápidas. */
export default function InicioScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { usuario, sair } = useSession();
  const [dash, setDash] = useState<EmpresaDashboard | null>(null);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      api.empresa
        .dashboard()
        .then((d) => ativo && setDash(d))
        .finally(() => ativo && setCarregando(false));
      return () => {
        ativo = false;
      };
    }, []),
  );

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
            <Ionicons name="location-outline" size={13} /> {dash?.empresa.municipio ?? 'Tocantins'} · Pescado
          </ThemedText>
        </View>

        {carregando && !dash ? (
          <ActivityIndicator color={Brand.teal} style={{ marginTop: Spacing.five }} />
        ) : dash ? (
          <>
            <View style={styles.stats}>
              <StatCard icon="cube" valor={dash.totalEstacoes} rotulo="Estações" tone="teal" />
              <StatCard icon="briefcase" valor={dash.totalVagas} rotulo="Vagas" tone="primary" />
              <StatCard icon="people" valor={dash.totalCandidatos} rotulo="Candidatos" tone="accent" />
            </View>

            <ThemedText type="smallBold">Ações rápidas</ThemedText>
            <View style={styles.acoes}>
              <Button title="Nova estação + QR" icon="qr-code" variant="secondary" onPress={() => router.push('/estacao-nova')} />
              <Button title="Publicar vaga" icon="add-circle" onPress={() => router.push('/vaga-nova')} />
              <Button title="Buscar trabalhadores" icon="search" variant="outline" onPress={() => router.push('/buscar')} />
            </View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  stats: { flexDirection: 'row', gap: Spacing.two },
  acoes: { gap: Spacing.two },
});
