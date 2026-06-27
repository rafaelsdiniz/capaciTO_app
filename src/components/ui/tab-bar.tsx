import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
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
 * Tab bar estilo iOS: barra branca flutuante (cantos arredondados, sombra) com
 * botão central elevado (FAB). O ícone do item ativo sobe levemente (mola).
 */
export function TabBar({ state, descriptors, navigation, icons, activeColor = Brand.azulRio, center }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const tabRoutes = state.routes.filter((r) => icons[r.name]);
  const meio = Math.ceil(tabRoutes.length / 2);

  function renderItem(route: { key: string; name: string }) {
    const { options } = descriptors[route.key];
    const label = (options.title ?? route.name) as string;
    const realIndex = state.routes.findIndex((r) => r.key === route.key);
    const focused = state.index === realIndex;

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    return <TabItem key={route.key} icon={icons[route.name]} label={label} focused={focused} activeColor={activeColor} inactiveColor={theme.textSecondary} onPress={onPress} />;
  }

  return (
    <View style={[styles.host, { paddingBottom: Math.max(insets.bottom, Spacing.three) + Spacing.three }]}>
      <View style={[styles.bar, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        {tabRoutes.slice(0, meio).map(renderItem)}
        {center ? (
          <View style={styles.centerSlot}>
            <CenterFab center={center} />
          </View>
        ) : null}
        {tabRoutes.slice(meio).map(renderItem)}
      </View>
    </View>
  );
}

function TabItem({
  icon,
  label,
  focused,
  activeColor,
  inactiveColor,
  onPress,
}: {
  icon: IconName;
  label: string;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
}) {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: focused ? 1 : 0, useNativeDriver: true, friction: 6, tension: 140 }).start();
  }, [focused, anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const color = focused ? activeColor : inactiveColor;

  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: focused }} onPress={onPress} style={styles.item}>
      <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
        <Ionicons name={icon} size={24} color={color} />
      </Animated.View>
      <ThemedText style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function CenterFab({ center }: { center: Center }) {
  const press = useRef(new Animated.Value(0)).current;

  const animar = (para: number) =>
    Animated.spring(press, { toValue: para, useNativeDriver: true, friction: 6, tension: 180 }).start();

  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ação principal"
        onPressIn={() => animar(1)}
        onPressOut={() => animar(0)}
        onPress={center.onPress}
        style={[styles.fab, { backgroundColor: center.color }]}>
        <Ionicons name={center.icon} size={26} color={Brand.branco} />
      </Pressable>
    </Animated.View>
  );
}

const FAB = 52;

const styles = StyleSheet.create({
  host: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, backgroundColor: 'transparent' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    ...Shadow.bar,
  },
  item: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 2 },
  label: { fontFamily: FontFamily.tag, fontSize: 11 },
  centerSlot: { width: FAB + Spacing.two, alignItems: 'center' },
  fab: {
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.fab,
  },
});
