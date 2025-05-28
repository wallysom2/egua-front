import { type ExercicioPratico, type Questao, type Exercicio } from "@/types/exercicio";

// Processador para exercícios práticos com questões de código
export function processarExercicioPratico(data: any): Exercicio {
  console.log("Processando exercício prático:", data);

  // Verificar se tem questões de código específicas
  let questoes: Questao[] = [];

  if (data.questoes_codigo && Array.isArray(data.questoes_codigo)) {
    questoes = data.questoes_codigo.map((questao: any, index: number) => ({
      id: questao.id,
      conteudo_id: questao.conteudo_id,
      enunciado: questao.enunciado,
      nivel: questao.nivel || "facil",
      tipo: "codigo" as const,
      exemplo_resposta: questao.exemplo_resposta,
      ordem: questao.ordem !== undefined ? questao.ordem : index
    }));
  }

  return {
    id: data.id,
    titulo: data.titulo,
    tipo: "pratico",
    linguagem_id: data.linguagem_id,
    nome_linguagem: data.nome_linguagem,
    codigo_exemplo: data.codigo_exemplo,
    questoes
  };
}

// Função para validar código Égua
export function validarCodigoEgua(codigo: string): { valido: boolean; erro?: string } {
  if (!codigo.trim()) {
    return { valido: false, erro: "Código não pode estar vazio" };
  }

  // Validações básicas para a linguagem Égua
  const linhas = codigo.split('\n');
  let temComandoEscreva = false;

  for (const linha of linhas) {
    const linhaTrimmed = linha.trim();
    
    if (linhaTrimmed === '') continue;
    
    // Verificar se tem comando escreva
    if (linhaTrimmed.includes('escreva(')) {
      temComandoEscreva = true;
    }

    // Verificar sintaxe básica - parênteses balanceados
    const abreParenteses = (linhaTrimmed.match(/\(/g) || []).length;
    const fechaParenteses = (linhaTrimmed.match(/\)/g) || []).length;
    
    if (abreParenteses !== fechaParenteses) {
      return { valido: false, erro: `Parênteses não balanceados na linha: ${linha}` };
    }
  }

  return { valido: true };
}

// Simulador de execução de código Égua
export async function executarCodigoEgua(codigo: string): Promise<{ resultado: string; erro?: string }> {
  const validacao = validarCodigoEgua(codigo);
  
  if (!validacao.valido) {
    return { resultado: "", erro: validacao.erro };
  }

  try {
    // Simular delay de execução
    await new Promise(resolve => setTimeout(resolve, 1000));

    let resultado = "";
    const linhas = codigo.split('\n');

    for (const linha of linhas) {
      const linhaTrimmed = linha.trim();
      
      if (linhaTrimmed.includes('escreva(')) {
        // Extrair o conteúdo entre aspas do comando escreva
        const match = linhaTrimmed.match(/escreva\s*\(\s*["']([^"']+)["']\s*\)/);
        if (match) {
          resultado += match[1] + '\n';
        } else {
          // Tentar extrair variáveis ou expressões simples
          const matchVar = linhaTrimmed.match(/escreva\s*\(\s*([^)]+)\s*\)/);
          if (matchVar) {
            resultado += matchVar[1] + '\n';
          }
        }
      }
    }

    return { resultado: resultado.trim() || "Código executado com sucesso!" };
  } catch (error) {
    return { resultado: "", erro: "Erro durante a execução do código" };
  }
}

// Re-exporta o compilador real para compatibilidade
export { useEguaCompiler } from "@/hooks/useEguaCompiler";
export { EguaCompiler } from "@/components/EguaCompiler"; 