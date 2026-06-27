import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompetenciaBadge } from '@/components/capacitacao/competencia-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Brand, Radius, Spacing } from '@/constants/theme';
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
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <ImageBackground source={require('@/assets/images/hero.jpg')} style={styles.hero} imageStyle={styles.heroImg}>
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
                <ProgressBar value={perfil.completude} color={Brand.dourado} />
                <ThemedText style={styles.heroStatsText}>
                  {perfil.completude}% qualificado · {certs.length} {certs.length === 1 ? 'certificado' : 'certificados'}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </ImageBackground>

        {/* CONTEÚDO */}
        <View style={styles.body}>
          {carregando && !perfil ? (
            <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.four }} />
          ) : perfil ? (
            <>
              <Card style={styles.rowBetween}>
                <View style={styles.flex}>
                  <ThemedText type="smallBold">Visível para indústrias</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {visivel ? 'As empresas podem te encontrar.' : 'Seu perfil está oculto.'}
                  </ThemedText>
                </View>
                <Switch value={visivel} onValueChange={alternarVisibilidade} trackColor={{ true: Brand.teal }} />
              </Card>

              <View style={styles.secaoHeader}>
                <ThemedText type="smallBold">Competências certificadas ({certs.length})</ThemedText>
                {certs.length > 0 ? (
                  <Pressable onPress={() => router.push('/certificados')} hitSlop={6}>
                    <ThemedText type="link" style={{ color: Brand.azulRio }}>
                      Ver todas
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>

              {certs.length === 0 ? (
                <Card>
                  <ThemedText type="small" themeColor="textSecondary">
                    Você ainda não tem certificações. Toque no botão do QR ou busque um treinamento para começar.
                  </ThemedText>
                </Card>
              ) : (
                <View style={styles.lista}>
                  {certs.slice(0, 3).map((c) => (
                    <CompetenciaBadge key={c.id} certificacao={c} />
                  ))}
                </View>
              )}

              <View style={styles.ctas}>
                <Button title="Escanear QR da estação" icon="qr-code" onPress={() => router.push('/escanear')} />
                <Button title="Buscar treinamentos" icon="school" variant="outline" onPress={() => router.push('/aprender')} />
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: Spacing.six * 2 },

  hero: { width: '100%', minHeight: 280 },
  heroImg: { borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl },
  heroContent: { flex: 1, paddingHorizontal: Spacing.four, paddingBottom: Spacing.four, minHeight: 280 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  brandTo: { color: Brand.dourado },
  heroSpacer: { flex: 1, minHeight: Spacing.six },
  heroUser: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  heroHello: { color: 'rgba(255,255,255,0.85)', fontFamily: 'Nunito_500Medium', fontSize: 14 },
  heroName: { color: '#FFFFFF', fontFamily: 'Nunito_700Bold', fontSize: 24, lineHeight: 30 },
  heroStats: { marginTop: Spacing.three, gap: Spacing.one },
  heroStatsText: { color: '#FFFFFF', fontFamily: 'Nunito_600SemiBold', fontSize: 13 },

  body: { paddingHorizontal: Spacing.four, paddingTop: Spacing.four, gap: Spacing.three },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  secaoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.one },
  lista: { gap: Spacing.two },
  ctas: { gap: Spacing.two, marginTop: Spacing.two },
});
