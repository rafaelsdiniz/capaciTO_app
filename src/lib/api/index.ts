/**
 * Fronteira de API (ROADMAP §2): mesma interface, duas implementações.
 *
 * Cada método decide entre a chamada HTTP real (`real.ts`) e o mock (`mock.ts`).
 * Os métodos cujo endpoint o backend já expõe estão REAIS; os 8 que ainda
 * faltam no CapaciTO_API seguem no mock até serem entregues:
 *   - estacoes.listar / estacoes.criar  (sem GET /estacoes nem coerência com a lista)
 *   - estacoes.obter                     (mantém coerência com a lista mock da indústria)
 *   - perfil.atualizar                   (PUT /perfis/{id} não cobre nome/cidade/funções)
 *   - vagas.daEmpresa / vagas.publicar   (sem filtro por empresa nem GET /competencias)
 *   - vagas.minhasCandidaturas           (sem endpoint de listagem)
 *   - competencias.listar                (sem GET /competencias)
 *   - empresa.dashboard                  (sem endpoint)
 *   - trabalhadores.buscar               (sem endpoint)
 *
 * Fallback offline: se o backend estiver inacessível (erro de rede), o método
 * cai para o mock para a demo nunca travar (RNF02). Erros 4xx/5xx do servidor
 * são propagados normalmente.
 */
import {
  atualizarPerfilMock,
  buscarTrabalhadoresMock,
  candidatarMock,
  criarEstacaoMock,
  definirVisibilidadeMock,
  empresaDashboardMock,
  listarCompetenciasMock,
  listarConteudosMock,
  listarEstacoesMock,
  listarVagasCompativeisMock,
  listarVagasDaEmpresaMock,
  loginMock,
  minhasCandidaturasMock,
  obterConteudoMock,
  obterEstacaoMock,
  obterVagaMock,
  perfilMeMock,
  publicarVagaMock,
  registrarConclusaoMock,
  registroMock,
  resolverQrMock,
} from '@/lib/api/mock';
import {
  candidatarReal,
  definirVisibilidadeReal,
  listarConteudosReal,
  listarVagasCompativeisReal,
  loginReal,
  obterConteudoReal,
  obterVagaReal,
  perfilMeReal,
  registrarConclusaoReal,
  registroReal,
  resolverQrReal,
} from '@/lib/api/real';
import type {
  ApiError,
  AuthResponse,
  Candidatura,
  Competencia,
  Conteudo,
  EmpresaDashboard,
  Estacao,
  LoginRequest,
  OrigemConclusao,
  PerfilMe,
  RegistroRequest,
  ResultadoConclusao,
  TrabalhadorResumo,
  Vaga,
  VagaComMatch,
} from '@/lib/api/types';

export { API_BASE_URL } from '@/lib/api/http';

/** Liga/desliga a API real globalmente. `false` força 100% mock (offline/demo). */
export const BACKEND_ATIVO = true;

/**
 * Coerência de sessão: se o LOGIN caiu no mock (backend inacessível), todas as
 * chamadas seguintes também usam mock — senão o real lança 401 (sem perfil no
 * auth-store) e a tela quebra. Volta a `false` quando um login real funciona.
 */
let sessaoMock = false;

/**
 * Executa a implementação real e, em caso de servidor inacessível
 * (`status === 0`) — ou se a sessão atual é mock — cai para o mock.
 * Demais erros (validação, 401, 404…) sobem.
 */
async function comFallback<T>(real: () => Promise<T>, mock: () => Promise<T>): Promise<T> {
  if (!BACKEND_ATIVO || sessaoMock) return mock();
  try {
    return await real();
  } catch (e) {
    if ((e as ApiError)?.status === 0) return mock();
    throw e;
  }
}

/**
 * Fallback específico do login/registro: marca a sessão como mock quando o
 * backend está fora (status 0), para o resto do app seguir no mock.
 */
async function comFallbackAuth(
  real: () => Promise<AuthResponse>,
  mock: () => Promise<AuthResponse>,
): Promise<AuthResponse> {
  if (!BACKEND_ATIVO) {
    sessaoMock = true;
    return mock();
  }
  try {
    const res = await real();
    sessaoMock = false;
    return res;
  } catch (e) {
    if ((e as ApiError)?.status === 0) {
      sessaoMock = true;
      return mock();
    }
    throw e;
  }
}

export const api = {
  auth: {
    login(req: LoginRequest): Promise<AuthResponse> {
      return comFallbackAuth(() => loginReal(req), () => loginMock(req));
    },
    registro(req: RegistroRequest): Promise<AuthResponse> {
      return comFallbackAuth(() => registroReal(req), () => registroMock(req));
    },
  },
  perfil: {
    me(): Promise<PerfilMe> {
      return comFallback(perfilMeReal, perfilMeMock);
    },
    // MOCK: backend (CreatePerfilDTO) não cobre nome/cidade/funcoesInteresse.
    atualizar(dados: { nome?: string; cidade?: string; funcoesInteresse?: string[] }): Promise<PerfilMe> {
      return atualizarPerfilMock(dados);
    },
    visibilidade(visivel: boolean): Promise<{ visivel: boolean }> {
      return comFallback(() => definirVisibilidadeReal(visivel), () => definirVisibilidadeMock(visivel));
    },
  },
  conteudos: {
    listar(busca?: string): Promise<Conteudo[]> {
      return comFallback(() => listarConteudosReal(busca), () => listarConteudosMock(busca));
    },
    obter(id: string): Promise<Conteudo> {
      return comFallback(() => obterConteudoReal(id), () => obterConteudoMock(id));
    },
  },
  conclusoes: {
    /** Registra conclusão e emite certificação se aplicável (RF13/RF18/RF20). */
    registrar(conteudoId: string, origem: OrigemConclusao): Promise<ResultadoConclusao> {
      return comFallback(
        () => registrarConclusaoReal(conteudoId, origem),
        () => registrarConclusaoMock(conteudoId, origem),
      );
    },
  },
  estacoes: {
    // MOCK: backend não tem GET /estacoes (lista).
    listar(): Promise<Estacao[]> {
      return listarEstacoesMock();
    },
    // MOCK: mantém coerência com a lista mock da indústria (ids locais).
    obter(id: string): Promise<Estacao> {
      return obterEstacaoMock(id);
    },
    /** Resolve o QR escaneado (RF17; RN04) — REAL (fatia ao vivo). */
    resolverQr(codigo: string): Promise<Estacao> {
      return comFallback(() => resolverQrReal(codigo), () => resolverQrMock(codigo));
    },
    // MOCK: criação coerente com a lista mock; POST /estacoes exige empresaId real.
    criar(nome: string, conteudoId: string): Promise<Estacao> {
      return criarEstacaoMock(nome, conteudoId);
    },
  },
  vagas: {
    compativeis(): Promise<VagaComMatch[]> {
      return comFallback(listarVagasCompativeisReal, listarVagasCompativeisMock);
    },
    obter(id: string): Promise<VagaComMatch> {
      return comFallback(() => obterVagaReal(id), () => obterVagaMock(id));
    },
    candidatar(vagaId: string): Promise<Candidatura> {
      return comFallback(() => candidatarReal(vagaId), () => candidatarMock(vagaId));
    },
    // MOCK: sem endpoint de listagem das candidaturas do trabalhador.
    minhasCandidaturas(): Promise<Candidatura[]> {
      return minhasCandidaturasMock();
    },
    // MOCK: GET /vagas não filtra por empresa; mantém CRUD coerente com publicar.
    daEmpresa(): Promise<Vaga[]> {
      return listarVagasDaEmpresaMock();
    },
    // MOCK: POST /vagas exige competenciaId (Long) e não há GET /competencias.
    publicar(dados: {
      funcao: string;
      municipio: string;
      descricao?: string;
      obrigatoriasIds: string[];
      desejaveisIds: string[];
    }): Promise<Vaga> {
      return publicarVagaMock(dados);
    },
  },
  competencias: {
    // MOCK: backend não expõe GET /competencias.
    listar(): Promise<Competencia[]> {
      return listarCompetenciasMock();
    },
  },
  empresa: {
    // MOCK: backend não expõe dashboard da empresa.
    dashboard(): Promise<EmpresaDashboard> {
      return empresaDashboardMock();
    },
  },
  trabalhadores: {
    // MOCK: backend não expõe busca de trabalhadores por competência.
    buscar(competencia?: string): Promise<TrabalhadorResumo[]> {
      return buscarTrabalhadoresMock(competencia);
    },
  },
};

export type {
  AuthResponse,
  Candidatura,
  Competencia,
  Conteudo,
  Empresa,
  EmpresaDashboard,
  Estacao,
  LoginRequest,
  PerfilMe,
  RegistroRequest,
  TrabalhadorResumo,
  Vaga,
  VagaComMatch,
} from '@/lib/api/types';
