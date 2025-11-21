interface NavegacaoQuestoesProps {
  questaoAtual: number;
  totalQuestoes: number;
  respostasPreenchidas: Set<number>;
  onMudarQuestao: (indice: number) => void;
  onProximaQuestao: () => void;
  onQuestaoAnterior: () => void;
}

export function NavegacaoQuestoes({
  questaoAtual,
  totalQuestoes,
  respostasPreenchidas,
  onMudarQuestao,
  onProximaQuestao,
  onQuestaoAnterior
}: NavegacaoQuestoesProps) {
  if (totalQuestoes <= 1) {
    return null;
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50">
      {/* Navegação */}
      <div className="p-6">
        <div className="flex justify-between items-center">
          {/* Botão Anterior */}
          <button
            onClick={onQuestaoAnterior}
            disabled={questaoAtual === 0}
            className="group flex items-center space-x-2 px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-700"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Anterior</span>
          </button>

          {/* Indicadores de Questões */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalQuestoes }, (_, i) => (
              <button
                key={i}
                onClick={() => onMudarQuestao(i)}
                className={`relative w-10 h-10 text-sm font-semibold transition-all duration-200 rounded-lg flex items-center justify-center ${i === questaoAtual
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-600"
                  }`}
                title={`Questão ${i + 1}${i === questaoAtual ? ' (atual)' : ''}${respostasPreenchidas.has(i) ? ' (respondida)' : ''}`}
              >
                <span>{i + 1}</span>
              </button>
            ))}
          </div>

          {/* Botão Próxima */}
          <button
            onClick={onProximaQuestao}
            disabled={questaoAtual === totalQuestoes - 1}
            className="group flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <span className="font-medium">Próxima</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}