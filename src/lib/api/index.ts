/**
 * Fronteira de API (ROADMAP §2): mesma interface, duas implementações.
 *
 * Hoje tudo aponta para `mock`. Conforme o backend (CapaciTO_API) entrega cada
 * endpoint, troca-se a função correspondente para a chamada HTTP real a
 * `${API_BASE_URL}/...`. Mantenha a assinatura idêntica para não quebrar a UI.
 *
 * NOTA DE PROPRIEDADE: módulo da trilha F2 (stub criado por F1 no M0).
 */
import { loginMock, registroMock } from '@/lib/api/mock';
import type { AuthResponse, LoginRequest, RegistroRequest } from '@/lib/api/types';

/**
 * Base da API real. No device físico NÃO use localhost — use o IP da máquina
 * onde roda o backend (ROADMAP §6, riscos). Ex.: http://192.168.0.10:8080/api/v1
 */
export const API_BASE_URL = 'http://localhost:8080/api/v1';

/** Liga/desliga o uso do mock por recurso. F2 vira para false quando o real existir. */
export const USE_MOCK = {
  auth: true,
} as const;

export const api = {
  auth: {
    login(req: LoginRequest): Promise<AuthResponse> {
      // if (!USE_MOCK.auth) return httpPost('/auth/login', req);
      return loginMock(req);
    },
    registro(req: RegistroRequest): Promise<AuthResponse> {
      // if (!USE_MOCK.auth) return httpPost('/auth/registro', req);
      return registroMock(req);
    },
  },
};

export type { AuthResponse, LoginRequest, RegistroRequest } from '@/lib/api/types';
