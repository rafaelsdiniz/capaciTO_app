import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type IconName } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Campo de texto rotulado. Acessível: rótulo claro, alvo alto, alto contraste. */
export function Input({
  label,
  hint,
  icon,
  ...inputProps
}: TextInputProps & { label?: string; hint?: string; icon?: IconName }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      {label ? <ThemedText type="smallBold">{label}</ThemedText> : null}
      <View
        style={[
          styles.box,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        {icon ? <Ionicons name={icon} size={18} color={theme.textSecondary} /> : null}
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.textSecondary}
          {...inputProps}
        />
      </View>
      {hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.one },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    minHeight: 52,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: Spacing.three },
});
