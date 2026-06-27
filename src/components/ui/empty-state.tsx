import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type IconName } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Estado vazio amigável (lista sem itens, sem resultados de busca). */
export function EmptyState({ icon = 'cloud-outline', title, message }: { icon?: IconName; title: string; message?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.box}>
      <Ionicons name={icon} size={48} color={theme.textSecondary} />
      <ThemedText type="smallBold" style={styles.center}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingVertical: Spacing.six, paddingHorizontal: Spacing.four },
  center: { textAlign: 'center' },
});
