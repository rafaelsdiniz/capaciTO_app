import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { Brand, Spacing } from '@/constants/theme';
import type { Certificacao } from '@/lib/api/types';

/**
 * Cartão de competência certificada na carteira (RF06).
 * Mostra "expirada" quando aplicável (RN03).
 */
export function CompetenciaBadge({ certificacao }: { certificacao: Certificacao }) {
  const expirada = certificacao.status === 'EXPIRADA';
  return (
    <Card style={styles.card}>
      <View style={[styles.selo, { backgroundColor: expirada ? Brand.perigo : Brand.teal }]}>
        <Ionicons name={expirada ? 'alert' : 'ribbon'} size={20} color={Brand.branco} />
      </View>
      <View style={styles.texts}>
        <ThemedText type="smallBold">{certificacao.competencia.nome}</ThemedText>
        <ThemedText type="tag" themeColor="textSecondary">
          Emitida em {formatarData(certificacao.dataEmissao)}
        </ThemedText>
      </View>
      <Tag label={expirada ? 'Expirada' : 'Ativa'} tone={expirada ? 'danger' : 'success'} />
    </Card>
  );
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  selo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
});
