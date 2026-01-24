import {
  type Exercicio,
  type Questao,
  type ExercicioComQuestoes,
  type ExercicioComConteudo,
  type Opcao,
} from '@/types/exercicio';

// Função auxiliar para normalizar as opções
function normalizarOpcoes(opcoes: any): Opcao[] {
  if (!opcoes) return [];

  // Se for array
  if (Array.isArray(opcoes)) {
    // Se for array vazio, retorna vazio
    if (opcoes.length === 0) return [];

    // Se já for array de objetos com id e texto (formato correto)
    if (typeof opcoes[0] === 'object' && 'id' in opcoes[0] && 'texto' in opcoes[0]) {
      return opcoes as Opcao[];
    }

    // Se for array de strings (formato simples)
    if (typeof opcoes[0] === 'string') {
      return opcoes.map((texto, index) => ({
        id: String(index),
        texto: String(texto),
      }));
    }
  }

  // Se for objeto (formato dicionário/mapa)
  if (typeof opcoes === 'object') {
    return Object.entries(opcoes).map(([key, value]) => ({
      id: key,
      texto: String(value),
    }));
  }

  return [];
}

// Função auxiliar para normalizar a resposta correta
function normalizarRespostaCorreta(resposta: any, opcoes: Opcao[]): string | undefined {
  if (resposta === undefined || resposta === null) return undefined;
  const respostaStr = String(resposta);

  // 1. Tenta encontrar pelo texto exato
  const porTexto = opcoes.find(op => op.texto === respostaStr);
  if (porTexto) return porTexto.id;

  // 2. Tenta encontrar pelo ID
  const porId = opcoes.find(op => op.id === respostaStr);
  if (porId) return porId.id;

  return respostaStr;
}

// Processador para formato com exercicio_questao
export function processarExercicioComQuestoes(
  data: ExercicioComQuestoes,
): Exercicio {
  const questoes: Questao[] = data.exercicio_questao
    .map((eq) => {
      const opcoes = normalizarOpcoes(eq.questao.opcoes);
      return {
        id: eq.questao.id,
        conteudo_id: eq.questao.conteudo_id,
        enunciado: eq.questao.enunciado,
        nivel: eq.questao.nivel,
        tipo: eq.questao.tipo as Questao['tipo'],
        opcoes,
        resposta_correta: normalizarRespostaCorreta(eq.questao.resposta_correta, opcoes),
        exemplo_resposta: eq.questao.exemplo_resposta,
        ordem: eq.ordem,
      };
    })
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  return {
    id: data.id,
    titulo: data.titulo,
    tipo: data.tipo,
    linguagem_id: data.linguagem_id,
    questoes,
  };
}

// Processador para formato com conteúdo
export function processarExercicioComConteudo(
  data: ExercicioComConteudo,
): Exercicio {
  const questoes: Questao[] = data.conteudo.questoes
    .map((questao, index) => {
      const opcoes = normalizarOpcoes(questao.opcoes);
      return {
        id: questao.id,
        conteudo_id: data.conteudo.id,
        enunciado: questao.enunciado,
        nivel: questao.nivel,
        tipo: questao.tipo as Questao['tipo'],
        opcoes,
        resposta_correta: normalizarRespostaCorreta(questao.resposta_correta, opcoes),
        exemplo_resposta: questao.exemplo_resposta,
        ordem: questao.ordem !== undefined ? questao.ordem : index,
      };
    })
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  return {
    id: data.id,
    titulo: data.titulo,
    tipo: data.tipo,
    linguagem_id: data.linguagem_id,
    questoes,
  };
}

// Processador para formato simples (array de questões direto)
export function processarQuestoesSimples(questoes: any[]): Questao[] {
  return questoes.map((questao, index) => {
    const opcoes = normalizarOpcoes(questao.opcoes);
    return {
      id: questao.id,
      conteudo_id: questao.conteudo_id,
      enunciado: questao.enunciado,
      nivel: questao.nivel || 'facil',
      tipo: questao.tipo,
      opcoes,
      resposta_correta: normalizarRespostaCorreta(questao.resposta_correta, opcoes),
      exemplo_resposta: questao.exemplo_resposta,
      ordem: questao.ordem !== undefined ? questao.ordem : index,
    };
  });
}

// Função principal para detectar o formato e processar adequadamente
export function processarExercicio(data: any): Exercicio {
  // Verificar se tem exercicio_questao (formato atual do quiz)
  if (data.exercicio_questao && Array.isArray(data.exercicio_questao)) {
    return processarExercicioComQuestoes(data as ExercicioComQuestoes);
  }

  // Verificar se tem conteúdo com questões
  if (
    data.conteudo &&
    data.conteudo.questoes &&
    Array.isArray(data.conteudo.questoes)
  ) {
    return processarExercicioComConteudo(data as ExercicioComConteudo);
  }

  // Formato básico - só os dados do exercício sem questões aninhadas
  return {
    id: data.id,
    titulo: data.titulo,
    tipo: data.tipo,
    linguagem_id: data.linguagem_id,
    nome_linguagem: data.nome_linguagem,
    codigo_exemplo: data.codigo_exemplo,
    questoes: [],
  };
}

// Função para processar questões que vêm de endpoint separado
export function processarQuestoesDoEndpoint(
  questoesData: any[],
  exercicioId: number,
): Questao[] {
  return questoesData
    .filter((questao) => questao.exercicio_id === exercicioId)
    .map((questao) => {
      const opcoes = normalizarOpcoes(questao.opcoes);
      return {
        id: questao.id,
        conteudo_id: questao.conteudo_id,
        enunciado: questao.enunciado,
        nivel: questao.nivel,
        tipo: questao.tipo,
        opcoes,
        resposta_correta: normalizarRespostaCorreta(questao.resposta_correta, opcoes),
        exemplo_resposta: questao.exemplo_resposta,
        ordem: questao.ordem,
      };
    })
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
}
