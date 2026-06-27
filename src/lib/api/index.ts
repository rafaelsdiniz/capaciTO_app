/**
 * Fronteira de API (ROADMAP §2): mesma interface, duas implementações.
 *
 * Hoje tudo aponta para `mock`. Conforme o backend (CapaciTO_API) entrega cada
 * endpoint, troca-se a função correspondente para a chamada HTTP real a
 * `${API_BASE_URL}/...`. Mantenha a assinatura idêntica para não quebrar a UI.
 */
import {
  buscarTrabalhadoresMock,
  candidatarMock,
  criarEstacaoMock,
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
import type {
  AuthResponse,
  Candidatura,
  Competencia,
  Conteudo,
  Empresa,
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

/**
 * Base da API real. No device físico NÃO use localhost — use o IP da máquina
 * onde roda o backend (ROADMAP §6). Ex.: http://192.168.0.10:8080/api/v1
 */
export const API_BASE_URL = 'http://localhost:8080/api/v1';

/** Liga/desliga o uso do mock por recurso. Vire para false quando o real existir. */
export const USE_MOCK = {
  auth: true,
  perfil: true,
  conteudos: true,
  conclusoes: true,
  estacoes: true,
  vagas: true,
  empresa: true,
  trabalhadores: true,
} as const;

export const api = {
  auth: {
    login(req: LoginRequest): Promise<AuthResponse> {
      return loginMock(req);
    },
    registro(req: RegistroRequest): Promise<AuthResponse> {
      return registroMock(req);
    },
  },
  perfil: {
    me(): Promise<PerfilMe> {
      return perfilMeMock();
    },
  },
  conteudos: {
    listar(busca?: string): Promise<Conteudo[]> {
      return listarConteudosMock(busca);
    },
    obter(id: string): Promise<Conteudo> {
      return obterConteudoMock(id);
    },
  },
  conclusoes: {
    /** Registra conclusão e emite certificação se aplicável (RF13/RF18/RF20). */
    registrar(conteudoId: string, origem: OrigemConclusao): Promise<ResultadoConclusao> {
      return registrarConclusaoMock(conteudoId, origem);
    },
  },
  estacoes: {
    listar(): Promise<Estacao[]> {
      return listarEstacoesMock();
    },
    obter(id: string): Promise<Estacao> {
      return obterEstacaoMock(id);
    },
    /** Resolve o QR escaneado (RF17; RN04). */
    resolverQr(codigo: string): Promise<Estacao> {
      return resolverQrMock(codigo);
    },
    criar(nome: string, conteudoId: string): Promise<Estacao> {
      return criarEstacaoMock(nome, conteudoId);
    },
  },
  vagas: {
    compativeis(): Promise<VagaComMatch[]> {
      return listarVagasCompativeisMock();
    },
    obter(id: string): Promise<VagaComMatch> {
      return obterVagaMock(id);
    },
    candidatar(vagaId: string): Promise<Candidatura> {
      return candidatarMock(vagaId);
    },
    minhasCandidaturas(): Promise<Candidatura[]> {
      return minhasCandidaturasMock();
    },
    daEmpresa(): Promise<Vaga[]> {
      return listarVagasDaEmpresaMock();
    },
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
    listar(): Promise<Competencia[]> {
      return listarCompetenciasMock();
    },
  },
  empresa: {
    dashboard(): Promise<EmpresaDashboard> {
      return empresaDashboardMock();
    },
  },
  trabalhadores: {
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
