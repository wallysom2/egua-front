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

  const progressoPercentual = Math.round(((questaoAtual + 1) / totalQuestoes) * 100);
  const questoesRespondidas = respostasPreenchidas.size;

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">

      {/* Navegação */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={onQuestaoAnterior}
            disabled={questaoAtual === 0}
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            ← Anterior
          </button>
          
          <div className="flex gap-1 max-w-xs overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
            {Array.from({ length: totalQuestoes }, (_, i) => (
              <button
                key={i}
                onClick={() => onMudarQuestao(i)}
                className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center ${
                  i === questaoAtual
                    ? "bg-blue-600 text-white shadow-md scale-110"
                    : respostasPreenchidas.has(i)
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500"
                }`}
                title={`Questão ${i + 1}${i === questaoAtual ? ' (atual)' : ''}${respostasPreenchidas.has(i) ? ' (respondida)' : ''}`}
              >
                {respostasPreenchidas.has(i) && i !== questaoAtual ? '✓' : i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={onProximaQuestao}
            disabled={questaoAtual === totalQuestoes - 1}
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Próxima →
          </button>
        </div>
      </div>
    </div>
  );
} 