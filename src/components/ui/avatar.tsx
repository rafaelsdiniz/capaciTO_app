import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, FontFamily } from '@/constants/theme';

/** Avatar com iniciais (placeholder até ter foto — RF05). */
export function Avatar({ nome, size = 56, tone = 'primary' }: { nome?: string; size?: number; tone?: 'primary' | 'teal' }) {
  const bg = tone === 'teal' ? Brand.teal : Brand.azulRio;
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <ThemedText style={[styles.txt, { fontSize: size * 0.4 }]}>{iniciais(nome)}</ThemedText>
    </View>
  );
}

function iniciais(nome?: string): string {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  const a = partes[0]?.[0] ?? '';
  const b = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (a + b).toUpperCase();
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  txt: { color: Brand.branco, fontFamily: FontFamily.tituloSemi },
});
