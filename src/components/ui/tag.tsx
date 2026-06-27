import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';

type TagTone = 'neutral' | 'primary' | 'teal' | 'accent' | 'success' | 'danger';

/** Etiqueta/crachá (Barlow). Para competências, status, temas (#Tambaqui). */
export function Tag({ label, tone = 'neutral', icon }: { label: string; tone?: TagTone; icon?: string }) {
  const c = TONES[tone];
  return (
    <View style={[styles.tag, { backgroundColor: c.bg, borderColor: c.border }]}>
      {icon ? <ThemedText style={[styles.icon, { color: c.fg }]}>{icon}</ThemedText> : null}
      <ThemedText type="tag" style={{ color: c.fg }}>
        {label}
      </ThemedText>
    </View>
  );
}

const TONES: Record<TagTone, { bg: string; fg: string; border: string }> = {
  neutral: { bg: '#EEF2F1', fg: '#5B6B7A', border: '#DDE5E3' },
  primary: { bg: '#E6EEF4', fg: Brand.azulRio, border: '#CBDBE7' },
  teal: { bg: '#E0F2F1', fg: '#006B69', border: '#BFE3E1' },
  accent: { bg: '#FDF1D6', fg: '#8A6300', border: '#F6E0A8' },
  success: { bg: '#E4F6EC', fg: '#147A43', border: '#C5E9D3' },
  danger: { bg: '#FDECEC', fg: Brand.perigo, border: '#F6CFCF' },
};

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  icon: { fontSize: 12 },
});
