// Tipos principais para exercícios
export interface Opcao {
  id: string;
  texto: string;
}

export interface Questao {
  id: number;
  conteudo_id?: number;
  enunciado: string;
  nivel: 'facil' | 'medio' | 'dificil';
  tipo:
    | 'multipla_escolha'
    | 'verdadeiro_falso'
    | 'codigo'
    | 'quiz'
    | 'programacao';
  opcoes?: Opcao[];
  resposta_correta?: string;
  exemplo_resposta?: string | null;
  ordem?: number;
}

export interface Exercicio {
  id: number;
  titulo: string;
  tipo: 'pratico' | 'quiz';
  linguagem_id: number;
  nome_linguagem?: string;
  codigo_exemplo?: string;
  questoes: Questao[];
}

// Tipos para diferentes formatos de resposta da API
export interface ExercicioComQuestoes {
  id: number;
  titulo: string;
  tipo: 'pratico' | 'quiz';
  linguagem_id: number;
  exercicio_questao: Array<{
    exercicio_id: number;
    questao_id: number;
    ordem: number;
    questao: {
      id: number;
      conteudo_id: number;
      enunciado: string;
      nivel: 'facil' | 'medio' | 'dificil';
      exemplo_resposta?: string | null;
      opcoes?: Opcao[];
      resposta_correta?: string;
      tipo: string;
    };
  }>;
}

export interface ExercicioComConteudo {
  id: number;
  titulo: string;
  tipo: 'pratico' | 'quiz';
  linguagem_id: number;
  conteudo: {
    id: number;
    questoes: Array<{
      id: number;
      enunciado: string;
      nivel: 'facil' | 'medio' | 'dificil';
      tipo: string;
      opcoes?: Opcao[];
      resposta_correta?: string;
      exemplo_resposta?: string | null;
      ordem?: number;
    }>;
  };
}

export interface ExercicioPratico {
  id: number;
  titulo: string;
  tipo: 'pratico';
  linguagem_id: number;
  codigo_exemplo: string;
  instrucoes?: string;
  questoes: Questao[];
}

// Tipos para respostas
export interface RespostaMultiplaEscolha {
  questao_id: number;
  opcao_selecionada: string;
}

export interface RespostaCodigo {
  questao_id: number;
  codigo: string;
  resultado_execucao?: string;
}

export type RespostaExercicio = RespostaMultiplaEscolha | RespostaCodigo;

// Tipos para análise do Gemini
export interface AnaliseGemini {
  criterio: string;
  peso: number;
  aprovado: boolean;
  feedback: string;
  avaliado_em: string;
}

export interface ResultadoAnalise {
  aprovado: boolean;
  pontuacao_media: number;
}

export interface RespostaComAnalise {
  id: string;
  resposta: string;
  questao: {
    enunciado: string;
    tipo: string;
  };
  analise_disponivel: boolean;
  analises: AnaliseGemini[];
  resultado_geral: ResultadoAnalise;
}

export interface SubmissaoResposta {
  user_exercicio_id: string;
  questao_id: number;
  resposta: string;
}
