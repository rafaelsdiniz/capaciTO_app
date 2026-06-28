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

// --- Perfil / Carteira / Aprendizagem (spec §8) ---

/** Competência do catálogo da cadeia de alimentos. */
export type Competencia = {
  id: string;
  nome: string;
  descricao?: string;
};

export type StatusCertificacao = 'ATIVA' | 'EXPIRADA';

/** Certificação emitida ao trabalhador (RF20–RF22; RN02, RN03). */
export type Certificacao = {
  id: string;
  competencia: Competencia;
  dataEmissao: string; // ISO
  dataValidade?: string; // ISO; ausente = sem validade
  status: StatusCertificacao;
};

/** Resposta de GET /api/v1/perfil/me (RF05–RF08). */
export type PerfilMe = {
  usuario: Usuario;
  cidade?: string;
  funcoesInteresse: string[];
  /** Visibilidade para indústrias (RF08; RN06). */
  visivel: boolean;
  /** Indicador de completude/qualificação 0–100 (RF07). */
  completude: number;
  /** Competências certificadas exibidas na carteira (RF06). */
  certificacoes: Certificacao[];
};

export type SegmentoEmpresa = 'PESCADO' | 'LATICINIO' | 'POLPA' | 'PANIFICACAO';

export type Empresa = {
  id: string;
  nome: string;
  segmento: SegmentoEmpresa;
  municipio: string;
};

/** Indicadores do painel da indústria. */
export type EmpresaDashboard = {
  empresa: Empresa;
  totalEstacoes: number;
  totalVagas: number;
  totalCandidatos: number;
};

export type TipoConteudo = 'MICROVIDEO' | 'TRILHA';

/** Item do catálogo de aprendizagem (RF10–RF12). */
export type Conteudo = {
  id: string;
  titulo: string;
  tipo: TipoConteudo;
  /** Competência que este conteúdo certifica ao concluir. */
  competencia: Competencia;
  /** Duração em segundos (microvídeo curto/vertical). */
  duracao: number;
  urlVideo?: string;
  /** Tema para busca/filtro (higiene, manipulação, segurança, boas práticas). */
  tema: string;
};

// --- Estações / QR (spec §8; RF15–RF18) ---

export type Estacao = {
  id: string;
  nome: string;
  empresaNome: string;
  conteudo: Conteudo;
  /** Código único do QR da estação (RF16; RN04). */
  codigoQr: string;
};

export type OrigemConclusao = 'CATALOGO' | 'QR' | 'ESTACAO';

/** Resultado de registrar uma conclusão (RF13/RF18) — pode emitir certificação. */
export type ResultadoConclusao = {
  /** Certificação recém-emitida, se a conclusão gerou uma nova (RF20/RF21). */
  certificacao?: Certificacao;
  /** true se já estava certificada antes (RN10 — não duplica). */
  jaCertificada: boolean;
};

// --- Vagas / Candidaturas (spec §8; RF24–RF28) ---

export type StatusVaga = 'ABERTA' | 'FECHADA';

export type Vaga = {
  id: string;
  funcao: string;
  municipio: string;
  empresaNome: string;
  segmento: SegmentoEmpresa;
  descricao?: string;
  competenciasObrigatorias: Competencia[];
  competenciasDesejaveis: Competencia[];
  status: StatusVaga;
};

/** Vaga na visão do trabalhador, com cálculo de match (RN05). */
export type VagaComMatch = Vaga & {
  /** Possui TODAS as obrigatórias certificadas e ATIVAS. */
  compativel: boolean;
  /** Competências obrigatórias que ainda faltam. */
  faltam: Competencia[];
  /** Quantas desejáveis o trabalhador já tem (ordena melhor). */
  desejaveisAtendidas: number;
};

export type StatusCandidatura = 'ENVIADA' | 'EM_ANALISE' | 'APROVADA';

export type Candidatura = {
  id: string;
  vaga: Vaga;
  data: string;
  status: StatusCandidatura;
};

/** Trabalhador na busca da indústria (RF28) — respeita visibilidade (RN06). */
export type TrabalhadorResumo = {
  id: string;
  nome: string;
  cidade: string;
  completude: number;
  competencias: string[];
};

// --- PÓS-PIVOT: Qualificação (editais/cursos/bolsas) + Plano de carreira + Funcionários ---

export type TipoOportunidade = 'EDITAL' | 'CURSO_GRATUITO' | 'BOLSA';
export type ModalidadeOportunidade = 'PRESENCIAL' | 'ONLINE' | 'HIBRIDO';

/** Oportunidade de qualificação real (curadoria) — onde o trabalhador pode se capacitar. */
export type Oportunidade = {
  id: string;
  titulo: string;
  instituicao: string;
  tipo: TipoOportunidade;
  modalidade: ModalidadeOportunidade;
  municipio?: string;
  link: string;
  prazoInscricao?: string; // ISO
  gratuito: boolean;
  descricao?: string;
  /** Competências que esta oportunidade desenvolve. */
  competencias: Competencia[];
};

/** Lacuna de competência: o que falta + onde se qualificar. */
export type Lacuna = {
  competencia: Competencia;
  /** Quantas vagas abertas exigem esta competência. */
  vagasQueExigem: number;
  ondeQualificar: Oportunidade[];
};

/** Plano de carreira: análise de lacuna perfil × vagas. */
export type PlanoCarreira = {
  competenciasAtuais: number;
  vagasCompativeis: number;
  lacunas: Lacuna[];
  oportunidadesRecomendadas: Oportunidade[];
};

/** Funcionário (vínculo empresa ↔ trabalhador contratado). */
export type Funcionario = {
  id: string;
  nome: string;
  cargo: string;
  admissao?: string; // ISO
  competencias: string[];
};
