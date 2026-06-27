import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';

/**
 * Leitura do QR da estação (RF17; RN04). Resolve o código para a estação +
 * conteúdo vigente e abre o microvídeo já com origem=QR (fatia ao vivo).
 * Em web/sem câmera, oferece "Simular leitura" para a demo nunca travar.
 */
export default function EscanearScreen() {
  const router = useRouter();
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const travado = useRef(false);

  const semCamera = Platform.OS === 'web';

  async function resolver(codigo: string) {
    if (travado.current) return;
    travado.current = true;
    setProcessando(true);
    setErro(null);
    try {
      const estacao = await api.estacoes.resolverQr(codigo);
      router.push({ pathname: '/curso/[id]', params: { id: estacao.conteudo.id, origem: 'QR' } });
    } catch {
      setErro('QR não reconhecido. Aproxime de uma estação válida ou use a simulação.');
      travado.current = false;
    } finally {
      setProcessando(false);
    }
  }

  return (
    <Screen padded={false}>
      <AppHeader title="Escanear estação" subtitle="Aponte para o QR da sua estação" />

      <View style={styles.body}>
        <View style={styles.cameraBox}>
          {!semCamera && permissao?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => resolver(data)}
            />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Ionicons name="qr-code-outline" size={72} color={Brand.branco} />
              <ThemedText type="small" style={{ color: Brand.branco, textAlign: 'center' }}>
                {semCamera
                  ? 'Câmera indisponível no navegador'
                  : permissao?.granted === false
                    ? 'Precisamos da câmera para ler o QR'
                    : 'Toque para liberar a câmera'}
              </ThemedText>
            </View>
          )}
          <View style={styles.mira} pointerEvents="none" />
        </View>

        {erro ? (
          <Card style={{ borderColor: Brand.perigo }}>
            <ThemedText type="small" style={{ color: Brand.perigo }}>
              {erro}
            </ThemedText>
          </Card>
        ) : null}

        {!semCamera && !permissao?.granted ? (
          <Button title="Liberar câmera" icon="camera" onPress={pedirPermissao} loading={processando} />
        ) : null}

        {/* Demo: simula a leitura da estação da câmara fria */}
        <Button
          title="Simular leitura (câmara fria)"
          icon="flash"
          variant="outline"
          onPress={() => resolver('CAPACITO:EST:est-1')}
          loading={processando}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: Spacing.four, gap: Spacing.three },
  cameraBox: { aspectRatio: 1, borderRadius: Radius.lg, backgroundColor: Brand.azulRio, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  cameraPlaceholder: { alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  mira: {
    position: 'absolute',
    width: '60%',
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: Brand.dourado,
    borderRadius: Radius.md,
  },
});
