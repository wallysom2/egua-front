/**
 * Tipos relacionados a Turmas
 */

export interface Turma {
  id: string;
  nome: string;
  descricao: string | null;
  codigo_acesso: string;
  professor_id: string;
  ativo: boolean;
  is_padrao: boolean;
  created_at: string;
  updated_at: string;
  _count: {
    turma_aluno: number;
    turma_exercicio: number;
    trilha_modulo: number;
  };
}

export interface TurmaDetalhes extends Turma {
  trilha_modulo: TrilhaModulo[];
}

export interface TrilhaModulo {
  id: string;
  turma_id: string;
  titulo: string;
  descricao: string | null;
  icone: string | null;
  ordem: number;
  xp_recompensa: number;
  ativo: boolean;
  created_at: string;
  trilha_licao: TrilhaLicao[];
}

export interface TrilhaLicao {
  id: string;
  modulo_id: string;
  exercicio_id: number;
  ordem: number;
  xp_recompensa: number;
  created_at: string;
  exercicio: {
    id: number;
    titulo: string;
  };
}

export interface CriarTurmaData {
  nome: string;
  descricao?: string;
}

export interface AtualizarTurmaData {
  nome?: string;
  descricao?: string;
}

export interface EntrarTurmaData {
  codigo_acesso: string;
}

export interface EntrarTurmaResponse {
  success: boolean;
  message: string;
  turma?: {
    id: string;
    nome: string;
  };
}

export interface TurmaAluno {
  id: string;
  nome: string;
  descricao: string | null;
  is_padrao: boolean;
  matriculado_em: string;
  _count: {
    trilha_modulo: number;
  };
  progresso: {
    total: number;
    completadas: number;
    percentual: number;
    xp_total: number;
  };
}
