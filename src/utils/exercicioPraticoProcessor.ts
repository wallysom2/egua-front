import { type Exercicio, type Questao } from '@/types/exercicio';

// Processador para exercícios práticos com questões de código
export function processarExercicioPratico(data: any): Exercicio {
  console.log('Processando exercício prático:', data);

  // Verificar se tem questões de código específicas
  let questoes: Questao[] = [];

  if (data.questoes_codigo && Array.isArray(data.questoes_codigo)) {
    questoes = data.questoes_codigo.map((questao: any, index: number) => ({
      id: questao.id,
      conteudo_id: questao.conteudo_id,
      enunciado: questao.enunciado,
      nivel: questao.nivel || 'facil',
      tipo: 'codigo' as const,
      exemplo_resposta: questao.exemplo_resposta,
      ordem: questao.ordem !== undefined ? questao.ordem : index,
    }));
  }

  return {
    id: data.id,
    titulo: data.titulo,
    tipo: 'pratico',
    linguagem_id: data.linguagem_id,
    nome_linguagem: data.nome_linguagem,
    codigo_exemplo: data.codigo_exemplo,
    questoes,
  };
}

// Função para validar código Senior Code AI
export function validarCodigo(codigo: string): {
  valido: boolean;
  erro?: string;
} {
  if (!codigo || codigo.trim().length === 0) {
    return { valido: false, erro: 'Código não pode estar vazio' };
  }

  // Validações básicas para a linguagem Senior Code AI
  const linhas = codigo.split('\n');

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (linha.length > 0 && !linha.startsWith('//')) {
      // Verificar se a linha tem sintaxe básica válida
      if (linha.includes('(') && !linha.includes(')')) {
        return {
          valido: false,
          erro: `Linha ${i + 1}: Parênteses não balanceados`,
        };
      }
    }
  }

  return { valido: true };
}

// Simulador de execução de código Senior Code AI
export function simularExecucao(codigo: string): {
  sucesso: boolean;
  resultado?: string;
  erro?: string;
} {
  try {
    // Simulação básica de execução
    const linhas = codigo
      .split('\n')
      .filter((linha) => linha.trim().length > 0);

    if (linhas.length === 0) {
      return { sucesso: false, erro: 'Código vazio' };
    }

    // Simular saída básica
    const resultado = linhas
      .filter((linha) => linha.includes('escreva') || linha.includes('imprima'))
      .map((linha) => {
        const match = linha.match(/escreva\s*\(\s*["']([^"']+)["']\s*\)/);
        return match ? match[1] : 'Saída simulada';
      })
      .join('\n');

    return {
      sucesso: true,
      resultado: resultado || 'Execução concluída com sucesso',
    };
  } catch (erro) {
    return {
      sucesso: false,
      erro: `Erro na execução: ${erro}`,
    };
  }
}

// Re-exporta o compilador real para compatibilidade
export { useEguaCompiler } from '@/hooks/useEguaCompiler';
export { EguaCompiler } from '@/components/EguaCompiler';
