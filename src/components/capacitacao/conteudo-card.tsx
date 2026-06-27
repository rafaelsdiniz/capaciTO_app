import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { Brand, Radius, Spacing } from '@/constants/theme';
import type { Conteudo } from '@/lib/api/types';

/** Card de conteúdo no catálogo de aprendizagem (RF10/RF11). */
export function ConteudoCard({ conteudo, onPress }: { conteudo: Conteudo; onPress?: () => void }) {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.thumb}>
        <Ionicons name="play" size={24} color={Brand.branco} />
      </View>
      <View style={styles.info}>
        <ThemedText type="smallBold" numberOfLines={2}>
          {conteudo.titulo}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {conteudo.competencia.nome}
        </ThemedText>
        <View style={styles.tags}>
          <Tag label={formatarDuracao(conteudo.duracao)} tone="neutral" />
          <Tag label={`#${conteudo.tema}`} tone="teal" />
        </View>
      </View>
    </Card>
  );
}

function formatarDuracao(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')} min`;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  thumb: { width: 64, height: 64, borderRadius: Radius.sm, backgroundColor: Brand.teal, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 4, justifyContent: 'center' },
  tags: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
});
