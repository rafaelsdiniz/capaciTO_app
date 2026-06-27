import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Brand, FontFamily, Spacing } from '@/constants/theme';

const TO_BLUE = '#214B9A';
const TO_GOLD = '#F2A51A';
const BACKGROUND = '#071A2D';
const DURATION_MS = 6000;

export function AppEntryAnimation({ onFinish }: { onFinish?: () => void }) {
  const { height } = useWindowDimensions();
  const [visible, setVisible] = useState(true);

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslate = useRef(new Animated.Value(18)).current;
  const wordScale = useRef(new Animated.Value(1)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markTranslate = useRef(new Animated.Value(18)).current;
  const markScale = useRef(new Animated.Value(0.86)).current;
  const tTranslate = useRef(new Animated.Value(-46)).current;
  const oTranslate = useRef(new Animated.Value(46)).current;
  const flagOpacity = useRef(new Animated.Value(0)).current;
  const flagTranslate = useRef(new Animated.Value(18)).current;
  const flagScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    setVisible(true);
    screenOpacity.setValue(1);
    wordOpacity.setValue(0);
    wordTranslate.setValue(18);
    wordScale.setValue(1);
    markOpacity.setValue(0);
    markTranslate.setValue(18);
    markScale.setValue(0.86);
    tTranslate.setValue(-46);
    oTranslate.setValue(46);
    flagOpacity.setValue(0);
    flagTranslate.setValue(18);
    flagScale.setValue(0.92);

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(wordTranslate, {
          toValue: 0,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1120),
      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 0,
          duration: 620,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(wordScale, {
          toValue: 0.92,
          duration: 620,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(markOpacity, {
          toValue: 1,
          duration: 760,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(markTranslate, {
          toValue: 0,
          duration: 760,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(markScale, {
          toValue: 1,
          duration: 760,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(tTranslate, {
          toValue: 0,
          duration: 860,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(oTranslate, {
          toValue: 0,
          duration: 860,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(680),
      Animated.parallel([
        Animated.timing(flagOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(flagTranslate, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(flagScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(920),
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
    }, DURATION_MS + 350);

    return () => {
      animation.stop();
      clearTimeout(fallback);
    };
  }, [
    flagOpacity,
    flagScale,
    flagTranslate,
    markOpacity,
    markScale,
    markTranslate,
    oTranslate,
    onFinish,
    screenOpacity,
    tTranslate,
    wordOpacity,
    wordScale,
    wordTranslate,
  ]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.screen, { minHeight: Math.max(height, 720), opacity: screenOpacity }]}>
      <View style={styles.stage}>
        <Animated.View
          style={[
            styles.wordmark,
            {
              opacity: wordOpacity,
              transform: [{ translateY: wordTranslate }, { scale: wordScale }],
            },
          ]}>
          <Text style={styles.wordCapaci}>Capaci</Text>
          <Text style={styles.wordTo}>TO</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.toMark,
            {
              opacity: markOpacity,
              transform: [{ translateY: markTranslate }, { scale: markScale }],
            },
          ]}>
          <View style={styles.toLetters}>
            <Animated.Text style={[styles.toLetter, styles.toT, { transform: [{ translateX: tTranslate }] }]}>
              T
            </Animated.Text>
            <Animated.Text style={[styles.toLetter, styles.toO, { transform: [{ translateX: oTranslate }] }]}>
              O
            </Animated.Text>
          </View>
          <Text style={styles.markCaption}>Tocantins em movimento</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.flagBlock,
            {
              opacity: flagOpacity,
              transform: [{ translateY: flagTranslate }, { scale: flagScale }],
            },
          ]}>
          <TocantinsFlag />
          <Text style={styles.flagText}>CapaciTO</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function TocantinsFlag() {
  return (
    <View style={styles.flag}>
      <View style={styles.flagGold} />
      <View style={styles.flagBlue} />
      <View style={styles.flagWhite} />
      <View style={styles.flagSun} />
    </View>
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
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    transform: [{ translateY: -24 }],
  },
  wordmark: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordCapaci: {
    color: Brand.branco,
    fontFamily: FontFamily.tituloBold,
    fontSize: 46,
    lineHeight: 56,
  },
  wordTo: {
    color: TO_GOLD,
    fontFamily: FontFamily.tituloBold,
    fontSize: 46,
    lineHeight: 56,
  },
  toMark: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  toLetters: {
    width: 156,
    height: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 26,
    backgroundColor: Brand.branco,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  toLetter: {
    fontFamily: FontFamily.tituloBold,
    fontSize: 54,
    lineHeight: 62,
  },
  toT: {
    color: TO_BLUE,
  },
  toO: {
    color: TO_GOLD,
  },
  markCaption: {
    color: '#DCE9F7',
    fontFamily: FontFamily.corpoMedio,
    fontSize: 14,
    lineHeight: 20,
  },
  flagBlock: {
    position: 'absolute',
    top: 260,
    alignItems: 'center',
    gap: Spacing.two,
  },
  flag: {
    width: 154,
    height: 94,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: 18,
    backgroundColor: TO_GOLD,
  },
  flagGold: {
    position: 'absolute',
    width: 190,
    height: 126,
    right: -28,
    bottom: -34,
    backgroundColor: TO_GOLD,
    transform: [{ rotate: '-18deg' }],
  },
  flagBlue: {
    position: 'absolute',
    width: 190,
    height: 126,
    left: -52,
    top: -54,
    backgroundColor: TO_BLUE,
    transform: [{ rotate: '-18deg' }],
  },
  flagWhite: {
    position: 'absolute',
    width: 220,
    height: 42,
    left: -34,
    top: 26,
    backgroundColor: Brand.branco,
    transform: [{ rotate: '-18deg' }],
  },
  flagSun: {
    position: 'absolute',
    left: 66,
    top: 35,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: TO_GOLD,
  },
  flagText: {
    color: Brand.branco,
    fontFamily: FontFamily.tituloSemi,
    fontSize: 15,
    lineHeight: 22,
  },
});
