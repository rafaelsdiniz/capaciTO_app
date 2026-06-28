import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';

// Fundo branco: casa com o fundo da própria logo (sem "quadrado" visível).
const BACKGROUND = '#FFFFFF';
const DURATION_MS = 3200;

const LOGO = require('@/assets/images/logoCapacito.png');

/**
 * Abertura do app: a logo CapaciTO surge com fade + zoom suave, seguida da
 * tagline e de um acento dourado que cresce sob o texto. Segura um instante e
 * dá fade-out, entregando o controle ao destino via onFinish (RF03).
 */
export function AppEntryAnimation({ onFinish }: { onFinish?: () => void }) {
  const { width, height } = useWindowDimensions();
  const [visible, setVisible] = useState(true);

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoTranslate = useRef(new Animated.Value(16)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(10)).current;
  const accentScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setVisible(true);
    screenOpacity.setValue(1);
    logoOpacity.setValue(0);
    logoScale.setValue(0.82);
    logoTranslate.setValue(16);
    taglineOpacity.setValue(0);
    taglineTranslate.setValue(10);
    accentScale.setValue(0);

    const animation = Animated.sequence([
      // 1) Logo entra: fade + zoom + leve subida.
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 760,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 880,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslate, {
          toValue: 0,
          duration: 880,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      // 2) Tagline + acento dourado.
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslate, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(accentScale, {
          toValue: 1,
          duration: 640,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 3) Segura e some.
      Animated.delay(820),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 520,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        setVisible(false);
        onFinish?.();
      }
    });

    const fallback = setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, DURATION_MS + 400);

    return () => {
      animation.stop();
      clearTimeout(fallback);
    };
  }, [
    accentScale,
    logoOpacity,
    logoScale,
    logoTranslate,
    onFinish,
    screenOpacity,
    taglineOpacity,
    taglineTranslate,
  ]);

  if (!visible) return null;

  const logoSize = Math.min(width * 0.72, 300);

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.screen, { minHeight: Math.max(height, 720), opacity: screenOpacity }]}>
      <View style={styles.stage}>
        <Animated.Image
          source={LOGO}
          resizeMode="contain"
          style={[
            { width: logoSize, height: logoSize },
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslate }, { scale: logoScale }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.tagBlock,
            { opacity: taglineOpacity, transform: [{ translateY: taglineTranslate }] },
          ]}>
          <Animated.View style={[styles.accent, { transform: [{ scaleX: accentScale }] }]} />
          <Text style={styles.tagline}>Qualificação e conexão profissional</Text>
          <Text style={styles.tagSub}>Indústria de alimentos do Tocantins</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BACKGROUND,
  },
  stage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    transform: [{ translateY: -12 }],
  },
  tagBlock: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  accent: {
    width: 56,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Brand.dourado,
    marginBottom: Spacing.two,
  },
  tagline: {
    color: Brand.azulRio,
    fontFamily: FontFamily.tituloSemi,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  tagSub: {
    color: Brand.chumbo,
    fontFamily: FontFamily.corpoMedio,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    opacity: 0.7,
  },
});
