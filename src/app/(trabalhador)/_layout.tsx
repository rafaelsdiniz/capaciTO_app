import { Stack } from 'expo-router';

// Área do Trabalhador. PROPRIEDADE do shell: F2 (vira tabs no M1).
// F1 mantém aqui um Stack mínimo para a Carteira e a fatia ao vivo.
export default function TrabalhadorLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
