import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';

import { CarreiraChat } from '@/components/carreira/carreira-chat';
import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { AuthButton } from '@/components/ui/auth-button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Lacuna, PlanoCarreira } from '@/lib/api/types';

/** Aba Plano de carreira: o que falta pra você + onde se qualificar. */
export default function PlanoCarreiraScreen() {
  const router = useRouter();
  const [plano, setPlano] = useState<PlanoCarreira | null>(null);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      api.planoCarreira
        .obter()
        .then((p) => ativo && setPlano(p))
        .finally(() => ativo && setCarregando(false));
      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <Screen scroll padded={false}>
      <AppHeader centered title="Plano de carreira" subtitle="Como evoluir na indústria de alimentos" right={<AuthButton />} />

      <View style={styles.body}>
        <CarreiraChat />

        {carregando && !plano ? (
          <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.five }} />
        ) : plano ? (
          <>
            {/* Resumo */}
            <View style={styles.resumoRow}>
              <ResumoCard icon="ribbon" valor={plano.competenciasAtuais} rotulo="Competências" cor={Brand.teal} />
              <ResumoCard icon="briefcase" valor={plano.vagasCompativeis} rotulo="Vagas compatíveis" cor={Brand.azulRio} />
            </View>

            {plano.lacunas.length === 0 ? (
              <Card style={styles.parabens}>
                <Ionicons name="trophy" size={32} color={Brand.dourado} />
                <ThemedText type="smallBold" style={styles.parabensTitulo}>
                  Você está em dia!
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
                  Seu perfil já atende às competências das vagas abertas. Continue acompanhando novas oportunidades.
                </ThemedText>
              </Card>
            ) : (
              <>
                <View>
                  <ThemedText type="smallBold">Suas próximas conquistas</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Competências que destravam mais vagas — e onde aprendê-las.
                  </ThemedText>
                </View>
                {plano.lacunas.map((l) => (
                  <LacunaCard key={l.competencia.id} lacuna={l} />
                ))}
              </>
            )}

            <Pressable onPress={() => router.push('/editais')} style={styles.verTodos}>
              <ThemedText type="smallBold" style={{ color: Brand.azulRio }}>
                Ver todos os editais e cursos
              </ThemedText>
              <Ionicons name="arrow-forward" size={16} color={Brand.azulRio} />
            </Pressable>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

function ResumoCard({ icon, valor, rotulo, cor }: { icon: keyof typeof Ionicons.glyphMap; valor: number; rotulo: string; cor: string }) {
  return (
    <Card style={styles.resumoCard}>
      <View style={[styles.resumoIcon, { backgroundColor: cor }]}>
        <Ionicons name={icon} size={20} color={Brand.branco} />
      </View>
      <ThemedText style={styles.resumoValor}>{valor}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {rotulo}
      </ThemedText>
    </Card>
  );
}

function LacunaCard({ lacuna }: { lacuna: Lacuna }) {
  return (
    <Card>
      <View style={styles.lacunaTop}>
        <View style={styles.flex}>
          <ThemedText type="smallBold" style={styles.lacunaNome}>
            {lacuna.competencia.nome}
          </ThemedText>
          <View style={styles.metaRow}>
            <Ionicons name="briefcase-outline" size={13} color={Brand.dourado} />
            <ThemedText type="small" style={{ color: '#8A6300' }}>
              {lacuna.vagasQueExigem} {lacuna.vagasQueExigem === 1 ? 'vaga exige' : 'vagas exigem'} esta competência
            </ThemedText>
          </View>
        </View>
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        Onde se qualificar:
      </ThemedText>
      {lacuna.ondeQualificar.map((o) => (
        <Pressable
          key={o.id}
          accessibilityRole="button"
          onPress={() => Linking.openURL(o.link).catch(() => {})}
          style={styles.opLinha}>
          <Ionicons name="school" size={16} color={Brand.teal} />
          <View style={styles.flex}>
            <ThemedText type="small" style={styles.opTitulo} numberOfLines={1}>
              {o.titulo}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {o.instituicao}
            </ThemedText>
          </View>
          {o.gratuito ? <Tag label="Grátis" tone="success" /> : null}
          <Ionicons name="open-outline" size={16} color="#9AA8B2" />
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  resumoRow: { flexDirection: 'row', gap: Spacing.two },
  resumoCard: { flex: 1, alignItems: 'center', gap: 4 },
  resumoIcon: { width: 42, height: 42, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  resumoValor: { fontFamily: FontFamily.tituloBold, fontSize: 28, lineHeight: 32, color: Brand.chumbo },

  parabens: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.four },
  parabensTitulo: { fontSize: 18 },

  lacunaTop: { flexDirection: 'row', alignItems: 'center' },
  lacunaNome: { fontSize: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  opLinha: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 6 },
  opTitulo: { fontFamily: FontFamily.corpoMedio },

  verTodos: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: Spacing.two },
});
