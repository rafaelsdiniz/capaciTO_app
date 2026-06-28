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
  Candidatura,
  Competencia,
  Conteudo,
  Certificacao,
  Empresa,
  EmpresaDashboard,
  Estacao,
  LoginRequest,
  OrigemConclusao,
  PerfilMe,
  RegistroRequest,
  ResultadoConclusao,
  TrabalhadorResumo,
  Usuario,
  Vaga,
  VagaComMatch,
} from '@/lib/api/types';

/** Simula latência de rede para a UI exercitar estados de loading. */
function delay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** "Banco" em memória — alguns usuários de demo + os que registrarem na sessão. */
const usuariosMock: (Usuario & { senha: string })[] = [
  {
    id: 'u-trab-1',
    nome: 'Maria Souza',
    email: 'maria@email.com',
    telefone: '63999990001',
    papel: 'TRABALHADOR',
    senha: '123456',
  },
  {
    id: 'u-ind-1',
    nome: 'Frigopeixe Tocantins',
    email: 'rh@frigopeixe.com',
    papel: 'INDUSTRIA',
    senha: '123456',
  },
  {
    id: 'u-ind-2',
    nome: 'Laticínios Araguaia',
    email: 'rh@laticinios.com',
    papel: 'INDUSTRIA',
    senha: '123456',
  },
  {
    id: 'u-ind-3',
    nome: 'Panificadora Cerrado',
    email: 'rh@panificadora.com',
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

// --- Catálogo de competências e conteúdos (🐟 pescado) ---

const COMPETENCIAS = {
  higiene: { id: 'c-higiene', nome: 'Higiene e manipulação de alimentos', descricao: 'Boas práticas de higiene pessoal e do alimento.' },
  camaraFria: { id: 'c-camara-fria', nome: 'Segurança em câmara fria', descricao: 'Procedimentos seguros em ambiente refrigerado.' },
  recepcaoPescado: { id: 'c-recepcao-pescado', nome: 'Recepção de pescado', descricao: 'Controle de temperatura e qualidade na chegada do pescado.' },
  bpf: { id: 'c-bpf', nome: 'Boas Práticas de Fabricação (BPF)', descricao: 'Uso de EPI e padrões de produção.' },
} satisfies Record<string, Competencia>;

const conteudosMock: Conteudo[] = [
  { id: 'cont-1', titulo: 'Higienização correta das mãos', tipo: 'MICROVIDEO', competencia: COMPETENCIAS.higiene, duracao: 90, tema: 'higiene' },
  { id: 'cont-2', titulo: 'Como agir na câmara fria', tipo: 'MICROVIDEO', competencia: COMPETENCIAS.camaraFria, duracao: 120, tema: 'segurança' },
  { id: 'cont-3', titulo: 'Recepção de pescado: boas práticas', tipo: 'MICROVIDEO', competencia: COMPETENCIAS.recepcaoPescado, duracao: 110, tema: 'manipulação' },
  { id: 'cont-4', titulo: 'Uso de EPI no frigorífico', tipo: 'MICROVIDEO', competencia: COMPETENCIAS.bpf, duracao: 80, tema: 'boas práticas' },
];

/**
 * "Perfil" em memória do trabalhador demo. Começa com 1 certificação para a
 * carteira não ficar vazia; a fatia ao vivo (M2) anexa novas aqui.
 */
const certificacoesMock: Certificacao[] = [
  {
    id: 'cert-1',
    competencia: COMPETENCIAS.higiene,
    dataEmissao: '2026-05-10',
    status: 'ATIVA',
  },
];

export async function listarConteudosMock(busca?: string): Promise<Conteudo[]> {
  const termo = busca?.trim().toLowerCase();
  const lista = !termo
    ? conteudosMock
    : conteudosMock.filter(
        (c) =>
          c.titulo.toLowerCase().includes(termo) ||
          c.tema.toLowerCase().includes(termo) ||
          c.competencia.nome.toLowerCase().includes(termo),
      );
  return delay(lista, 300);
}

export async function obterConteudoMock(id: string): Promise<Conteudo> {
  const c = conteudosMock.find((x) => x.id === id);
  if (!c) throw { status: 404, message: 'Conteúdo não encontrado.' };
  return delay(c, 200);
}

/** Estado mutável do perfil do trabalhador demo (editável em perfil-editar). */
const perfilState = {
  cidade: 'Palmas',
  funcoesInteresse: ['Manipulador de pescado'] as string[],
  visivel: true,
};

export async function perfilMeMock(): Promise<PerfilMe> {
  const usuario = usuariosMock.find((u) => u.papel === 'TRABALHADOR')!;
  const { senha: _omit, ...usuarioPublico } = usuario;
  const perfil: PerfilMe = {
    usuario: usuarioPublico,
    cidade: perfilState.cidade,
    funcoesInteresse: perfilState.funcoesInteresse,
    visivel: perfilState.visivel,
    completude: calcularCompletude(certificacoesMock.length),
    certificacoes: [...certificacoesMock],
  };
  return delay(perfil, 300);
}

/** Atualiza dados do perfil (RF05). */
export async function atualizarPerfilMock(dados: {
  nome?: string;
  cidade?: string;
  funcoesInteresse?: string[];
}): Promise<PerfilMe> {
  const usuario = usuariosMock.find((u) => u.papel === 'TRABALHADOR')!;
  if (dados.nome?.trim()) usuario.nome = dados.nome.trim();
  if (dados.cidade !== undefined) perfilState.cidade = dados.cidade.trim();
  if (dados.funcoesInteresse) perfilState.funcoesInteresse = dados.funcoesInteresse.filter(Boolean);
  return perfilMeMock();
}

/** Liga/desliga a visibilidade do perfil para as indústrias (RF08; RN06). */
export async function definirVisibilidadeMock(visivel: boolean): Promise<{ visivel: boolean }> {
  perfilState.visivel = visivel;
  return delay({ visivel }, 150);
}

/** Completude simples (RF07): base de perfil + peso por certificação ativa, teto 100. */
function calcularCompletude(qtdCertificacoes: number): number {
  return Math.min(100, 40 + qtdCertificacoes * 20);
}

// --- Conclusão → Certificação automática (RF13/RF18/RF20/RF21; RN01, RN02, RN10) ---

/**
 * Registra conclusão de um conteúdo e, se ainda não certificado, emite a
 * certificação da competência ligada (aparece na carteira). É o motor da
 * fatia ao vivo rodando 100% no mock, sem backend.
 */
export async function registrarConclusaoMock(
  conteudoId: string,
  _origem: OrigemConclusao,
): Promise<ResultadoConclusao> {
  const conteudo = conteudosMock.find((c) => c.id === conteudoId);
  if (!conteudo) throw { status: 404, message: 'Conteúdo não encontrado.' };

  const jaCertificada = certificacoesMock.some(
    (c) => c.competencia.id === conteudo.competencia.id && c.status === 'ATIVA',
  );
  if (jaCertificada) {
    return delay({ jaCertificada: true });
  }

  const nova: Certificacao = {
    id: `cert-${Date.now()}`,
    competencia: conteudo.competencia,
    dataEmissao: new Date().toISOString().slice(0, 10),
    status: 'ATIVA',
  };
  certificacoesMock.push(nova);
  return delay({ jaCertificada: false, certificacao: nova });
}

// --- Estações / QR (RF15–RF18; RN04) ---

const estacoesMock: Estacao[] = [
  { id: 'est-1', nome: 'Câmara fria — Setor A', empresaNome: 'Frigorífico Pescado TO', conteudo: conteudosMock[1], codigoQr: 'CAPACITO:EST:est-1' },
  { id: 'est-2', nome: 'Recepção de pescado', empresaNome: 'Frigorífico Pescado TO', conteudo: conteudosMock[2], codigoQr: 'CAPACITO:EST:est-2' },
  { id: 'est-3', nome: 'Lavatório / Higienização', empresaNome: 'Frigorífico Pescado TO', conteudo: conteudosMock[0], codigoQr: 'CAPACITO:EST:est-3' },
];

export async function listarEstacoesMock(): Promise<Estacao[]> {
  return delay([...estacoesMock], 300);
}

export async function obterEstacaoMock(id: string): Promise<Estacao> {
  const e = estacoesMock.find((x) => x.id === id);
  if (!e) throw { status: 404, message: 'Estação não encontrada.' };
  return delay(e, 200);
}

/** Resolve o QR escaneado para a estação + conteúdo vigente (RF17; RN04). */
export async function resolverQrMock(codigo: string): Promise<Estacao> {
  const e = estacoesMock.find((x) => x.codigoQr === codigo.trim());
  if (!e) throw { status: 404, code: 'QR_INVALIDO', message: 'QR não reconhecido. Tente outra estação.' };
  return delay(e, 250);
}

export async function criarEstacaoMock(nome: string, conteudoId: string): Promise<Estacao> {
  const conteudo = conteudosMock.find((c) => c.id === conteudoId) ?? conteudosMock[0];
  const id = `est-${Date.now()}`;
  const nova: Estacao = { id, nome, empresaNome: 'Frigorífico Pescado TO', conteudo, codigoQr: `CAPACITO:EST:${id}` };
  estacoesMock.push(nova);
  return delay(nova, 300);
}

// --- Empresa / dashboard ---

const empresaMock: Empresa = { id: 'emp-1', nome: 'Frigorífico Pescado TO', segmento: 'PESCADO', municipio: 'Palmas' };

export async function empresaDashboardMock(): Promise<EmpresaDashboard> {
  return delay(
    { empresa: empresaMock, totalEstacoes: estacoesMock.length, totalVagas: vagasMock.length, totalCandidatos: candidatosMock.length },
    300,
  );
}

// --- Vagas / match (RF24–RF27; RN05, RN03) ---

const vagasMock: Vaga[] = [
  {
    id: 'vaga-1',
    funcao: 'Auxiliar de câmara fria',
    municipio: 'Palmas',
    empresaNome: 'Frigorífico Pescado TO',
    segmento: 'PESCADO',
    descricao: 'Atuação em ambiente refrigerado, manuseio e estocagem de pescado.',
    competenciasObrigatorias: [COMPETENCIAS.camaraFria, COMPETENCIAS.higiene],
    competenciasDesejaveis: [COMPETENCIAS.bpf],
    status: 'ABERTA',
  },
  {
    id: 'vaga-2',
    funcao: 'Manipulador de pescado',
    municipio: 'Porto Nacional',
    empresaNome: 'Frigorífico Pescado TO',
    segmento: 'PESCADO',
    descricao: 'Recepção, limpeza e preparo de pescado seguindo boas práticas.',
    competenciasObrigatorias: [COMPETENCIAS.recepcaoPescado, COMPETENCIAS.higiene],
    competenciasDesejaveis: [COMPETENCIAS.camaraFria],
    status: 'ABERTA',
  },
  {
    id: 'vaga-3',
    funcao: 'Auxiliar de produção',
    municipio: 'Palmas',
    empresaNome: 'Laticínio Vale do Tocantins',
    segmento: 'LATICINIO',
    descricao: 'Apoio à linha de produção com foco em higiene e BPF.',
    competenciasObrigatorias: [COMPETENCIAS.higiene],
    competenciasDesejaveis: [COMPETENCIAS.bpf],
    status: 'ABERTA',
  },
  {
    id: 'vaga-4',
    funcao: 'Operador de filetagem',
    municipio: 'Palmas',
    empresaNome: 'Frigorífico Pescado TO',
    segmento: 'PESCADO',
    descricao: 'Processo de filetagem e cortes do pescado. (Processo seletivo encerrado.)',
    competenciasObrigatorias: [COMPETENCIAS.recepcaoPescado],
    competenciasDesejaveis: [],
    status: 'FECHADA',
  },
  {
    id: 'vaga-5',
    funcao: 'Auxiliar de limpeza industrial',
    municipio: 'Gurupi',
    empresaNome: 'Panificadora Cerrado',
    segmento: 'PANIFICACAO',
    descricao: 'Higienização de equipamentos e áreas de produção da padaria industrial.',
    competenciasObrigatorias: [COMPETENCIAS.higiene],
    competenciasDesejaveis: [COMPETENCIAS.bpf],
    status: 'ABERTA',
  },
  {
    id: 'vaga-6',
    funcao: 'Embalador(a) de polpas',
    municipio: 'Paraíso do Tocantins',
    empresaNome: 'Polpas do Vale',
    segmento: 'POLPA',
    descricao: 'Envase e embalagem de polpas de frutas regionais com controle de qualidade.',
    competenciasObrigatorias: [COMPETENCIAS.higiene],
    competenciasDesejaveis: [COMPETENCIAS.bpf, COMPETENCIAS.camaraFria],
    status: 'ABERTA',
  },
  {
    id: 'vaga-7',
    funcao: 'Técnico(a) de controle de qualidade',
    municipio: 'Araguaína',
    empresaNome: 'Laticínio Vale do Tocantins',
    segmento: 'LATICINIO',
    descricao: 'Monitoramento de BPF e padrões sanitários na linha de laticínios.',
    competenciasObrigatorias: [COMPETENCIAS.higiene, COMPETENCIAS.bpf],
    competenciasDesejaveis: [],
    status: 'ABERTA',
  },
  {
    id: 'vaga-8',
    funcao: 'Estoquista de congelados',
    municipio: 'Palmas',
    empresaNome: 'Frigorífico Pescado TO',
    segmento: 'PESCADO',
    descricao: 'Organização e controle de estoque em câmaras de congelamento.',
    competenciasObrigatorias: [COMPETENCIAS.camaraFria],
    competenciasDesejaveis: [COMPETENCIAS.higiene],
    status: 'ABERTA',
  },
  {
    id: 'vaga-9',
    funcao: 'Auxiliar de recepção de pescado',
    municipio: 'Porto Nacional',
    empresaNome: 'Pescados Araguaia',
    segmento: 'PESCADO',
    descricao: 'Recebimento, pesagem e triagem do pescado com controle de temperatura.',
    competenciasObrigatorias: [COMPETENCIAS.recepcaoPescado, COMPETENCIAS.higiene, COMPETENCIAS.camaraFria],
    competenciasDesejaveis: [COMPETENCIAS.bpf],
    status: 'ABERTA',
  },
];

// Candidaturas do trabalhador demo — uma em andamento e uma encerrada.
const candidaturasMock: Candidatura[] = [
  { id: 'cand-seed-1', vaga: vagasMock[0], data: '2026-06-20', status: 'EM_ANALISE' },
  { id: 'cand-seed-2', vaga: vagasMock[3], data: '2026-05-02', status: 'ENVIADA' },
];

function competenciasAtivasIds(): Set<string> {
  return new Set(certificacoesMock.filter((c) => c.status === 'ATIVA').map((c) => c.competencia.id));
}

function montarMatch(vaga: Vaga): VagaComMatch {
  const ativas = competenciasAtivasIds();
  const faltam = vaga.competenciasObrigatorias.filter((c) => !ativas.has(c.id));
  const desejaveisAtendidas = vaga.competenciasDesejaveis.filter((c) => ativas.has(c.id)).length;
  return { ...vaga, compativel: faltam.length === 0, faltam, desejaveisAtendidas };
}

/** Vagas para o trabalhador, ordenadas: compatíveis primeiro, depois por desejáveis. */
export async function listarVagasCompativeisMock(): Promise<VagaComMatch[]> {
  const lista = vagasMock
    .filter((v) => v.status === 'ABERTA')
    .map(montarMatch)
    .sort((a, b) => Number(b.compativel) - Number(a.compativel) || b.desejaveisAtendidas - a.desejaveisAtendidas || a.faltam.length - b.faltam.length);
  return delay(lista, 300);
}

export async function obterVagaMock(id: string): Promise<VagaComMatch> {
  const v = vagasMock.find((x) => x.id === id);
  if (!v) throw { status: 404, message: 'Vaga não encontrada.' };
  return delay(montarMatch(v), 200);
}

export async function candidatarMock(vagaId: string): Promise<Candidatura> {
  const vaga = vagasMock.find((x) => x.id === vagaId);
  if (!vaga) throw { status: 404, message: 'Vaga não encontrada.' };
  const existente = candidaturasMock.find((c) => c.vaga.id === vagaId);
  if (existente) return delay(existente);
  const nova: Candidatura = { id: `cand-${Date.now()}`, vaga, data: new Date().toISOString().slice(0, 10), status: 'ENVIADA' };
  candidaturasMock.push(nova);
  return delay(nova, 300);
}

export async function minhasCandidaturasMock(): Promise<Candidatura[]> {
  return delay([...candidaturasMock], 200);
}

export async function listarVagasDaEmpresaMock(): Promise<Vaga[]> {
  return delay(vagasMock.filter((v) => v.empresaNome === empresaMock.nome), 300);
}

export async function publicarVagaMock(dados: {
  funcao: string;
  municipio: string;
  descricao?: string;
  obrigatoriasIds: string[];
  desejaveisIds: string[];
}): Promise<Vaga> {
  const mapear = (ids: string[]) => CATALOGO_COMPETENCIAS.filter((c) => ids.includes(c.id));
  const nova: Vaga = {
    id: `vaga-${Date.now()}`,
    funcao: dados.funcao,
    municipio: dados.municipio,
    empresaNome: empresaMock.nome,
    segmento: empresaMock.segmento,
    descricao: dados.descricao,
    competenciasObrigatorias: mapear(dados.obrigatoriasIds),
    competenciasDesejaveis: mapear(dados.desejaveisIds),
    status: 'ABERTA',
  };
  vagasMock.unshift(nova);
  return delay(nova, 300);
}

// --- Catálogo de competências (para formulários) ---

export const CATALOGO_COMPETENCIAS: Competencia[] = Object.values(COMPETENCIAS);

export async function listarCompetenciasMock(): Promise<Competencia[]> {
  return delay([...CATALOGO_COMPETENCIAS], 150);
}

// --- Busca de trabalhadores pela indústria (RF28; RN06) ---

const candidatosMock: TrabalhadorResumo[] = [
  { id: 't-1', nome: 'Maria da Pesca', cidade: 'Palmas', completude: 80, competencias: ['Higiene e manipulação de alimentos', 'Segurança em câmara fria'] },
  { id: 't-2', nome: 'João Ribeiro', cidade: 'Porto Nacional', completude: 60, competencias: ['Recepção de pescado', 'Higiene e manipulação de alimentos'] },
  { id: 't-3', nome: 'Ana Sousa', cidade: 'Palmas', completude: 100, competencias: ['Higiene e manipulação de alimentos', 'Segurança em câmara fria', 'Boas Práticas de Fabricação (BPF)'] },
  { id: 't-4', nome: 'Carlos Lima', cidade: 'Gurupi', completude: 40, competencias: ['Boas Práticas de Fabricação (BPF)'] },
];

export async function buscarTrabalhadoresMock(competenciaNome?: string): Promise<TrabalhadorResumo[]> {
  const termo = competenciaNome?.trim().toLowerCase();
  const lista = !termo
    ? candidatosMock
    : candidatosMock.filter((t) => t.competencias.some((c) => c.toLowerCase().includes(termo)) || t.nome.toLowerCase().includes(termo));
  return delay(lista, 300);
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
