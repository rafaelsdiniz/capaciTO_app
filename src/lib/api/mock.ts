/**
 * Implementação MOCK da API (mock-first — ROADMAP §2).
 *
 * Dados fake em memória para o front rodar sem o backend. Quando o endpoint
 * real existir, troca-se para a implementação `real` em src/lib/api/index.ts.
 *
 * NOTA DE PROPRIEDADE: módulo da trilha F2 (stub criado por F1 no M0).
 */
import type {
  AuthResponse,
  LoginRequest,
  RegistroRequest,
  Usuario,
} from '@/lib/api/types';

/** Simula latência de rede para a UI exercitar estados de loading. */
function delay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** "Banco" em memória — alguns usuários de demo + os que registrarem na sessão. */
const usuariosMock: (Usuario & { senha: string })[] = [
  {
    id: 'u-trab-1',
    nome: 'Maria da Pesca',
    email: 'maria@trab.com',
    telefone: '63999990001',
    papel: 'TRABALHADOR',
    senha: '123456',
  },
  {
    id: 'u-ind-1',
    nome: 'Frigorífico Pescado TO',
    email: 'rh@pescado.com',
    papel: 'INDUSTRIA',
    senha: '123456',
  },
];

function gerarToken(usuario: Usuario): string {
  // Token fake só para a sessão local. O backend emite JWT real (RF02).
  return `mock.${usuario.id}.${Date.now()}`;
}

export async function loginMock(req: LoginRequest): Promise<AuthResponse> {
  const encontrado = usuariosMock.find(
    (u) =>
      (u.email === req.identificador || u.telefone === req.identificador) &&
      u.senha === req.senha,
  );
  if (!encontrado) {
    throw { status: 401, code: 'AUTH_INVALIDA', message: 'E-mail/telefone ou senha inválidos.' };
  }
  const { senha: _omit, ...usuario } = encontrado;
  return delay({ token: gerarToken(usuario), usuario });
}

export async function registroMock(req: RegistroRequest): Promise<AuthResponse> {
  if (usuariosMock.some((u) => u.email === req.email)) {
    throw { status: 409, code: 'EMAIL_DUPLICADO', message: 'Já existe uma conta com este e-mail.' };
  }
  // RN09 também é validada na UI; reforço aqui para o mock refletir o backend.
  if (req.papel === 'TRABALHADOR' && !maiorDeIdade(req.dataNascimento)) {
    throw {
      status: 422,
      code: 'RN09_IDADE_MINIMA',
      message: 'O cadastro de trabalhador exige idade mínima de 18 anos.',
    };
  }
  const novo: Usuario & { senha: string } = {
    id: `u-${Date.now()}`,
    nome: req.nome,
    email: req.email,
    telefone: req.telefone,
    papel: req.papel,
    senha: req.senha,
  };
  usuariosMock.push(novo);
  const { senha: _omit, ...usuario } = novo;
  return delay({ token: gerarToken(usuario), usuario });
}

/** Util compartilhado: idade ≥ 18 a partir de ISO yyyy-mm-dd (RN09). */
export function maiorDeIdade(dataNascimentoIso?: string): boolean {
  if (!dataNascimentoIso) return false;
  const nasc = new Date(dataNascimentoIso);
  if (Number.isNaN(nasc.getTime())) return false;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade >= 18;
}
