import { Barlow_500Medium } from '@expo-google-fonts/barlow';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SessionProvider } from '@/lib/session/session-context';

// Shell raiz do app. Tema claro fixo (identidade light-first).
export default function RootLayout() {
  const [fontesProntas] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Barlow_500Medium,
  });

  if (!fontesProntas) {
    // Mantém o splash até as fontes da marca carregarem (evita "flash" de fonte).
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <SessionProvider>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }} />
      </SessionProvider>
    </ThemeProvider>
  );
}
