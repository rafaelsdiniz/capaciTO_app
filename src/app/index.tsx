import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';

import { AppEntryAnimation } from '@/components/app-entry-animation';
import { useSession } from '@/lib/session/session-context';

/**
 * Tela de entrada do app: toca a animacao primeiro e so depois decide o destino
 * conforme a sessao e o papel (RF03).
 */
export default function Index() {
  const router = useRouter();
  const { usuario } = useSession();

  const aoTerminarAnimacao = useCallback(() => {
    if (!usuario) {
      router.replace('/login' as Href);
      return;
    }
    if (usuario.papel === 'INDUSTRIA' || usuario.papel === 'ADMIN') {
      router.replace('/inicio' as Href);
      return;
    }
    router.replace('/carteira' as Href);
  }, [router, usuario]);

  return <AppEntryAnimation onFinish={aoTerminarAnimacao} />;
}
