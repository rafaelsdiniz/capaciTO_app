/**
 * Estado de autenticação compartilhado com a camada de API real.
 *
 * O backend (TokenResponseDTO) devolve `usuarioId` e `perfilId` no login, e os
 * endpoints reais precisam desses ids (ex.: GET /perfis/{id}, trabalhadorId em
 * POST /conclusoes e /candidaturas). Como os métodos do `api` não recebem id
 * (mesma assinatura do mock), guardamos aqui o contexto da sessão.
 *
 * É preenchido por `loginReal`/`registroReal` e limpo no logout (session-context).
 */
import type { ApiError, Papel } from '@/lib/api/types';

export type AuthState = {
  token: string;
  usuarioId: number;
  /** Id do PerfilTrabalhador (trabalhador) ou da Empresa (indústria). Pode faltar. */
  perfilId: number | null;
  papel: Papel;
  nome: string;
  email: string;
};

let estado: AuthState | null = null;

export function setAuth(novo: AuthState): void {
  estado = novo;
}

export function clearAuth(): void {
  estado = null;
}

export function getAuth(): AuthState | null {
  return estado;
}

export function getToken(): string | null {
  return estado?.token ?? null;
}

/** Id de perfil exigido pelos endpoints de trabalhador/perfil; lança se ausente. */
export function requirePerfilId(): number {
  if (estado?.perfilId == null) {
    throw {
      status: 401,
      code: 'SEM_PERFIL',
      message: 'Sessão sem perfil associado. Entre novamente.',
    } satisfies ApiError;
  }
  return estado.perfilId;
}
