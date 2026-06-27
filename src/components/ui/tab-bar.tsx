import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { type IconName } from '@/components/ui/button';
import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Props vindos do tabBar do expo-router (BottomTabBarProps). Tipados como any
// nos campos de navegação para não depender de @react-navigation/bottom-tabs.
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  descriptors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  icons: Record<string, IconName>;
  activeColor?: string;
};

/**
 * Tab bar custom da plataforma: barra clara flutuante, item ativo com pílula
 * na cor da marca. Recebe os ícones por nome de rota via `icons`.
 */
export function TabBar({ state, descriptors, navigation, icons, activeColor = Brand.azulRio }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, Spacing.two), backgroundColor: theme.backgroundElement, borderTopColor: theme.border }]}>
      {state.routes.map((route, index) => {
        const icon = icons[route.name];
        if (!icon) return null; // rotas de detalhe (href:null) não viram aba
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable key={route.key} accessibilityRole="button" accessibilityState={{ selected: focused }} onPress={onPress} style={styles.item}>
            <View style={[styles.pill, focused && { backgroundColor: activeColor }]}>
              <Ionicons name={icon} size={22} color={focused ? Brand.branco : theme.textSecondary} />
            </View>
            <ThemedText style={[styles.label, { color: focused ? activeColor : theme.textSecondary }]} numberOfLines={1}>
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.two,
    ...Platform.select({
      web: { gap: Spacing.two },
      default: {},
    }),
  },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  pill: { paddingHorizontal: Spacing.three, paddingVertical: 6, borderRadius: Radius.pill, minWidth: 56, alignItems: 'center' },
  label: { fontFamily: FontFamily.tag, fontSize: 11 },
});
