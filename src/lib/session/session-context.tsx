/**
 * Sessão de autenticação do app.
 *
 * Guarda o usuário logado + token JWT e expõe login/registro/logout.
 * STUB do M0: estado em memória (some ao recarregar). F2 endurece persistindo
 * o token (expo-secure-store) e injetando o header Authorization no cliente HTTP.
 *
 * NOTA DE PROPRIEDADE: módulo da trilha F2 (stub criado por F1 no M0).
 */
import { createContext, use, useMemo, useState, type ReactNode } from 'react';

import { api } from '@/lib/api';
import type { LoginRequest, RegistroRequest, Usuario } from '@/lib/api/types';

type SessionState = {
  usuario: Usuario | null;
  token: string | null;
  carregando: boolean;
  entrar: (req: LoginRequest) => Promise<Usuario>;
  registrar: (req: RegistroRequest) => Promise<Usuario>;
  sair: () => void;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const value = useMemo<SessionState>(
    () => ({
      usuario,
      token,
      carregando,
      async entrar(req) {
        setCarregando(true);
        try {
          const res = await api.auth.login(req);
          setUsuario(res.usuario);
          setToken(res.token);
          return res.usuario;
        } finally {
          setCarregando(false);
        }
      },
      async registrar(req) {
        setCarregando(true);
        try {
          const res = await api.auth.registro(req);
          setUsuario(res.usuario);
          setToken(res.token);
          return res.usuario;
        } finally {
          setCarregando(false);
        }
      },
      sair() {
        setUsuario(null);
        setToken(null);
      },
    }),
    [usuario, token, carregando],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionState {
  const ctx = use(SessionContext);
  if (!ctx) {
    throw new Error('useSession deve ser usado dentro de <SessionProvider>.');
  }
  return ctx;
}
