import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Estacao } from '@/lib/api/types';

/** Detalhe da estação com QR escaneável para imprimir/colar na estação (RF16). */
export default function EstacaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [estacao, setEstacao] = useState<Estacao | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    api.estacoes
      .obter(String(id))
      .then((e) => ativo && setEstacao(e))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [id]);

  return (
    <Screen scroll>
      <AppHeader back title="Estação" />
      {carregando ? (
        <ActivityIndicator color={Brand.teal} style={{ marginTop: Spacing.six }} />
      ) : !estacao ? (
        <ThemedText type="small" themeColor="textSecondary">
          Estação não encontrada.
        </ThemedText>
      ) : (
        <>
          <View style={styles.head}>
            <ThemedText type="subtitle">{estacao.nome}</ThemedText>
            <Tag label={estacao.conteudo.competencia.nome} tone="teal" />
          </View>

          <Card style={styles.qrCard}>
            <View style={styles.qrBox}>
              <QRCode value={estacao.codigoQr} size={200} color={Brand.azulRio} backgroundColor={Brand.branco} />
            </View>
            <ThemedText type="tag" themeColor="textSecondary">
              {estacao.codigoQr}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              Imprima e cole na estação. O trabalhador escaneia e abre o microvídeo
              “{estacao.conteudo.titulo}” na hora.
            </ThemedText>
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: Spacing.two, alignItems: 'flex-start' },
  qrCard: { alignItems: 'center', gap: Spacing.three },
  qrBox: { padding: Spacing.three, backgroundColor: Brand.branco, borderRadius: Spacing.two },
  center: { textAlign: 'center' },
});
