/**
 * Contrato de dados da API CapaciTO (/api/v1).
 *
 * Espelha o modelo de dados da spec (docs/requisitos-fieto.md §8) no que o
 * front precisa. Mantenha alinhado com os DTOs do backend (CapaciTO_API).
 *
 * NOTA DE PROPRIEDADE: este módulo (src/lib/api) é da trilha F2. F1 criou um
 * stub mínimo (mock-first) para não ficar bloqueado no M0. F2 assume e expande.
 */

export type Papel = 'TRABALHADOR' | 'INDUSTRIA' | 'ADMIN';

/** Usuário autenticado (sem senha_hash — nunca trafega para o app). */
export type Usuario = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  papel: Papel;
};

/** Resposta de /auth/login e /auth/registro. */
export type AuthResponse = {
  token: string;
  usuario: Usuario;
};

/** Corpo de POST /api/v1/auth/login. */
export type LoginRequest = {
  /** e-mail ou telefone (RF02). */
  identificador: string;
  senha: string;
};

/** Corpo de POST /api/v1/auth/registro. */
export type RegistroRequest = {
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
  papel: Papel;
  /** Obrigatório para TRABALHADOR; usado na validação de idade ≥18 (RN09). ISO yyyy-mm-dd. */
  dataNascimento?: string;
};

/** Erro padronizado vindo do backend (CLAUDE.md §5). */
export type ApiError = {
  status: number;
  /** código de regra de negócio, ex.: "RN09_IDADE_MINIMA". */
  code?: string;
  message: string;
};
