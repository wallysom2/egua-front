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
  const { analise, loading, error, buscarAnalise, resetError } =
    useAnaliseGemini({
      respostaId,
      autoRefresh: true,
      refreshInterval: 5000,
    });

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
                Retorno da IA Gemini
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
    </motion.div>
  );
}
