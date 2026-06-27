/**
 * Implementação REAL da API (CapaciTO_API, /api/v1).
 *
 * Espelha as funções de `mock.ts` (mesma assinatura) chamando o backend via
 * `http.request` e mapeando os DTOs do Spring para os tipos do front. Onde o
 * backend e o front divergem (nomes, ids Long vs string, campos ausentes), o
 * mapeamento é explícito e comentado.
 *
 * Cobertura: só os endpoints que o backend já expõe. Os 8 que faltam
 * (estações listar/criar, perfil.atualizar, vagas da empresa/publicar,
 * minhas candidaturas, competências, dashboard, busca de trabalhadores)
 * continuam no mock — ver `index.ts`.
 */
import { getAuth, requirePerfilId, setAuth } from '@/lib/api/auth-store';
import { request } from '@/lib/api/http';
import type {
  AuthResponse,
  Candidatura,
  Certificacao,
  Competencia,
  Conteudo,
  Estacao,
  LoginRequest,
  OrigemConclusao,
  Papel,
  PerfilMe,
  RegistroRequest,
  ResultadoConclusao,
  StatusCandidatura,
  StatusVaga,
  Vaga,
  VagaComMatch,
} from '@/lib/api/types';

// --- DTOs do backend (espelho mínimo do que consumimos) ---

type TipoUsuarioBackend = 'TRABALHADOR' | 'EMPRESA';

type TokenResponseDTO = {
  token: string;
  tipo: string;
  usuarioId: number;
  perfilId: number | null;
  nome: string;
  tipoUsuario: TipoUsuarioBackend;
};

type CertificacaoDTO = {
  id: number;
  codigo: string;
  competenciaNome: string;
  dataEmissao: string;
  dataValidade: string | null;
  status: 'ATIVA' | 'EXPIRADA';
};

type PerfilResponseDTO = {
  id: number;
  usuarioId: number;
  nome: string;
  cpf: string | null;
  resumo: string | null;
  fotoUrl: string | null;
  completude: number;
  perfilPublico: boolean;
  competencias: unknown[];
  certificacoes: CertificacaoDTO[];
};

type ConteudoResumoDTO = {
  id: number;
  titulo: string;
  descricao: string | null;
  duracaoSegundos: number | null;
  competenciaNome: string;
  empresaNome: string | null;
};

type ConteudoDetalheDTO = {
  id: number;
  titulo: string;
  descricao: string | null;
  urlVideo: string | null;
  duracaoSegundos: number | null;
  versao: number | null;
  competenciaNome: string;
  empresaNome: string | null;
};

type EstacaoResponseDTO = {
  id: number;
  nome: string;
  descricao: string | null;
  codigoQr: string;
  conteudoId: number;
  conteudoTitulo: string;
  ativa: boolean | null;
};

type ConclusaoResponseDTO = {
  id: number;
  trabalhadorId: number;
  conteudoTitulo: string;
  origem: 'CATALOGO' | 'ESTACAO';
  quizAprovado: boolean | null;
  pontuacaoQuiz: number | null;
  concluidoEm: string | null;
  jaConcluido: boolean;
};

type VagaCompetenciaDTO = {
  competenciaId: number | null;
  competenciaNome: string;
  obrigatoria: boolean;
};

type VagaResponseDTO = {
  id: number;
  empresaId: number;
  empresaNome: string | null;
  titulo: string;
  descricao: string | null;
  local: string | null;
  status: string;
  criadoEm: string | null;
  competencias: VagaCompetenciaDTO[];
};

type CandidaturaResponseDTO = {
  id: number;
  vagaId: number;
  vagaTitulo: string;
  trabalhadorId: number;
  trabalhadorNome: string;
  status: string;
  candidatadoEm: string | null;
  jaExistia: boolean;
};

// --- Helpers de mapeamento ---

/** EMPRESA (backend) ↔ INDUSTRIA (front). */
function paraPapel(tipo: TipoUsuarioBackend): Papel {
  return tipo === 'EMPRESA' ? 'INDUSTRIA' : 'TRABALHADOR';
}

/** INDUSTRIA/ADMIN (front) → EMPRESA; demais → TRABALHADOR. */
function paraTipoUsuario(papel: Papel): TipoUsuarioBackend {
  return papel === 'TRABALHADOR' ? 'TRABALHADOR' : 'EMPRESA';
}

/** Slug estável a partir do nome (o backend só devolve `competenciaNome`). */
function slug(nome: string): string {
  return (
    'c-' +
    nome
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // remove acentos (diacríticos combinantes)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  );
}

/** O backend não tem entidade Competencia no JSON; sintetizamos a partir do nome. */
function competenciaDeNome(nome: string): Competencia {
  return { id: slug(nome), nome };
}

/** Tema para o filtro/hashtag — primeira palavra da competência. */
function temaDe(nome: string): string {
  return (nome ?? '').toLowerCase().split(/\s+/)[0] ?? '';
}

function mapCertificacao(c: CertificacaoDTO): Certificacao {
  return {
    id: String(c.id),
    competencia: competenciaDeNome(c.competenciaNome),
    dataEmissao: c.dataEmissao,
    dataValidade: c.dataValidade ?? undefined,
    status: c.status,
  };
}

function mapConteudoResumo(d: ConteudoResumoDTO): Conteudo {
  return {
    id: String(d.id),
    titulo: d.titulo,
    tipo: 'MICROVIDEO',
    competencia: competenciaDeNome(d.competenciaNome),
    duracao: d.duracaoSegundos ?? 0,
    tema: temaDe(d.competenciaNome),
  };
}

function mapConteudoDetalhe(d: ConteudoDetalheDTO): Conteudo {
  return {
    id: String(d.id),
    titulo: d.titulo,
    tipo: 'MICROVIDEO',
    competencia: competenciaDeNome(d.competenciaNome),
    duracao: d.duracaoSegundos ?? 0,
    urlVideo: d.urlVideo ?? undefined,
    tema: temaDe(d.competenciaNome),
  };
}

function mapVagaCompetencia(c: VagaCompetenciaDTO): Competencia {
  // Id sintetizado do nome para casar com as certificações (match por nome).
  return { id: slug(c.competenciaNome), nome: c.competenciaNome };
}

function mapVaga(v: VagaResponseDTO): Vaga {
  const comps = v.competencias ?? [];
  return {
    id: String(v.id),
    funcao: v.titulo,
    municipio: v.local ?? '',
    empresaNome: v.empresaNome ?? '',
    // O backend não expõe segmento na vaga; default do segmento herói (demo pescado).
    segmento: 'PESCADO',
    descricao: v.descricao ?? undefined,
    competenciasObrigatorias: comps.filter((c) => c.obrigatoria).map(mapVagaCompetencia),
    competenciasDesejaveis: comps.filter((c) => !c.obrigatoria).map(mapVagaCompetencia),
    status: (v.status === 'FECHADA' ? 'FECHADA' : 'ABERTA') as StatusVaga,
  };
}

/** PENDENTE/APROVADA/REJEITADA (backend) → ENVIADA/EM_ANALISE/APROVADA (front). */
function mapStatusCandidatura(status: string): StatusCandidatura {
  if (status === 'APROVADA') return 'APROVADA';
  if (status === 'PENDENTE') return 'ENVIADA';
  return 'EM_ANALISE';
}

// --- Auth ---

function aplicarToken(dto: TokenResponseDTO, email: string): AuthResponse {
  const papel = paraPapel(dto.tipoUsuario);
  setAuth({
    token: dto.token,
    usuarioId: dto.usuarioId,
    perfilId: dto.perfilId ?? null,
    papel,
    nome: dto.nome,
    email,
  });
  return {
    token: dto.token,
    // TokenResponseDTO não devolve email/telefone; usamos o informado no login.
    usuario: { id: String(dto.usuarioId), nome: dto.nome, email, papel },
  };
}

export async function loginReal(req: LoginRequest): Promise<AuthResponse> {
  const dto = await request<TokenResponseDTO>('/auth/login', {
    method: 'POST',
    auth: false,
    // Front usa "identificador" (email ou telefone); backend só aceita email.
    body: { email: req.identificador, senha: req.senha },
  });
  return aplicarToken(dto, req.identificador);
}

export async function registroReal(req: RegistroRequest): Promise<AuthResponse> {
  // CreateUsuarioDTO não tem telefone/dataNascimento/papel — só nome/email/senha/tipo.
  await request('/usuarios', {
    method: 'POST',
    auth: false,
    body: { nome: req.nome, email: req.email, senha: req.senha, tipo: paraTipoUsuario(req.papel) },
  });
  // POST /usuarios não devolve token; logamos em seguida para obter o JWT.
  return loginReal({ identificador: req.email, senha: req.senha });
}

// --- Perfil / Carteira ---

export async function perfilMeReal(): Promise<PerfilMe> {
  const auth = getAuth();
  const perfilId = requirePerfilId();
  const dto = await request<PerfilResponseDTO>(`/perfis/${perfilId}`);
  return {
    usuario: {
      id: String(auth?.usuarioId ?? dto.usuarioId),
      nome: dto.nome ?? auth?.nome ?? '',
      email: auth?.email ?? '',
      papel: auth?.papel ?? 'TRABALHADOR',
    },
    // Backend (PerfilResponseDTO) não tem cidade/funcoesInteresse — só na edição mock.
    cidade: undefined,
    funcoesInteresse: [],
    visivel: dto.perfilPublico,
    completude: dto.completude,
    certificacoes: (dto.certificacoes ?? []).map(mapCertificacao),
  };
}

export async function definirVisibilidadeReal(visivel: boolean): Promise<{ visivel: boolean }> {
  const perfilId = requirePerfilId();
  const dto = await request<PerfilResponseDTO>(`/perfis/${perfilId}/visibilidade`, {
    method: 'PATCH',
    body: { perfilPublico: visivel },
  });
  return { visivel: dto.perfilPublico };
}

// --- Conteúdos ---

export async function listarConteudosReal(busca?: string): Promise<Conteudo[]> {
  const lista = await request<ConteudoResumoDTO[]>('/conteudos');
  const itens = lista.map(mapConteudoResumo);
  const termo = busca?.trim().toLowerCase();
  // Backend não tem busca por query; filtramos no cliente (mesma regra do mock).
  if (!termo) return itens;
  return itens.filter(
    (c) =>
      c.titulo.toLowerCase().includes(termo) ||
      c.tema.toLowerCase().includes(termo) ||
      c.competencia.nome.toLowerCase().includes(termo),
  );
}

export async function obterConteudoReal(id: string): Promise<Conteudo> {
  const dto = await request<ConteudoDetalheDTO>(`/conteudos/${id}`);
  return mapConteudoDetalhe(dto);
}

// --- Estações / QR (fatia ao vivo) ---

async function montarEstacao(est: EstacaoResponseDTO): Promise<Estacao> {
  // EstacaoResponseDTO traz só conteudoId/título; buscamos o conteúdo completo
  // (urlVideo etc.) para o player abrir direto — coração da fatia ao vivo.
  const conteudo = await obterConteudoReal(String(est.conteudoId));
  return {
    id: String(est.id),
    nome: est.nome,
    // EstacaoResponseDTO não traz o nome da empresa.
    empresaNome: '',
    conteudo,
    codigoQr: est.codigoQr,
  };
}

export async function resolverQrReal(codigo: string): Promise<Estacao> {
  const est = await request<EstacaoResponseDTO>(`/estacoes/qr/${encodeURIComponent(codigo.trim())}`);
  return montarEstacao(est);
}

export async function obterEstacaoReal(id: string): Promise<Estacao> {
  const est = await request<EstacaoResponseDTO>(`/estacoes/${id}`);
  return montarEstacao(est);
}

// --- Conclusão → Certificação ---

export async function registrarConclusaoReal(
  conteudoId: string,
  _origem: OrigemConclusao,
): Promise<ResultadoConclusao> {
  const trabalhadorId = requirePerfilId();
  // POST /conclusoes (origem CATALOGO no backend). A conclusão por estação tem
  // rota própria (/estacoes/{id}/conclusoes) que exigiria o id da estação — aqui
  // só temos o conteúdo, então usamos a rota de conteúdo (cert. emitida igual).
  const dto = await request<ConclusaoResponseDTO>('/conclusoes', {
    method: 'POST',
    body: { trabalhadorId, conteudoId: Number(conteudoId), quizAprovado: true },
  });
  // ConclusaoResponseDTO não devolve a certificação emitida; a carteira
  // (perfil.me real) reflete a competência nova ao recarregar.
  return { jaCertificada: dto.jaConcluido, certificacao: undefined };
}

// --- Vagas / Match (visão do trabalhador) ---

async function listarVagasBackend(): Promise<Vaga[]> {
  const lista = await request<VagaResponseDTO[]>('/vagas');
  return lista.map(mapVaga);
}

/** Nomes de competências certificadas e ATIVAS do trabalhador logado. */
async function competenciasAtivasNomes(): Promise<Set<string>> {
  const perfil = await perfilMeReal();
  return new Set(
    perfil.certificacoes
      .filter((c) => c.status === 'ATIVA')
      .map((c) => c.competencia.nome.toLowerCase()),
  );
}

function montarMatch(vaga: Vaga, ativas: Set<string>): VagaComMatch {
  // Match por NOME da competência (backend não expõe ids estáveis nos dois lados).
  const faltam = vaga.competenciasObrigatorias.filter((c) => !ativas.has(c.nome.toLowerCase()));
  const desejaveisAtendidas = vaga.competenciasDesejaveis.filter((c) =>
    ativas.has(c.nome.toLowerCase()),
  ).length;
  return { ...vaga, compativel: faltam.length === 0, faltam, desejaveisAtendidas };
}

export async function listarVagasCompativeisReal(): Promise<VagaComMatch[]> {
  const [vagas, ativas] = await Promise.all([listarVagasBackend(), competenciasAtivasNomes()]);
  return vagas
    .filter((v) => v.status === 'ABERTA')
    .map((v) => montarMatch(v, ativas))
    .sort(
      (a, b) =>
        Number(b.compativel) - Number(a.compativel) ||
        b.desejaveisAtendidas - a.desejaveisAtendidas ||
        a.faltam.length - b.faltam.length,
    );
}

export async function obterVagaReal(id: string): Promise<VagaComMatch> {
  // Backend não tem GET /vagas/{id}; buscamos a lista e localizamos o id.
  const [vagas, ativas] = await Promise.all([listarVagasBackend(), competenciasAtivasNomes()]);
  const vaga = vagas.find((v) => v.id === id);
  if (!vaga) throw { status: 404, message: 'Vaga não encontrada.' };
  return montarMatch(vaga, ativas);
}

export async function candidatarReal(vagaId: string): Promise<Candidatura> {
  const trabalhadorId = requirePerfilId();
  const dto = await request<CandidaturaResponseDTO>('/candidaturas', {
    method: 'POST',
    body: { vagaId: Number(vagaId), trabalhadorId },
  });
  // Candidatura do front embute a Vaga inteira; o response só traz id/título,
  // então recuperamos a vaga da listagem.
  const vagas = await listarVagasBackend();
  const vaga = vagas.find((v) => v.id === String(dto.vagaId)) ?? vagas.find((v) => v.id === vagaId);
  return {
    id: String(dto.id),
    vaga: vaga ?? {
      id: vagaId,
      funcao: dto.vagaTitulo,
      municipio: '',
      empresaNome: '',
      segmento: 'PESCADO',
      competenciasObrigatorias: [],
      competenciasDesejaveis: [],
      status: 'ABERTA',
    },
    data: (dto.candidatadoEm ?? new Date().toISOString()).slice(0, 10),
    status: mapStatusCandidatura(dto.status),
  };
}
