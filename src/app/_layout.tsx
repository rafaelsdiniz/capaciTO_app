import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SessionProvider } from '@/lib/session/session-context';

// Shell raiz do app. Tema claro fixo (identidade light-first).
// Tipografia: Nunito (família redonda, próxima de Nimbus Sans Round).
export default function RootLayout() {
  const [fontesProntas] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
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
