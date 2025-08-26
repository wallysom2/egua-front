import { type Questao, type Exercicio } from '@/types/exercicio';

interface PainelQuestaoProps {
  exercicio: Exercicio;
  questao?: Questao;
  questaoAtual: number;
  totalQuestoes: number;
}

export function PainelQuestao({
  exercicio,
  questao,
  questaoAtual,
  totalQuestoes,
}: PainelQuestaoProps) {
  if (!questao) {
    return (
      <div className="p-8 text-center">
        <div className="text-slate-500 dark:text-slate-400 py-8">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Nenhuma questão encontrada
          </h3>
          <p className="text-sm">
            Total de questões carregadas: {totalQuestoes}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Cabeçalho da questão */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Questão {questaoAtual + 1}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                questao.nivel === 'facil'
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                  : questao.nivel === 'medio'
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
                  : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
              }`}
            >
              {questao.nivel}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {exercicio.titulo} •{' '}
            {exercicio.tipo === 'pratico' ? 'Exercício Prático' : 'Quiz'}
          </p>
        </div>

        <div className="text-right ml-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {questaoAtual + 1} de {totalQuestoes}
          </div>
        </div>
      </div>

      {/* Enunciado */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
          Enunciado
        </h3>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700 rounded-lg p-5">
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-base whitespace-pre-wrap">
            {questao.enunciado}
          </p>
        </div>
      </div>
    </div>
  );
}
