import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native';

import { CompetenciaBadge } from '@/components/capacitacao/competencia-badge';
import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { PerfilMe } from '@/lib/api/types';
import { useSession } from '@/lib/session/session-context';

/** Carteira de Qualificação Digital (RF06 competências, RF07 completude, RF08 visibilidade). */
export default function CarteiraScreen() {
  const router = useRouter();
  const theme = useTheme();
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

  // Recarrega ao voltar para a aba (ex.: depois de certificar na fatia ao vivo).
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  function aoSair() {
    sair();
    router.replace('/');
  }

  const certs = perfil?.certificacoes ?? [];

  return (
    <Screen scroll padded={false}>
      <AppHeader
        showLogo
        right={
          <Pressable accessibilityRole="button" onPress={aoSair} hitSlop={10} style={styles.sair}>
            <Ionicons name="log-out-outline" size={22} color={theme.textSecondary} />
          </Pressable>
        }
      />

      <View style={styles.body}>
        {/* Identidade do trabalhador */}
        <View style={styles.perfilRow}>
          <Avatar nome={perfil?.usuario.nome ?? usuario?.nome} size={64} />
          <View style={styles.flex}>
            <ThemedText type="subtitle">{perfil?.usuario.nome ?? usuario?.nome ?? 'Trabalhador'}</ThemedText>
            {perfil?.cidade ? (
              <ThemedText type="small" themeColor="textSecondary">
                <Ionicons name="location-outline" size={13} /> {perfil.cidade}
              </ThemedText>
            ) : null}
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/perfil-editar')} hitSlop={8}>
            <Ionicons name="create-outline" size={22} color={Brand.azulRio} />
          </Pressable>
        </View>

        {carregando && !perfil ? (
          <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.five }} />
        ) : perfil ? (
          <>
            {/* RF07 — completude */}
            <Card>
              <View style={styles.rowBetween}>
                <ThemedText type="smallBold">Qualificação do perfil</ThemedText>
                <ThemedText type="smallBold" style={{ color: Brand.teal }}>
                  {perfil.completude}%
                </ThemedText>
              </View>
              <ProgressBar value={perfil.completude} />
            </Card>

            {/* RF08 — visibilidade (RN06) */}
            <Card style={styles.rowBetween}>
              <View style={styles.flex}>
                <ThemedText type="smallBold">Visível para indústrias</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {visivel ? 'As empresas podem te encontrar.' : 'Seu perfil está oculto.'}
                </ThemedText>
              </View>
              <Switch
                value={visivel}
                onValueChange={setVisivel}
                trackColor={{ true: Brand.teal }}
                accessibilityLabel="Visibilidade do perfil"
              />
            </Card>

            {/* RF06 — competências certificadas */}
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
                  Você ainda não tem certificações. Assista a um treinamento ou escaneie o QR de uma
                  estação para começar.
                </ThemedText>
              </Card>
            ) : (
              <View style={styles.lista}>
                {certs.slice(0, 3).map((c) => (
                  <CompetenciaBadge key={c.id} certificacao={c} />
                ))}
              </View>
            )}

            {/* CTAs */}
            <View style={styles.ctas}>
              <Button title="Escanear QR da estação" icon="qr-code" onPress={() => router.push('/escanear')} />
              <Button title="Buscar treinamentos" icon="school" variant="outline" onPress={() => router.push('/aprender')} />
            </View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sair: { padding: 4 },
  body: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.five, gap: Spacing.three },
  perfilRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.one },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  secaoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.one },
  lista: { gap: Spacing.two },
  ctas: { gap: Spacing.two, marginTop: Spacing.two },
});
