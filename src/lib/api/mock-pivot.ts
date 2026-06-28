/**
 * MOCK pós-pivot: Qualificação (oportunidades), Plano de carreira e Funcionários.
 * Mantém o app rodável sem backend (mock-first). Reaproveita dados de `mock.ts`.
 */
import {
  CATALOGO_COMPETENCIAS,
  listarVagasCompativeisMock,
} from '@/lib/api/mock';
import type {
  Competencia,
  Funcionario,
  Lacuna,
  Oportunidade,
  PlanoCarreira,
  TipoOportunidade,
} from '@/lib/api/types';

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const comp = (id: string): Competencia =>
  CATALOGO_COMPETENCIAS.find((c) => c.id === id) ?? { id, nome: id };

/** Curadoria de oportunidades reais do Tocantins (editais, cursos gratuitos, bolsas). */
const OPORTUNIDADES: Oportunidade[] = [
  {
    id: 'op-1',
    titulo: 'Curso Boas Práticas de Fabricação (BPF)',
    instituicao: 'SENAI Tocantins',
    tipo: 'CURSO_GRATUITO',
    modalidade: 'PRESENCIAL',
    municipio: 'Palmas',
    link: 'https://www.to.senai.br',
    prazoInscricao: '2026-08-15',
    gratuito: true,
    descricao: 'Capacitação gratuita em BPF para a indústria de alimentos.',
    competencias: [comp('c-bpf'), comp('c-higiene')],
  },
  {
    id: 'op-2',
    titulo: 'Higiene e Manipulação de Alimentos',
    instituicao: 'SENAC Tocantins',
    tipo: 'CURSO_GRATUITO',
    modalidade: 'ONLINE',
    link: 'https://www.to.senac.br',
    prazoInscricao: '2026-07-31',
    gratuito: true,
    descricao: 'Curso online gratuito de higiene e manipulação.',
    competencias: [comp('c-higiene')],
  },
  {
    id: 'op-3',
    titulo: 'Operador de Processamento de Pescado',
    instituicao: 'Pronatec',
    tipo: 'CURSO_GRATUITO',
    modalidade: 'PRESENCIAL',
    municipio: 'Araguaína',
    link: 'https://www.gov.br/pronatec',
    prazoInscricao: '2026-08-20',
    gratuito: true,
    descricao: 'Formação inicial para a cadeia do pescado.',
    competencias: [comp('c-recepcao-pescado')],
  },
  {
    id: 'op-4',
    titulo: 'Segurança e Cadeia de Frio',
    instituicao: 'IFTO',
    tipo: 'EDITAL',
    modalidade: 'PRESENCIAL',
    municipio: 'Palmas',
    link: 'https://www.ifto.edu.br',
    prazoInscricao: '2026-09-30',
    gratuito: true,
    descricao: 'Edital de qualificação em operação segura de câmara fria.',
    competencias: [comp('c-camara-fria')],
  },
  {
    id: 'op-5',
    titulo: 'Técnico em Alimentos',
    instituicao: 'IFTO',
    tipo: 'EDITAL',
    modalidade: 'PRESENCIAL',
    municipio: 'Palmas',
    link: 'https://www.ifto.edu.br',
    prazoInscricao: '2026-10-05',
    gratuito: true,
    descricao: 'Curso técnico com processo seletivo via edital.',
    competencias: [comp('c-bpf'), comp('c-higiene')],
  },
  {
    id: 'op-6',
    titulo: 'Qualificação em Aquicultura',
    instituicao: 'IFTO',
    tipo: 'BOLSA',
    modalidade: 'HIBRIDO',
    municipio: 'Gurupi',
    link: 'https://www.ifto.edu.br',
    prazoInscricao: '2026-09-10',
    gratuito: true,
    descricao: 'Bolsa de qualificação voltada à piscicultura/aquicultura.',
    competencias: [comp('c-recepcao-pescado'), comp('c-camara-fria')],
  },
];

export async function listarOportunidadesMock(filtro?: {
  competenciaId?: string;
  tipo?: TipoOportunidade;
  municipio?: string;
}): Promise<Oportunidade[]> {
  let lista = OPORTUNIDADES;
  if (filtro?.competenciaId) {
    lista = lista.filter((o) => o.competencias.some((c) => c.id === filtro.competenciaId));
  }
  if (filtro?.tipo) lista = lista.filter((o) => o.tipo === filtro.tipo);
  if (filtro?.municipio) lista = lista.filter((o) => o.municipio === filtro.municipio);
  return delay([...lista], 250);
}

/** Plano de carreira: deriva as lacunas das vagas que o trabalhador ainda NÃO atende. */
export async function planoCarreiraMock(): Promise<PlanoCarreira> {
  const vagas = await listarVagasCompativeisMock();
  const compativeis = vagas.filter((v) => v.compativel).length;

  // Conta competências obrigatórias faltantes entre as vagas abertas.
  const contagem = new Map<string, { competencia: Competencia; vagas: number }>();
  vagas.forEach((v) =>
    v.faltam.forEach((c) => {
      const atual = contagem.get(c.id);
      if (atual) atual.vagas += 1;
      else contagem.set(c.id, { competencia: c, vagas: 1 });
    }),
  );

  const lacunas: Lacuna[] = [...contagem.values()]
    .sort((a, b) => b.vagas - a.vagas)
    .map((x) => ({
      competencia: x.competencia,
      vagasQueExigem: x.vagas,
      ondeQualificar: OPORTUNIDADES.filter((o) =>
        o.competencias.some((c) => c.id === x.competencia.id),
      ),
    }));

  const recomendadas = [
    ...new Map(
      lacunas.flatMap((l) => l.ondeQualificar).map((o) => [o.id, o]),
    ).values(),
  ];

  // Estima competências atuais pelas obrigatórias que ele já atende (todas - faltantes únicas).
  const todasObrigatorias = new Set(vagas.flatMap((v) => v.competenciasObrigatorias.map((c) => c.id)));
  const competenciasAtuais = Math.max(0, todasObrigatorias.size - contagem.size);

  return delay({ competenciasAtuais, vagasCompativeis: compativeis, lacunas, oportunidadesRecomendadas: recomendadas }, 300);
}

const funcionariosMock: Funcionario[] = [
  { id: 'f-1', nome: 'Maria da Pesca', cargo: 'Auxiliar de câmara fria', admissao: '2026-03-10', competencias: ['Higiene e manipulação de alimentos', 'Segurança em câmara fria'] },
  { id: 'f-2', nome: 'Ana Sousa', cargo: 'Operadora de filetagem', admissao: '2025-11-02', competencias: ['Recepção de pescado', 'BPF'] },
];

export async function funcionariosMockFn(): Promise<Funcionario[]> {
  return delay([...funcionariosMock], 250);
}
