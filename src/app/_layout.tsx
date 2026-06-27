import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SessionProvider } from '@/lib/session/session-context';

// Shell raiz do app. PROPRIEDADE: trilha F2 (navegação por papel).
// F1 montou a versão mínima no M0 para destravar as telas de auth + carteira.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }} />
      </SessionProvider>
    </ThemeProvider>
  );
}
