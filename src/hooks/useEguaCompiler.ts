import { useState, useCallback } from 'react';
import { executarCodigo as executarCodigoDelegua } from '@/lib/delegua';

interface ResultadoExecucao {
  sucesso: boolean;
  saida: string[];
  tempoExecucao: number;
  erro?: string;
}

interface UseEguaCompilerReturn {
  executando: boolean;
  resultado: ResultadoExecucao | null;
  executarCodigo: (codigo: string) => Promise<void>;
  limparResultado: () => void;
}

export function useEguaCompiler(): UseEguaCompilerReturn {
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoExecucao | null>(null);

  const executarCodigo = useCallback(async (codigo: string) => {
    if (!codigo.trim()) {
      setResultado({
        sucesso: false,
        saida: [],
        tempoExecucao: 0,
        erro: 'Código não pode estar vazio'
      });
      return;
    }

    setExecutando(true);
    const inicioExecucao = Date.now();

    try {
      const saida = await executarCodigoDelegua(codigo);
      const tempoExecucao = Date.now() - inicioExecucao;

      // Verificar se há erros na saída
      const temErro = saida.some(linha => 
        linha.includes('Erro') || 
        linha.includes('erro') ||
        linha.includes('Error')
      );

      setResultado({
        sucesso: !temErro,
        saida,
        tempoExecucao,
        erro: temErro ? saida.find(linha => linha.includes('Erro') || linha.includes('erro')) : undefined
      });

    } catch (error) {
      const tempoExecucao = Date.now() - inicioExecucao;
      const mensagemErro = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setResultado({
        sucesso: false,
        saida: [],
        tempoExecucao,
        erro: `Erro crítico: ${mensagemErro}`
      });
    } finally {
      setExecutando(false);
    }
  }, []);

  const limparResultado = useCallback(() => {
    setResultado(null);
  }, []);

  return {
    executando,
    resultado,
    executarCodigo,
    limparResultado
  };
} 