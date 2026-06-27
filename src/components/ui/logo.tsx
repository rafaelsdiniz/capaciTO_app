import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, FontFamily } from '@/constants/theme';

/**
 * Wordmark do CapaciTO — "Capaci" + "TO" em destaque (sol/dourado).
 * Espaço reservado para um logo em imagem (basta trocar por <Image/> depois).
 * Identidade: Montserrat Bold (autoridade), acento Dourado Jalapão.
 */
export function Logo({ size = 'md', style }: { size?: 'sm' | 'md' | 'lg'; style?: StyleProp<ViewStyle> }) {
  const fontSize = size === 'lg' ? 34 : size === 'sm' ? 20 : 26;
  return (
    <View style={[styles.row, style]}>
      <View style={[styles.mark, { width: fontSize * 1.25, height: fontSize * 1.25, borderRadius: fontSize * 0.35 }]}>
        <ThemedText style={[styles.markText, { fontSize: fontSize * 0.7 }]}>C</ThemedText>
      </View>
      <View style={styles.word}>
        <ThemedText style={[styles.capaci, { fontSize }]}>Capaci</ThemedText>
        <ThemedText style={[styles.to, { fontSize }]}>TO</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { backgroundColor: Brand.azulRio, alignItems: 'center', justifyContent: 'center' },
  markText: { color: Brand.branco, fontFamily: FontFamily.tituloBold },
  word: { flexDirection: 'row', alignItems: 'baseline' },
  capaci: { color: Brand.azulRio, fontFamily: FontFamily.tituloBold },
  to: { color: Brand.dourado, fontFamily: FontFamily.tituloBold },
});
