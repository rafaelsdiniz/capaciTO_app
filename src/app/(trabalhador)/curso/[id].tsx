import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Conteudo, OrigemConclusao, ResultadoConclusao } from '@/lib/api/types';

/**
 * Detalhe + player do conteúdo. Fatia ao vivo:
 * assistir → concluir → POST /conclusoes → emissão de certificação (RF11/13/20/21).
 * O "player" é uma área da marca com progresso simulado (conteúdo próprio entra
 * via expo-video trocando esta área por <VideoView/>).
 */
export default function CursoScreen() {
  const router = useRouter();
  const { id, origem } = useLocalSearchParams<{ id: string; origem?: string }>();
  const origemConclusao: OrigemConclusao = origem === 'QR' ? 'QR' : 'CATALOGO';

  const [conteudo, setConteudo] = useState<Conteudo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [progresso, setProgresso] = useState(0); // 0..100 do vídeo
  const [assistindo, setAssistindo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoConclusao | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const c = await api.conteudos.obter(String(id));
        if (ativo) setConteudo(c);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
      if (timer.current) clearInterval(timer.current);
    };
  }, [id]);

  function assistir() {
    if (progresso >= 100) return;
    setAssistindo(true);
    timer.current = setInterval(() => {
      setProgresso((p) => {
        const next = p + 5;
        if (next >= 100) {
          if (timer.current) clearInterval(timer.current);
          setAssistindo(false);
          return 100;
        }
        return next;
      });
    }, 150);
  }

  async function concluir() {
    if (!conteudo) return;
    setEnviando(true);
    try {
      const res = await api.conclusoes.registrar(conteudo.id, origemConclusao);
      setResultado(res);
    } finally {
      setEnviando(false);
    }
  }

  const assistido = progresso >= 100;

  return (
    <Screen scroll padded={false}>
      <AppHeader back title="Treinamento" />

      {carregando ? (
        <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.six }} />
      ) : !conteudo ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.pad}>
          Conteúdo não encontrado.
        </ThemedText>
      ) : resultado ? (
        // Estado de sucesso após concluir
        <View style={styles.pad}>
          <View style={styles.sucessoIcon}>
            <Ionicons name="ribbon" size={56} color={Brand.branco} />
          </View>
          <ThemedText type="subtitle" style={styles.center}>
            {resultado.jaCertificada ? 'Treinamento concluído!' : 'Competência certificada!'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            {resultado.jaCertificada
              ? `Você já tinha a competência "${conteudo.competencia.nome}".`
              : `"${conteudo.competencia.nome}" foi adicionada à sua carteira.`}
          </ThemedText>
          <View style={{ height: Spacing.four }} />
          <Button title="Ver na carteira" icon="wallet" onPress={() => router.replace('/carteira')} />
          <View style={{ height: Spacing.two }} />
          <Button title="Voltar aos treinamentos" variant="ghost" onPress={() => router.replace('/aprender')} />
        </View>
      ) : (
        <View style={styles.pad}>
          {/* Player (vertical) */}
          <View style={styles.player}>
            {assistido ? (
              <View style={styles.center}>
                <Ionicons name="checkmark-circle" size={56} color={Brand.branco} />
                <ThemedText type="smallBold" style={{ color: Brand.branco }}>
                  Vídeo assistido
                </ThemedText>
              </View>
            ) : (
              <Pressable onPress={assistir} disabled={assistindo} style={styles.center} accessibilityRole="button">
                <View style={styles.playBtn}>
                  <Ionicons name={assistindo ? 'pause' : 'play'} size={32} color={Brand.azulRio} />
                </View>
                <ThemedText type="small" style={{ color: Brand.branco }}>
                  {assistindo ? 'Reproduzindo…' : 'Tocar microvídeo'}
                </ThemedText>
              </Pressable>
            )}
            <View style={styles.playerProgress}>
              <ProgressBar value={progresso} color={Brand.dourado} />
            </View>
          </View>

          <View style={styles.info}>
            <ThemedText type="subtitle">{conteudo.titulo}</ThemedText>
            <View style={styles.tags}>
              <Tag label={`#${conteudo.tema}`} tone="teal" />
              {origemConclusao === 'QR' ? <Tag label="Estação QR" tone="primary" icon="📍" /> : null}
            </View>
            <Card>
              <ThemedText type="smallBold">Ao concluir você certifica</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {conteudo.competencia.nome}
              </ThemedText>
            </Card>
          </View>

          <Button
            title={assistido ? 'Concluir e certificar' : 'Assista o vídeo para concluir'}
            icon="checkmark-done"
            onPress={concluir}
            loading={enviando}
            disabled={!assistido}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  center: { alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  player: {
    height: 360,
    borderRadius: Radius.lg,
    backgroundColor: Brand.azulRio,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    overflow: 'hidden',
  },
  playBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: Brand.branco, alignItems: 'center', justifyContent: 'center' },
  playerProgress: { position: 'absolute', bottom: Spacing.three, left: Spacing.three, right: Spacing.three },
  info: { gap: Spacing.two },
  tags: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
  sucessoIcon: { alignSelf: 'center', width: 96, height: 96, borderRadius: 48, backgroundColor: Brand.teal, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.four, marginBottom: Spacing.three },
});
