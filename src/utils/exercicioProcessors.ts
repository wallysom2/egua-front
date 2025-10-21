import {
  type Exercicio,
  type Questao,
  type ExercicioComQuestoes,
  type ExercicioComConteudo,
} from '@/types/exercicio';

// Processador para formato com exercicio_questao
export function processarExercicioComQuestoes(
  data: ExercicioComQuestoes,
): Exercicio {
  console.log('Processando exercício com questões:', data);

  const questoes: Questao[] = data.exercicio_questao
    .map((eq) => ({
      id: eq.questao.id,
      conteudo_id: eq.questao.conteudo_id,
      enunciado: eq.questao.enunciado,
      nivel: eq.questao.nivel,
      tipo: eq.questao.tipo as Questao['tipo'],
      opcoes: eq.questao.opcoes || [],
      resposta_correta: eq.questao.resposta_correta,
      exemplo_resposta: eq.questao.exemplo_resposta,
      ordem: eq.ordem,
    }))
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  console.log('Questões processadas:', questoes);

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
  console.log('Processando exercício com conteúdo:', data);

  const questoes: Questao[] = data.conteudo.questoes
    .map((questao, index) => ({
      id: questao.id,
      conteudo_id: data.conteudo.id,
      enunciado: questao.enunciado,
      nivel: questao.nivel,
      tipo: questao.tipo as Questao['tipo'],
      opcoes: questao.opcoes || [],
      resposta_correta: questao.resposta_correta,
      exemplo_resposta: questao.exemplo_resposta,
      ordem: questao.ordem !== undefined ? questao.ordem : index,
    }))
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  console.log('Questões processadas:', questoes);

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
  console.log('Processando questões simples:', questoes);

  return questoes.map((questao, index) => {
    const questaoProcessada = {
      id: questao.id,
      conteudo_id: questao.conteudo_id,
      enunciado: questao.enunciado,
      nivel: questao.nivel || 'facil',
      tipo: questao.tipo,
      opcoes: questao.opcoes || [],
      resposta_correta: questao.resposta_correta,
      exemplo_resposta: questao.exemplo_resposta,
      ordem: questao.ordem !== undefined ? questao.ordem : index,
    };
    console.log(`Questão ${index + 1} processada:`, questaoProcessada);
    return questaoProcessada;
  });
}

// Função principal para detectar o formato e processar adequadamente
export function processarExercicio(data: any): Exercicio {
  console.log('Dados recebidos da API:', data);

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
    .map((questao) => ({
      id: questao.id,
      conteudo_id: questao.conteudo_id,
      enunciado: questao.enunciado,
      nivel: questao.nivel,
      tipo: questao.tipo,
      opcoes: questao.opcoes || [],
      resposta_correta: questao.resposta_correta,
      exemplo_resposta: questao.exemplo_resposta,
      ordem: questao.ordem,
    }))
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
}
