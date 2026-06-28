import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';

import { SessionProvider } from '@/lib/session/session-context';

// Shell raiz do app. Tema claro fixo (identidade light-first).
// Tipografia: Outfit (sans geométrica, leitura clara em telas — identidade da marca).
export default function RootLayout() {
  const [fontesProntas] = useFonts({
    Outfit_400Regular: require('../../assets/fonts/Outfit-Regular.ttf'),
    Outfit_500Medium: require('../../assets/fonts/Outfit-Medium.ttf'),
    Outfit_600SemiBold: require('../../assets/fonts/Outfit-SemiBold.ttf'),
    Outfit_700Bold: require('../../assets/fonts/Outfit-Bold.ttf'),
    Outfit_800ExtraBold: require('../../assets/fonts/Outfit-ExtraBold.ttf'),
  });

  if (!fontesProntas) {
    // Mantém o splash até as fontes da marca carregarem (evita "flash" de fonte).
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <SessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SessionProvider>
    </ThemeProvider>
  );
}
