import { motion } from 'framer-motion';
import { useAnaliseGemini } from '@/hooks/useAnaliseGemini';

interface AnaliseGeminiProps {
  respostaId: string | null;
  questaoId: number;
  userId: string | number;
}

export function AnaliseGemini({
  respostaId
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
        <div className="flex items-center justify-between">
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

      {/* Análises por Critério */}
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
