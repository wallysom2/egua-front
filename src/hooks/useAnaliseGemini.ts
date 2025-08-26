import { useState, useEffect, useCallback } from 'react';
import { type RespostaComAnalise } from '@/types/exercicio';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface UseAnaliseGeminiProps {
  respostaId: string | null;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseAnaliseGeminiReturn {
  analise: RespostaComAnalise | null;
  loading: boolean;
  error: string | null;
  buscarAnalise: () => Promise<void>;
  resetError: () => void;
}

export function useAnaliseGemini({
  respostaId,
  autoRefresh = true,
  refreshInterval = 5000,
}: UseAnaliseGeminiProps): UseAnaliseGeminiReturn {
  const [analise, setAnalise] = useState<RespostaComAnalise | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarAnalise = useCallback(async () => {
    if (!respostaId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/respostas/analise/${respostaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setAnalise(data);
        console.log('Análise recebida:', data);
      } else if (response.status === 404) {
        setError(
          'Análise ainda não está disponível. A IA Gemini está processando seu código...',
        );
        console.log('Análise ainda não disponível para resposta:', respostaId);
      } else {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Erro ao buscar análise:', err);
      setError(
        'Erro ao carregar análise. Verifique sua conexão e tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  }, [respostaId]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Effect para buscar análise quando respostaId muda
  useEffect(() => {
    if (respostaId) {
      console.log('Iniciando busca de análise para resposta:', respostaId);
      buscarAnalise();
    } else {
      setAnalise(null);
      setError(null);
    }
  }, [respostaId, buscarAnalise]);

  // Effect para auto-refresh se análise não estiver disponível
  useEffect(() => {
    if (!respostaId || !autoRefresh) return;

    const shouldPoll = analise && !analise.analise_disponivel;
    if (!shouldPoll) return;

    console.log('Configurando polling para análise da resposta:', respostaId);
    const interval = setInterval(() => {
      if (analise && !analise.analise_disponivel) {
        console.log('Polling: verificando análise...');
        buscarAnalise();
      }
    }, refreshInterval);

    return () => {
      console.log('Limpando polling de análise');
      clearInterval(interval);
    };
  });

  return {
    analise,
    loading,
    error,
    buscarAnalise,
    resetError,
  };
}
