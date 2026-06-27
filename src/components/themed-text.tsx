import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontFamily, Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code' | 'tag';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        type === 'tag' && styles.tag,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // Corpo / mensagens → Inter (legibilidade em telas)
  small: {
    fontFamily: FontFamily.corpo,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: FontFamily.corpoMedio,
    fontSize: 14,
    lineHeight: 20,
  },
  default: {
    fontFamily: FontFamily.corpo,
    fontSize: 16,
    lineHeight: 24,
  },
  // Títulos / chamadas → Montserrat (autoridade)
  title: {
    fontFamily: FontFamily.tituloBold,
    fontSize: 40,
    lineHeight: 46,
  },
  subtitle: {
    fontFamily: FontFamily.tituloSemi,
    fontSize: 28,
    lineHeight: 36,
  },
  link: {
    fontFamily: FontFamily.corpoMedio,
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    fontFamily: FontFamily.corpoMedio,
    lineHeight: 30,
    fontSize: 14,
    color: '#0A3659',
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
  // Tags / dados técnicos / crachás → Barlow (aspecto técnico-industrial)
  tag: {
    fontFamily: FontFamily.tag,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
});
