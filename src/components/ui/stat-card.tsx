import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type IconName } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';

/** Cartão de indicador para dashboards (ex.: nº de estações, vagas). */
export function StatCard({
  icon,
  valor,
  rotulo,
  tone = 'primary',
}: {
  icon: IconName;
  valor: string | number;
  rotulo: string;
  tone?: 'primary' | 'teal' | 'accent';
}) {
  const cor = tone === 'teal' ? Brand.teal : tone === 'accent' ? Brand.dourado : Brand.azulRio;
  return (
    <Card style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: cor }]}>
        <Ionicons name={icon} size={20} color={tone === 'accent' ? Brand.chumbo : Brand.branco} />
      </View>
      <ThemedText style={styles.valor}>{valor}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {rotulo}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: Spacing.one },
  iconBox: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  valor: { fontFamily: FontFamily.tituloBold, fontSize: 26, color: Brand.azulRio },
});
