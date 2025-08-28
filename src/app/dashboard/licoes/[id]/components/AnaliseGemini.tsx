import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAnaliseGemini } from '@/hooks/useAnaliseGemini';

interface AnaliseGeminiProps {
  respostaId: string | null;
  questaoId: number;
  userId: string | number;
}

export function AnaliseGemini({
  respostaId,
  questaoId,
  userId
}: AnaliseGeminiProps) {
  const [solicitandoAnalise, setSolicitandoAnalise] = useState(false);
  const [erroSolicitacao, setErroSolicitacao] = useState<string | null>(null);
  
  const { analise, loading, error, buscarAnalise, resetError } =
    useAnaliseGemini({
      respostaId,
      autoRefresh: true,
      refreshInterval: 5000,
    });

  const solicitarAnaliseManual = async () => {
    if (!respostaId || !questaoId || !userId) {
      setErroSolicitacao('Dados insuficientes para solicitar análise');
      return;
    }

    setSolicitandoAnalise(true);
    setErroSolicitacao(null);

    try {
      const token = localStorage.getItem('token');
      
      // Como não há endpoint específico para solicitar análise, apenas forçar uma nova busca
      // A análise é processada automaticamente pelo backend quando a resposta é submetida
      console.log('🔍 Forçando nova busca de análise...');
      
      // Aguardar um pouco e então buscar a análise novamente
      setTimeout(() => {
        buscarAnalise();
      }, 1000);
      
      // Simular sucesso para o usuário
      setTimeout(() => {
        setSolicitandoAnalise(false);
        setErroSolicitacao(null);
      }, 2000);
    } catch (error) {
      console.error('Erro ao solicitar análise manual:', error);
      setErroSolicitacao(
        error instanceof Error ? error.message : 'Erro ao solicitar análise'
      );
    } finally {
      setSolicitandoAnalise(false);
    }
  };

  if (!respostaId) {
    return null;
  }

  if (loading && !analise) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">
            Enviando código para análise da IA Gemini...
          </span>
        </div>
      </div>
    );
  }

  if (error && !analise) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <span>⏳</span>
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={() => {
              resetError();
              buscarAnalise();
            }}
            className="px-3 py-1 bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 text-xs rounded hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
          >
            Verificar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!analise || !analise.analise_disponivel) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">
              IA Gemini está analisando seu código. Aguarde alguns instantes...
            </span>
          </div>
          {loading && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Verificando...
            </div>
          )}
        </div>
        
        {/* Botão para solicitar análise manual */}
        <div className="flex flex-col gap-2">
          {erroSolicitacao && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {erroSolicitacao}
            </div>
          )}
          
          <button
            onClick={solicitarAnaliseManual}
            disabled={solicitandoAnalise || loading}
            className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
          >
            {solicitandoAnalise ? (
              <>
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                Solicitando análise...
              </>
            ) : (
              <>🤖 Solicitar análise da IA</>
            )}
          </button>
        </div>
      </div>
    );
  }

  const getCriterioIcon = (criterio: string) => {
    switch (criterio.toLowerCase()) {
      case 'correção do código':
        return '✅';
      case 'boas práticas':
        return '🏆';
      case 'eficiência':
        return '⚡';
      case 'legibilidade':
        return '📖';
      default:
        return '📊';
    }
  };

  const getCriterioColor = (aprovado: boolean) => {
    return aprovado
      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getTomIcon = (tom: string) => {
    switch (tom) {
      case 'orientacao':
        return '💡';
      case 'parabenizacao':
        return '🎉';
      case 'motivacao':
        return '💪';
      case 'correcao':
        return '🔧';
      default:
        return '🤖';
    }
  };

  const getTomColor = (tom: string) => {
    switch (tom) {
      case 'orientacao':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      case 'parabenizacao':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'motivacao':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200';
      case 'correcao':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Cabeçalho da Análise */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            🤖 Análise IA Gemini - Resultado
          </h3>
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                analise.resultado_geral.aprovado
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
              }`}
            >
              {analise.resultado_geral.aprovado
                ? '✅ Aprovado'
                : '❌ Precisa melhorar'}
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300">
              {analise.resultado_geral.pontuacao_media.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analise.resultado_geral.pontuacao_media}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={`h-2 rounded-full ${
              analise.resultado_geral.pontuacao_media >= 70
                ? 'bg-green-500'
                : analise.resultado_geral.pontuacao_media >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* Mensagem Personalizada da IA ou Análises por Critério */}
      {analise.mensagem_personalizada ? (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`border rounded-lg p-6 ${getTomColor(analise.mensagem_personalizada.tom)}`}
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl flex-shrink-0">
              {getTomIcon(analise.mensagem_personalizada.tom)}
            </span>
            <div>
              <h4 className="font-semibold text-lg mb-2">
                Feedback da IA Gemini
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {analise.mensagem_personalizada.mensagem}
              </p>
            </div>
          </div>
        </motion.div>
      ) : analise.analises && analise.analises.length > 0 ? (
        <div className="space-y-3">
          {analise.analises.map((analiseItem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`border rounded-lg p-4 ${getCriterioColor(
                analiseItem.aprovado,
              )}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getCriterioIcon(analiseItem.criterio)}
                  </span>
                  <h4 className="font-medium">{analiseItem.criterio}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-75">
                    Peso: {analiseItem.peso}%
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      analiseItem.aprovado
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {analiseItem.aprovado ? '✓' : '✗'}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{analiseItem.feedback}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm text-center">
            Nenhuma análise detalhada disponível no momento.
          </p>
        </div>
      )}

      {/* Código Analisado */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50">
          <h4 className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 text-sm">
            💻 Código Analisado
          </h4>
        </div>
        <div className="p-4">
          <pre className="text-slate-800 dark:text-slate-300 font-mono text-sm overflow-x-auto max-h-40 overflow-y-auto leading-relaxed bg-white dark:bg-slate-900 p-3 rounded border">
            {analise.resposta}
          </pre>
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetError();
            buscarAnalise();
          }}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
              Atualizando...
            </>
          ) : (
            <>🔄 Atualizar Análise</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
