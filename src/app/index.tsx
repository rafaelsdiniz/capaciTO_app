import { Redirect, type Href } from 'expo-router';

import { useSession } from '@/lib/session/session-context';

/**
 * Gate de entrada: decide a primeira tela conforme a sessão e o papel (RF03).
 */
export default function Index() {
  const { usuario } = useSession();

  if (!usuario) {
    return <Redirect href={'/login' as Href} />;
  }
  if (usuario.papel === 'INDUSTRIA' || usuario.papel === 'ADMIN') {
    return <Redirect href={'/inicio' as Href} />;
  }
  return <Redirect href={'/carteira' as Href} />;
}
