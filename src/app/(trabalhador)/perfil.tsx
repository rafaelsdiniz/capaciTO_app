import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type IconName } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { PerfilMe } from '@/lib/api/types';
import { useSession } from '@/lib/session/session-context';

/** Hub da conta do trabalhador: dados, certificados, candidaturas, visibilidade. */
export default function PerfilScreen() {
  const router = useRouter();
  const { usuario, sair } = useSession();

  const [perfil, setPerfil] = useState<PerfilMe | null>(null);
  const [qtdCandidaturas, setQtdCandidaturas] = useState<number>(0);
  const [visivel, setVisivel] = useState(true);

  const carregar = useCallback(async () => {
    const [p, cand] = await Promise.all([api.perfil.me(), api.vagas.minhasCandidaturas()]);
    setPerfil(p);
    setVisivel(p.visivel);
    setQtdCandidaturas(cand.length);
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

  return (
    <Screen scroll padded={false}>
      <AppHeader centered title="Minha conta" />

      <View style={styles.body}>
        {/* Cartão de identidade */}
        <Card style={styles.identidade}>
          <Avatar nome={perfil?.usuario.nome ?? usuario?.nome} size={72} />
          <View style={styles.flex}>
            <ThemedText type="smallBold" style={styles.nome}>
              {perfil?.usuario.nome ?? usuario?.nome ?? 'Trabalhador'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {perfil?.usuario.email ?? usuario?.email}
            </ThemedText>
            {perfil?.cidade ? (
              <View style={{ marginTop: 4 }}>
                <Tag label={perfil.cidade} tone="primary" icon="📍" />
              </View>
            ) : null}
          </View>
        </Card>

        {/* Ação principal: ler QR da estação (fatia ao vivo) */}
        <Button title="Escanear QR da estação" icon="qr-code" onPress={() => router.push('/escanear')} />

        {/* Atalhos */}
        <View style={styles.menu}>
          <MenuRow icon="person-outline" label="Editar meus dados" onPress={() => router.push('/perfil-editar')} />
          <MenuRow
            icon="ribbon-outline"
            label="Meus certificados"
            badge={perfil ? String(perfil.certificacoes.length) : undefined}
            onPress={() => router.push('/certificados')}
          />
          <MenuRow
            icon="document-text-outline"
            label="Minhas candidaturas"
            badge={qtdCandidaturas ? String(qtdCandidaturas) : undefined}
            onPress={() => router.push('/minhas-candidaturas')}
          />
        </View>

        {/* Visibilidade */}
        <Card style={styles.rowBetween}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">Visível para indústrias</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {visivel ? 'As empresas podem te encontrar.' : 'Seu perfil está oculto.'}
            </ThemedText>
          </View>
          <Switch value={visivel} onValueChange={alternarVisibilidade} trackColor={{ true: Brand.teal }} />
        </Card>

        <Button title="Sair da conta" icon="log-out-outline" variant="outline" onPress={aoSair} />
      </View>
    </Screen>
  );
}

function MenuRow({ icon, label, badge, onPress }: { icon: IconName; label: string; badge?: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Card onPress={onPress} style={styles.menuRow}>
      <View style={[styles.menuIcon, { backgroundColor: '#E6EEF4' }]}>
        <Ionicons name={icon} size={20} color={Brand.azulRio} />
      </View>
      <ThemedText type="smallBold" style={styles.flex}>
        {label}
      </ThemedText>
      {badge ? <Tag label={badge} tone="neutral" /> : null}
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  identidade: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  nome: { fontSize: 18 },
  menu: { gap: Spacing.two },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  menuIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
});
