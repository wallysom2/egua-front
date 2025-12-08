import { useState, useEffect, useCallback, useRef } from 'react';
import { type RespostaComAnalise } from '@/types/exercicio';
import { API_BASE_URL } from '@/config/api';

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
  const isRequestingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const buscarAnalise = useCallback(async () => {
    if (!respostaId || isRequestingRef.current) return;

    isRequestingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/respostas/analise/${respostaId}`,
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
          'Análise ainda não está disponível. A IA está processando seu código...',
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
      isRequestingRef.current = false;
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
    // Limpar interval anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Não iniciar polling se não tiver respostaId ou autoRefresh desabilitado
    if (!respostaId || !autoRefresh) return;

    // Não iniciar polling se a análise já estiver disponível
    if (analise?.analise_disponivel) return;

    // Só iniciar polling se houver análise mas ainda não disponível
    const shouldPoll = analise && !analise.analise_disponivel;
    if (!shouldPoll && !loading) return;

    console.log('Configurando polling para análise da resposta:', respostaId);
    intervalRef.current = setInterval(() => {
      // Só fazer requisição se não houver uma em andamento
      if (!isRequestingRef.current && (!analise || !analise.analise_disponivel)) {
        console.log('Polling: verificando análise...');
        buscarAnalise();
      }
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        console.log('Limpando polling de análise');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [respostaId, autoRefresh, analise, loading, refreshInterval, buscarAnalise]);

  return {
    analise,
    loading,
    error,
    buscarAnalise,
    resetError,
  };
}
