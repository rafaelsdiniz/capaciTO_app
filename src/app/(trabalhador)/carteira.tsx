import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, type ComponentProps } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompetenciaBadge } from '@/components/capacitacao/competencia-badge';
import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brand, FontFamily, Radius, Shadow, Spacing, TabBarSpace } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { PerfilMe } from '@/lib/api/types';
import { useSession } from '@/lib/session/session-context';

/** Carteira de Qualificação Digital — primeira tela do trabalhador. */
export default function CarteiraScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { usuario, sair } = useSession();

  const [perfil, setPerfil] = useState<PerfilMe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [visivel, setVisivel] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const p = await api.perfil.me();
      setPerfil(p);
      setVisivel(p.visivel);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function alternarVisibilidade(v: boolean) {
    setVisivel(v);
    await api.perfil.visibilidade(v);
  }

  function aoSair() {
    sair();
    router.replace('/');
  }

  const nome = perfil?.usuario.nome ?? usuario?.nome ?? 'Trabalhador';
  const certs = perfil?.certificacoes ?? [];
  const ativas = certs.filter((c) => c.status === 'ATIVA').length;

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.two }]}
        showsVerticalScrollIndicator={false}>

        {/* Barra superior */}
        <View style={styles.topBar}>
          <ThemedText style={styles.brand}>
            Capaci<ThemedText style={[styles.brand, styles.brandTo]}>TO</ThemedText>
          </ThemedText>
          <Pressable accessibilityRole="button" accessibilityLabel="Sair" onPress={aoSair} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={20} color={Brand.azulRio} />
          </Pressable>
        </View>

        {/* Cartão da carteira digital (gradiente da marca, sem foto) */}
        <LinearGradient
          colors={['#0A3659', '#0C4F73', Brand.teal]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.walletCard}>
          <Ionicons name="shield-checkmark" size={150} color="#FFFFFF" style={styles.walletWatermark} />

          <View style={styles.walletHead}>
            <Avatar nome={nome} size={52} tone="teal" />
            <View style={styles.flex}>
              <ThemedText style={styles.walletHello}>Olá,</ThemedText>
              <ThemedText style={styles.walletName} numberOfLines={1}>
                {nome}
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar perfil"
              onPress={() => router.push('/perfil-editar')}
              hitSlop={8}
              style={styles.walletEdit}>
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.walletLabelRow}>
            <Ionicons name="card-outline" size={14} color={Brand.dourado} />
            <ThemedText style={styles.walletLabel}>CARTEIRA DE QUALIFICAÇÃO DIGITAL</ThemedText>
          </View>

          {perfil ? (
            certs.length > 0 ? (
              <View style={styles.walletStats}>
                <View style={styles.walletProgressTrack}>
                  <View style={[styles.walletProgressFill, { width: `${clamp(perfil.completude)}%` }]} />
                </View>
                <View style={styles.walletMetricsRow}>
                  <Metric valor={`${perfil.completude}%`} rotulo="qualificado" />
                  <View style={styles.walletDivider} />
                  <Metric valor={`${ativas}`} rotulo={ativas === 1 ? 'certificado' : 'certificados'} />
                </View>
              </View>
            ) : (
              <ThemedText style={styles.walletEmpty}>Pronta para o seu primeiro certificado 🐟</ThemedText>
            )
          ) : (
            <View style={styles.walletLoading}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}
        </LinearGradient>

        {/* Conteúdo */}
        <View style={styles.body}>
          {carregando && !perfil ? (
            <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.four }} />
          ) : perfil ? (
            certs.length === 0 ? (
              <>
                {/* Estado inicial: explica o caminho até o 1º certificado */}
                <Card style={styles.comecar}>
                  <ThemedText type="smallBold">Como funciona sua carteira</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Cada treino que você conclui vira um certificado aqui — e é com ele que as indústrias de alimentos do
                    Tocantins te encontram.
                  </ThemedText>
                  <View style={styles.passos}>
                    <Passo n={1} icon="qr-code" texto="Escaneie o QR na estação ou escolha um treinamento" />
                    <Passo n={2} icon="play-circle" texto="Assista ao microvídeo — leva menos de 2 minutos" />
                    <Passo n={3} icon="ribbon" texto="Ganhe o certificado e apareça para as empresas" />
                  </View>
                </Card>

                <View style={styles.ctas}>
                  <Button title="Ver treinamentos" icon="school" onPress={() => router.push('/aprender')} />
                </View>
              </>
            ) : (
              <>
                {/* Ação rápida */}
                <View style={styles.atalhos}>
                  <Atalho icon="school" cor={Brand.teal} titulo="Ver treinamentos" onPress={() => router.push('/aprender')} />
                </View>

                {/* Competências certificadas */}
                <View style={styles.secaoHeader}>
                  <ThemedText type="smallBold">Competências certificadas ({certs.length})</ThemedText>
                  <Pressable onPress={() => router.push('/certificados')} hitSlop={6}>
                    <ThemedText type="link" style={{ color: Brand.azulRio }}>
                      Ver todas
                    </ThemedText>
                  </Pressable>
                </View>

                <View style={styles.lista}>
                  {certs.slice(0, 3).map((c) => (
                    <CompetenciaBadge key={c.id} certificacao={c} />
                  ))}
                </View>

                {/* Visibilidade LGPD (RN06) */}
                <Card style={styles.rowBetween}>
                  <View style={styles.visIcon}>
                    <Ionicons name={visivel ? 'eye-outline' : 'eye-off-outline'} size={20} color={Brand.azulRio} />
                  </View>
                  <View style={styles.flex}>
                    <ThemedText type="smallBold">Visível para indústrias</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {visivel ? 'As empresas podem te encontrar.' : 'Seu perfil está oculto.'}
                    </ThemedText>
                  </View>
                  <Switch value={visivel} onValueChange={alternarVisibilidade} trackColor={{ true: Brand.teal }} />
                </Card>
              </>
            )
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

/** Métrica do cartão (valor grande + rótulo pequeno). */
function Metric({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={styles.metric}>
      <ThemedText style={styles.metricValor}>{valor}</ThemedText>
      <ThemedText style={styles.metricRotulo}>{rotulo}</ThemedText>
    </View>
  );
}

/** Atalho quadrado de ação rápida (estado com certificados). */
function Atalho({
  icon,
  cor,
  titulo,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  cor: string;
  titulo: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.atalho, pressed && styles.atalhoPressed]}>
      <View style={[styles.atalhoIcon, { backgroundColor: cor }]}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      </View>
      <ThemedText type="smallBold">{titulo}</ThemedText>
    </Pressable>
  );
}

/** Passo numerado do guia "como funciona" (estado inicial da carteira). */
function Passo({
  n,
  icon,
  texto,
}: {
  n: number;
  icon: ComponentProps<typeof Ionicons>['name'];
  texto: string;
}) {
  return (
    <View style={styles.passo}>
      <View style={styles.passoNum}>
        <ThemedText style={styles.passoNumTxt}>{n}</ThemedText>
      </View>
      <Ionicons name={icon} size={20} color={Brand.azulRio} />
      <ThemedText type="small" style={styles.flex}>
        {texto}
      </ThemedText>
    </View>
  );
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: TabBarSpace },

  // Barra superior
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.three },
  brand: { color: Brand.azulRio, fontSize: 22, fontFamily: FontFamily.tituloBold },
  brandTo: { color: Brand.dourado },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...Shadow.card,
  },

  // Cartão da carteira
  walletCard: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
    overflow: 'hidden',
    ...Shadow.fab,
  },
  walletWatermark: { position: 'absolute', right: -30, bottom: -34, opacity: 0.12 },
  walletHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  walletHello: { color: 'rgba(255,255,255,0.82)', fontFamily: FontFamily.corpoMedio, fontSize: 14 },
  walletName: { color: '#FFFFFF', fontFamily: FontFamily.tituloBold, fontSize: 22, lineHeight: 28 },
  walletEdit: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  walletLabelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  walletLabel: { color: Brand.dourado, fontFamily: FontFamily.tituloBold, fontSize: 12, letterSpacing: 0.8 },

  walletStats: { gap: Spacing.two },
  walletProgressTrack: { height: 8, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  walletProgressFill: { height: 8, borderRadius: Radius.pill, backgroundColor: Brand.dourado },
  walletMetricsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.one },
  walletDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.22)' },
  metric: { gap: 0 },
  metricValor: { color: '#FFFFFF', fontFamily: FontFamily.tituloBold, fontSize: 22, lineHeight: 26 },
  metricRotulo: { color: 'rgba(255,255,255,0.78)', fontFamily: FontFamily.corpoMedio, fontSize: 12 },
  walletEmpty: { color: '#FFFFFF', fontFamily: FontFamily.corpoMedio, fontSize: 14, lineHeight: 20 },
  walletLoading: { height: 40, alignItems: 'flex-start', justifyContent: 'center' },

  // Corpo
  body: { paddingTop: Spacing.four, gap: Spacing.three },

  atalhos: { flexDirection: 'row', gap: Spacing.three },
  atalho: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
    ...Shadow.card,
  },
  atalhoPressed: { opacity: 0.95, transform: [{ scale: 0.99 }] },
  atalhoIcon: { width: 46, height: 46, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },

  comecar: { gap: Spacing.two },
  passos: { gap: Spacing.three, marginTop: Spacing.one },
  passo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  passoNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: Brand.azulRio, alignItems: 'center', justifyContent: 'center' },
  passoNumTxt: { color: '#FFFFFF', fontFamily: FontFamily.tituloBold, fontSize: 13 },

  secaoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.one },
  lista: { gap: Spacing.two },
  ctas: { gap: Spacing.two, marginTop: Spacing.two },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  visIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6EEF4',
  },
});
