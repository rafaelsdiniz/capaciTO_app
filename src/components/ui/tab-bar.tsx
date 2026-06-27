import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { type IconName } from '@/components/ui/button';
import { Brand, FontFamily, Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Center = { icon: IconName; color: string; onPress: () => void };

// Props vindos do tabBar do expo-router (BottomTabBarProps) — campos de
// navegação tipados como any para não depender de @react-navigation/bottom-tabs.
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  descriptors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  icons: Record<string, IconName>;
  activeColor?: string;
  center?: Center;
};

/**
 * Tab bar estilo iOS: barra branca flutuante com cantos arredondados, hairline
 * e sombra; itens com ícone + label pequeno; botão central circular elevado
 * (FAB) para a ação principal (Escanear no trabalhador, + na indústria).
 */
export function TabBar({ state, descriptors, navigation, icons, activeColor = Brand.azulRio, center }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const tabRoutes = state.routes.filter((r) => icons[r.name]);
  const meio = Math.ceil(tabRoutes.length / 2);
  const esquerda = tabRoutes.slice(0, meio);
  const direita = tabRoutes.slice(meio);

  function item(route: { key: string; name: string }) {
    const icon = icons[route.name];
    const { options } = descriptors[route.key];
    const label = (options.title ?? route.name) as string;
    const realIndex = state.routes.findIndex((r) => r.key === route.key);
    const focused = state.index === realIndex;

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    return (
      <Pressable key={route.key} accessibilityRole="button" accessibilityState={{ selected: focused }} onPress={onPress} style={styles.item}>
        <Ionicons name={icon} size={24} color={focused ? activeColor : theme.textSecondary} />
        <ThemedText style={[styles.label, { color: focused ? activeColor : theme.textSecondary }]} numberOfLines={1}>
          {label}
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <View style={[styles.host, { paddingBottom: Math.max(insets.bottom, Spacing.two) }]}>
      <View style={[styles.bar, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        {esquerda.map(item)}
        {center ? (
          <View style={styles.centerSlot}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ação principal"
              onPress={center.onPress}
              style={({ pressed }) => [styles.fab, { backgroundColor: center.color }, pressed && styles.fabPressed]}>
              <Ionicons name={center.icon} size={28} color={Brand.branco} />
            </Pressable>
          </View>
        ) : null}
        {direita.map(item)}
      </View>
    </View>
  );
}

const FAB = 62;

const styles = StyleSheet.create({
  host: { paddingHorizontal: Spacing.three, paddingTop: FAB / 2, backgroundColor: 'transparent' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    ...Shadow.bar,
  },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2 },
  label: { fontFamily: FontFamily.tag, fontSize: 11 },
  centerSlot: { width: FAB + Spacing.two, alignItems: 'center' },
  fab: {
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -(FAB / 2) }],
    ...Shadow.fab,
  },
  fabPressed: { transform: [{ translateY: -(FAB / 2) }, { scale: 0.94 }] },
});
