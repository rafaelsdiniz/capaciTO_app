import { Stack } from 'expo-router';

// Grupo de rotas de autenticação (login/registro). Sem header.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
