/**
 * Cliente HTTP da API real (CapaciTO_API, /api/v1).
 *
 * Encapsula fetch + base URL + header Authorization (Bearer) + normalização de
 * erro para o formato `ApiError` que a UI já trata. Não conhece domínio: os
 * mapeadores DTO↔tipos do front vivem em `real.ts`.
 */
import { getToken } from '@/lib/api/auth-store';
import type { ApiError } from '@/lib/api/types';

/**
 * Base da API real. No device físico NÃO use localhost — troque pelo IP da
 * máquina onde roda o backend (ROADMAP §6). Ex.: http://192.168.0.10:8080/api/v1
 */
export const API_BASE_URL = 'http://localhost:8080/api/v1';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Corpo serializado como JSON. Omitido em GET. */
  body?: unknown;
  /** Anexa o Bearer token da sessão (padrão true). */
  auth?: boolean;
};

/** `status: 0` sinaliza servidor inacessível (rede) — usado para fallback offline. */
const REDE_INDISPONIVEL: ApiError = {
  status: 0,
  code: 'REDE_INDISPONIVEL',
  message: 'Não foi possível conectar ao servidor.',
};

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = opts;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw REDE_INDISPONIVEL;
  }

  const texto = await res.text();
  const data = texto ? parseJson(texto) : null;

  if (!res.ok) {
    const corpo = (data ?? {}) as Partial<ApiError> & { error?: string };
    throw {
      status: res.status,
      code: corpo.code,
      message: corpo.message ?? corpo.error ?? `Erro ${res.status}`,
    } satisfies ApiError;
  }

  return data as T;
}

function parseJson(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}
