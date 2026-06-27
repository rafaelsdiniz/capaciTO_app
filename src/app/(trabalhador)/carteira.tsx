import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, type ComponentProps } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompetenciaBadge } from '@/components/capacitacao/competencia-badge';
import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Brand, Spacing, TabBarSpace } from '@/constants/theme';
import { api } from '@/lib/api';
import type { PerfilMe } from '@/lib/api/types';
import { useSession } from '@/lib/session/session-context';

/** Carteira de Qualificação Digital — primeira tela do trabalhador, com hero. */
export default function CarteiraScreen() {
  const router = useRouter();
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

  return (
    <View style={styles.flex}>
      {/* Foto de fundo em tela cheia (atrás de tudo, inclusive da navbar) */}
      <ImageBackground source={require('@/assets/images/hero.jpg')} resizeMode="cover" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(10,54,89,0.45)', 'rgba(10,54,89,0.25)', 'rgba(10,54,89,0.55)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* HERO (conteúdo sobre a foto) */}
        <View style={styles.hero}>

          <LinearGradient
            colors={['rgba(10,54,89,0.20)', 'rgba(10,54,89,0.55)', 'rgba(10,54,89,0.92)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.heroContent, { paddingTop: insets.top + Spacing.two }]}>
            <View style={styles.heroTop}>
              <ThemedText style={styles.brand}>
                Capaci<ThemedText style={[styles.brand, styles.brandTo]}>TO</ThemedText>
              </ThemedText>
              <Pressable accessibilityRole="button" onPress={aoSair} hitSlop={10}>
                <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.heroSpacer} />

            <View style={styles.heroUser}>
              <Avatar nome={nome} size={56} />
              <View style={styles.flex}>
                <ThemedText style={styles.heroHello}>Olá,</ThemedText>
                <ThemedText style={styles.heroName} numberOfLines={1}>
                  {nome}
                </ThemedText>
              </View>
              <Pressable accessibilityRole="button" onPress={() => router.push('/perfil-editar')} hitSlop={8}>
                <Ionicons name="create-outline" size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            {perfil ? (
              <View style={styles.heroStats}>
                <ThemedText style={styles.heroCarteira}>Carteira de Qualificação Digital</ThemedText>
                {certs.length > 0 ? (
                  <>
                    <ProgressBar value={perfil.completude} color={Brand.dourado} />
                    <ThemedText style={styles.heroStatsText}>
                      {perfil.completude}% qualificado · {certs.length} {certs.length === 1 ? 'certificado' : 'certificados'}
                    </ThemedText>
                  </>
                ) : (
                  <ThemedText style={styles.heroStatsText}>Pronta para o seu primeiro certificado 🐟</ThemedText>
                )}
              </View>
            ) : null}
          </View>
        </View>

        {/* CONTEÚDO */}
        <View style={styles.body}>
          {carregando && !perfil ? (
            <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.four }} />
          ) : perfil ? (
            <>
              {certs.length === 0 ? (
                <>
                  {/* Estado inicial: acolhe e mostra o caminho até o 1º certificado */}
                  <Card style={styles.comecar}>
                    <ThemedText type="smallBold">Como funciona sua carteira</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Cada treino que você conclui vira um certificado aqui — e é com ele que as indústrias de alimentos do Tocantins te encontram.
                    </ThemedText>
                    <View style={styles.passos}>
                      <Passo n={1} icon="qr-code" texto="Escaneie o QR na estação ou escolha um treinamento" />
                      <Passo n={2} icon="play-circle" texto="Assista ao microvídeo — leva menos de 2 minutos" />
                      <Passo n={3} icon="ribbon" texto="Ganhe o certificado e apareça para as empresas" />
                    </View>
                  </Card>

                  <View style={styles.ctas}>
                    <Button title="Escanear QR da estação" icon="qr-code" onPress={() => router.push('/escanear')} />
                    <Button title="Ver treinamentos" icon="school" variant="outline" onPress={() => router.push('/aprender')} />
                  </View>
                </>
              ) : (
                <>
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

                  <View style={styles.ctas}>
                    <Button title="Escanear QR da estação" icon="qr-code" onPress={() => router.push('/escanear')} />
                    <Button title="Ver treinamentos" icon="school" variant="outline" onPress={() => router.push('/aprender')} />
                  </View>

                  <Card style={styles.rowBetween}>
                    <View style={styles.flex}>
                      <ThemedText type="smallBold">Visível para indústrias</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {visivel ? 'As empresas podem te encontrar.' : 'Seu perfil está oculto.'}
                      </ThemedText>
                    </View>
                    <Switch value={visivel} onValueChange={alternarVisibilidade} trackColor={{ true: Brand.teal }} />
                  </Card>
                </>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: TabBarSpace },

  hero: { width: '100%', height: 320 },
  heroContent: { flex: 1, paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  brandTo: { color: Brand.dourado },
  heroSpacer: { flex: 1, minHeight: Spacing.six },
  heroUser: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  heroHello: { color: 'rgba(255,255,255,0.85)', fontFamily: 'Nunito_500Medium', fontSize: 14 },
  heroName: { color: '#FFFFFF', fontFamily: 'Nunito_700Bold', fontSize: 24, lineHeight: 30 },
  heroStats: { marginTop: Spacing.three, gap: Spacing.one },
  heroCarteira: { color: Brand.dourado, fontFamily: 'Nunito_700Bold', fontSize: 13, letterSpacing: 0.5 },
  heroStatsText: { color: '#FFFFFF', fontFamily: 'Nunito_600SemiBold', fontSize: 13 },

  comecar: { gap: Spacing.two },
  passos: { gap: Spacing.three, marginTop: Spacing.one },
  passo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  passoNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: Brand.azulRio, alignItems: 'center', justifyContent: 'center' },
  passoNumTxt: { color: '#FFFFFF', fontFamily: 'Nunito_700Bold', fontSize: 13 },

  body: { paddingHorizontal: Spacing.four, paddingTop: Spacing.four, gap: Spacing.three },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  secaoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.one },
  lista: { gap: Spacing.two },
  ctas: { gap: Spacing.two, marginTop: Spacing.two },
});
