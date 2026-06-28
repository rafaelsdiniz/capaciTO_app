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
    // Entrada livre: sem login, o visitante cai direto na vitrine de vagas e
    // navega à vontade. O login só é exigido na hora de se candidatar (RF24).
    // Rotas qualificadas pelo grupo: "vagas" existe nos dois (trabalhador e
    // indústria); sem o grupo o expo-router resolveria para o lado errado.
    if (usuario?.papel === 'INDUSTRIA' || usuario?.papel === 'ADMIN') {
      router.replace('/(industria)/inicio' as Href);
      return;
    }
    router.replace('/(trabalhador)/vagas' as Href);
  }, [router, usuario]);

  return <AppEntryAnimation onFinish={aoTerminarAnimacao} />;
}
